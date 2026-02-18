import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Plus, Pencil, Trash2, Loader2, Upload, Download,
  Save, CheckCircle2, AlertTriangle, ArrowLeft, Layers, X, ImagePlus,
} from 'lucide-react';
import { getAllExams } from '@/services/examService';
import { getQuestionsForExam, getSetsForExam } from '@/services/questionService';
import {
  createQuestion, updateQuestion, deleteQuestion,
  bulkCreateQuestions, QuestionInput,
  getExamSetQuestionMap, moveQuestionToSet,
  uploadKeyPointImage, deleteKeyPointImage,
} from '@/services/adminService';
import type { ExamConfig, ExamSet, Question } from '@/types/exam';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin';

// ─── CSV parser (handles quoted fields) ─────────────────────────────────────
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const cells: string[] = [];
    let inQ = false, cell = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cell += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        cells.push(cell.trim()); cell = '';
      } else {
        cell += ch;
      }
    }
    cells.push(cell.trim());
    rows.push(cells);
  }
  return rows;
}

// Parse a single CSV data row into QuestionInput
function csvRowToQuestion(cols: string[]): Omit<QuestionInput, 'examId'> | null {
  // Expected: text,option_a,option_b,option_c,option_d,correct,explanation,difficulty,tags
  if (cols.length < 8) return null;
  const [text, optA, optB, optC, optD, correct, explanation, diffStr, tagsStr = ''] = cols;
  const diff = parseInt(diffStr, 10);
  const correctId = correct.toLowerCase().trim() as 'a' | 'b' | 'c' | 'd';
  if (!text || !optA || !optB || !['a','b','c','d'].includes(correctId)) return null;
  return {
    text,
    options: [
      { id: 'a', text: optA },
      { id: 'b', text: optB },
      { id: 'c', text: optC },
      { id: 'd', text: optD },
    ],
    correctOptionId: correctId,
    explanation,
    difficulty: ([1, 2, 3].includes(diff) ? diff : 1) as 1 | 2 | 3,
    tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
  };
}

// CSV template download
function downloadCSVTemplate() {
  const header = 'text,option_a,option_b,option_c,option_d,correct,explanation,difficulty,tags';
  const example = '"Which AWS service provides foundation models through a single API?","Amazon SageMaker","Amazon Bedrock","Amazon Comprehend","Amazon Rekognition","b","Amazon Bedrock provides foundation models through a unified API.","1","AI,ML"';
  const csv = [header, example].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'question_template.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ─── Question form dialog ────────────────────────────────────────────────────
interface QFormProps {
  examId: string;
  edit?: Question | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

const QuestionFormDialog = ({ examId, edit, open, onClose, onSaved }: QFormProps) => {
  const empty = { text: '', a: '', b: '', c: '', d: '', a_exp: '', b_exp: '', c_exp: '', d_exp: '', correct: 'a' as 'a'|'b'|'c'|'d', explanation: '', difficulty: 1 as 1|2|3, tags: '', keyPoints: '', keyPointImages: [] as string[], refLinks: [] as { name: string; url: string }[] };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edit) {
      const opts: Record<string, string> = {};
      const exps: Record<string, string> = {};
      edit.options.forEach(o => { opts[o.id] = o.text; exps[o.id] = o.explanation ?? ''; });
      setForm({
        text: edit.text,
        a: opts['a'] ?? '', b: opts['b'] ?? '', c: opts['c'] ?? '', d: opts['d'] ?? '',
        a_exp: exps['a'] ?? '', b_exp: exps['b'] ?? '', c_exp: exps['c'] ?? '', d_exp: exps['d'] ?? '',
        correct: edit.correctOptionId as 'a'|'b'|'c'|'d',
        explanation: edit.explanation,
        difficulty: edit.difficulty,
        tags: edit.tags.join(', '),
        keyPoints: edit.keyPoints ?? '',
        keyPointImages: edit.keyPointImages ?? [],
        refLinks: edit.refLinks ?? [],
      });
    } else {
      setForm(empty);
    }
    setError('');
  }, [edit, open]);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setImageUploading(true);
    setError('');
    try {
      // Use a temporary ID if creating a new question
      const qId = edit?.id ?? `temp-${Date.now()}`;
      const urls = await Promise.all(files.map(f => uploadKeyPointImage(f, qId)));
      set('keyPointImages', [...form.keyPointImages, ...urls]);
    } catch (e: any) {
      setError('이미지 업로드 실패: ' + (e.message ?? String(e)));
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (url: string) => {
    set('keyPointImages', form.keyPointImages.filter(u => u !== url));
    try { await deleteKeyPointImage(url); } catch { /* ignore */ }
  };

  const handleSave = async () => {
    if (!form.text.trim() || !form.a.trim() || !form.b.trim()) {
      setError('문제 텍스트와 보기 A, B는 필수입니다.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const input: Omit<QuestionInput, 'examId'> = {
        text: form.text.trim(),
        options: ([
          { id: 'a' as const, text: form.a.trim(), explanation: form.a_exp.trim() || undefined },
          { id: 'b' as const, text: form.b.trim(), explanation: form.b_exp.trim() || undefined },
          { id: 'c' as const, text: form.c.trim(), explanation: form.c_exp.trim() || undefined },
          { id: 'd' as const, text: form.d.trim(), explanation: form.d_exp.trim() || undefined },
        ] as { id: 'a'|'b'|'c'|'d'; text: string; explanation?: string }[]).filter(o => o.text),
        correctOptionId: form.correct,
        explanation: form.explanation.trim(),
        difficulty: form.difficulty,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        keyPoints: form.keyPoints.trim() || undefined,
        keyPointImages: form.keyPointImages.length > 0 ? form.keyPointImages : undefined,
        refLinks: form.refLinks.filter(r => r.name.trim() && r.url.trim()),
      };
      if (edit) {
        await updateQuestion(edit.id, input);
      } else {
        await createQuestion({ ...input, examId });
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message ?? '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{edit ? '문제 편집' : '새 문제 추가'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Question text */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">문제 텍스트 *</label>
            <Textarea
              placeholder="문제를 입력하세요..."
              rows={3}
              value={form.text}
              onChange={e => set('text', e.target.value)}
            />
          </div>

          {/* Options */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">보기 (A~D)</label>
            <div className="space-y-3">
              {(['a','b','c','d'] as const).map((id, i) => (
                <div key={id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => set('correct', id)}
                      className={`h-7 w-7 rounded-full border-2 text-xs font-bold shrink-0 transition-all ${
                        form.correct === id
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-muted-foreground/40 text-muted-foreground hover:border-accent/60'
                      }`}
                    >
                      {OPTION_LABELS[i]}
                    </button>
                    <Input
                      placeholder={`보기 ${OPTION_LABELS[i]}${i < 2 ? ' *' : ''}`}
                      value={form[id]}
                      onChange={e => set(id, e.target.value)}
                    />
                  </div>
                  {form[id].trim() && (
                    <div className="ml-9">
                      <Input
                        placeholder={`보기 ${OPTION_LABELS[i]} 설명 (선택) — 왜 이 보기가 맞거나 틀린지`}
                        value={form[`${id}_exp` as keyof typeof form] as string}
                        onChange={e => set(`${id}_exp`, e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">동그라미 클릭 → 정답 선택 (주황색 = 정답)</p>
          </div>

          {/* Explanation */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">해설</label>
            <Textarea
              placeholder="정답 설명을 입력하세요..."
              rows={2}
              value={form.explanation}
              onChange={e => set('explanation', e.target.value)}
            />
          </div>

          {/* Difficulty + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">난이도</label>
              <div className="flex gap-2">
                {([1,2,3] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set('difficulty', d)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      form.difficulty === d
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground hover:border-accent/40'
                    }`}
                  >
                    {d === 1 ? '쉬움' : d === 2 ? '보통' : '어려움'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">태그 (쉼표 구분)</label>
              <Input
                placeholder="예: AI, ML, SageMaker"
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
              />
            </div>
          </div>

          {/* Key Points */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">핵심 암기사항 (선택)</label>
            <Textarea
              placeholder="이 문제와 관련하여 반드시 암기해야 할 핵심 사항을 입력하세요..."
              rows={3}
              value={form.keyPoints}
              onChange={e => set('keyPoints', e.target.value)}
            />
            {/* Image upload */}
            <div className="mt-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={imageUploading}
                onClick={() => imageInputRef.current?.click()}
                className="w-full"
              >
                {imageUploading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />업로드 중...</>
                  : <><ImagePlus className="h-4 w-4 mr-2" />이미지 추가</>
                }
              </Button>
              {form.keyPointImages.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {form.keyPointImages.map((url, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-border group">
                      <img src={url} alt={`이미지 ${idx + 1}`} className="w-full object-contain max-h-32 bg-muted" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reference Links */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">참고자료 (선택)</label>
            <div className="space-y-2">
              {form.refLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="자료 이름"
                    value={link.name}
                    onChange={e => {
                      const updated = [...form.refLinks];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      set('refLinks', updated);
                    }}
                    className="flex-1"
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={e => {
                      const updated = [...form.refLinks];
                      updated[idx] = { ...updated[idx], url: e.target.value };
                      set('refLinks', updated);
                    }}
                    className="flex-[2]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set('refLinks', form.refLinks.filter((_, i) => i !== idx))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set('refLinks', [...form.refLinks, { name: '', url: '' }])}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                참고자료 추가
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button
            disabled={saving}
            onClick={handleSave}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── CSV Upload Dialog ────────────────────────────────────────────────────────
interface CsvDialogProps {
  examId: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const CsvUploadDialog = ({ examId, open, onClose, onSaved }: CsvDialogProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<Omit<QuestionInput, 'examId'>[]>([]);
  const [parseError, setParseError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);

  const reset = () => {
    setParsed([]); setParseError(''); setUploading(false);
    setProgress(0); setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  useEffect(() => { if (!open) reset(); }, [open]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(''); setParsed([]); setResult(null);

    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) { setParseError('데이터가 없습니다. (헤더 포함 2행 이상 필요)'); return; }
      const dataRows = rows.slice(1); // skip header
      const questions: Omit<QuestionInput, 'examId'>[] = [];
      const errs: string[] = [];
      dataRows.forEach((cols, i) => {
        const q = csvRowToQuestion(cols);
        if (q) questions.push(q);
        else errs.push(`행 ${i + 2}: 형식 오류 (${cols.length}열 인식됨)`);
      });
      if (errs.length > 0) setParseError(errs.join('\n'));
      setParsed(questions);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleUpload = async () => {
    if (parsed.length === 0) return;
    setUploading(true); setProgress(0); setResult(null);
    const res = await bulkCreateQuestions(examId, parsed, (done, total) => {
      setProgress(Math.round((done / total) * 100));
    });
    setResult(res);
    setUploading(false);
    if (res.success > 0) onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>CSV 파일 업로드</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Format info */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground text-sm mb-2">CSV 형식 (헤더 필수)</p>
            <p>text, option_a, option_b, option_c, option_d,</p>
            <p>correct, explanation, difficulty, tags</p>
            <p className="mt-2 text-xs">• correct: a / b / c / d 중 하나</p>
            <p>• difficulty: 1(쉬움) / 2(보통) / 3(어려움)</p>
            <p>• tags: 쉼표로 구분 (예: AI,ML)</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSVTemplate}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            양식 다운로드 (CSV 템플릿)
          </Button>

          {/* File input */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">파일 선택</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/80 cursor-pointer"
            />
          </div>

          {/* Parse errors */}
          {parseError && (
            <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg whitespace-pre-wrap">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              {parseError}
            </div>
          )}

          {/* Preview */}
          {parsed.length > 0 && !result && (
            <div className="bg-accent/5 border border-accent/30 rounded-lg p-3 text-sm">
              <CheckCircle2 className="h-4 w-4 inline text-accent mr-1" />
              <strong>{parsed.length}문제</strong> 인식됨 — "업로드" 버튼으로 저장하세요.
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-center">{progress}% 완료</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="bg-accent/5 border border-accent/30 rounded-lg p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 inline text-accent mr-1" />
                <strong>{result.success}문제</strong> 업로드 완료
              </div>
              {result.errors.length > 0 && (
                <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg">
                  <p className="font-semibold mb-1">실패 {result.errors.length}건:</p>
                  {result.errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{result ? '닫기' : '취소'}</Button>
          {!result && (
            <Button
              disabled={parsed.length === 0 || uploading}
              onClick={handleUpload}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {uploading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{progress}%</>
                : <><Upload className="h-4 w-4 mr-2" />업로드 ({parsed.length}문제)</>
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Set assignment inline selector ─────────────────────────────────────────
interface SetSelectorProps {
  questionId: string;
  currentSetIds: string[];
  sets: ExamSet[];
  onChanged: () => void;
}

const SetSelector = ({ questionId, currentSetIds, sets, onChanged }: SetSelectorProps) => {
  const [changing, setChanging] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSetId = e.target.value;
    if (!newSetId) return;
    setChanging(true);
    try {
      const oldSetId = currentSetIds[0]; // current primary set
      await moveQuestionToSet(questionId, newSetId, oldSetId !== newSetId ? oldSetId : undefined);
      onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setChanging(false);
    }
  };

  const currentSetId = currentSetIds[0] ?? '';

  return (
    <div className="flex items-center gap-1.5">
      <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      {changing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      ) : (
        <select
          value={currentSetId}
          onChange={handleChange}
          className="text-xs border border-border rounded px-1.5 py-0.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          <option value="">-- 미배정 --</option>
          {sets.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminQuestionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [activeExamId, setActiveExamId] = useState('');
  const [questionsMap, setQuestionsMap] = useState<Record<string, Question[]>>({});
  const [setsMap, setSetsMap] = useState<Record<string, ExamSet[]>>({});
  const [setQMap, setSetQMap] = useState<Record<string, Record<string, string[]>>>({});
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingQ, setLoadingQ] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin(user?.email)) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    getAllExams()
      .then(data => { setExams(data); if (data.length) setActiveExamId(data[0].id); })
      .finally(() => setLoadingExams(false));
  }, []);

  useEffect(() => {
    if (!activeExamId) return;
    loadData(activeExamId);
  }, [activeExamId]);

  const loadData = async (examId: string) => {
    setLoadingQ(true);
    try {
      const [qs, sets, qSetMap] = await Promise.all([
        getQuestionsForExam(examId),
        getSetsForExam(examId),
        getExamSetQuestionMap(examId),
      ]);
      setQuestionsMap(prev => ({ ...prev, [examId]: qs }));
      setSetsMap(prev => ({ ...prev, [examId]: sets }));
      setSetQMap(prev => ({ ...prev, [examId]: qSetMap }));
    } finally {
      setLoadingQ(false);
    }
  };

  const refresh = () => loadData(activeExamId);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteQuestion(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
  };

  const questions = questionsMap[activeExamId] ?? [];
  const sets = setsMap[activeExamId] ?? [];
  const qSetMap = setQMap[activeExamId] ?? {};

  const diffLabel = (d: number) => d === 1 ? '쉬움' : d === 2 ? '보통' : '어려움';
  const diffColor = (d: number) => d === 1 ? 'bg-green-100 text-green-700' : d === 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  if (loadingExams) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="mb-3 -ml-1">
            <ArrowLeft className="h-4 w-4 mr-1" /> 세트 관리로
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">문제 관리</h1>
              <p className="text-muted-foreground text-sm mt-1">문제를 직접 입력하거나 CSV 파일로 한꺼번에 업로드하세요.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCsvOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />CSV 업로드
              </Button>
              <Button
                onClick={() => { setEditQ(null); setFormOpen(true); }}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="h-4 w-4 mr-2" />새 문제
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeExamId} onValueChange={setActiveExamId}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            {exams.map(exam => (
              <TabsTrigger key={exam.id} value={exam.id} className="text-xs sm:text-sm">
                {exam.code}
                <span className="ml-1.5 text-xs opacity-60">
                  ({(questionsMap[exam.id] ?? []).length})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {exams.map(exam => (
            <TabsContent key={exam.id} value={exam.id}>
              {loadingQ ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
                  <p className="text-sm">문제가 없습니다.</p>
                  <p className="text-xs mt-1">"새 문제" 버튼으로 추가하거나 CSV 파일을 업로드하세요.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const assignedSetIds = qSetMap[q.id] ?? [];
                    const assignedSets = sets.filter(s => assignedSetIds.includes(s.id));
                    return (
                      <div
                        key={q.id}
                        className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-accent/30 transition-colors"
                      >
                        {/* Index */}
                        <span className="shrink-0 text-sm font-bold text-muted-foreground w-8 pt-0.5">
                          Q{idx + 1}.
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug line-clamp-2">{q.text}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor(q.difficulty)}`}>
                              {diffLabel(q.difficulty)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              정답: <strong>{q.correctOptionId.toUpperCase()}</strong>
                            </span>
                            {q.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 h-5">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {/* Set assignment row */}
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            {assignedSets.length > 0 ? (
                              assignedSets.map(s => (
                                <Badge
                                  key={s.id}
                                  variant="outline"
                                  className="text-xs border-accent/40 text-accent gap-1"
                                >
                                  <Layers className="h-3 w-3" />
                                  {s.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">미배정</span>
                            )}
                            <SetSelector
                              questionId={q.id}
                              currentSetIds={assignedSetIds}
                              sets={sets}
                              onChanged={refresh}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => { setEditQ(q); setFormOpen(true); }}
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => setDeleteTarget(q)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Dialogs */}
      <QuestionFormDialog
        examId={activeExamId}
        edit={editQ}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditQ(null); }}
        onSaved={refresh}
      />

      <CsvUploadDialog
        examId={activeExamId}
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onSaved={refresh}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>문제를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 문제와 관련된 보기, 태그, 세트 배정이 모두 삭제됩니다. 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default AdminQuestionsPage;
