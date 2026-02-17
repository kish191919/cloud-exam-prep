import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { getAllSessions, createSession } from '@/hooks/useExamSession';
import { getQuestionsByIds } from '@/services/questionService';
import { getAllExams } from '@/services/examService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  XCircle, Bookmark, Loader2, PenTool, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import type { Question, ExamSession } from '@/types/exam';

interface QuestionWithMeta extends Question {
  sessionId: string;
  examTitle: string;
  examId: string;
  userAnswer?: string;
  date: number;
}

interface SetGroup {
  examKey: string;    // full session title e.g. "AWS Certified AI Practitioner - 세트 1"
  setLabel: string;   // just the set label e.g. "세트 1"
  examId: string;
  wrong: QuestionWithMeta[];
  bookmarks: QuestionWithMeta[];
}

interface ExamGroup {
  examId: string;
  examTitle: string;
  sets: SetGroup[];
}

const ReviewPage = () => {
  const { t, i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [examTitleMap, setExamTitleMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false);
  const [expandedExams, setExpandedExams] = useState<Set<string>>(new Set());

  const loadSessionsAndQuestions = async () => {
    setLoading(true);
    try {
      const [allSessions, allExams] = await Promise.all([
        getAllSessions(user?.id),
        getAllExams(),
      ]);

      // Build examId → base title map
      const titleMap: Record<string, string> = {};
      allExams.forEach(e => { titleMap[e.id] = e.title; });
      setExamTitleMap(titleMap);

      // Filter sessions that have answers or bookmarks
      const filteredSessions = allSessions.filter(s =>
        Object.keys(s.answers).length > 0 || s.bookmarks.length > 0
      );

      if (filteredSessions.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      // Collect all unique question IDs
      const questionIds = new Set<string>();
      filteredSessions.forEach(s => {
        Object.keys(s.answers).forEach(qid => questionIds.add(qid));
        s.bookmarks.forEach(qid => questionIds.add(qid));
        try {
          const storedIds = localStorage.getItem(`cloudmaster_questionids_${s.id}`);
          if (storedIds) {
            (JSON.parse(storedIds) as string[]).forEach(qid => questionIds.add(qid));
          }
        } catch { /* ignore */ }
      });

      const questions = await getQuestionsByIds(Array.from(questionIds));
      const questionMap = new Map(questions.map(q => [q.id, q]));

      const sessionsWithQuestions = filteredSessions.map(s => {
        const qidSet = new Set([...Object.keys(s.answers), ...s.bookmarks]);
        try {
          const storedIds = localStorage.getItem(`cloudmaster_questionids_${s.id}`);
          if (storedIds) {
            (JSON.parse(storedIds) as string[]).forEach(qid => qidSet.add(qid));
          }
        } catch { /* ignore */ }
        return {
          ...s,
          questions: Array.from(qidSet)
            .map(qid => questionMap.get(qid))
            .filter((q): q is Question => q !== undefined),
        };
      });

      setSessions(sessionsWithQuestions);

      // Auto-expand all exam groups on first load
      const examIds = new Set(filteredSessions.map(s => s.examId));
      setExpandedExams(examIds);
    } catch (error) {
      console.error('❌ Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionsAndQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, location.key]);

  const startReviewSession = async (
    examId: string,
    examTitle: string,
    questions: Question[],
    mode: 'study' | 'practice',
    sessionType: string
  ) => {
    if (questions.length === 0) return;
    setCreatingSession(true);
    try {
      const timeLimitMinutes = questions.length * 2;
      const suffix = isKo
        ? (mode === 'study' ? ` - ${sessionType} 복습` : ` - ${sessionType} 테스트`)
        : (mode === 'study' ? ` - ${sessionType} Review` : ` - ${sessionType} Test`);
      const initialBookmarks = sessionType === '북마크' || sessionType === 'Bookmarks'
        ? questions.map(q => q.id)
        : [];
      const sessionId = await createSession(
        examId, examTitle + suffix, questions, timeLimitMinutes,
        mode, false, user?.id || null, initialBookmarks
      );
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Failed to create review session:', error);
      alert(isKo ? '복습 세션 생성에 실패했습니다.' : 'Failed to create review session.');
    } finally {
      setCreatingSession(false);
    }
  };

  // ── Identify review sessions ──────────────────────────────────────────────
  const isReviewSession = (title: string) =>
    title.includes(' - 오답') || title.includes(' - 북마크') ||
    title.includes(' - 복습') || title.includes(' - 테스트') ||
    title.includes(' - Wrong') || title.includes(' - Bookmark') ||
    title.includes(' - Review') || title.includes(' - Test');

  const getBaseExamKey = (reviewTitle: string): string => {
    const suffixes = [
      ' - 오답 복습', ' - 오답 테스트', ' - 북마크 복습', ' - 북마크 테스트',
      ' - Wrong Answers Review', ' - Wrong Answers Test',
      ' - Bookmarks Review', ' - Bookmarks Test',
    ];
    for (const suffix of suffixes) {
      if (reviewTitle.endsWith(suffix)) return reviewTitle.slice(0, -suffix.length);
    }
    return reviewTitle;
  };

  // ── Track questions answered correctly in review sessions (per exam key) ──
  const reviewedCorrectByExam: Record<string, Set<string>> = {};
  sessions.forEach(s => {
    if (!isReviewSession(s.examTitle)) return;
    const baseKey = getBaseExamKey(s.examTitle);
    if (!reviewedCorrectByExam[baseKey]) reviewedCorrectByExam[baseKey] = new Set();
    s.questions.forEach(q => {
      if (s.answers[q.id] === q.correctOptionId) reviewedCorrectByExam[baseKey].add(q.id);
    });
  });

  // ── Track LATEST answer per question per exam key (bug fix) ───────────────
  // Uses the most recent session's answer, so if you answered correctly in a
  // newer attempt it won't show as wrong from an older attempt.
  const latestAnswerPerExam: Record<string, Map<string, {
    answer: string; timestamp: number; question: Question; sessionId: string; examId: string;
  }>> = {};

  sessions
    .filter(s => !isReviewSession(s.examTitle))
    .forEach(s => {
      const examKey = s.examTitle;
      const timestamp = s.startedAt;
      if (!latestAnswerPerExam[examKey]) latestAnswerPerExam[examKey] = new Map();
      s.questions.forEach(q => {
        const answer = s.answers[q.id];
        if (answer === undefined) return;
        const existing = latestAnswerPerExam[examKey].get(q.id);
        if (!existing || timestamp > existing.timestamp) {
          latestAnswerPerExam[examKey].set(q.id, {
            answer, timestamp, question: q, sessionId: s.id, examId: s.examId,
          });
        }
      });
    });

  // ── Track latest bookmark status per question ─────────────────────────────
  const latestBookmarkStatus: Record<string, boolean> = {};
  const questionLastUpdated: Record<string, number> = {};

  sessions.forEach(s => {
    const timestamp = s.startedAt;
    s.questions.forEach(q => {
      const isBookmarked = s.bookmarks.includes(q.id);
      if (!questionLastUpdated[q.id] || timestamp > questionLastUpdated[q.id]) {
        questionLastUpdated[q.id] = timestamp;
        latestBookmarkStatus[q.id] = isBookmarked;
      }
    });
    s.bookmarks.forEach(qid => {
      if (!questionLastUpdated[qid] || timestamp > questionLastUpdated[qid]) {
        questionLastUpdated[qid] = timestamp;
        latestBookmarkStatus[qid] = true;
      }
    });
    Object.keys(s.answers).forEach(qid => {
      const isBookmarked = s.bookmarks.includes(qid);
      if (!questionLastUpdated[qid] || timestamp > questionLastUpdated[qid]) {
        questionLastUpdated[qid] = timestamp;
        latestBookmarkStatus[qid] = isBookmarked;
      }
    });
  });

  // ── Build wrong / bookmark maps from latest answers ───────────────────────
  const wrongByExam: Record<string, Map<string, QuestionWithMeta>> = {};
  const bookmarksByExam: Record<string, Map<string, QuestionWithMeta>> = {};

  Object.entries(latestAnswerPerExam).forEach(([examKey, answerMap]) => {
    answerMap.forEach(({ answer, question, sessionId, examId, timestamp }, qid) => {
      // Wrong answers: latest answer is wrong AND not mastered in review
      if (answer !== question.correctOptionId && !reviewedCorrectByExam[examKey]?.has(qid)) {
        if (!wrongByExam[examKey]) wrongByExam[examKey] = new Map();
        wrongByExam[examKey].set(qid, {
          ...question, sessionId, examTitle: examKey, examId, userAnswer: answer, date: timestamp,
        });
      }
    });

    // Bookmarks: based on latest bookmark status, for questions seen in this exam key
    answerMap.forEach(({ question, sessionId, examId, timestamp }) => {
      if (latestBookmarkStatus[question.id] === true) {
        if (!bookmarksByExam[examKey]) bookmarksByExam[examKey] = new Map();
        if (!bookmarksByExam[examKey].has(question.id)) {
          bookmarksByExam[examKey].set(question.id, {
            ...question, sessionId, examTitle: examKey, examId, date: timestamp,
          });
        }
      }
    });
  });

  // Also include bookmarks from sessions even if no answers (bookmark-only sessions)
  sessions
    .filter(s => !isReviewSession(s.examTitle))
    .forEach(s => {
      const examKey = s.examTitle;
      s.questions.forEach(q => {
        if (latestBookmarkStatus[q.id] === true) {
          if (!bookmarksByExam[examKey]) bookmarksByExam[examKey] = new Map();
          if (!bookmarksByExam[examKey].has(q.id)) {
            bookmarksByExam[examKey].set(q.id, {
              ...q, sessionId: s.id, examTitle: examKey, examId: s.examId,
              date: s.startedAt,
            });
          }
        }
      });
    });

  // ── Build hierarchical ExamGroup structure ────────────────────────────────
  const examGroupMap: Record<string, ExamGroup> = {};
  const allExamKeys = Array.from(new Set([
    ...Object.keys(wrongByExam),
    ...Object.keys(bookmarksByExam),
  ]));

  allExamKeys.forEach(examKey => {
    // Find any session with this examKey to get examId
    const refSession = sessions.find(
      s => s.examTitle === examKey && !isReviewSession(s.examTitle)
    );
    if (!refSession) return;

    const examId = refSession.examId;
    const baseTitle = examTitleMap[examId] || examKey;
    const setLabel = examKey === baseTitle
      ? (isKo ? '전체' : 'All')
      : examKey.replace(baseTitle + ' - ', '');

    if (!examGroupMap[examId]) {
      examGroupMap[examId] = { examId, examTitle: baseTitle, sets: [] };
    }

    examGroupMap[examId].sets.push({
      examKey,
      setLabel,
      examId,
      wrong: Array.from(wrongByExam[examKey]?.values() ?? []),
      bookmarks: Array.from(bookmarksByExam[examKey]?.values() ?? []),
    });
  });

  const examGroups = Object.values(examGroupMap);
  const totalWrong = examGroups.reduce((sum, eg) =>
    sum + eg.sets.reduce((s2, set) => s2 + set.wrong.length, 0), 0);
  const totalBookmarks = examGroups.reduce((sum, eg) =>
    sum + eg.sets.reduce((s2, set) => s2 + set.bookmarks.length, 0), 0);

  const toggleExam = (examId: string) => {
    setExpandedExams(prev => {
      const next = new Set(prev);
      if (next.has(examId)) next.delete(examId);
      else next.add(examId);
      return next;
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('review.title')}</h1>
          <p className="text-muted-foreground">{t('review.subtitle')}</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isKo ? '오답 문제' : 'Wrong Answers'}</p>
                  <p className="text-2xl font-bold text-destructive">{totalWrong}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isKo ? '북마크' : 'Bookmarks'}</p>
                  <p className="text-2xl font-bold text-accent">{totalBookmarks}</p>
                </div>
                <Bookmark className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exam groups */}
        {examGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>{isKo ? '아직 오답이 없습니다. 먼저 시험을 응시하세요!' : 'No data yet. Take an exam first!'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {examGroups.map(examGroup => {
              const totalWrongForExam = examGroup.sets.reduce((s, set) => s + set.wrong.length, 0);
              const totalBmForExam = examGroup.sets.reduce((s, set) => s + set.bookmarks.length, 0);
              const isExpanded = expandedExams.has(examGroup.examId);

              return (
                <Card key={examGroup.examId} className="overflow-hidden">
                  {/* Exam header — clickable to expand/collapse */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExam(examGroup.examId)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold text-base truncate">{examGroup.examTitle}</span>
                      <div className="flex gap-1.5 shrink-0">
                        {totalWrongForExam > 0 && (
                          <Badge variant="outline" className="border-destructive/40 text-destructive text-xs">
                            <XCircle className="h-3 w-3 mr-1" />{totalWrongForExam}
                          </Badge>
                        )}
                        {totalBmForExam > 0 && (
                          <Badge variant="outline" className="border-accent/40 text-accent text-xs">
                            <Bookmark className="h-3 w-3 mr-1" />{totalBmForExam}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>

                  {/* Set rows */}
                  {isExpanded && (
                    <div className="border-t divide-y">
                      {examGroup.sets.map(setGroup => (
                        <div
                          key={setGroup.examKey}
                          className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                          {/* Set label + badges */}
                          <div className="flex items-center gap-2 sm:w-48 shrink-0">
                            <span className="text-sm font-medium text-foreground">{setGroup.setLabel}</span>
                            <div className="flex gap-1">
                              {setGroup.wrong.length > 0 && (
                                <Badge variant="outline" className="border-destructive/40 text-destructive text-xs px-1.5">
                                  <XCircle className="h-2.5 w-2.5 mr-0.5" />{setGroup.wrong.length}
                                </Badge>
                              )}
                              {setGroup.bookmarks.length > 0 && (
                                <Badge variant="outline" className="border-accent/40 text-accent text-xs px-1.5">
                                  <Bookmark className="h-2.5 w-2.5 mr-0.5" />{setGroup.bookmarks.length}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-1.5">
                            {setGroup.wrong.length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2.5"
                                disabled={creatingSession}
                                onClick={() => startReviewSession(
                                  setGroup.examId, setGroup.examKey, setGroup.wrong,
                                  'practice', isKo ? '오답' : 'Wrong Answers'
                                )}
                              >
                                <PenTool className="h-3 w-3 mr-1" />
                                {isKo ? '오답 테스트' : 'Wrong Test'}
                              </Button>
                            )}
                            {setGroup.bookmarks.length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2.5"
                                disabled={creatingSession}
                                onClick={() => startReviewSession(
                                  setGroup.examId, setGroup.examKey, setGroup.bookmarks,
                                  'practice', isKo ? '북마크' : 'Bookmarks'
                                )}
                              >
                                <PenTool className="h-3 w-3 mr-1" />
                                {isKo ? '북마크 테스트' : 'Bookmarks Test'}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ReviewPage;
