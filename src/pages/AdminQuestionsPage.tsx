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
  Save, CheckCircle2, AlertTriangle, ArrowLeft, Layers, X,
} from 'lucide-react';
import { getAllExams } from '@/services/examService';
import { getQuestionsForExam, getSetsForExam } from '@/services/questionService';
import {
  createQuestion, updateQuestion, deleteQuestion,
  bulkCreateQuestions, QuestionInput,
  getExamSetQuestionMap, moveQuestionToSet,
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
  // Expected: text,option_a,option_b,option_c,option_d,correct,explanation,tags
  if (cols.length < 7) return null;
  const [text, optA, optB, optC, optD, correct, explanation, tagsStr = ''] = cols;
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
    tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
  };
}

// CSV template download
function downloadCSVTemplate() {
  const header = 'text,option_a,option_b,option_c,option_d,correct,explanation,tags';
  const example = '"Which AWS service provides foundation models through a single API?","Amazon SageMaker","Amazon Bedrock","Amazon Comprehend","Amazon Rekognition","b","Amazon Bedrock provides foundation models through a unified API.","AI,ML"';
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

const LANGS = [
  { key: 'en', label: 'EN' },
  { key: 'pt', label: 'PT' },
  { key: 'es', label: 'ES' },
  { key: 'ja', label: 'JA' },
] as const;
type LangKey = typeof LANGS[number]['key'];

const QuestionFormDialog = ({ examId, edit, open, onClose, onSaved }: QFormProps) => {
  const empty = {
    text: '', text_en: '', text_pt: '', text_es: '', text_ja: '',
    a: '', b: '', c: '', d: '',
    a_en: '', b_en: '', c_en: '', d_en: '',
    a_pt: '', b_pt: '', c_pt: '', d_pt: '',
    a_es: '', b_es: '', c_es: '', d_es: '',
    a_ja: '', b_ja: '', c_ja: '', d_ja: '',
    a_exp: '', b_exp: '', c_exp: '', d_exp: '',
    a_exp_en: '', b_exp_en: '', c_exp_en: '', d_exp_en: '',
    a_exp_pt: '', b_exp_pt: '', c_exp_pt: '', d_exp_pt: '',
    a_exp_es: '', b_exp_es: '', c_exp_es: '', d_exp_es: '',
    a_exp_ja: '', b_exp_ja: '', c_exp_ja: '', d_exp_ja: '',
    correct: 'a' as 'a'|'b'|'c'|'d',
    explanation: '', explanation_en: '', explanation_pt: '', explanation_es: '', explanation_ja: '',
    tags: '',
    keyPoints: '', keyPoints_en: '', keyPoints_pt: '', keyPoints_es: '', keyPoints_ja: '',
    refLinks: [] as { name: string; url: string }[],
  };
  const [form, setForm] = useState(empty);
  const [langTab, setLangTab] = useState<LangKey>('en');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (edit) {
      const opts: Record<string, string> = {};
      const opts_en: Record<string, string> = {};
      const opts_pt: Record<string, string> = {};
      const opts_es: Record<string, string> = {};
      const opts_ja: Record<string, string> = {};
      const exps: Record<string, string> = {};
      const exps_en: Record<string, string> = {};
      const exps_pt: Record<string, string> = {};
      const exps_es: Record<string, string> = {};
      const exps_ja: Record<string, string> = {};
      edit.options.forEach(o => {
        opts[o.id] = o.text;
        opts_en[o.id] = o.textEn ?? '';
        opts_pt[o.id] = o.textPt ?? '';
        opts_es[o.id] = o.textEs ?? '';
        opts_ja[o.id] = o.textJa ?? '';
        exps[o.id] = o.explanation ?? '';
        exps_en[o.id] = o.explanationEn ?? '';
        exps_pt[o.id] = o.explanationPt ?? '';
        exps_es[o.id] = o.explanationEs ?? '';
        exps_ja[o.id] = o.explanationJa ?? '';
      });
      setForm({
        text: edit.text,
        text_en: edit.textEn ?? '',
        text_pt: edit.textPt ?? '',
        text_es: edit.textEs ?? '',
        text_ja: edit.textJa ?? '',
        a: opts['a'] ?? '', b: opts['b'] ?? '', c: opts['c'] ?? '', d: opts['d'] ?? '',
        a_en: opts_en['a'] ?? '', b_en: opts_en['b'] ?? '', c_en: opts_en['c'] ?? '', d_en: opts_en['d'] ?? '',
        a_pt: opts_pt['a'] ?? '', b_pt: opts_pt['b'] ?? '', c_pt: opts_pt['c'] ?? '', d_pt: opts_pt['d'] ?? '',
        a_es: opts_es['a'] ?? '', b_es: opts_es['b'] ?? '', c_es: opts_es['c'] ?? '', d_es: opts_es['d'] ?? '',
        a_ja: opts_ja['a'] ?? '', b_ja: opts_ja['b'] ?? '', c_ja: opts_ja['c'] ?? '', d_ja: opts_ja['d'] ?? '',
        a_exp: exps['a'] ?? '', b_exp: exps['b'] ?? '', c_exp: exps['c'] ?? '', d_exp: exps['d'] ?? '',
        a_exp_en: exps_en['a'] ?? '', b_exp_en: exps_en['b'] ?? '', c_exp_en: exps_en['c'] ?? '', d_exp_en: exps_en['d'] ?? '',
        a_exp_pt: exps_pt['a'] ?? '', b_exp_pt: exps_pt['b'] ?? '', c_exp_pt: exps_pt['c'] ?? '', d_exp_pt: exps_pt['d'] ?? '',
        a_exp_es: exps_es['a'] ?? '', b_exp_es: exps_es['b'] ?? '', c_exp_es: exps_es['c'] ?? '', d_exp_es: exps_es['d'] ?? '',
        a_exp_ja: exps_ja['a'] ?? '', b_exp_ja: exps_ja['b'] ?? '', c_exp_ja: exps_ja['c'] ?? '', d_exp_ja: exps_ja['d'] ?? '',
        correct: edit.correctOptionId as 'a'|'b'|'c'|'d',
        explanation: edit.explanation,
        explanation_en: edit.explanationEn ?? '',
        explanation_pt: edit.explanationPt ?? '',
        explanation_es: edit.explanationEs ?? '',
        explanation_ja: edit.explanationJa ?? '',
        tags: edit.tags.join(', '),
        keyPoints: edit.keyPoints ?? '',
        keyPoints_en: edit.keyPointsEn ?? '',
        keyPoints_pt: edit.keyPointsPt ?? '',
        keyPoints_es: edit.keyPointsEs ?? '',
        keyPoints_ja: edit.keyPointsJa ?? '',
        refLinks: Array.isArray(edit.refLinks) ? edit.refLinks : [],
      });
    } else {
      setForm(empty);
    }
    setError('');
  }, [edit, open]);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

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
        textEn: form.text_en.trim() || undefined,
        textPt: form.text_pt.trim() || undefined,
        textEs: form.text_es.trim() || undefined,
        textJa: form.text_ja.trim() || undefined,
        options: ([
          { id: 'a' as const, text: form.a.trim(), textEn: form.a_en.trim() || undefined, textPt: form.a_pt.trim() || undefined, textEs: form.a_es.trim() || undefined, textJa: form.a_ja.trim() || undefined, explanation: form.a_exp.trim() || undefined, explanationEn: form.a_exp_en.trim() || undefined, explanationPt: form.a_exp_pt.trim() || undefined, explanationEs: form.a_exp_es.trim() || undefined, explanationJa: form.a_exp_ja.trim() || undefined },
          { id: 'b' as const, text: form.b.trim(), textEn: form.b_en.trim() || undefined, textPt: form.b_pt.trim() || undefined, textEs: form.b_es.trim() || undefined, textJa: form.b_ja.trim() || undefined, explanation: form.b_exp.trim() || undefined, explanationEn: form.b_exp_en.trim() || undefined, explanationPt: form.b_exp_pt.trim() || undefined, explanationEs: form.b_exp_es.trim() || undefined, explanationJa: form.b_exp_ja.trim() || undefined },
          { id: 'c' as const, text: form.c.trim(), textEn: form.c_en.trim() || undefined, textPt: form.c_pt.trim() || undefined, textEs: form.c_es.trim() || undefined, textJa: form.c_ja.trim() || undefined, explanation: form.c_exp.trim() || undefined, explanationEn: form.c_exp_en.trim() || undefined, explanationPt: form.c_exp_pt.trim() || undefined, explanationEs: form.c_exp_es.trim() || undefined, explanationJa: form.c_exp_ja.trim() || undefined },
          { id: 'd' as const, text: form.d.trim(), textEn: form.d_en.trim() || undefined, textPt: form.d_pt.trim() || undefined, textEs: form.d_es.trim() || undefined, textJa: form.d_ja.trim() || undefined, explanation: form.d_exp.trim() || undefined, explanationEn: form.d_exp_en.trim() || undefined, explanationPt: form.d_exp_pt.trim() || undefined, explanationEs: form.d_exp_es.trim() || undefined, explanationJa: form.d_exp_ja.trim() || undefined },
        ]).filter(o => o.text),
        correctOptionId: form.correct,
        explanation: form.explanation.trim(),
        explanationEn: form.explanation_en.trim() || undefined,
        explanationPt: form.explanation_pt.trim() || undefined,
        explanationEs: form.explanation_es.trim() || undefined,
        explanationJa: form.explanation_ja.trim() || undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        keyPoints: form.keyPoints.trim() || undefined,
        keyPointsEn: form.keyPoints_en.trim() || undefined,
        keyPointsPt: form.keyPoints_pt.trim() || undefined,
        keyPointsEs: form.keyPoints_es.trim() || undefined,
        keyPointsJa: form.keyPoints_ja.trim() || undefined,
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
          {/* Language tab selector */}
          <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30 w-fit">
            <span className="text-xs text-muted-foreground px-2">번역 언어:</span>
            {LANGS.map(l => (
              <button
                key={l.key}
                type="button"
                onClick={() => setLangTab(l.key)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  langTab === l.key
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Question text */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">문제 텍스트 *</label>
            <Textarea
              placeholder="문제를 입력하세요..."
              rows={3}
              value={form.text}
              onChange={e => set('text', e.target.value)}
            />
            <Textarea
              placeholder={`${langTab.toUpperCase()} question text (optional)`}
              rows={2}
              value={form[`text_${langTab}` as keyof typeof form] as string}
              onChange={e => set(`text_${langTab}`, e.target.value)}
              className="mt-1.5 text-sm"
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
                  <div className="ml-9">
                    <Input
                      placeholder={`Option ${OPTION_LABELS[i]} in ${langTab.toUpperCase()} (optional)`}
                      value={form[`${id}_${langTab}` as keyof typeof form] as string}
                      onChange={e => set(`${id}_${langTab}`, e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                  {form[id].trim() && (
                    <div className="ml-9 space-y-1">
                      <Input
                        placeholder={`보기 ${OPTION_LABELS[i]} 설명 (KO) — 왜 이 보기가 맞거나 틀린지`}
                        value={form[`${id}_exp` as keyof typeof form] as string}
                        onChange={e => set(`${id}_exp`, e.target.value)}
                        className="text-xs h-8"
                      />
                      <Input
                        placeholder={`보기 ${OPTION_LABELS[i]} 설명 (${langTab.toUpperCase()}) — optional`}
                        value={form[`${id}_exp_${langTab}` as keyof typeof form] as string}
                        onChange={e => set(`${id}_exp_${langTab}`, e.target.value)}
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
            <Textarea
              placeholder={`${langTab.toUpperCase()} explanation (optional)`}
              rows={2}
              value={form[`explanation_${langTab}` as keyof typeof form] as string}
              onChange={e => set(`explanation_${langTab}`, e.target.value)}
              className="mt-1.5 text-sm"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">태그 (쉼표 구분)</label>
            <Input
              placeholder="예: AI, ML, SageMaker"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
            />
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
            <Textarea
              placeholder={`Key points in ${langTab.toUpperCase()} (optional)`}
              rows={2}
              value={form[`keyPoints_${langTab}` as keyof typeof form] as string}
              onChange={e => set(`keyPoints_${langTab}`, e.target.value)}
              className="mt-1.5 text-sm"
            />
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
            <p>correct, explanation, tags</p>
            <p className="mt-2 text-xs">• correct: a / b / c / d 중 하나</p>
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
