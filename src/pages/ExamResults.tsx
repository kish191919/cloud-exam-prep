import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSession, createSession } from '@/hooks/useExamSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, XCircle, RotateCcw, ArrowLeft,
  Trophy, Target, Clock, Minus, Loader2, PenTool,
  ChevronDown, ChevronUp, Lightbulb,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import type { ExamSession, Question } from '@/types/exam';

type FilterType = 'all' | 'wrong' | 'correct' | 'unanswered';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}분 ${s}초`;
}

const ExamResults = () => {
  const { i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      if (!sessionId) { setLoading(false); return; }
      const s = await getSession(sessionId);
      setSession(s);
      setLoading(false);
    }
    load();
  }, [sessionId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!session || session.status !== 'submitted') {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">{isKo ? '결과를 찾을 수 없습니다.' : 'Results not found.'}</p>
          <Link to="/exams"><Button className="mt-4">{isKo ? '시험 목록으로' : 'Back to Exams'}</Button></Link>
        </div>
      </AppLayout>
    );
  }

  // ── Derived stats ────────────────────────────────────────────────────────
  const total = session.questions.length;
  // ── Tag breakdown ────────────────────────────────────────────────────────
  const tagStats: Record<string, { correct: number; total: number }> = (() => {
    if (session.tagBreakdown && Object.keys(session.tagBreakdown).length > 0) {
      return session.tagBreakdown;
    }
    const stats: Record<string, { correct: number; total: number }> = {};
    session.questions.forEach(q => {
      q.tags.forEach(tag => {
        if (!stats[tag]) stats[tag] = { correct: 0, total: 0 };
        stats[tag].total++;
      });
      if (session.answers[q.id] === q.correctOptionId) {
        q.tags.forEach(tag => { stats[tag].correct++; });
      }
    });
    return stats;
  })();
  const tagEntries = Object.entries(tagStats).sort((a, b) => b[1].total - a[1].total);
  const correctQs = session.questions.filter(q => session.answers[q.id] === q.correctOptionId);
  const wrongQs   = session.questions.filter(q => session.answers[q.id] && session.answers[q.id] !== q.correctOptionId);
  const skippedQs = session.questions.filter(q => !session.answers[q.id]);
  const score = session.score ?? 0;
  const passed = score >= 70;
  const timeTaken = session.submittedAt && session.startedAt
    ? formatTime(session.submittedAt - session.startedAt)
    : null;

  // ── Filtered question list ───────────────────────────────────────────────
  const filteredQuestions: Question[] = (() => {
    let qs = session.questions;
    if (filter === 'wrong')           qs = wrongQs;
    else if (filter === 'correct')    qs = correctQs;
    else if (filter === 'unanswered') qs = skippedQs;
    if (tagFilter) qs = qs.filter(q => q.tags.includes(tagFilter));
    return qs;
  })();

  // 오답/복습/북마크 등 필터된 세션인지 판별
  const isFilteredSession = [' - 오답', ' - 복습', ' - 북마크', ' - 테스트', ' - Wrong', ' - Review', ' - Bookmark', ' - Test']
    .some(suffix => session.examTitle.includes(suffix));

  // ── Handlers ────────────────────────────────────────────────────────────
  const handlePracticeWrong = async () => {
    if (wrongQs.length === 0 || creating) return;
    setCreating(true);
    try {
      const id = await createSession(
        session.examId,
        `${session.examTitle} - ${isKo ? '오답' : 'Wrong Answers'}`,
        wrongQs,
        Math.ceil(wrongQs.length * 2),
        'practice',
        false,
        user?.id || null
      );
      navigate(`/session/${id}`);
    } finally { setCreating(false); }
  };

  const handleDomainPractice = async (tag: string) => {
    if (creating) return;
    const tagQuestions = session.questions.filter(q => q.tags.includes(tag));
    if (tagQuestions.length === 0) return;
    setCreating(true);
    try {
      const id = await createSession(
        session.examId,
        `${tag} - ${isKo ? '연습' : 'Practice'}`,
        tagQuestions,
        Math.ceil(tagQuestions.length * 2),
        'practice',
        false,
        user?.id || null
      );
      navigate(`/session/${id}`);
    } finally { setCreating(false); }
  };

  // 필터된 세션이면 시험 목록으로, 일반 세션이면 동일 문제 전체 재시도
  const handleRetryAll = async (mode: 'exam' | 'practice') => {
    if (isFilteredSession) {
      navigate('/exams');
      return;
    }
    if (creating) return;
    setCreating(true);
    try {
      const id = await createSession(
        session.examId, session.examTitle, session.questions,
        session.timeLimitSec / 60, mode, false, user?.id || null
      );
      navigate(`/session/${id}`);
    } finally { setCreating(false); }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const FILTERS: { key: FilterType; label: string; count: number }[] = [
    { key: 'all',        label: isKo ? '전체'   : 'All',        count: total },
    { key: 'wrong',      label: isKo ? '오답'   : 'Wrong',      count: wrongQs.length },
    { key: 'correct',    label: isKo ? '정답'   : 'Correct',    count: correctQs.length },
    { key: 'unanswered', label: isKo ? '미응답' : 'Unanswered', count: skippedQs.length },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5 pb-12">

        {/* ── Score hero ── */}
        <Card className={`border-2 ${passed ? 'border-green-400' : 'border-destructive'}`}>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Icon + score */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${
                  passed ? 'bg-green-100 dark:bg-green-950' : 'bg-destructive/10'
                }`}>
                  {passed
                    ? <Trophy className="h-12 w-12 text-green-500" />
                    : <Target className="h-12 w-12 text-destructive" />}
                </div>
                <span className="text-4xl font-extrabold">{score}%</span>
                <span className={`text-sm font-semibold mt-1 ${passed ? 'text-green-500' : 'text-destructive'}`}>
                  {passed ? (isKo ? '합격' : 'PASSED') : (isKo ? '불합격' : 'FAILED')}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {isKo ? '합격 기준 70%' : 'Passing score: 70%'}
                </span>
              </div>

              {/* Stats grid */}
              <div className="flex-1 w-full">
                <p className="text-sm font-medium text-muted-foreground mb-3 truncate">{session.examTitle}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: isKo ? '총 문제' : 'Total',     value: total,              color: 'text-foreground' },
                    { label: isKo ? '정답'   : 'Correct',   value: correctQs.length,   color: 'text-green-600' },
                    { label: isKo ? '오답'   : 'Wrong',     value: wrongQs.length,     color: 'text-destructive' },
                    { label: isKo ? '미응답' : 'Skipped',   value: skippedQs.length,   color: 'text-muted-foreground' },
                  ].map(s => (
                    <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Time + score bar */}
                <div className="space-y-2">
                  {timeTaken && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{isKo ? '소요 시간' : 'Time'}: {timeTaken}</span>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>0%</span>
                      <span className="text-yellow-600 font-medium">70% {isKo ? '합격선' : 'pass'}</span>
                      <span>100%</span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${passed ? 'bg-green-500' : 'bg-destructive'}`}
                        style={{ width: `${score}%` }}
                      />
                      {/* Passing threshold marker */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-yellow-500" style={{ left: '70%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-5 border-t space-y-2.5">
              {wrongQs.length > 0 && (
                <Button onClick={handlePracticeWrong} disabled={creating} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <PenTool className="h-4 w-4 mr-1.5" />
                  {isKo ? `오답 테스트 (${wrongQs.length}문제)` : `Wrong Test (${wrongQs.length})`}
                </Button>
              )}
              {isFilteredSession ? (
                <Button onClick={() => handleRetryAll('exam')} disabled={creating} variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  {isKo ? '전체 시험 보기' : 'Full Exam'}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => handleRetryAll('exam')} disabled={creating} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-1.5 shrink-0" />
                    {isKo ? '실전 재시도' : 'Retry (Exam)'}
                  </Button>
                  <Button onClick={() => handleRetryAll('practice')} disabled={creating} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-1.5 shrink-0" />
                    {isKo ? '연습 재시도' : 'Retry (Practice)'}
                  </Button>
                </div>
              )}
              <Link to="/review" className="block">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  {isKo ? '복습 페이지' : 'Review Page'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* ── Domain score breakdown ── */}
        {tagEntries.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {isKo ? '도메인별 성적' : 'Score by Domain'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tagEntries.map(([tag, { correct, total: tagTotal }]) => {
                const pct = tagTotal > 0 ? Math.round((correct / tagTotal) * 100) : 0;
                return (
                  <div key={tag}>
                    <button
                      onClick={() => handleDomainPractice(tag)}
                      disabled={creating}
                      className="w-full text-left group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground flex-1 mr-3 truncate group-hover:text-foreground transition-colors">
                          {tag}
                        </span>
                        <span className="text-xs font-semibold shrink-0 text-green-600">
                          {correct}/{tagTotal} ({pct}%)
                        </span>
                      </div>
                      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden group-hover:bg-muted/70 transition-colors">
                        <div
                          className="h-full rounded-full transition-all bg-green-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* ── Question review ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {isKo ? '문제 검토' : 'Question Review'}
            </CardTitle>
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filter === f.key
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {f.key === 'wrong'      && <XCircle className="h-3 w-3" />}
                  {f.key === 'correct'    && <CheckCircle2 className="h-3 w-3" />}
                  {f.key === 'unanswered' && <Minus className="h-3 w-3" />}
                  {f.label}
                  <span className="opacity-70">({f.count})</span>
                </button>
              ))}
              {tagEntries.length > 0 && (
                <>
                  <span className="text-muted-foreground/40 text-xs self-center px-0.5">|</span>
                  {tagEntries.map(([tag]) => (
                    <button
                      key={tag}
                      onClick={() => setTagFilter(prev => prev === tag ? null : tag)}
                      className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors max-w-[160px] truncate ${
                        tagFilter === tag
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {filteredQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {isKo ? '해당하는 문제가 없습니다.' : 'No questions match this filter.'}
              </p>
            ) : (
              filteredQuestions.map((q) => {
                const userAnswer = session.answers[q.id];
                const isCorrect  = userAnswer === q.correctOptionId;
                const isSkipped  = !userAnswer;
                const globalIdx  = session.questions.indexOf(q) + 1;
                const isExpanded = expandedIds.has(q.id);

                return (
                  <div key={q.id} className={`border rounded-lg overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-accent' : ''}`}>
                    {/* Header — always visible, question text full when expanded */}
                    <button
                      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors ${isExpanded ? 'bg-accent/10 hover:bg-accent/20' : 'hover:bg-muted/30'}`}
                      onClick={() => toggleExpand(q.id)}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                         isSkipped ? <Minus className="h-4 w-4 text-muted-foreground" /> :
                                     <XCircle className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground">Q{globalIdx}</span>
                        <p className={`text-sm leading-relaxed mt-0.5 ${!isExpanded ? 'line-clamp-2' : 'whitespace-pre-line'}`}>
                          {q.text}
                        </p>
                      </div>
                      <div className="shrink-0 ml-2 mt-0.5">
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Expanded: options + explanation only (no repeated question text) */}
                    {isExpanded && (
                      <div className="border-t px-4 py-4 space-y-4 bg-muted/20 cursor-pointer" onClick={() => toggleExpand(q.id)}>
                        {/* Options */}
                        <div className="space-y-1.5">
                          {q.options.map((opt, oi) => {
                            const isAnswer   = opt.id === q.correctOptionId;
                            const isUserPick = opt.id === userAnswer;
                            return (
                              <div
                                key={opt.id}
                                className={`text-sm px-3 py-2.5 rounded-lg border-l-2 ${
                                  isAnswer   ? 'border-l-green-500 bg-green-50/60 dark:bg-green-950/20 border border-border' :
                                  isUserPick ? 'border-l-red-400 bg-red-50/60 dark:bg-red-950/20 border border-border' :
                                               'border-l-transparent border border-border/50 text-muted-foreground'
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <span className="shrink-0 text-xs text-muted-foreground w-4 pt-px">{oi + 1}.</span>
                                  <div className="flex-1">
                                    <span className={
                                      isAnswer   ? 'text-green-800 dark:text-green-300 font-medium' :
                                      isUserPick ? 'text-red-700 dark:text-red-400' : ''
                                    }>
                                      {opt.text}
                                    </span>
                                    {isAnswer && (
                                      <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-medium">
                                        ✓ {isKo ? '정답' : 'Correct'}
                                      </span>
                                    )}
                                    {isUserPick && !isAnswer && (
                                      <span className="ml-2 text-xs text-red-500 font-medium">
                                        ✗ {isKo ? '내 선택' : 'Your pick'}
                                      </span>
                                    )}
                                    {opt.explanation && (
                                      <p className="text-xs mt-1 text-muted-foreground italic">{opt.explanation}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="pl-3 border-l-2 border-l-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">
                              {isKo ? '해설' : 'Explanation'}
                            </p>
                            <p className="text-xs text-foreground/80 leading-relaxed">{q.explanation}</p>
                          </div>
                        )}

                        {/* Key points */}
                        {q.keyPoints && (
                          <div className="pl-3 border-l-2 border-l-accent/60">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Lightbulb className="h-3 w-3 text-accent" />
                              <p className="text-xs font-semibold text-accent">
                                {isKo ? '핵심 암기사항' : 'Key Points'}
                              </p>
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                              {q.keyPoints}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
};

export default ExamResults;
