import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Loader2, ListChecks, Save, FileText,
} from 'lucide-react';
import { getAllExams } from '@/services/examService';
import { getSetsForExam, getQuestionsForExam } from '@/services/questionService';
import {
  createExamSet,
  updateExamSet,
  deleteExamSet,
  getSetQuestionIds,
  updateSetQuestions,
} from '@/services/adminService';
import type { ExamConfig, ExamSet, Question } from '@/types/exam';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '@/lib/admin';

// ─── Set form dialog ────────────────────────────────────────────────────────
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
          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">세트 이름 *</label>
            <Input
              placeholder="예: 세트 1, 샘플 세트"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Type */}
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

          {/* Description */}
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

// ─── Question picker dialog ──────────────────────────────────────────────────
interface QuestionPickerDialogProps {
  set: ExamSet;
  allQuestions: Question[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const QuestionPickerDialog = ({ set, allQuestions, open, onClose, onSaved }: QuestionPickerDialogProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getSetQuestionIds(set.id)
      .then(ids => setSelected(new Set(ids)))
      .finally(() => setLoading(false));
  }, [open, set.id]);

  const toggle = (qId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSetQuestions(set.id, Array.from(selected));
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
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            문제 편집 — {set.name}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({selected.size}문제 선택됨)
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {allQuestions.map((q, idx) => (
              <div
                key={q.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selected.has(q.id)
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/30'
                }`}
                onClick={() => toggle(q.id)}
              >
                <Checkbox
                  checked={selected.has(q.id)}
                  onCheckedChange={() => toggle(q.id)}
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-muted-foreground mr-2">Q{idx + 1}.</span>
                  <span className="text-sm">{q.text}</span>
                  {q.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {q.tags.map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button
            disabled={saving}
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

// ─── Main Admin Page ─────────────────────────────────────────────────────────
const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [activeExamId, setActiveExamId] = useState<string>('');
  const [setsMap, setSetsMap] = useState<Record<string, ExamSet[]>>({});
  const [questionsMap, setQuestionsMap] = useState<Record<string, Question[]>>({});
  const [loadingExams, setLoadingExams] = useState(true);

  // Dialog state
  const [setFormOpen, setSetFormOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<ExamSet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamSet | null>(null);
  const [questionPickerSet, setQuestionPickerSet] = useState<ExamSet | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user !== undefined && !isAdmin(user?.email)) navigate('/');
  }, [user, navigate]);

  // Load exams
  useEffect(() => {
    getAllExams()
      .then(data => {
        setExams(data);
        if (data.length > 0) setActiveExamId(data[0].id);
      })
      .finally(() => setLoadingExams(false));
  }, []);

  // Load sets & questions when active exam changes
  useEffect(() => {
    if (!activeExamId) return;
    loadSets(activeExamId);
    if (!questionsMap[activeExamId]) {
      getQuestionsForExam(activeExamId).then(qs => {
        setQuestionsMap(prev => ({ ...prev, [activeExamId]: qs }));
      });
    }
  }, [activeExamId]);

  const loadSets = async (examId: string) => {
    const sets = await getSetsForExam(examId);
    setSetsMap(prev => ({ ...prev, [examId]: sets }));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteExamSet(deleteTarget.id);
    setDeleteTarget(null);
    loadSets(activeExamId);
  };

  const currentSets = setsMap[activeExamId] ?? [];
  const currentQuestions = questionsMap[activeExamId] ?? [];

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">시험 세트 관리</h1>
            <p className="text-muted-foreground text-sm mt-1">시험별 세트를 추가·편집·삭제하고 문제를 배정하세요.</p>
          </div>
          <Link to="/admin/questions">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />문제 관리
            </Button>
          </Link>
        </div>

        <Tabs value={activeExamId} onValueChange={setActiveExamId}>
          {/* Exam tabs */}
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
                      {exam.code} · {exam.questionCount}문제 · {currentSets.length}개 세트
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
                          {/* Icon */}
                          <div className={`p-2 rounded-lg ${set.type === 'sample' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                            {set.type === 'sample'
                              ? <FlaskConical className="h-5 w-5 text-primary" />
                              : <BookOpen className="h-5 w-5 text-accent" />
                            }
                          </div>

                          {/* Info */}
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

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setQuestionPickerSet(set)}
                              className="text-xs"
                            >
                              <ListChecks className="h-3.5 w-3.5 mr-1" />문제 편집
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

      {/* Set form dialog (create / edit) */}
      <SetFormDialog
        examId={activeExamId}
        editSet={editingSet}
        existingSets={currentSets}
        open={setFormOpen}
        onClose={() => { setSetFormOpen(false); setEditingSet(null); }}
        onSaved={() => loadSets(activeExamId)}
      />

      {/* Question picker dialog */}
      {questionPickerSet && (
        <QuestionPickerDialog
          set={questionPickerSet}
          allQuestions={currentQuestions}
          open={!!questionPickerSet}
          onClose={() => setQuestionPickerSet(null)}
          onSaved={() => loadSets(activeExamId)}
        />
      )}

      {/* Delete confirmation */}
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

export default AdminPage;
