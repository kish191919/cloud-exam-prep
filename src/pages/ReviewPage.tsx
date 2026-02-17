import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { getAllSessions, createSession } from '@/hooks/useExamSession';
import { getQuestionsByIds } from '@/services/questionService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  XCircle, Bookmark, Loader2, BookOpen, PenTool,
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

const ReviewPage = () => {
  const { t, i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false);

  // Load sessions and questions efficiently
  const loadSessionsAndQuestions = async () => {
    setLoading(true);
    try {
      // 1. Load all sessions (without questions)
      const allSessions = await getAllSessions();
      console.log('📊 Sessions loaded:', allSessions.length);

      // 2. Filter sessions that have answers or bookmarks
      const filteredSessions = allSessions.filter(s =>
        Object.keys(s.answers).length > 0 || s.bookmarks.length > 0
      );

      if (filteredSessions.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      // 3. Collect all unique question IDs from answers and bookmarks
      const questionIds = new Set<string>();
      filteredSessions.forEach(s => {
        Object.keys(s.answers).forEach(qid => questionIds.add(qid));
        s.bookmarks.forEach(qid => questionIds.add(qid));
      });

      console.log('📊 Unique questions to load:', questionIds.size);

      // 4. Fetch all questions at once (only the ones we need!)
      const questions = await getQuestionsByIds(Array.from(questionIds));
      const questionMap = new Map(questions.map(q => [q.id, q]));

      console.log('📊 Questions loaded:', questions.length);

      // 5. Attach questions to sessions
      const sessionsWithQuestions = filteredSessions.map(s => ({
        ...s,
        questions: Array.from(new Set([...Object.keys(s.answers), ...s.bookmarks]))
          .map(qid => questionMap.get(qid))
          .filter((q): q is Question => q !== undefined)
      }));

      setSessions(sessionsWithQuestions);
    } catch (error) {
      console.error('❌ Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionsAndQuestions();

    // Reload data when window regains focus (user returns to this page)
    const handleFocus = () => {
      loadSessionsAndQuestions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);


  // Create a review session with specific questions
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
      // Calculate time limit: 2 minutes per question
      const timeLimitMinutes = questions.length * 2;

      // Create session with suffix based on type and mode
      const suffix = isKo
        ? (mode === 'study' ? ` - ${sessionType} 복습` : ` - ${sessionType} 테스트`)
        : (mode === 'study' ? ` - ${sessionType} Review` : ` - ${sessionType} Test`);

      // For bookmark sessions, initialize bookmarks with all question IDs
      const initialBookmarks = sessionType === '북마크' || sessionType === 'Bookmarks'
        ? questions.map(q => q.id)
        : [];

      const sessionId = await createSession(
        examId,
        examTitle + suffix,
        questions,
        timeLimitMinutes,
        mode,
        false, // don't randomize for review
        undefined, // userId
        initialBookmarks
      );

      // Navigate to the new session
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Failed to create review session:', error);
      alert(isKo ? '복습 세션 생성에 실패했습니다.' : 'Failed to create review session.');
    } finally {
      setCreatingSession(false);
    }
  };

  // Group questions by exam (excluding review sessions)
  const wrongByExam: Record<string, QuestionWithMeta[]> = {};
  const bookmarksByExam: Record<string, QuestionWithMeta[]> = {};

  // Filter out review sessions (those created from review page)
  const isReviewSession = (title: string) => {
    return title.includes(' - 오답') ||
           title.includes(' - 북마크') ||
           title.includes(' - 복습') ||
           title.includes(' - 테스트') ||
           title.includes(' - Wrong') ||
           title.includes(' - Bookmark') ||
           title.includes(' - Review') ||
           title.includes(' - Test');
  };

  // Track questions that were answered correctly in review sessions
  const reviewedCorrectQuestionIds = new Set<string>();

  // Track current bookmarks from bookmark review sessions
  const bookmarkReviewSessionsByExam: Record<string, Set<string>> = {};

  sessions.forEach(s => {
    if (isReviewSession(s.examTitle)) {
      // Track questions answered correctly in review sessions
      s.questions.forEach(q => {
        if (s.answers[q.id] === q.correctOptionId) {
          reviewedCorrectQuestionIds.add(q.id);
        }
      });

      // Track current bookmarks from bookmark review sessions
      if (s.examTitle.includes('북마크') || s.examTitle.includes('Bookmark')) {
        // Extract original exam title
        const originalTitle = s.examTitle
          .replace(/ - 북마크.*/, '')
          .replace(/ - Bookmark.*/, '');

        if (!bookmarkReviewSessionsByExam[originalTitle]) {
          bookmarkReviewSessionsByExam[originalTitle] = new Set();
        }

        // Add all current bookmarks from this review session
        s.bookmarks.forEach(qid => bookmarkReviewSessionsByExam[originalTitle].add(qid));
      }
    }
  });

  // Use Maps to deduplicate questions by ID
  const wrongQuestionsMap: Record<string, Map<string, QuestionWithMeta>> = {};
  const bookmarkQuestionsMap: Record<string, Map<string, QuestionWithMeta>> = {};

  sessions.forEach(s => {
    // Skip review sessions to avoid infinite loop
    if (isReviewSession(s.examTitle)) return;

    const examKey = s.examTitle;

    // Wrong answers - deduplicate by question ID and exclude reviewed correct answers
    s.questions
      .filter(q =>
        s.answers[q.id] !== q.correctOptionId &&
        !reviewedCorrectQuestionIds.has(q.id) // Exclude if answered correctly in review
      )
      .forEach(q => {
        if (!wrongQuestionsMap[examKey]) wrongQuestionsMap[examKey] = new Map();
        // Only add if not already present (keeps the most recent attempt)
        if (!wrongQuestionsMap[examKey].has(q.id)) {
          wrongQuestionsMap[examKey].set(q.id, {
            ...q,
            sessionId: s.id,
            examTitle: s.examTitle,
            examId: s.examId,
            userAnswer: s.answers[q.id],
            date: s.submittedAt || s.startedAt,
          });
        }
      });

    // Bookmarked - deduplicate by question ID
    // If there's a bookmark review session for this exam, use its current bookmarks
    const activeBookmarks = bookmarkReviewSessionsByExam[examKey];

    s.questions
      .filter(q => {
        const inOriginalBookmarks = s.bookmarks.includes(q.id);

        // If there's a bookmark review session, only include bookmarks that are still active
        if (activeBookmarks) {
          return inOriginalBookmarks && activeBookmarks.has(q.id);
        }

        return inOriginalBookmarks;
      })
      .forEach(q => {
        if (!bookmarkQuestionsMap[examKey]) bookmarkQuestionsMap[examKey] = new Map();
        // Only add if not already present
        if (!bookmarkQuestionsMap[examKey].has(q.id)) {
          bookmarkQuestionsMap[examKey].set(q.id, {
            ...q,
            sessionId: s.id,
            examTitle: s.examTitle,
            examId: s.examId,
            date: s.submittedAt || s.startedAt,
          });
        }
      });
  });

  // Convert Maps to arrays
  Object.keys(wrongQuestionsMap).forEach(examKey => {
    wrongByExam[examKey] = Array.from(wrongQuestionsMap[examKey].values());
  });
  Object.keys(bookmarkQuestionsMap).forEach(examKey => {
    bookmarksByExam[examKey] = Array.from(bookmarkQuestionsMap[examKey].values());
  });

  const examTitles = Array.from(new Set([...Object.keys(wrongByExam), ...Object.keys(bookmarksByExam)]));

  const totalWrong = Object.values(wrongByExam).flat().length;
  const totalBookmarks = Object.values(bookmarksByExam).flat().length;

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
                  <p className="text-sm text-muted-foreground">오답 문제</p>
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
                  <p className="text-sm text-muted-foreground">북마크</p>
                  <p className="text-2xl font-bold text-accent">{totalBookmarks}</p>
                </div>
                <Bookmark className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
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

              return (
                <Card key={examTitle}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Exam title and badges */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate">{examTitle}</h3>
                        <div className="flex gap-2 shrink-0">
                          {wrong.length > 0 && (
                            <Badge variant="outline" className="border-destructive/40 text-destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              {wrong.length}
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

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {wrong.length > 0 && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startReviewSession(
                                wrong[0].examId,
                                examTitle,
                                wrong,
                                'study',
                                isKo ? '오답' : 'Wrong Answers'
                              )}
                              disabled={creatingSession}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              {isKo ? '오답 복습' : 'Review'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startReviewSession(
                                wrong[0].examId,
                                examTitle,
                                wrong,
                                'practice',
                                isKo ? '오답' : 'Wrong Answers'
                              )}
                              disabled={creatingSession}
                            >
                              <PenTool className="h-4 w-4 mr-2" />
                              {isKo ? '오답 테스트' : 'Test'}
                            </Button>
                          </>
                        )}
                        {bookmarks.length > 0 && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startReviewSession(
                                bookmarks[0].examId,
                                examTitle,
                                bookmarks,
                                'study',
                                isKo ? '북마크' : 'Bookmarks'
                              )}
                              disabled={creatingSession}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              {isKo ? '북마크 복습' : 'Bookmarks Review'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startReviewSession(
                                bookmarks[0].examId,
                                examTitle,
                                bookmarks,
                                'practice',
                                isKo ? '북마크' : 'Bookmarks'
                              )}
                              disabled={creatingSession}
                            >
                              <PenTool className="h-4 w-4 mr-2" />
                              {isKo ? '북마크 테스트' : 'Bookmarks Test'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
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
