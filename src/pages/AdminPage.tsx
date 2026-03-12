import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
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
  ChevronUp, ChevronDown, Shuffle, ArrowRightLeft,
  Search, Crown, UserCheck, UserX, Users,
  ChevronLeft, ChevronRight,
  BarChart3, TrendingUp, Clock, Activity, CalendarDays,
  RefreshCw, Megaphone, Pin, CheckSquare, NotebookPen, Eye, EyeOff, Gift,
  Flag, ExternalLink, MessageSquare, Send,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  getAllAnnouncementsAdmin,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/services/boardService';
import {
  getAllReports,
  updateReport,
  getReportCounts,
  getQuestionSetInfo,
  REASON_LABELS,
  STATUS_LABELS,
  type QuestionReport,
  type QuestionSetInfo,
  type ReportStatus,
} from '@/services/reportService';
import {
  getAllContacts,
  updateContact,
  getContactCounts,
} from '@/services/contactService';
import {
  CATEGORY_LABELS as CONTACT_CATEGORY_LABELS,
  STATUS_LABELS as CONTACT_STATUS_LABELS,
  type ContactMessage,
  type ContactStatus,
} from '@/types/contact';
import type { Announcement, AnnouncementInput, AnnouncementCategory } from '@/types/announcement';
import {
  getAllBlogPostsAdmin,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  calcReadTime,
} from '@/services/blogService';
import type { BlogPost, BlogPostInput, BlogProvider } from '@/services/blogService';
import MarkdownEditor from '@/components/MarkdownEditor';
import { getAllExams } from '@/services/examService';
import { getSetsForExam, getQuestionsForSet } from '@/services/questionService';
import {
  createExamSet,
  updateExamSet,
  deleteExamSet,
  getSetQuestionIds,
  updateSetQuestions,
  moveQuestionToSet,
  moveQuestionsToSet,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllProfiles,
  updateSubscriptionTier,
  getAdminOverview,
  getRecentSessions,
  getExamStats,
  getSetStats,
  getHourlyActivity,
  getFreeAccessEvent,
  setFreeAccessEvent,
  QuestionInput,
  ProfileResult,
  OverviewStats,
  RecentSession,
  ExamStat,
  SetStat,
  HourStat,
  WeekdayStat,
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

const LANGS = [
  { key: 'en', label: 'EN' },
  { key: 'pt', label: 'PT' },
  { key: 'es', label: 'ES' },
] as const;
type LangKey = typeof LANGS[number]['key'];

const QuestionForm = ({ examId: _examId, edit, onSave, onCancel }: QuestionFormProps) => {
  const empty = {
    text: '', text_en: '', text_pt: '', text_es: '',
    a: '', b: '', c: '', d: '',
    a_en: '', b_en: '', c_en: '', d_en: '',
    a_pt: '', b_pt: '', c_pt: '', d_pt: '',
    a_es: '', b_es: '', c_es: '', d_es: '',
    a_exp: '', b_exp: '', c_exp: '', d_exp: '',
    a_exp_en: '', b_exp_en: '', c_exp_en: '', d_exp_en: '',
    a_exp_pt: '', b_exp_pt: '', c_exp_pt: '', d_exp_pt: '',
    a_exp_es: '', b_exp_es: '', c_exp_es: '', d_exp_es: '',
    correct: 'a' as 'a'|'b'|'c'|'d',
    explanation: '', explanation_en: '', explanation_pt: '', explanation_es: '',
    tags: '', keyPoints: '', keyPoints_en: '', keyPoints_pt: '', keyPoints_es: '',
    refLinks: [] as { name: string; url: string }[],
  };
  const [form, setFormState] = useState(empty);
  const [langTab, setLangTab] = useState<LangKey>('en');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (edit) {
      const opts: Record<string, string> = {};
      const opts_en: Record<string, string> = {};
      const opts_pt: Record<string, string> = {};
      const opts_es: Record<string, string> = {};
      const exps: Record<string, string> = {};
      const exps_en: Record<string, string> = {};
      const exps_pt: Record<string, string> = {};
      const exps_es: Record<string, string> = {};
      edit.options.forEach(o => {
        opts[o.id] = o.text; opts_en[o.id] = o.textEn ?? ''; opts_pt[o.id] = o.textPt ?? ''; opts_es[o.id] = o.textEs ?? '';
        exps[o.id] = o.explanation ?? ''; exps_en[o.id] = o.explanationEn ?? ''; exps_pt[o.id] = o.explanationPt ?? ''; exps_es[o.id] = o.explanationEs ?? '';
      });
      setFormState({
        text: edit.text,
        text_en: edit.textEn ?? '', text_pt: edit.textPt ?? '', text_es: edit.textEs ?? '',
        a: opts['a'] ?? '', b: opts['b'] ?? '', c: opts['c'] ?? '', d: opts['d'] ?? '',
        a_en: opts_en['a'] ?? '', b_en: opts_en['b'] ?? '', c_en: opts_en['c'] ?? '', d_en: opts_en['d'] ?? '',
        a_pt: opts_pt['a'] ?? '', b_pt: opts_pt['b'] ?? '', c_pt: opts_pt['c'] ?? '', d_pt: opts_pt['d'] ?? '',
        a_es: opts_es['a'] ?? '', b_es: opts_es['b'] ?? '', c_es: opts_es['c'] ?? '', d_es: opts_es['d'] ?? '',
        a_exp: exps['a'] ?? '', b_exp: exps['b'] ?? '', c_exp: exps['c'] ?? '', d_exp: exps['d'] ?? '',
        a_exp_en: exps_en['a'] ?? '', b_exp_en: exps_en['b'] ?? '', c_exp_en: exps_en['c'] ?? '', d_exp_en: exps_en['d'] ?? '',
        a_exp_pt: exps_pt['a'] ?? '', b_exp_pt: exps_pt['b'] ?? '', c_exp_pt: exps_pt['c'] ?? '', d_exp_pt: exps_pt['d'] ?? '',
        a_exp_es: exps_es['a'] ?? '', b_exp_es: exps_es['b'] ?? '', c_exp_es: exps_es['c'] ?? '', d_exp_es: exps_es['d'] ?? '',
        correct: edit.correctOptionId as 'a'|'b'|'c'|'d',
        explanation: edit.explanation,
        explanation_en: edit.explanationEn ?? '', explanation_pt: edit.explanationPt ?? '', explanation_es: edit.explanationEs ?? '',
        tags: edit.tags.join(', '),
        keyPoints: edit.keyPoints ?? '',
        keyPoints_en: edit.keyPointsEn ?? '', keyPoints_pt: edit.keyPointsPt ?? '', keyPoints_es: edit.keyPointsEs ?? '',
        refLinks: Array.isArray(edit.refLinks) ? edit.refLinks : [],
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
        textEn: form.text_en.trim() || undefined,
        textPt: form.text_pt.trim() || undefined,
        textEs: form.text_es.trim() || undefined,
        options: ([
          { id: 'a' as const, text: form.a.trim(), textEn: form.a_en.trim() || undefined, textPt: form.a_pt.trim() || undefined, textEs: form.a_es.trim() || undefined, explanation: form.a_exp.trim() || undefined, explanationEn: form.a_exp_en.trim() || undefined, explanationPt: form.a_exp_pt.trim() || undefined, explanationEs: form.a_exp_es.trim() || undefined },
          { id: 'b' as const, text: form.b.trim(), textEn: form.b_en.trim() || undefined, textPt: form.b_pt.trim() || undefined, textEs: form.b_es.trim() || undefined, explanation: form.b_exp.trim() || undefined, explanationEn: form.b_exp_en.trim() || undefined, explanationPt: form.b_exp_pt.trim() || undefined, explanationEs: form.b_exp_es.trim() || undefined },
          { id: 'c' as const, text: form.c.trim(), textEn: form.c_en.trim() || undefined, textPt: form.c_pt.trim() || undefined, textEs: form.c_es.trim() || undefined, explanation: form.c_exp.trim() || undefined, explanationEn: form.c_exp_en.trim() || undefined, explanationPt: form.c_exp_pt.trim() || undefined, explanationEs: form.c_exp_es.trim() || undefined },
          { id: 'd' as const, text: form.d.trim(), textEn: form.d_en.trim() || undefined, textPt: form.d_pt.trim() || undefined, textEs: form.d_es.trim() || undefined, explanation: form.d_exp.trim() || undefined, explanationEn: form.d_exp_en.trim() || undefined, explanationPt: form.d_exp_pt.trim() || undefined, explanationEs: form.d_exp_es.trim() || undefined },
        ]).filter(o => o.text),
        correctOptionId: form.correct,
        explanation: form.explanation.trim(),
        explanationEn: form.explanation_en.trim() || undefined,
        explanationPt: form.explanation_pt.trim() || undefined,
        explanationEs: form.explanation_es.trim() || undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        keyPoints: form.keyPoints.trim() || undefined,
        keyPointsEn: form.keyPoints_en.trim() || undefined,
        keyPointsPt: form.keyPoints_pt.trim() || undefined,
        keyPointsEs: form.keyPoints_es.trim() || undefined,
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
        <div className="flex gap-1 mt-1.5 mb-1">
          {LANGS.map(l => (
            <button
              key={l.key}
              type="button"
              onClick={() => setLangTab(l.key)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                langTab === l.key
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <Textarea
          placeholder={`Question text in ${langTab.toUpperCase()} (optional)`}
          rows={2}
          value={form[`text_${langTab}` as keyof typeof form] as string}
          onChange={e => set(`text_${langTab}`, e.target.value)}
          className="text-sm"
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
                    placeholder={`보기 ${OPTION_LABELS[i]} 설명 (선택) — 왜 이 보기가 맞거나 틀린지`}
                    value={form[`${id}_exp` as keyof typeof form] as string}
                    onChange={e => set(`${id}_exp`, e.target.value)}
                    className="text-xs h-8"
                  />
                  <Input
                    placeholder={`Option ${OPTION_LABELS[i]} explanation in ${langTab.toUpperCase()} (optional)`}
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

      <div>
        <label className="text-sm font-medium mb-1.5 block">해설</label>
        <Textarea
          placeholder="정답 설명을 입력하세요..."
          rows={2}
          value={form.explanation}
          onChange={e => set('explanation', e.target.value)}
        />
        <Textarea
          placeholder={`Explanation in ${langTab.toUpperCase()} (optional)`}
          rows={2}
          value={form[`explanation_${langTab}` as keyof typeof form] as string}
          onChange={e => set(`explanation_${langTab}`, e.target.value)}
          className="mt-1.5 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">태그 (쉼표 구분)</label>
        <Input
          placeholder="예: AI, ML, SageMaker"
          value={form.tags}
          onChange={e => set('tags', e.target.value)}
        />
      </div>

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
  allSets: ExamSet[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const SetQuestionsDialog = ({ set, examId, allSets, open, onClose, onSaved }: SetQuestionsDialogProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const newFormRef = useRef<HTMLDivElement>(null);
  const [shuffling, setShuffling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [moveDialogQuestion, setMoveDialogQuestion] = useState<Question | null>(null);
  const [moveTargetSetId, setMoveTargetSetId] = useState('');
  const [moving, setMoving] = useState(false);
  const [scrollToId, setScrollToId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false);
  const [bulkMoveTargetSetId, setBulkMoveTargetSetId] = useState('');
  const [bulkMoving, setBulkMoving] = useState(false);

  const otherSets = allSets.filter(s => s.id !== set.id);

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
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, [open, set.id]);

  useEffect(() => {
    if (!scrollToId || questions.length === 0) return;
    const el = document.getElementById(`q-${scrollToId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setScrollToId(null);
    }
  }, [scrollToId, questions]);

  const handleUpdateQuestion = async (input: Omit<QuestionInput, 'examId'>) => {
    if (!editingId) return;
    const savedId = editingId;
    await updateQuestion(editingId, input);
    setEditingId(null);
    setScrollToId(savedId);
    await loadQuestions();
  };

  const handleAddQuestion = async (input: Omit<QuestionInput, 'examId'>) => {
    const newId = await createQuestion({ ...input, examId });
    const existingIds = await getSetQuestionIds(set.id);
    await updateSetQuestions(set.id, [...existingIds, newId]);
    setAddingNew(false);
    await loadQuestions();
    onSaved();
  };

  const handleShuffle = async () => {
    setShuffling(true);
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    await updateSetQuestions(set.id, shuffled.map(q => q.id));
    await loadQuestions();
    setShuffling(false);
  };

  const handleReorderQuestion = async (idx: number, dir: 'up' | 'down') => {
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= questions.length) return;
    setReordering(true);
    const reordered = [...questions];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    await updateSetQuestions(set.id, reordered.map(q => q.id));
    await loadQuestions();
    setReordering(false);
  };

  const handleMoveToOtherSet = async () => {
    if (!moveDialogQuestion || !moveTargetSetId) return;
    setMoving(true);
    await moveQuestionToSet(moveDialogQuestion.id, moveTargetSetId, set.id);
    setMoveDialogQuestion(null);
    await loadQuestions();
    onSaved();
    setMoving(false);
  };

  const handleBulkMoveToOtherSet = async () => {
    if (selectedIds.size === 0 || !bulkMoveTargetSetId) return;
    setBulkMoving(true);
    await moveQuestionsToSet([...selectedIds], bulkMoveTargetSetId, set.id);
    setBulkMoveDialogOpen(false);
    setSelectedIds(new Set());
    setSelectionMode(false);
    await loadQuestions();
    onSaved();
    setBulkMoving(false);
  };

  const toggleSelectQuestion = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = questions.length > 0 && selectedIds.size === questions.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < questions.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map(q => q.id)));
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteTarget) return;
    const existingIds = await getSetQuestionIds(set.id);
    await updateSetQuestions(set.id, existingIds.filter(id => id !== deleteTarget.id));
    await deleteQuestion(deleteTarget.id);
    setDeleteTarget(null);
    await loadQuestions();
    onSaved();
  };

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

          {!loading && questions.length > 0 && (
            <div className="flex items-center justify-between px-1 pb-2 border-b gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={selectionMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectionMode(v => !v);
                    setSelectedIds(new Set());
                  }}
                >
                  <CheckSquare className="h-4 w-4 mr-1.5" />
                  {selectionMode ? '선택 취소' : '선택'}
                </Button>
                {selectionMode && (
                  <>
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={handleToggleAll}
                      id="select-all"
                    />
                    <label htmlFor="select-all" className="text-xs text-muted-foreground cursor-pointer select-none">
                      {selectedIds.size > 0 ? `${selectedIds.size}개 선택됨` : '전체 선택'}
                    </label>
                    <Button
                      size="sm"
                      disabled={selectedIds.size === 0 || otherSets.length === 0}
                      title={otherSets.length === 0 ? '이동할 다른 세트가 없습니다' : undefined}
                      onClick={() => {
                        setBulkMoveTargetSetId(otherSets[0]?.id ?? '');
                        setBulkMoveDialogOpen(true);
                      }}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <ArrowRightLeft className="h-4 w-4 mr-1.5" />
                      선택 이동 ({selectedIds.size})
                    </Button>
                  </>
                )}
                {!selectionMode && (
                  <span className="text-xs text-muted-foreground">▲/▼ 순서 변경, → 다른 세트로 이동</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={shuffling || questions.length < 2}
                onClick={handleShuffle}
              >
                {shuffling
                  ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  : <Shuffle className="h-4 w-4 mr-2" />
                }
                랜덤으로 섞기
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {questions.map((q, idx) => (
                  <div key={q.id} id={`q-${q.id}`}>
                    {editingId === q.id ? (
                      <QuestionForm
                        examId={examId}
                        edit={q}
                        onSave={handleUpdateQuestion}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div
                        className={`border rounded-xl p-4 transition-colors ${
                          selectionMode
                            ? selectedIds.has(q.id)
                              ? 'border-accent bg-accent/5 cursor-pointer'
                              : 'hover:border-accent/30 cursor-pointer'
                            : 'hover:border-accent/30'
                        }`}
                        onClick={selectionMode ? () => toggleSelectQuestion(q.id) : undefined}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {selectionMode && (
                            <Checkbox
                              checked={selectedIds.has(q.id)}
                              onCheckedChange={() => toggleSelectQuestion(q.id)}
                              onClick={e => e.stopPropagation()}
                              className="mt-0.5 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-muted-foreground">Q{idx + 1}</span>
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
                          {!selectionMode && (
                            <div className="flex items-start gap-1 shrink-0">
                              <div className="flex flex-col gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={idx === 0 || reordering}
                                  onClick={() => handleReorderQuestion(idx, 'up')}
                                >
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={idx === questions.length - 1 || reordering}
                                  onClick={() => handleReorderQuestion(idx, 'down')}
                                >
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={otherSets.length === 0}
                                title={otherSets.length === 0 ? '이동할 다른 세트가 없습니다' : '다른 세트로 이동'}
                                onClick={() => {
                                  setMoveDialogQuestion(q);
                                  setMoveTargetSetId(otherSets[0]?.id ?? '');
                                }}
                              >
                                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                              </Button>
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
                          )}
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

                {addingNew && (
                  <div ref={newFormRef}>
                    <QuestionForm
                      examId={examId}
                      onSave={handleAddQuestion}
                      onCancel={() => setAddingNew(false)}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t pt-3 flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              disabled={addingNew || editingId !== null}
              onClick={() => {
                setAddingNew(true);
                setEditingId(null);
                setTimeout(() => newFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />새 문제 추가
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      <Dialog open={!!moveDialogQuestion} onOpenChange={v => !v && setMoveDialogQuestion(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>다른 세트로 이동</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              이 문제를 현재 세트(<strong>{set.name}</strong>)에서 제거하고 선택한 세트에 추가합니다.
            </p>
            <select
              value={moveTargetSetId}
              onChange={e => setMoveTargetSetId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            >
              {otherSets.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.questionCount}문제)
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogQuestion(null)}>취소</Button>
            <Button
              disabled={moving || !moveTargetSetId}
              onClick={handleMoveToOtherSet}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {moving
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <ArrowRightLeft className="h-4 w-4 mr-2" />
              }
              이동
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkMoveDialogOpen} onOpenChange={v => !v && setBulkMoveDialogOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{selectedIds.size}개 문제를 다른 세트로 이동</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              선택한 <strong>{selectedIds.size}개</strong> 문제를 현재 세트(<strong>{set.name}</strong>)에서 제거하고 선택한 세트에 추가합니다.
            </p>
            <select
              value={bulkMoveTargetSetId}
              onChange={e => setBulkMoveTargetSetId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            >
              {otherSets.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.questionCount}문제)
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkMoveDialogOpen(false)}>취소</Button>
            <Button
              disabled={bulkMoving || !bulkMoveTargetSetId}
              onClick={handleBulkMoveToOtherSet}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {bulkMoving
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <ArrowRightLeft className="h-4 w-4 mr-2" />
              }
              이동 ({selectedIds.size}개)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── Subscription Management Section ─────────────────────────────────────────
const PAGE_SIZE = 20;

const SubscriptionManager = () => {
  const [profiles, setProfiles] = useState<ProfileResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [freeCount, setFreeCount] = useState(0);
  const [premiumCount, setPremiumCount] = useState(0);
  const [page, setPage] = useState(0);
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'premium'>('all');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const loadProfiles = useCallback(async (p: number, tier: typeof filterTier, email: string) => {
    setLoading(true);
    setError('');
    try {
      const { data, count } = await getAllProfiles(
        p,
        PAGE_SIZE,
        tier === 'all' ? undefined : tier,
        email || undefined,
      );
      setProfiles(data);
      setTotalCount(count);
    } catch (e: any) {
      setError(e.message ?? '불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load aggregate counts (free/premium)
  const loadStats = useCallback(async () => {
    try {
      const [freeRes, premRes] = await Promise.all([
        getAllProfiles(0, 1, 'free'),
        getAllProfiles(0, 1, 'premium'),
      ]);
      setFreeCount(freeRes.count);
      setPremiumCount(premRes.count);
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    loadProfiles(page, filterTier, searchEmail);
  }, [page, filterTier, searchEmail, loadProfiles]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSearch = () => {
    setPage(0);
    setSearchEmail(searchInput);
  };

  const handleFilterChange = (tier: typeof filterTier) => {
    setFilterTier(tier);
    setPage(0);
  };

  const handleTierChange = async (userId: string, tier: 'free' | 'premium') => {
    setUpdating(userId);
    try {
      await updateSubscriptionTier(userId, tier);
      setProfiles(prev => prev.map(r => r.id === userId ? { ...r, subscription_tier: tier } : r));
      // Update stats
      if (tier === 'premium') {
        setFreeCount(c => c - 1);
        setPremiumCount(c => c + 1);
      } else {
        setPremiumCount(c => c - 1);
        setFreeCount(c => c + 1);
      }
    } catch (e: any) {
      setError(e.message ?? '업데이트 중 오류가 발생했습니다.');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">전체 회원</p>
              <p className="text-2xl font-bold">{freeCount + premiumCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <UserX className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">무료 회원</p>
              <p className="text-2xl font-bold">{freeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Crown className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">프리미엄 회원</p>
              <p className="text-2xl font-bold text-accent">{premiumCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">회원 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Tier filter tabs */}
            <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
              {(['all', 'free', 'premium'] as const).map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => handleFilterChange(tier)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    filterTier === tier
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {tier === 'all' ? '전체' : tier === 'free' ? '무료' : '프리미엄'}
                </button>
              ))}
            </div>

            {/* Email search */}
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="이메일로 검색..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-1.5 hidden sm:inline">검색</span>
              </Button>
              {searchEmail && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSearchInput(''); setSearchEmail(''); setPage(0); }}
                  title="검색 초기화"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg mb-4">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">일치하는 회원이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 bg-muted/50 px-4 py-2.5 text-xs font-semibold text-muted-foreground border-b border-border">
                  <span>이메일</span>
                  <span className="text-center w-20">가입일</span>
                  <span className="text-center w-24">마지막 접속</span>
                  <span className="text-center w-20">만료일</span>
                  <span className="text-center w-20">등급</span>
                  <span className="text-center w-28">액션</span>
                </div>

                {/* Rows */}
                {profiles.map((profile, idx) => (
                  <div
                    key={profile.id}
                    className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 items-center px-4 py-3 text-sm transition-colors hover:bg-muted/30 ${
                      idx !== profiles.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="min-w-0 pr-4">
                      <p className="font-medium truncate">{profile.email ?? '(이메일 없음)'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">ID: {profile.id.slice(0, 8)}…</p>
                    </div>
                    <span className="text-xs text-muted-foreground w-20 text-center">
                      {formatDate(profile.created_at)}
                    </span>
                    <span className="text-xs text-muted-foreground w-24 text-center">
                      {formatDate(profile.last_sign_in_at)}
                    </span>
                    <span className="text-xs text-muted-foreground w-20 text-center">
                      {formatDate(profile.subscription_expires_at)}
                    </span>
                    <div className="w-20 flex justify-center">
                      <Badge
                        variant="outline"
                        className={profile.subscription_tier === 'premium'
                          ? 'border-accent text-accent bg-accent/5'
                          : 'border-muted-foreground/30 text-muted-foreground'
                        }
                      >
                        {profile.subscription_tier === 'premium' ? '프리미엄' : '무료'}
                      </Badge>
                    </div>
                    <div className="w-28 flex justify-center">
                      {profile.subscription_tier === 'free' ? (
                        <Button
                          size="sm"
                          disabled={updating === profile.id}
                          onClick={() => handleTierChange(profile.id, 'premium')}
                          className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-7 px-2.5"
                        >
                          {updating === profile.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <UserCheck className="h-3.5 w-3.5 mr-1" />
                          }
                          프리미엄 부여
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updating === profile.id}
                          onClick={() => handleTierChange(profile.id, 'free')}
                          className="text-xs h-7 px-2.5"
                        >
                          {updating === profile.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <UserX className="h-3.5 w-3.5 mr-1" />
                          }
                          무료로 변경
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    총 {totalCount}명 중 {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)}명
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-3 py-1 rounded border border-border bg-muted/50">
                      {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Report Manager Component ─────────────────────────────────────────────────
const STATUS_COLOR: Record<ReportStatus, string> = {
  pending:   'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  resolved:  'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  dismissed: 'bg-muted text-muted-foreground',
};

const ReportManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<QuestionReport | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reportSetInfo, setReportSetInfo] = useState<Record<string, QuestionSetInfo>>({});

  const loadReports = async () => {
    setLoading(true);
    try {
      const [data, cnt] = await Promise.all([
        getAllReports(statusFilter),
        getReportCounts(),
      ]);
      setReports(data);
      setCounts(cnt);
      if (data.length > 0) {
        const ids = data.map(r => r.question_id);
        getQuestionSetInfo(ids).then(setReportSetInfo).catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, [statusFilter]);

  const openDetail = (report: QuestionReport) => {
    setSelectedReport(report);
    setAdminNote(report.admin_note ?? '');
    setSaveError(null);
  };

  const handleUpdateStatus = async (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    if (newStatus === 'resolved' && !adminNote.trim()) {
      setSaveError('처리 완료 시 관리자 답변을 입력해주세요.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await updateReport(selectedReport.id, {
        status: newStatus,
        adminNote: adminNote.trim() || undefined,
        resolvedBy: user?.id,
      });
      toast({ title: '상태가 업데이트되었습니다.' });
      setSelectedReport(null);
      loadReports();
    } catch (e: any) {
      const msg = (e as Error).message ?? '저장 중 오류가 발생했습니다.';
      setSaveError(msg);
      toast({ title: '오류', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filterButtons: { label: string; value: ReportStatus | 'all' }[] = [
    { label: `전체 (${counts.total ?? 0})`, value: 'all' },
    { label: `대기 (${counts.pending ?? 0})`, value: 'pending' },
    { label: `검토 중 (${counts.reviewing ?? 0})`, value: 'reviewing' },
    { label: `완료 (${counts.resolved ?? 0})`, value: 'resolved' },
    { label: `기각 (${counts.dismissed ?? 0})`, value: 'dismissed' },
  ];

  return (
    <div className="space-y-4">
      {/* 필터 + 새로고침 */}
      <div className="flex flex-wrap items-center gap-2">
        {filterButtons.map(btn => (
          <Button
            key={btn.value}
            variant={statusFilter === btn.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(btn.value)}
          >
            {btn.label}
          </Button>
        ))}
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={loadReports}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Flag className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">신고 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reports.map(report => (
                <div
                  key={report.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {reportSetInfo[report.question_id] ? (
                        <span className="text-xs font-medium">
                          {reportSetInfo[report.question_id].setName}
                          <span className="text-muted-foreground"> · {reportSetInfo[report.question_id].sortOrder}번</span>
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">{report.question_id}</span>
                      )}
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {REASON_LABELS[report.reason]}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[report.status]}`}>
                        {STATUS_LABELS[report.status]}
                      </span>
                    </div>
                    {report.comment && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{report.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {report.user_name ? `${report.user_name} · ` : ''}{report.user_email ?? '비회원'} · {new Date(report.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => openDetail(report)}
                  >
                    상세
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 신고 상세 다이얼로그 */}
      <Dialog open={!!selectedReport} onOpenChange={v => !v && setSelectedReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-orange-500" />
              신고 상세
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-1">
              {/* 문제 정보 */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">문제</span>
                  {reportSetInfo[selectedReport.question_id] ? (
                    <span className="text-sm font-medium">
                      {reportSetInfo[selectedReport.question_id].setName}
                      <span className="text-muted-foreground ml-1">· {reportSetInfo[selectedReport.question_id].sortOrder}번</span>
                      <span className="font-mono text-xs text-muted-foreground ml-1">({selectedReport.question_id})</span>
                    </span>
                  ) : (
                    <span className="font-mono text-sm">{selectedReport.question_id}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-xs text-accent h-auto p-0 hover:underline"
                    onClick={() => navigate(`/admin/questions?q=${selectedReport.question_id}`)}
                  >
                    문제 수정
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">신고 유형</span>
                  <span className="text-sm">{REASON_LABELS[selectedReport.reason]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">신고자</span>
                  <span className="text-sm">
                    {selectedReport.user_name
                      ? `${selectedReport.user_name} (${selectedReport.user_email ?? '비회원'})`
                      : (selectedReport.user_email ?? '비회원')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">상태</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_COLOR[selectedReport.status]}`}>
                    {STATUS_LABELS[selectedReport.status]}
                  </span>
                </div>
              </div>

              {/* 학생 의견 */}
              {selectedReport.comment && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">학생 의견</p>
                  <p className="text-sm leading-relaxed p-3 rounded-lg bg-muted/30 border border-border">
                    {selectedReport.comment}
                  </p>
                </div>
              )}

              {/* 관리자 답변 */}
              <div>
                <p className="text-xs font-medium mb-1.5">
                  관리자 답변 <span className="text-muted-foreground">(학생에게 공개)</span>
                </p>
                <Textarea
                  placeholder="검토 결과를 입력해주세요. 처리 완료 시 필수입니다."
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={saving || selectedReport?.status === 'reviewing'}
              onClick={() => handleUpdateStatus('reviewing')}
            >
              검토 중으로
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={saving || selectedReport?.status === 'dismissed'}
              onClick={() => handleUpdateStatus('dismissed')}
            >
              기각
            </Button>
            <Button
              size="sm"
              disabled={saving || selectedReport?.status === 'resolved'}
              onClick={() => handleUpdateStatus('resolved')}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              처리 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Admin Stats Component ────────────────────────────────────────────────────
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const AdminStats = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'sets' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [examStats, setExamStats] = useState<ExamStat[]>([]);
  const [setStats, setSetStats] = useState<SetStat[]>([]);
  const [hourly, setHourly] = useState<HourStat[]>([]);
  const [weekday, setWeekday] = useState<WeekdayStat[]>([]);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [ov, recent, exam, set, activity] = await Promise.all([
        getAdminOverview(),
        getRecentSessions(10),
        getExamStats(),
        getSetStats(),
        getHourlyActivity(30),
      ]);
      setOverview(ov);
      setRecentSessions(recent);
      setExamStats(exam);
      setSetStats(set);
      setHourly(activity.hourly);
      setWeekday(activity.weekday);
    } catch (e: any) {
      setError(e.message ?? '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const formatDuration = (sec: number | null) => {
    if (sec === null) return '-';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}분 ${s}초`;
  };

  const maskEmail = (email: string | null) => {
    if (!email) return '(비회원)';
    const [user, domain] = email.split('@');
    if (!domain) return email;
    return `${user.slice(0, 2)}${'*'.repeat(Math.max(1, user.length - 2))}@${domain}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        {error}
        <Button variant="outline" size="sm" className="ml-auto" onClick={loadAll}>재시도</Button>
      </div>
    );
  }

  const maxHour = Math.max(1, ...hourly.map(h => h.count));
  const maxWeekday = Math.max(1, ...weekday.map(d => d.count));

  return (
    <div className="space-y-6">
      {/* Refresh button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={loadAll}>
          <RefreshCw className="h-4 w-4 mr-2" />새로 고침
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-1.5"><Activity className="h-4 w-4" />현황 요약</TabsTrigger>
          <TabsTrigger value="exams" className="gap-1.5"><TrendingUp className="h-4 w-4" />시험별 통계</TabsTrigger>
          <TabsTrigger value="sets" className="gap-1.5"><BarChart3 className="h-4 w-4" />세트별 통계</TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5"><CalendarDays className="h-4 w-4" />시간대별 패턴</TabsTrigger>
        </TabsList>

        {/* ── 현황 요약 ── */}
        <TabsContent value="overview">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {[
              { label: '오늘 시험 응시', value: overview?.todaySessions ?? 0, icon: <Activity className="h-4 w-4" />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
              { label: '이번 주 제출', value: overview?.weekSubmitted ?? 0, icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-500 bg-green-50 dark:bg-green-950/40' },
              { label: '전체 평균 점수', value: overview?.avgScore !== null && overview?.avgScore !== undefined ? `${overview.avgScore}점` : '-', icon: <BarChart3 className="h-4 w-4" />, color: 'text-accent bg-accent/10' },
              { label: '진행 중 세션', value: overview?.inProgressSessions ?? 0, icon: <Clock className="h-4 w-4" />, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
              { label: '이번 주 신규 가입', value: overview?.newUsersWeek ?? 0, icon: <Users className="h-4 w-4" />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
            ].map(({ label, value, icon, color }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <div className={`inline-flex p-1.5 rounded-lg mb-2 ${color}`}>{icon}</div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold mt-0.5">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent sessions feed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">최근 제출 완료 ({recentSessions.length}건)</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">아직 제출 완료된 시험이 없습니다.</p>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground border-b">
                    <span>회원</span>
                    <span className="w-36 text-center">시험</span>
                    <span className="w-16 text-center">점수</span>
                    <span className="w-24 text-right">소요시간</span>
                  </div>
                  {recentSessions.map((s, idx) => (
                    <div key={s.id} className={`grid grid-cols-[1fr_auto_auto_auto] gap-0 items-center px-4 py-2.5 text-sm ${idx !== recentSessions.length - 1 ? 'border-b border-border' : ''}`}>
                      <span className="text-xs text-muted-foreground truncate pr-4">{maskEmail(s.userEmail)}</span>
                      <span className="w-36 text-xs text-center truncate">{s.examTitle}</span>
                      <span className={`w-16 text-center font-bold text-sm ${(s.score ?? 0) >= 70 ? 'text-green-600' : 'text-destructive'}`}>
                        {s.score !== null ? `${s.score}점` : '-'}
                      </span>
                      <span className="w-24 text-right text-xs text-muted-foreground">{formatDuration(s.durationSec)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 시험별 통계 ── */}
        <TabsContent value="exams">
          {examStats.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">데이터가 없습니다.</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {examStats.map(ex => (
                <Card key={ex.examId}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{ex.examTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: '총 응시', value: `${ex.totalSessions}회` },
                        { label: '제출 완료', value: `${ex.submittedSessions}회` },
                        { label: '평균 점수', value: ex.avgScore !== null ? `${ex.avgScore}점` : '-' },
                        { label: '합격률 (≥70)', value: ex.passRate !== null ? `${ex.passRate}%` : '-' },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-muted/40 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                          <p className="font-bold">{value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Weak tags */}
                    {ex.topWeakTags.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">취약 태그 TOP {ex.topWeakTags.length}</p>
                        <div className="space-y-1.5">
                          {ex.topWeakTags.map(t => (
                            <div key={t.tag} className="flex items-center gap-2">
                              <span className="text-xs w-32 shrink-0 truncate">{t.tag}</span>
                              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${t.correctRate < 50 ? 'bg-destructive' : t.correctRate < 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
                                  style={{ width: `${t.correctRate}%` }}
                                />
                              </div>
                              <span className="text-xs w-12 text-right text-muted-foreground">{t.correctRate}%</span>
                              <span className="text-xs text-muted-foreground/60">({t.total})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── 세트별 통계 ── */}
        <TabsContent value="sets">
          {setStats.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">데이터가 없습니다.</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 bg-muted/50 px-4 py-2.5 text-xs font-semibold text-muted-foreground border-b">
                    <span>세트</span>
                    <span className="w-20 text-center">총 응시</span>
                    <span className="w-20 text-center">완료</span>
                    <span className="w-20 text-center">평균 점수</span>
                    <span className="w-24 text-center">평균 시간</span>
                  </div>
                  {setStats.map((s, idx) => (
                    <div key={s.setId ?? '__none__'} className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 items-center px-4 py-3 text-sm ${idx !== setStats.length - 1 ? 'border-b border-border' : ''}`}>
                      <div>
                        <p className="font-medium truncate">{s.setName}</p>
                        <p className="text-xs text-muted-foreground">{s.examTitle}</p>
                      </div>
                      <span className="w-20 text-center">{s.totalSessions}</span>
                      <span className="w-20 text-center">{s.submittedSessions}</span>
                      <span className={`w-20 text-center font-bold ${(s.avgScore ?? 0) >= 70 ? 'text-green-600' : s.avgScore !== null ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {s.avgScore !== null ? `${s.avgScore}점` : '-'}
                      </span>
                      <span className="w-24 text-center text-xs text-muted-foreground">
                        {s.avgDurationMin !== null ? `${s.avgDurationMin}분` : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── 시간대별 패턴 ── */}
        <TabsContent value="activity">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly bar chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">시간대별 접속 (최근 30일)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-0.5 h-36">
                  {hourly.map(h => {
                    const pct = Math.round((h.count / maxHour) * 100);
                    return (
                      <div key={h.hour} className="flex-1 flex flex-col items-center gap-0.5 group">
                        <div
                          className="w-full rounded-t transition-all bg-accent/60 group-hover:bg-accent"
                          style={{ height: `${Math.max(2, pct)}%` }}
                          title={`${h.hour}시: ${h.count}회`}
                        />
                        {h.hour % 6 === 0 && (
                          <span className="text-[9px] text-muted-foreground">{h.hour}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">시각 (0~23시)</p>
              </CardContent>
            </Card>

            {/* Weekday bar chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">요일별 접속 (최근 30일)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-36">
                  {weekday.map(d => {
                    const pct = Math.round((d.count / maxWeekday) * 100);
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">{d.count}</span>
                        <div
                          className="w-full rounded-t bg-accent/60 transition-all"
                          style={{ height: `${Math.max(4, pct)}%` }}
                          title={`${WEEKDAY_LABELS[d.day]}: ${d.count}회`}
                        />
                        <span className="text-xs font-medium">{WEEKDAY_LABELS[d.day]}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 24h heatmap */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">시간대 히트맵</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-1">
                {hourly.map(h => {
                  const intensity = h.count === 0 ? 0 : Math.ceil((h.count / maxHour) * 5);
                  const bg = [
                    'bg-muted/30',
                    'bg-accent/15',
                    'bg-accent/30',
                    'bg-accent/50',
                    'bg-accent/70',
                    'bg-accent',
                  ][intensity];
                  return (
                    <div
                      key={h.hour}
                      className={`${bg} rounded h-8 flex items-center justify-center text-xs transition-all cursor-default`}
                      title={`${h.hour}시: ${h.count}회`}
                    >
                      <span className="text-[10px] font-medium opacity-80">{h.hour}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-1 mt-2">
                <span className="text-xs text-muted-foreground mr-1">낮음</span>
                {['bg-muted/30','bg-accent/15','bg-accent/30','bg-accent/50','bg-accent/70','bg-accent'].map(c => (
                  <div key={c} className={`${c} w-4 h-4 rounded`} />
                ))}
                <span className="text-xs text-muted-foreground ml-1">높음</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── Announcement Manager ─────────────────────────────────────────────────────
const CATEGORY_OPTIONS: AnnouncementCategory[] = ['notice', 'info', 'tip', 'update'];
const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  notice: '공지', info: '정보', tip: '팁', update: '업데이트',
};

interface AnnFormDialogProps {
  exams: ExamConfig[];
  editItem?: Announcement | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const AnnFormDialog = ({ exams, editItem, open, onClose, onSaved }: AnnFormDialogProps) => {
  const [category, setCategory] = useState<AnnouncementCategory>('notice');
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [content, setContent] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [examId, setExamId] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [refLinkPairs, setRefLinkPairs] = useState<{ name: string; url: string }[]>([{ name: '', url: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) {
      setCategory(editItem.category);
      setTitle(editItem.title);
      setTitleEn(editItem.titleEn ?? '');
      setContent(editItem.content);
      setContentEn(editItem.contentEn ?? '');
      setExamId(editItem.examId ?? '');
      setIsPinned(editItem.isPinned);
      setIsActive(editItem.isActive);
      setCoverImageUrl(editItem.coverImageUrl ?? '');
      try {
        const parsed = editItem.refLinks ? JSON.parse(editItem.refLinks) : [];
        setRefLinkPairs(parsed.length ? parsed : [{ name: '', url: '' }]);
      } catch {
        setRefLinkPairs([{ name: '', url: '' }]);
      }
    } else {
      setCategory('notice');
      setTitle('');
      setTitleEn('');
      setContent('');
      setContentEn('');
      setExamId('');
      setIsPinned(false);
      setIsActive(true);
      setCoverImageUrl('');
      setRefLinkPairs([{ name: '', url: '' }]);
    }
  }, [editItem, open]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const input: AnnouncementInput = {
        category,
        title: title.trim(),
        titleEn: titleEn.trim() || undefined,
        content: content.trim(),
        contentEn: contentEn.trim() || undefined,
        examId: examId || null,
        isPinned,
        isActive,
        coverImageUrl: coverImageUrl.trim() || null,
        refLinks: (() => {
          const valid = refLinkPairs.filter(p => p.name.trim() && p.url.trim());
          return valid.length ? JSON.stringify(valid) : null;
        })(),
      };
      if (editItem) {
        await updateAnnouncement(editItem.id, input);
      } else {
        await createAnnouncement(input);
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? '게시글 편집' : '새 게시글'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    category === cat
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted-foreground hover:border-accent/40'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">제목 (한국어) *</label>
            <Input
              placeholder="제목을 입력하세요"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">제목 (English, 선택)</label>
            <Input
              placeholder="Title in English (optional)"
              value={titleEn}
              onChange={e => setTitleEn(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">내용 (한국어) *</label>
            <Textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">내용 (English, 선택)</label>
            <Textarea
              placeholder="Content in English (optional)"
              value={contentEn}
              onChange={e => setContentEn(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">관련 시험 (선택)</label>
            <select
              value={examId}
              onChange={e => setExamId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">관련 시험 없음</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.code} — {exam.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">커버 이미지 URL (선택)</label>
            <Input
              placeholder="https://images.unsplash.com/photo-xxx?w=1200&q=80"
              value={coverImageUrl}
              onChange={e => setCoverImageUrl(e.target.value)}
            />
            {coverImageUrl.trim() && (
              <img
                src={coverImageUrl.trim()}
                alt="preview"
                className="mt-2 rounded-lg h-24 w-full object-cover border border-border"
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">출처·참고자료 (선택, 최대 5개)</label>
            <div className="space-y-2">
              {refLinkPairs.map((pair, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="이름 (예: AWS 공식 문서)"
                    value={pair.name}
                    onChange={e => {
                      const next = [...refLinkPairs];
                      next[idx] = { ...next[idx], name: e.target.value };
                      setRefLinkPairs(next);
                    }}
                    className="flex-1"
                  />
                  <Input
                    placeholder="URL (https://...)"
                    value={pair.url}
                    onChange={e => {
                      const next = [...refLinkPairs];
                      next[idx] = { ...next[idx], url: e.target.value };
                      setRefLinkPairs(next);
                    }}
                    className="flex-[2]"
                  />
                  <button
                    type="button"
                    onClick={() => setRefLinkPairs(refLinkPairs.filter((_, i) => i !== idx))}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 text-lg leading-none"
                    aria-label="삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {refLinkPairs.length < 5 && (
              <button
                type="button"
                onClick={() => setRefLinkPairs([...refLinkPairs, { name: '', url: '' }])}
                className="mt-2 text-xs text-accent hover:underline"
              >
                + 출처 추가
              </button>
            )}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-accent"
              />
              상단 고정
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-accent"
              />
              게시 활성화
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button
            disabled={!title.trim() || !content.trim() || saving}
            onClick={handleSave}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AnnouncementManagerProps {
  exams: ExamConfig[];
}

const AnnouncementManager = ({ exams }: AnnouncementManagerProps) => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const load = () => {
    setLoading(true);
    getAllAnnouncementsAdmin()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteAnnouncement(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const handleTogglePin = async (item: Announcement) => {
    await updateAnnouncement(item.id, { isPinned: !item.isPinned });
    load();
  };

  const handleToggleActive = async (item: Announcement) => {
    await updateAnnouncement(item.id, { isActive: !item.isActive });
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">게시판 관리</CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length}개 게시글</p>
        </div>
        <Button
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />새 게시글
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">게시글이 없습니다. "새 게시글" 버튼으로 추가하세요.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  item.isActive ? 'border-border' : 'border-border/50 opacity-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    {item.isPinned && <Pin className="h-3.5 w-3.5 text-accent shrink-0" />}
                    <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[item.category]}</Badge>
                    {!item.isActive && <Badge variant="outline" className="text-xs text-muted-foreground">비활성</Badge>}
                  </div>
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    title={item.isPinned ? '고정 해제' : '상단 고정'}
                    onClick={() => handleTogglePin(item)}
                    className="h-8 w-8"
                  >
                    <Pin className={`h-4 w-4 ${item.isPinned ? 'text-accent' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={item.isActive ? '비활성화' : '활성화'}
                    onClick={() => handleToggleActive(item)}
                    className="h-8 w-8"
                  >
                    {item.isActive
                      ? <X className="h-4 w-4 text-muted-foreground" />
                      : <Plus className="h-4 w-4 text-green-500" />
                    }
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditTarget(item); setFormOpen(true); }}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(item)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AnnFormDialog
        exams={exams}
        editItem={editTarget}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSaved={load}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시글을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.title}</strong> 게시글이 비활성화됩니다.
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
    </Card>
  );
};

// ─── Blog Form Dialog ─────────────────────────────────────────────────────────
const PROVIDER_OPTIONS: BlogProvider[] = ['aws', 'gcp', 'azure', 'general'];
const PROVIDER_LABELS: Record<BlogProvider, string> = {
  aws: 'AWS', gcp: 'GCP', azure: 'AZURE', general: '일반',
};

interface BlogFormDialogProps {
  exams: ExamConfig[];
  editItem?: BlogPost | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const BlogFormDialog = ({ exams, editItem, open, onClose, onSaved }: BlogFormDialogProps) => {
  const [slug, setSlug] = useState('');
  const [provider, setProvider] = useState<BlogProvider>('aws');
  const [examId, setExamId] = useState('');
  const [category, setCategory] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [content, setContent] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [refLinkPairs, setRefLinkPairs] = useState<{ name: string; url: string }[]>([{ name: '', url: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) {
      setSlug(editItem.slug);
      setProvider(editItem.provider);
      setExamId(editItem.examId ?? '');
      setCategory(editItem.category ?? '');
      setTagsStr(editItem.tags.join(', '));
      setTitle(editItem.title);
      setTitleEn(editItem.titleEn ?? '');
      setExcerpt(editItem.excerpt ?? '');
      setExcerptEn(editItem.excerptEn ?? '');
      setContent(editItem.content);
      setContentEn(editItem.contentEn ?? '');
      setCoverImageUrl(editItem.coverImageUrl ?? '');
      setIsPinned(editItem.isPinned);
      setIsPublished(editItem.isPublished);
      const links = Array.isArray(editItem.refLinks)
        ? (editItem.refLinks as { name: string; url: string }[])
        : [];
      setRefLinkPairs(links.length ? links : [{ name: '', url: '' }]);
    } else {
      setSlug('');
      setProvider('aws');
      setExamId('');
      setCategory('');
      setTagsStr('');
      setTitle('');
      setTitleEn('');
      setExcerpt('');
      setExcerptEn('');
      setContent('');
      setContentEn('');
      setCoverImageUrl('');
      setIsPinned(false);
      setIsPublished(false);
      setRefLinkPairs([{ name: '', url: '' }]);
    }
  }, [editItem, open]);

  const handleSave = async () => {
    if (!slug.trim() || !title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const validLinks = refLinkPairs.filter(p => p.name.trim() && p.url.trim());
      const input: BlogPostInput = {
        slug: slug.trim(),
        provider,
        examId: examId || null,
        category: category.trim() || null,
        tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean),
        title: title.trim(),
        titleEn: titleEn.trim() || null,
        excerpt: excerpt.trim() || null,
        excerptEn: excerptEn.trim() || null,
        content: content.trim(),
        contentEn: contentEn.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
        readTimeMinutes: calcReadTime(content.trim()),
        refLinks: validLinks.length ? validLinks : [],
        isPublished,
        isPinned,
      };
      if (editItem) {
        await updateBlogPost(editItem.id, input);
      } else {
        await createBlogPost(input);
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? '포스트 편집' : '새 블로그 포스트'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Slug */}
          <div>
            <label className="text-sm font-medium mb-1 block">슬러그 (URL) *</label>
            <Input
              placeholder="amazon-bedrock-intro"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              영문 소문자, 숫자, 하이픈만 사용. URL: /blog/{slug || '슬러그'}
            </p>
          </div>

          {/* Provider + Exam */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">플랫폼 *</label>
              <div className="flex flex-wrap gap-2">
                {PROVIDER_OPTIONS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`px-3 py-1 rounded-lg border text-sm font-medium transition-all ${
                      provider === p
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground hover:border-accent/40'
                    }`}
                  >
                    {PROVIDER_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">관련 자격증 (선택)</label>
              <select
                value={examId}
                onChange={e => setExamId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">없음</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category + Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">카테고리 (선택)</label>
              <Input
                placeholder="예: AI/ML, Storage, Networking"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">태그 (쉼표 구분)</label>
              <Input
                placeholder="Amazon Bedrock, RAG, S3"
                value={tagsStr}
                onChange={e => setTagsStr(e.target.value)}
              />
            </div>
          </div>

          {/* Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">제목 (한국어) *</label>
              <Input placeholder="제목 입력" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">제목 (English, 선택)</label>
              <Input placeholder="Title in English" value={titleEn} onChange={e => setTitleEn(e.target.value)} />
            </div>
          </div>

          {/* Excerpt */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">요약 (한국어, 160자 이내)</label>
              <Input placeholder="SEO 메타 설명..." value={excerpt} onChange={e => setExcerpt(e.target.value)} maxLength={160} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">요약 (English, 선택)</label>
              <Input placeholder="SEO description..." value={excerptEn} onChange={e => setExcerptEn(e.target.value)} maxLength={160} />
            </div>
          </div>

          {/* Content */}
          <MarkdownEditor
            label="내용 (한국어, 마크다운)"
            required
            value={content}
            onChange={setContent}
            placeholder="## 제목&#10;&#10;본문 내용을 마크다운으로 작성하세요..."
            rows={8}
          />

          <MarkdownEditor
            label="내용 (English, 선택)"
            value={contentEn}
            onChange={setContentEn}
            placeholder="## Title&#10;&#10;Content in English..."
            rows={4}
          />

          {/* Cover image */}
          <div>
            <label className="text-sm font-medium mb-1 block">커버 이미지 URL (선택)</label>
            <Input
              placeholder="https://images.unsplash.com/photo-xxx?w=1200"
              value={coverImageUrl}
              onChange={e => setCoverImageUrl(e.target.value)}
            />
            {coverImageUrl.trim() && (
              <img
                src={coverImageUrl.trim()}
                alt="preview"
                className="mt-2 rounded-lg h-24 w-full object-cover border border-border"
              />
            )}
          </div>

          {/* Ref links */}
          <div>
            <label className="text-sm font-medium mb-1 block">참고자료 (선택, 최대 5개)</label>
            <div className="space-y-2">
              {refLinkPairs.map((pair, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="이름 (예: AWS 공식 문서)"
                    value={pair.name}
                    onChange={e => {
                      const next = [...refLinkPairs];
                      next[idx] = { ...next[idx], name: e.target.value };
                      setRefLinkPairs(next);
                    }}
                    className="flex-1"
                  />
                  <Input
                    placeholder="URL"
                    value={pair.url}
                    onChange={e => {
                      const next = [...refLinkPairs];
                      next[idx] = { ...next[idx], url: e.target.value };
                      setRefLinkPairs(next);
                    }}
                    className="flex-[2]"
                  />
                  <button
                    type="button"
                    onClick={() => setRefLinkPairs(refLinkPairs.filter((_, i) => i !== idx))}
                    className="text-muted-foreground hover:text-destructive text-lg leading-none shrink-0"
                  >×</button>
                </div>
              ))}
            </div>
            {refLinkPairs.length < 5 && (
              <button
                type="button"
                onClick={() => setRefLinkPairs([...refLinkPairs, { name: '', url: '' }])}
                className="mt-2 text-xs text-accent hover:underline"
              >
                + 추가
              </button>
            )}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="h-4 w-4 rounded border-input accent-accent" />
              상단 고정
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="h-4 w-4 rounded border-input accent-accent" />
              발행 (공개)
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button
            disabled={!slug.trim() || !title.trim() || !content.trim() || saving}
            onClick={handleSave}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Blog Manager ─────────────────────────────────────────────────────────────
interface BlogManagerProps { exams: ExamConfig[]; }

const BlogManager = ({ exams }: BlogManagerProps) => {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const load = () => {
    setLoading(true);
    getAllBlogPostsAdmin()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBlogPost(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const handleTogglePublish = async (item: BlogPost) => {
    await updateBlogPost(item.id, { isPublished: !item.isPublished });
    load();
  };

  const handleTogglePin = async (item: BlogPost) => {
    await updateBlogPost(item.id, { isPinned: !item.isPinned });
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">블로그 관리</CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length}개 포스트</p>
        </div>
        <Button
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />새 포스트
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <NotebookPen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">포스트가 없습니다. "새 포스트" 버튼으로 추가하세요.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  item.isPublished ? 'border-border' : 'border-border/50 opacity-60'
                }`}
              >
                {item.coverImageUrl && (
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="h-10 w-14 rounded object-cover shrink-0 border border-border"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    {item.isPinned && <Pin className="h-3.5 w-3.5 text-accent shrink-0" />}
                    <Badge variant="outline" className="text-xs">{item.provider.toUpperCase()}</Badge>
                    {!item.isPublished && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">비공개</Badge>
                    )}
                    {item.readTimeMinutes && (
                      <span className="text-xs text-muted-foreground">{item.readTimeMinutes}분</span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    /blog/{item.slug} · {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    title={item.isPinned ? '고정 해제' : '상단 고정'}
                    onClick={() => handleTogglePin(item)}
                    className="h-8 w-8"
                  >
                    <Pin className={`h-4 w-4 ${item.isPinned ? 'text-accent' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={item.isPublished ? '비공개' : '발행'}
                    onClick={() => handleTogglePublish(item)}
                    className="h-8 w-8"
                  >
                    {item.isPublished
                      ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                      : <Eye className="h-4 w-4 text-green-500" />
                    }
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditTarget(item); setFormOpen(true); }}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(item)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <BlogFormDialog
        exams={exams}
        editItem={editTarget}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSaved={load}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>포스트를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.title}</strong> 포스트가 비공개 상태로 전환됩니다.
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
    </Card>
  );
};

// ─── Contact Manager Component ────────────────────────────────────────────────
const CONTACT_STATUS_COLOR: Record<ContactStatus, string> = {
  unread:    'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  read:      'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  responded: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  closed:    'bg-muted text-muted-foreground',
};

const ContactManager = () => {
  const { user, markContactsRead } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const [data, cnt] = await Promise.all([
        getAllContacts(statusFilter),
        getContactCounts(),
      ]);
      setContacts(data);
      setCounts(cnt);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContacts(); }, [statusFilter]);

  const openDetail = async (contact: ContactMessage) => {
    setSelected(contact);
    setAdminResponse(contact.adminResponse ?? '');
    setSaveError(null);
    // 미읽음이면 읽음으로 표시
    if (contact.status === 'unread') {
      try {
        await updateContact(contact.id, { status: 'read' });
        markContactsRead();
        loadContacts();
      } catch {}
    }
  };

  const handleSaveResponse = async (newStatus: ContactStatus) => {
    if (!selected) return;
    if (newStatus === 'responded' && !adminResponse.trim()) {
      setSaveError('답변 내용을 입력해주세요.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await updateContact(selected.id, {
        status: newStatus,
        adminResponse: adminResponse.trim() || undefined,
        respondedBy: user?.id,
      });
      toast({ title: '저장되었습니다.' });
      setSelected(null);
      loadContacts();
    } catch (e: any) {
      const msg = (e as Error).message ?? '저장 중 오류가 발생했습니다.';
      setSaveError(msg);
      toast({ title: '오류', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filterButtons: { label: string; value: ContactStatus | 'all' }[] = [
    { label: `전체 (${counts.total ?? 0})`, value: 'all' },
    { label: `미확인 (${counts.unread ?? 0})`, value: 'unread' },
    { label: `확인됨 (${counts.read ?? 0})`, value: 'read' },
    { label: `답변완료 (${counts.responded ?? 0})`, value: 'responded' },
    { label: `종료 (${counts.closed ?? 0})`, value: 'closed' },
  ];

  return (
    <div className="space-y-4">
      {/* 필터 + 새로고침 */}
      <div className="flex flex-wrap items-center gap-2">
        {filterButtons.map(btn => (
          <Button
            key={btn.value}
            variant={statusFilter === btn.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(btn.value)}
          >
            {btn.label}
          </Button>
        ))}
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={loadContacts}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">문의 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {CONTACT_CATEGORY_LABELS[contact.category]}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CONTACT_STATUS_COLOR[contact.status]}`}>
                        {CONTACT_STATUS_LABELS[contact.status]}
                      </span>
                      <span className="text-sm font-medium truncate">{contact.subject}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {contact.userName ?? ''} {contact.userEmail} · {new Date(contact.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => openDetail(contact)}
                  >
                    상세
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 문의 상세 다이얼로그 */}
      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              문의 상세
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 py-1">
              {/* 문의 정보 */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-14">유형</span>
                  <span className="text-sm">{CONTACT_CATEGORY_LABELS[selected.category]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-14">제목</span>
                  <span className="text-sm font-medium">{selected.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-14">작성자</span>
                  <span className="text-sm">{selected.userName ?? ''} ({selected.userEmail})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-14">상태</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CONTACT_STATUS_COLOR[selected.status]}`}>
                    {CONTACT_STATUS_LABELS[selected.status]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-14">날짜</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selected.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>

              {/* 문의 내용 */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">문의 내용</p>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              {/* 관리자 답변 */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">관리자 답변</p>
                <Textarea
                  placeholder="답변 내용을 입력해주세요. 답변 저장 시 회원의 마이페이지에 표시됩니다."
                  value={adminResponse}
                  onChange={e => setAdminResponse(e.target.value)}
                  rows={4}
                  className="resize-none text-sm"
                />
              </div>

              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
              닫기
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => handleSaveResponse('closed')}
            >
              종료 처리
            </Button>
            <Button
              size="sm"
              disabled={saving}
              onClick={() => handleSaveResponse('responded')}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              답변 저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Main Admin Page ──────────────────────────────────────────────────────────
const AdminPage = () => {
  const navigate = useNavigate();
  const { user, unreadContactCount } = useAuth();

  const [adminTab, setAdminTab] = useState<'sets' | 'subscriptions' | 'stats' | 'board' | 'blog' | 'event' | 'reports' | 'contacts'>('sets');
  const [eventExpiresAt, setEventExpiresAt] = useState<string | null>(null);
  const [eventInput, setEventInput] = useState('');
  const [eventLoading, setEventLoading] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
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

  useEffect(() => {
    if (adminTab !== 'event') return;
    setEventLoading(true);
    getFreeAccessEvent()
      .then(({ expiresAt }) => {
        setEventExpiresAt(expiresAt);
        if (expiresAt) {
          // datetime-local input은 'YYYY-MM-DDTHH:mm' 형식 필요
          setEventInput(expiresAt.slice(0, 16));
        } else {
          setEventInput('');
        }
      })
      .finally(() => setEventLoading(false));
  }, [adminTab]);

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

  const handleMoveSet = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentSets.length) return;

    const setA = currentSets[index];
    const setB = currentSets[newIndex];

    await Promise.all([
      updateExamSet(setA.id, { sortOrder: setB.sortOrder }),
      updateExamSet(setB.id, { sortOrder: setA.sortOrder }),
    ]);

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
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">관리자</h1>
            <p className="text-muted-foreground text-sm mt-1">시험 세트, 회원 구독, 접속 통계를 관리합니다.</p>
          </div>
          {adminTab === 'sets' && (
            <Link to="/admin/questions">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />문제 관리
              </Button>
            </Link>
          )}
        </div>

        {/* Top-level tabs */}
        <Tabs value={adminTab} onValueChange={v => setAdminTab(v as typeof adminTab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="sets" className="gap-2">
              <BookOpen className="h-4 w-4" />
              시험 세트 관리
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <Crown className="h-4 w-4" />
              구독 관리
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              통계
            </TabsTrigger>
            <TabsTrigger value="board" className="gap-2">
              <Megaphone className="h-4 w-4" />
              게시판 관리
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-2">
              <NotebookPen className="h-4 w-4" />
              블로그 관리
            </TabsTrigger>
            <TabsTrigger value="event" className="gap-2">
              <Gift className="h-4 w-4" />
              이벤트
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Flag className="h-4 w-4" />
              신고 관리
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2 relative">
              <MessageSquare className="h-4 w-4" />
              문의 관리
              {unreadContactCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white font-bold">
                  {unreadContactCount > 9 ? '9+' : unreadContactCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── 시험 세트 관리 탭 ── */}
          <TabsContent value="sets">
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
                          {currentSets.map((set, index) => (
                            <div
                              key={set.id}
                              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-accent/30 transition-colors"
                            >
                              <div className="flex flex-col gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={index === 0}
                                  onClick={() => handleMoveSet(index, 'up')}
                                  className="h-7 w-7"
                                >
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={index === currentSets.length - 1}
                                  onClick={() => handleMoveSet(index, 'down')}
                                  className="h-7 w-7"
                                >
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>

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
          </TabsContent>

          {/* ── 구독 관리 탭 ── */}
          <TabsContent value="subscriptions">
            <SubscriptionManager />
          </TabsContent>

          {/* ── 통계 탭 ── */}
          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          {/* ── 게시판 관리 탭 ── */}
          <TabsContent value="board">
            <AnnouncementManager exams={exams} />
          </TabsContent>

          {/* ── 블로그 관리 탭 ── */}
          <TabsContent value="blog">
            <BlogManager exams={exams} />
          </TabsContent>

          {/* ── 신고 관리 탭 ── */}
          <TabsContent value="reports">
            <ReportManager />
          </TabsContent>

          {/* ── 문의 관리 탭 ── */}
          <TabsContent value="contacts">
            <ContactManager />
          </TabsContent>

          {/* ── 이벤트 관리 탭 ── */}
          <TabsContent value="event">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  무료 이벤트 접근 관리
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  기간을 설정하면 무료 사용자(비로그인 포함)도 모든 문제 세트의 해설을 볼 수 있습니다.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {eventLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">불러오는 중...</span>
                  </div>
                ) : (
                  <>
                    {/* 현재 상태 */}
                    <div className="rounded-lg border p-4 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">현재 상태</p>
                      {eventExpiresAt && new Date() < new Date(eventExpiresAt) ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                            <span className="font-semibold text-green-700 dark:text-green-400">이벤트 활성 중</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            종료 시각: {new Date(eventExpiresAt).toLocaleString('ko-KR')}
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
                          <span className="text-muted-foreground">비활성 (해설 잠금 중)</span>
                        </div>
                      )}
                    </div>

                    {/* 이벤트 활성화 */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium">이벤트 종료 일시 설정</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="datetime-local"
                          value={eventInput}
                          onChange={e => setEventInput(e.target.value)}
                          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <Button
                          size="sm"
                          disabled={eventSaving || !eventInput}
                          onClick={async () => {
                            if (!eventInput) return;
                            setEventSaving(true);
                            setEventError(null);
                            try {
                              const isoStr = new Date(eventInput).toISOString();
                              await setFreeAccessEvent(isoStr);
                              setEventExpiresAt(isoStr);
                            } catch (e: any) {
                              setEventError(e.message ?? '저장 중 오류가 발생했습니다.');
                            } finally {
                              setEventSaving(false);
                            }
                          }}
                        >
                          {eventSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                          이벤트 활성화
                        </Button>
                      </div>
                    </div>

                    {/* 즉시 종료 버튼 */}
                    {eventExpiresAt && new Date() < new Date(eventExpiresAt) && (
                      <div className="space-y-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={eventSaving}
                          onClick={async () => {
                            setEventSaving(true);
                            setEventError(null);
                            try {
                              await setFreeAccessEvent(null);
                              setEventExpiresAt(null);
                              setEventInput('');
                            } catch (e: any) {
                              setEventError(e.message ?? '종료 처리 중 오류가 발생했습니다.');
                            } finally {
                              setEventSaving(false);
                            }
                          }}
                        >
                          {eventSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                          이벤트 즉시 종료
                        </Button>
                      </div>
                    )}

                    {eventError && (
                      <p className="text-sm text-destructive">{eventError}</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
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
          allSets={currentSets}
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
