import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { getAllSessions } from '@/hooks/useExamSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import {
  XCircle, Bookmark, ArrowRight, ChevronDown, ChevronUp,
  CheckCircle2, Eye, EyeOff, Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Question, ExamSession } from '@/types/exam';

interface QuestionWithMeta extends Question {
  sessionId: string;
  examTitle: string;
  examId: string;
  userAnswer?: string;
  date: number;
}

const REVIEWED_KEY = 'cloudmaster_reviewed_questions';

const ReviewPage = () => {
  const { t } = useTranslation('pages');
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewedQuestions, setReviewedQuestions] = useState<Record<string, boolean>>({});
  const [showReviewed, setShowReviewed] = useState(false);
  const [expandedExams, setExpandedExams] = useState<Record<string, boolean>>({});

  // Load sessions from Supabase/localStorage
  useEffect(() => {
    async function loadSessions() {
      try {
        const allSessions = await getAllSessions();
        console.log('📊 All sessions loaded:', allSessions.length);
        console.log('📊 Sessions data:', allSessions);

        // Include all sessions that have answers or bookmarks (not just submitted ones)
        const filteredSessions = allSessions.filter(s => {
          const hasAnswers = Object.keys(s.answers).length > 0;
          const hasBookmarks = s.bookmarks.length > 0;
          const hasQuestions = s.questions && s.questions.length > 0;

          console.log(`📊 Session ${s.id}:`, {
            examTitle: s.examTitle,
            hasAnswers,
            hasBookmarks,
            hasQuestions,
            answersCount: Object.keys(s.answers).length,
            bookmarksCount: s.bookmarks.length,
            questionsCount: s.questions?.length || 0
          });

          return hasAnswers || hasBookmarks;
        });

        console.log('📊 Filtered sessions:', filteredSessions.length);
        setSessions(filteredSessions);
      } catch (error) {
        console.error('❌ Failed to load sessions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  // Load reviewed questions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(REVIEWED_KEY);
    if (stored) {
      try {
        setReviewedQuestions(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse reviewed questions:', e);
      }
    }
  }, []);

  // Save reviewed questions to localStorage
  const toggleReviewed = (questionId: string) => {
    const updated = { ...reviewedQuestions, [questionId]: !reviewedQuestions[questionId] };
    setReviewedQuestions(updated);
    localStorage.setItem(REVIEWED_KEY, JSON.stringify(updated));
  };

  // Group questions by exam
  const wrongByExam: Record<string, QuestionWithMeta[]> = {};
  const bookmarksByExam: Record<string, QuestionWithMeta[]> = {};

  sessions.forEach(s => {
    const examKey = s.examTitle;

    // Wrong answers
    s.questions
      .filter(q => s.answers[q.id] !== q.correctOptionId)
      .forEach(q => {
        if (!wrongByExam[examKey]) wrongByExam[examKey] = [];
        wrongByExam[examKey].push({
          ...q,
          sessionId: s.id,
          examTitle: s.examTitle,
          examId: s.examId,
          userAnswer: s.answers[q.id],
          date: s.submittedAt || s.startedAt,
        });
      });

    // Bookmarked
    s.questions
      .filter(q => s.bookmarks.includes(q.id))
      .forEach(q => {
        if (!bookmarksByExam[examKey]) bookmarksByExam[examKey] = [];
        bookmarksByExam[examKey].push({
          ...q,
          sessionId: s.id,
          examTitle: s.examTitle,
          examId: s.examId,
          date: s.submittedAt || s.startedAt,
        });
      });
  });

  const examTitles = Array.from(new Set([...Object.keys(wrongByExam), ...Object.keys(bookmarksByExam)]));

  const toggleExam = (examTitle: string) => {
    setExpandedExams(prev => ({ ...prev, [examTitle]: !prev[examTitle] }));
  };

  const renderQuestionList = (questions: QuestionWithMeta[], type: 'wrong' | 'bookmark') => {
    const filtered = type === 'wrong' && !showReviewed
      ? questions.filter(q => !reviewedQuestions[q.id])
      : questions;

    if (filtered.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {type === 'wrong'
            ? (showReviewed ? '오답 문제가 없습니다.' : '복습할 오답이 없습니다. 모두 완료하셨어요!')
            : '북마크한 문제가 없습니다. 시험 중 문제를 북마크하세요!'
          }
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {filtered.map((q) => (
          <div key={`${q.sessionId}-${q.id}`} className={`p-3 rounded-lg border transition-all ${
            reviewedQuestions[q.id] && type === 'wrong'
              ? 'bg-muted/50 opacity-60'
              : 'bg-card'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2 mb-2">{q.text}</p>
                {type === 'wrong' && q.userAnswer && (
                  <p className="text-xs text-destructive mb-2">
                    내 답: {q.userAnswer.toUpperCase()} | 정답: {q.correctOptionId.toUpperCase()}
                  </p>
                )}
                <div className="flex gap-1 flex-wrap">
                  {q.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {type === 'wrong' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReviewed(q.id)}
                    className={reviewedQuestions[q.id] ? 'text-green-600' : 'text-muted-foreground'}
                  >
                    {reviewedQuestions[q.id]
                      ? <><CheckCircle2 className="h-4 w-4 mr-1" />완료</>
                      : <><CheckCircle2 className="h-4 w-4 mr-1" />완료 표시</>
                    }
                  </Button>
                )}
                <Link to={`/results/${q.sessionId}`}>
                  <Button variant="ghost" size="icon"><ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const totalWrong = Object.values(wrongByExam).flat().length;
  const totalBookmarks = Object.values(bookmarksByExam).flat().length;
  const unreviewedWrong = Object.values(wrongByExam).flat().filter(q => !reviewedQuestions[q.id]).length;

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">오답 문제</p>
                  <p className="text-2xl font-bold text-destructive">{unreviewedWrong}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">북마크</p>
                  <p className="text-2xl font-bold text-accent">{totalBookmarks}</p>
                </div>
                <Bookmark className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">복습 완료</p>
                  <p className="text-2xl font-bold text-green-600">{totalWrong - unreviewedWrong}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Show reviewed toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReviewed(!showReviewed)}
          >
            {showReviewed
              ? <><EyeOff className="h-4 w-4 mr-2" />완료한 문제 숨기기</>
              : <><Eye className="h-4 w-4 mr-2" />완료한 문제 보기</>
            }
          </Button>
        </div>

        {/* Exam groups */}
        {examTitles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>아직 오답이 없습니다. 먼저 시험을 응시하세요!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {examTitles.map(examTitle => {
              const wrong = wrongByExam[examTitle] || [];
              const bookmarks = bookmarksByExam[examTitle] || [];
              const isExpanded = expandedExams[examTitle] ?? true;
              const unreviewedCount = wrong.filter(q => !reviewedQuestions[q.id]).length;

              return (
                <Card key={examTitle}>
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExam(examTitle)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{examTitle}</CardTitle>
                        <div className="flex gap-2">
                          {wrong.length > 0 && (
                            <Badge variant="outline" className="border-destructive/40 text-destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              {unreviewedCount > 0 ? `${unreviewedCount}/${wrong.length}` : wrong.length}
                            </Badge>
                          )}
                          {bookmarks.length > 0 && (
                            <Badge variant="outline" className="border-accent/40 text-accent">
                              <Bookmark className="h-3 w-3 mr-1" />
                              {bookmarks.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      }
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent>
                      <Tabs defaultValue="wrong" className="w-full">
                        <TabsList className="w-full">
                          <TabsTrigger value="wrong" className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            오답 문제 ({unreviewedCount > 0 ? `${unreviewedCount}/${wrong.length}` : wrong.length})
                          </TabsTrigger>
                          <TabsTrigger value="bookmark" className="flex-1">
                            <Bookmark className="h-4 w-4 mr-2" />
                            북마크 ({bookmarks.length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="wrong" className="mt-4">
                          {renderQuestionList(wrong, 'wrong')}
                        </TabsContent>

                        <TabsContent value="bookmark" className="mt-4">
                          {renderQuestionList(bookmarks, 'bookmark')}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
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
