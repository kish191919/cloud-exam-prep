import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSession } from '@/hooks/useExamSession';
import QuestionPanel from '@/components/exam/QuestionPanel';
import QuestionDisplay from '@/components/exam/QuestionDisplay';
import ExamTimer from '@/components/exam/ExamTimer';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Menu, Send, Cloud, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { seededShuffle } from '@/utils/shuffle';

const MODE_LABEL: Record<string, { ko: string; en: string; color: string }> = {
  practice: { ko: '연습모드', en: 'Practice', color: 'bg-green-100 text-green-700' },
  study:    { ko: '해설모드', en: 'Study',    color: 'bg-blue-100 text-blue-700' },
  exam:     { ko: '실전모드', en: 'Exam',     color: 'bg-orange-100 text-orange-700' },
};

const ExamSession = () => {
  const { t, i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, loading, selectAnswer, toggleBookmark, goToQuestion, submitExam, saveSession } = useExamSession(sessionId || null);
  const [showPanel, setShowPanel] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [navDirection, setNavDirection] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef<number | null>(null);

  const mode = session?.mode ?? 'exam';
  const isExamMode = mode === 'exam';

  // Compute early (needed by handleFinish before the null guard)
  const exitDestination = (() => {
    const t = session?.examTitle ?? '';
    return (t.includes(' - 오답') || t.includes(' - 북마크') || t.includes(' - 복습') ||
            t.includes(' - 테스트') || t.includes(' - Wrong') || t.includes(' - Bookmark') ||
            t.includes(' - Review') || t.includes(' - Test'))
      ? '/review' : '/exams';
  })();

  const handleTimeUp = useCallback(async () => {
    await submitExam();
    if (sessionId) navigate(`/results/${sessionId}`, { replace: true });
  }, [submitExam, sessionId, navigate]);

  // Practice mode → submit & show results page
  // Study mode    → just save & go to review
  const handleFinish = useCallback(async () => {
    if (mode === 'practice') {
      const submitted = await submitExam();
      if (submitted) navigate(`/results/${submitted.id}`);
    } else {
      await saveSession();
      navigate(exitDestination);
    }
  }, [mode, submitExam, saveSession, navigate, exitDestination]);

  // Direction-aware navigation (sets slide direction before moving)
  const navigateTo = useCallback((index: number) => {
    if (!session) return;
    setNavDirection(index >= session.currentIndex ? 'next' : 'prev');
    goToQuestion(index);
  }, [session, goToQuestion]);

  // Handle answer selection
  const handleSelectAnswer = useCallback((questionId: string, optionId: string) => {
    selectAnswer(questionId, optionId);
  }, [selectAnswer]);

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || !session) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    const SWIPE_THRESHOLD = 60;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    if (deltaX < 0 && session.currentIndex < session.questions.length - 1) {
      navigateTo(session.currentIndex + 1);
    } else if (deltaX > 0 && session.currentIndex > 0) {
      navigateTo(session.currentIndex - 1);
    }
  }, [session, navigateTo]);

  // Keyboard shortcuts: 1-4 for options, Arrow keys for navigation
  useEffect(() => {
    if (!session || session.status === 'submitted') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      const q = session.questions[session.currentIndex];

      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        // Use the same shuffled order the user sees on screen
        const options = session.randomizeOptions
          ? seededShuffle(q.options, q.id)
          : q.options;
        const option = options[idx];
        if (!option) return;
        if (mode === 'study') return;
        if (mode === 'practice' && session.answers[q.id]) return;
        selectAnswer(q.id, option.id);
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft') {
        if (session.currentIndex > 0) navigateTo(session.currentIndex - 1);
        e.preventDefault();
      }

      if (e.key === 'ArrowRight') {
        if (session.currentIndex < session.questions.length - 1) navigateTo(session.currentIndex + 1);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, mode, selectAnswer, navigateTo]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">{t('examSession.sessionNotFound')}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t('examSession.sessionExpired')}</p>
          <Link to="/exams"><Button>{t('examSession.backToExams')}</Button></Link>
        </div>
      </div>
    );
  }

  if (session.status === 'submitted') {
    navigate(`/results/${session.id}`, { replace: true });
    return null;
  }

  const currentQuestion = session.questions[session.currentIndex];
  const unansweredIndices = session.questions
    .map((q, i) => (!session.answers[q.id] ? i + 1 : null))
    .filter((x): x is number => x !== null);

  const handleSubmit = async () => {
    const submitted = await submitExam();
    if (submitted) navigate(`/results/${submitted.id}`);
  };

  const modeInfo = MODE_LABEL[mode] ?? MODE_LABEL.exam;

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b bg-card gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {isExamMode && (
            <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9" onClick={() => setShowPanel(!showPanel)}>
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
          <Link to={exitDestination} className="flex items-center gap-1.5 min-w-0 hover:opacity-80 transition-opacity">
            <Cloud className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
            <span className="font-semibold text-xs sm:text-sm truncate max-w-[140px] sm:max-w-xs md:max-w-none">{session.examTitle}</span>
          </Link>
          {/* Mode badge */}
          <span className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${modeInfo.color}`}>
            {isKo ? modeInfo.ko : modeInfo.en}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Timer: only in exam mode */}
          {isExamMode && (
            <ExamTimer startedAt={session.startedAt} timeLimitSec={session.timeLimitSec} onTimeUp={handleTimeUp} />
          )}

          {/* Submit: only in exam mode */}
          {isExamMode && (
            <Button size="sm" onClick={() => setShowSubmitDialog(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs sm:text-sm px-2 sm:px-3">
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden xs:inline">{t('examSession.submit')}</span>
              <span className="xs:hidden">{isKo ? '제출' : 'Submit'}</span>
            </Button>
          )}

          {/* Finish button for practice/study modes */}
          {!isExamMode && (
            <Button size="sm" variant="outline" onClick={handleFinish} className="text-xs sm:text-sm px-2 sm:px-3">
              {isKo ? '종료' : 'Finish'}
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Question panel: only in exam mode */}
        {isExamMode && showPanel && (
          <QuestionPanel
            questions={session.questions}
            answers={session.answers}
            bookmarks={session.bookmarks}
            currentIndex={session.currentIndex}
            onSelect={navigateTo}
          />
        )}
        <div
          className="flex-1 overflow-auto p-3 sm:p-5 md:p-8"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            key={session.currentIndex}
            className={navDirection === 'next' ? 'animate-slide-from-right' : 'animate-slide-from-left'}
          >
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={session.currentIndex + 1}
              totalQuestions={session.questions.length}
              selectedOptionId={session.answers[currentQuestion.id]}
              isBookmarked={session.bookmarks.includes(currentQuestion.id)}
              onSelectOption={(optionId) => handleSelectAnswer(currentQuestion.id, optionId)}
              onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
              mode={mode}
              randomizeOptions={session.randomizeOptions}
            />
          </div>
        </div>
      </div>

      {/* Mobile question strip: only in exam mode */}
      {isExamMode && (
        <div className="md:hidden flex gap-1 px-3 py-2 overflow-x-auto border-t bg-card">
          {session.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => navigateTo(i)}
              className={`flex-shrink-0 w-8 h-8 rounded text-xs font-semibold ${
                i === session.currentIndex
                  ? 'bg-accent text-accent-foreground'
                  : session.answers[q.id]
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Footer nav: arrow buttons (all modes) */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-t bg-card shrink-0">
        <Button
          variant="outline"
          size="sm"
          disabled={session.currentIndex === 0}
          onClick={() => navigateTo(session.currentIndex - 1)}
          className="text-xs sm:text-sm px-2 sm:px-4"
        >
          <ChevronLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">{t('examSession.prev')}</span>
        </Button>

        <span className="text-xs sm:text-sm text-muted-foreground font-medium">
          {session.currentIndex + 1} / {session.questions.length}
        </span>

        {session.currentIndex < session.questions.length - 1 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo(session.currentIndex + 1)}
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            <span className="hidden sm:inline">{t('examSession.next')}</span>
            <ChevronRight className="h-4 w-4 sm:ml-1" />
          </Button>
        ) : (
          isExamMode ? (
            <Button
              size="sm"
              onClick={() => setShowSubmitDialog(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">{t('examSession.submit')}</span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleFinish} className="text-xs sm:text-sm px-2 sm:px-4">
              {isKo ? '종료' : 'Finish'}
            </Button>
          )
        )}
      </div>

      {/* Submit confirmation (exam mode only) */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('examSession.submitDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('examSession.submitDialog.description')}
            </DialogDescription>
          </DialogHeader>
          {unansweredIndices.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-sm">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <span>
                {t('examSession.submitDialog.unansweredWarning', { count: unansweredIndices.length, indices: unansweredIndices.join(', #') })}
              </span>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>{t('examSession.submitDialog.cancel')}</Button>
            <Button onClick={handleSubmit} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {t('examSession.submitDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamSession;
