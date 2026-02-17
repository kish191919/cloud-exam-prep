import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Plus, Pencil, Trash2, BookOpen, FlaskConical,
  Loader2, Save, FileText, AlertTriangle, X,
} from 'lucide-react';
import { getAllExams } from '@/services/examService';
import { getSetsForExam, getQuestionsForSet } from '@/services/questionService';
import {
  createExamSet,
  updateExamSet,
  deleteExamSet,
  getSetQuestionIds,
  updateSetQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  QuestionInput,
} from '@/services/adminService';
import type { ExamConfig, ExamSet, Question } from '@/types/exam';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '@/lib/admin';

// ─── Set form dialog ─────────────────────────────────────────────────────────
interface SetFormDialogProps {
  examId: string;
  editSet?: ExamSet | null;
  existingSets: ExamSet[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const SetFormDialog = ({ examId, editSet, existingSets, open, onClose, onSaved }: SetFormDialogProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'full' | 'sample'>('full');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editSet) {
      setName(editSet.name);
      setType(editSet.type);
      setDescription(editSet.description ?? '');
    } else {
      setName('');
      setType('full');
      setDescription('');
    }
  }, [editSet, open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editSet) {
        await updateExamSet(editSet.id, { name: name.trim(), type, description: description.trim() });
      } else {
        const maxOrder = Math.max(0, ...existingSets.map(s => s.sortOrder));
        await createExamSet({
          examId,
          name: name.trim(),
          type,
          description: description.trim(),
          sortOrder: maxOrder + 1,
        });
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editSet ? '세트 편집' : '새 세트 추가'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">세트 이름 *</label>
            <Input
              placeholder="예: 세트 1, 샘플 세트"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">세트 유형</label>
            <div className="flex gap-3">
              {(['full', 'sample'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    type === t
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted-foreground hover:border-accent/40'
                  }`}
                >
                  {t === 'full'
                    ? <><BookOpen className="h-4 w-4" /> 전체 세트</>
                    : <><FlaskConical className="h-4 w-4" /> 샘플 세트</>
                  }
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">설명 (선택)</label>
            <Textarea
              placeholder="세트에 대한 간단한 설명"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button
            disabled={!name.trim() || saving}
            onClick={handleSave}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Question form (embedded in SetQuestionsDialog) ───────────────────────────
const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

interface QuestionFormProps {
  examId: string;
  edit?: Question | null;
  onSave: (input: Omit<QuestionInput, 'examId'>) => Promise<void>;
  onCancel: () => void;
}

const QuestionForm = ({ examId: _examId, edit, onSave, onCancel }: QuestionFormProps) => {
  const empty = { text: '', a: '', b: '', c: '', d: '', a_exp: '', b_exp: '', c_exp: '', d_exp: '', correct: 'a' as 'a'|'b'|'c'|'d', explanation: '', difficulty: 1 as 1|2|3, tags: '', keyPoints: '', refLinks: [] as { name: string; url: string }[] };
  const [form, setFormState] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (edit) {
      const opts: Record<string, string> = {};
      const exps: Record<string, string> = {};
      edit.options.forEach(o => { opts[o.id] = o.text; exps[o.id] = o.explanation ?? ''; });
      setFormState({
        text: edit.text,
        a: opts['a'] ?? '', b: opts['b'] ?? '', c: opts['c'] ?? '', d: opts['d'] ?? '',
        a_exp: exps['a'] ?? '', b_exp: exps['b'] ?? '', c_exp: exps['c'] ?? '', d_exp: exps['d'] ?? '',
        correct: edit.correctOptionId as 'a'|'b'|'c'|'d',
        explanation: edit.explanation,
        difficulty: edit.difficulty,
        tags: edit.tags.join(', '),
        keyPoints: edit.keyPoints ?? '',
        refLinks: edit.refLinks ?? [],
      });
    } else {
      setFormState(empty);
    }
    setError('');
  }, [edit]);

  const set = (key: string, val: any) => setFormState(f => ({ ...f, [key]: val }));

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
        refLinks: form.refLinks.filter(r => r.name.trim() && r.url.trim()),
      };
      await onSave(input);
    } catch (e: any) {
      setError(e.message ?? '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-card space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">문제 텍스트 *</label>
        <Textarea
          placeholder="문제를 입력하세요..."
          rows={3}
          value={form.text}
          onChange={e => set('text', e.target.value)}
        />
      </div>

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

      <div>
        <label className="text-sm font-medium mb-1.5 block">해설</label>
        <Textarea
          placeholder="정답 설명을 입력하세요..."
          rows={2}
          value={form.explanation}
          onChange={e => set('explanation', e.target.value)}
        />
      </div>

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

      <div>
        <label className="text-sm font-medium mb-1.5 block">핵심 암기사항 (선택)</label>
        <Textarea
          placeholder="이 문제와 관련하여 반드시 암기해야 할 핵심 사항을 입력하세요..."
          rows={3}
          value={form.keyPoints}
          onChange={e => set('keyPoints', e.target.value)}
        />
      </div>

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

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}>취소</Button>
        <Button
          size="sm"
          disabled={saving}
          onClick={handleSave}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          저장
        </Button>
      </div>
    </div>
  );
};

// ─── Set questions dialog ─────────────────────────────────────────────────────
interface SetQuestionsDialogProps {
  set: ExamSet;
  examId: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const SetQuestionsDialog = ({ set, examId, open, onClose, onSaved }: SetQuestionsDialogProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);   // question id being edited
  const [addingNew, setAddingNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);

  const loadQuestions = async () => {
    setLoading(true);
    const qs = await getQuestionsForSet(set.id);
    setQuestions(qs);
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    loadQuestions();
    setEditingId(null);
    setAddingNew(false);
  }, [open, set.id]);

  // Save edit of an existing question
  const handleUpdateQuestion = async (input: Omit<QuestionInput, 'examId'>) => {
    if (!editingId) return;
    await updateQuestion(editingId, input);
    setEditingId(null);
    await loadQuestions();
  };

  // Create a new question and add it to this set
  const handleAddQuestion = async (input: Omit<QuestionInput, 'examId'>) => {
    const newId = await createQuestion({ ...input, examId });
    const existingIds = await getSetQuestionIds(set.id);
    await updateSetQuestions(set.id, [...existingIds, newId]);
    setAddingNew(false);
    await loadQuestions();
    onSaved(); // refresh set question count
  };

  // Remove question from set (and delete the question record)
  const handleDeleteQuestion = async () => {
    if (!deleteTarget) return;
    const existingIds = await getSetQuestionIds(set.id);
    await updateSetQuestions(set.id, existingIds.filter(id => id !== deleteTarget.id));
    await deleteQuestion(deleteTarget.id);
    setDeleteTarget(null);
    await loadQuestions();
    onSaved();
  };

  const diffLabel = (d: number) => d === 1 ? '쉬움' : d === 2 ? '보통' : '어려움';
  const diffColor = (d: number) => d === 1 ? 'text-green-600' : d === 2 ? 'text-yellow-600' : 'text-red-600';

  return (
    <>
      <Dialog open={open} onOpenChange={v => !v && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {set.name} — 문제 목록
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({questions.length}문제)
                </span>
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {questions.map((q, idx) => (
                  <div key={q.id}>
                    {editingId === q.id ? (
                      <QuestionForm
                        examId={examId}
                        edit={q}
                        onSave={handleUpdateQuestion}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="border rounded-xl p-4 hover:border-accent/30 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-muted-foreground">Q{idx + 1}</span>
                              <span className={`text-xs font-medium ${diffColor(q.difficulty)}`}>
                                {diffLabel(q.difficulty)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                정답: <strong className="text-accent">{q.correctOptionId.toUpperCase()}</strong>
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-2 leading-relaxed">{q.text}</p>
                            <div className="space-y-1 mb-2">
                              {q.options.map(opt => (
                                <div
                                  key={opt.id}
                                  className={`flex items-start gap-2 text-xs p-1.5 rounded ${
                                    opt.id === q.correctOptionId
                                      ? 'bg-accent/10 text-accent font-medium'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                                    opt.id === q.correctOptionId
                                      ? 'border-accent bg-accent text-accent-foreground'
                                      : 'border-muted-foreground/30'
                                  }`}>
                                    {opt.id.toUpperCase()}
                                  </span>
                                  {opt.text}
                                </div>
                              ))}
                            </div>
                            {q.explanation && (
                              <p className="text-xs text-muted-foreground italic border-l-2 border-accent/30 pl-2">
                                {q.explanation}
                              </p>
                            )}
                            {q.tags.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {q.tags.map(tag => (
                                  <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => { setAddingNew(false); setEditingId(q.id); }}
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeleteTarget(q)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {questions.length === 0 && !addingNew && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">이 세트에 문제가 없습니다. 아래에서 추가하세요.</p>
                  </div>
                )}

                {/* New question form */}
                {addingNew && (
                  <QuestionForm
                    examId={examId}
                    onSave={handleAddQuestion}
                    onCancel={() => setAddingNew(false)}
                  />
                )}
              </>
            )}
          </div>

          <div className="border-t pt-3 flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              disabled={addingNew || editingId !== null}
              onClick={() => { setAddingNew(true); setEditingId(null); }}
            >
              <Plus className="h-4 w-4 mr-2" />새 문제 추가
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>문제를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 문제가 세트에서 제거되고 완전히 삭제됩니다. 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ─── Main Admin Page ──────────────────────────────────────────────────────────
const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [activeExamId, setActiveExamId] = useState<string>('');
  const [setsMap, setSetsMap] = useState<Record<string, ExamSet[]>>({});
  const [loadingExams, setLoadingExams] = useState(true);

  const [setFormOpen, setSetFormOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<ExamSet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamSet | null>(null);
  const [questionsSet, setQuestionsSet] = useState<ExamSet | null>(null);

  useEffect(() => {
    if (user !== undefined && !isAdmin(user?.email)) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    getAllExams()
      .then(data => {
        setExams(data);
        if (data.length > 0) setActiveExamId(data[0].id);
      })
      .finally(() => setLoadingExams(false));
  }, []);

  useEffect(() => {
    if (!activeExamId) return;
    loadSets(activeExamId);
  }, [activeExamId]);

  const loadSets = async (examId: string) => {
    const sets = await getSetsForExam(examId);
    setSetsMap(prev => ({ ...prev, [examId]: sets }));
  };

  const handleDeleteSet = async () => {
    if (!deleteTarget) return;
    await deleteExamSet(deleteTarget.id);
    setDeleteTarget(null);
    loadSets(activeExamId);
  };

  const currentSets = setsMap[activeExamId] ?? [];

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">시험 세트 관리</h1>
            <p className="text-muted-foreground text-sm mt-1">시험별 세트를 추가·편집·삭제하고 문제를 관리하세요.</p>
          </div>
          <Link to="/admin/questions">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />문제 관리
            </Button>
          </Link>
        </div>

        <Tabs value={activeExamId} onValueChange={setActiveExamId}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            {exams.map(exam => (
              <TabsTrigger key={exam.id} value={exam.id} className="text-xs sm:text-sm">
                {exam.code}
              </TabsTrigger>
            ))}
          </TabsList>

          {exams.map(exam => (
            <TabsContent key={exam.id} value={exam.id}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {exam.code} · {currentSets.length}개 세트
                    </p>
                  </div>
                  <Button
                    onClick={() => { setEditingSet(null); setSetFormOpen(true); }}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />새 세트
                  </Button>
                </CardHeader>

                <CardContent>
                  {currentSets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">아직 세트가 없습니다. "새 세트" 버튼으로 추가하세요.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentSets.map(set => (
                        <div
                          key={set.id}
                          className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-accent/30 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${set.type === 'sample' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                            {set.type === 'sample'
                              ? <FlaskConical className="h-5 w-5 text-primary" />
                              : <BookOpen className="h-5 w-5 text-accent" />
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold">{set.name}</span>
                              <Badge variant="outline" className={`text-xs ${
                                set.type === 'sample'
                                  ? 'border-primary/40 text-primary'
                                  : 'border-accent/40 text-accent'
                              }`}>
                                {set.type === 'sample' ? '샘플' : '전체'}
                              </Badge>
                            </div>
                            {set.description && (
                              <p className="text-xs text-muted-foreground truncate">{set.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {set.questionCount}문제
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setQuestionsSet(set)}
                              className="text-xs"
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />문제 편집
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setEditingSet(set); setSetFormOpen(true); }}
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(set)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Set form dialog */}
      <SetFormDialog
        examId={activeExamId}
        editSet={editingSet}
        existingSets={currentSets}
        open={setFormOpen}
        onClose={() => { setSetFormOpen(false); setEditingSet(null); }}
        onSaved={() => loadSets(activeExamId)}
      />

      {/* Set questions dialog */}
      {questionsSet && (
        <SetQuestionsDialog
          set={questionsSet}
          examId={activeExamId}
          open={!!questionsSet}
          onClose={() => setQuestionsSet(null)}
          onSaved={() => loadSets(activeExamId)}
        />
      )}

      {/* Delete set confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>세트를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> 세트가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSet}
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

export default AdminPage;
