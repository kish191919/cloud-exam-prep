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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChevronLeft, ChevronRight, Menu, Send, Cloud, AlertTriangle, Loader2, CheckCircle2, XCircle, ChevronsUpDown, MoveHorizontal, Maximize2, Minimize2, Share, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { seededShuffle } from '@/utils/shuffle';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import FontSizeToggle from '@/components/FontSizeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useToast } from '@/hooks/use-toast';

const MODE_LABEL: Record<string, { ko: string; en: string; color: string }> = {
  practice: { ko: '연습모드', en: 'Practice', color: 'bg-green-100 text-green-700' },
  study:    { ko: '해설모드', en: 'Study',    color: 'bg-blue-100 text-blue-700' },
  exam:     { ko: '실전모드', en: 'Exam',     color: 'bg-orange-100 text-orange-700' },
};

const ExamSession = () => {
  const { t, i18n } = useTranslation('pages');
  const { t: tExam } = useTranslation('exam');
  const { toast } = useToast();
  const isKo = i18n.language === 'ko';
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, hasFullAccess, openAuthModal } = useAuth();
  const { session, loading, selectAnswer, toggleBookmark, goToQuestion, submitExam, saveSession } = useExamSession(sessionId || null);

  // setType이 'full'이고 전체 접근 권한이 없는 경우에만 해설/핵심암기사항 제한
  const isRestrictedSet = !hasFullAccess && session?.setType === 'full';

  const handleUpgrade = () => {
    if (!user) openAuthModal('signup');
    else navigate('/');
  };
  const [showPanel, setShowPanel] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const lastScreenshotToastRef = useRef<number>(0);
  const linkClickedRef = useRef<boolean>(false);

  const { isFullscreen, isFullscreenSupported, isIOS, isChrome, isAndroid, toggleFullscreen } = useFullscreen();

  const GESTURE_HINTS_KEY = 'cloudmaster_gesture_hints_seen';
  const IOS_HINT_KEY = 'cloudmaster_ios_hint_seen';
  const CHROME_HINT_KEY = 'cloudmaster_chrome_hint_seen';
  const [showGestureHints, setShowGestureHints] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [showChromeHint, setShowChromeHint] = useState(false);

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as Navigator & { standalone?: boolean }).standalone;

  useEffect(() => {
    if (window.innerWidth >= 768 || isStandalone) return;
    if (!localStorage.getItem(GESTURE_HINTS_KEY)) {
      const timer = setTimeout(() => setShowGestureHints(true), 800);
      return () => clearTimeout(timer);
    }
    // Chrome 힌트 (Android Chrome / Chrome iOS)
    if (isChrome && !localStorage.getItem(CHROME_HINT_KEY)) {
      const timer = setTimeout(() => setShowChromeHint(true), 1200);
      return () => clearTimeout(timer);
    }
    // iOS Safari 힌트 (Chrome 제외)
    if (isIOS && !isChrome && !localStorage.getItem(IOS_HINT_KEY)) {
      const timer = setTimeout(() => setShowIOSHint(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [isIOS, isChrome, isStandalone]);

  const dismissIOSHint = () => {
    localStorage.setItem(IOS_HINT_KEY, '1');
    setShowIOSHint(false);
  };

  const dismissChromeHint = () => {
    localStorage.setItem(CHROME_HINT_KEY, '1');
    setShowChromeHint(false);
  };

  const dismissGestureHints = () => {
    localStorage.setItem(GESTURE_HINTS_KEY, '1');
    setShowGestureHints(false);
  };
  const [navDirection, setNavDirection] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef<number | null>(null);
  const currentNavBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    currentNavBtnRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [session?.currentIndex]);

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

  // 복사 방지: Ctrl/Cmd + C/A/P/S 차단
  useEffect(() => {
    const handleCopyAttempt = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && ['c', 'a', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleCopyAttempt);
    return () => document.removeEventListener('keydown', handleCopyAttempt);
  }, []);

  // 외부 링크 클릭 감지 (스크린샷 오탐지 방지용)
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a[target="_blank"]')) {
        linkClickedRef.current = true;
        setTimeout(() => { linkClickedRef.current = false; }, 500);
      }
    };
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  // 스크린샷 감지: PrintScreen 키
  useEffect(() => {
    const handlePrintScreen = (e: KeyboardEvent) => {
      if (e.key !== 'PrintScreen') return;
      if (e.code && e.code !== 'PrintScreen') return;  // 물리 키가 아닌 가짜 이벤트 필터링
      if (linkClickedRef.current) return;               // 링크 클릭 직후 오탐지 방지
      const now = Date.now();
      if (now - lastScreenshotToastRef.current < 2000) return;  // 중복 토스트 방지
      lastScreenshotToastRef.current = now;
      toast({
        description: tExam('questionDisplay.screenshotWarning'),
        variant: 'destructive',
      });
    };

    document.addEventListener('keydown', handlePrintScreen);
    return () => document.removeEventListener('keydown', handlePrintScreen);
  }, [toast, tExam]);

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
  const isCurrentAnswered = !!session.answers[currentQuestion.id];
  const showFeedbackLayout = mode === 'study' || (mode === 'practice' && isCurrentAnswered);

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
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

          {/* 전체화면 버튼 (모바일 전용, PWA standalone 모드에서는 숨김) */}
          {!isStandalone && (isFullscreenSupported || isIOS || isChrome) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="md:hidden h-8 w-8"
                  onClick={
                    isIOS && !isChrome
                      ? () => setShowIOSHint(true)
                      : isIOS && isChrome
                        ? () => setShowChromeHint(true)
                        : toggleFullscreen
                  }
                >
                  {isFullscreen
                    ? <Minimize2 className="h-4 w-4" />
                    : <Maximize2 className="h-4 w-4" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {(isIOS && !isChrome) || (isIOS && isChrome)
                    ? (isKo ? '앱으로 설치하기' : 'Install as app')
                    : isFullscreen
                      ? (isKo ? '전체화면 종료' : 'Exit fullscreen')
                      : (isKo ? '전체화면으로 보기' : 'Enter fullscreen')
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Dark mode toggle */}
          <ThemeToggle />

          {/* Font size toggle */}
          <FontSizeToggle />

          {/* Language selector */}
          <LanguageSwitcher />

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
          className={`flex-1 ${showFeedbackLayout ? 'overflow-auto' : 'overflow-hidden md:overflow-auto'}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            key={session.currentIndex}
            className={`${showFeedbackLayout ? '' : 'h-full md:h-auto'} ${navDirection === 'next' ? 'animate-slide-from-right' : 'animate-slide-from-left'}`}
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
              isRestrictedSet={isRestrictedSet}
              onRequestUpgrade={handleUpgrade}
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
              ref={i === session.currentIndex ? currentNavBtnRef : undefined}
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

      {/* Practice mode: question status strip (correct/wrong indicators) */}
      {!isExamMode && mode === 'practice' && (
        <div className="flex gap-1 px-3 py-2 overflow-x-auto border-t bg-card shrink-0">
          {session.questions.map((q, i) => {
            const answered = session.answers[q.id];
            const isCorrect = answered && answered === q.correctOptionId;
            const isWrong = answered && answered !== q.correctOptionId;
            const isCurrent = i === session.currentIndex;

            return (
              <button
                key={q.id}
                ref={isCurrent ? currentNavBtnRef : undefined}
                onClick={() => navigateTo(i)}
                className={`relative flex-shrink-0 w-8 h-8 rounded text-xs font-semibold flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'ring-2 ring-offset-1 ring-accent'
                    : ''
                } ${
                  isCorrect
                    ? 'bg-green-500 text-white'
                    : isWrong
                    ? 'bg-red-400 text-white'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {isCorrect
                  ? <CheckCircle2 className="h-4 w-4" />
                  : isWrong
                  ? <XCircle className="h-4 w-4" />
                  : i + 1
                }
              </button>
            );
          })}
        </div>
      )}

      {/* Footer nav: arrow buttons (all modes) */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-t bg-card shrink-0">
        <Button
          variant="outline"
          size="sm"
          disabled={session.currentIndex === 0}
          onClick={() => navigateTo(session.currentIndex - 1)}
          className="text-xs sm:text-sm px-2 sm:px-3 gap-1"
        >
          <ChevronLeft className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">{t('examSession.prev')}</span>
          <kbd className="hidden md:inline-flex items-center px-1 py-0.5 text-[10px] font-mono border rounded bg-muted text-muted-foreground leading-none">←</kbd>
        </Button>

        <span className="text-xs sm:text-sm text-muted-foreground font-medium">
          {session.currentIndex + 1} / {session.questions.length}
        </span>

        {session.currentIndex < session.questions.length - 1 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo(session.currentIndex + 1)}
            className="text-xs sm:text-sm px-2 sm:px-3 gap-1"
          >
            <kbd className="hidden md:inline-flex items-center px-1 py-0.5 text-[10px] font-mono border rounded bg-muted text-muted-foreground leading-none">→</kbd>
            <span className="hidden sm:inline">{t('examSession.next')}</span>
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
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
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="text-sm font-medium text-destructive">
                  {t('examSession.submitDialog.unansweredWarning', { count: unansweredIndices.length })}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-6">
                {unansweredIndices.map(n => (
                  <span key={n} className="text-xs px-2 py-1 rounded-md bg-destructive/15 text-destructive font-semibold">
                    #{n}
                  </span>
                ))}
              </div>
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

      {/* 모바일 제스처 가이드 (최초 1회) */}
      <Sheet open={showGestureHints} onOpenChange={(open) => { if (!open) dismissGestureHints(); }}>
        <SheetContent side="bottom" className="pb-8 rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center text-base">
              {isKo ? '이용 안내' : 'How to Use'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                <ChevronsUpDown className="h-5 w-5 text-accent animate-bounce" />
              </div>
              <div>
                <p className="text-sm font-semibold">{isKo ? '질문 스크롤' : 'Scroll Question'}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isKo
                    ? '상단 질문 영역을 위아래로 스크롤하여 긴 질문 전체를 읽을 수 있습니다.'
                    : 'Scroll up and down in the question area to read the full question.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                <MoveHorizontal className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold">{isKo ? '스와이프로 문제 이동' : 'Swipe to Navigate'}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isKo
                    ? '화면을 좌우로 밀어 다음/이전 문제로 이동할 수 있습니다.'
                    : 'Swipe left or right to go to the next or previous question.'}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={dismissGestureHints} className="w-full mt-5">
            {isKo ? '확인했습니다' : 'Got it!'}
          </Button>
        </SheetContent>
      </Sheet>

      {/* iOS 홈화면 추가 안내 (최초 1회) */}
      <Sheet open={showIOSHint} onOpenChange={(open) => { if (!open) dismissIOSHint(); }}>
        <SheetContent side="bottom" className="pb-8 rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center text-base">
              {isKo ? '전체화면으로 사용하기' : 'Use Fullscreen'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Share className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold">{isKo ? 'Safari → 홈 화면에 추가' : 'Safari → Add to Home Screen'}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isKo
                    ? 'Safari 하단의 공유 버튼을 탭한 후 "홈 화면에 추가"를 선택하면 주소창·하단 탭바 없이 전체화면으로 사용할 수 있어요.'
                    : 'Tap the share button in Safari, then select "Add to Home Screen" to use the app fullscreen without the address bar.'}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={dismissIOSHint} className="w-full mt-5">
            {isKo ? '확인했습니다' : 'Got it!'}
          </Button>
        </SheetContent>
      </Sheet>

      {/* Chrome 홈 화면 추가 안내 (최초 1회) */}
      <Sheet open={showChromeHint} onOpenChange={(open) => { if (!open) dismissChromeHint(); }}>
        <SheetContent side="bottom" className="pb-8 rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center text-base">
              {isKo ? '앱으로 설치하면 더 넓게 볼 수 있어요' : 'Install as App for More Space'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-3">
            {isAndroid ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <MoreVertical className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{isKo ? 'Chrome 메뉴(⋮) → 홈 화면에 추가' : 'Chrome menu (⋮) → Add to Home Screen'}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isKo
                      ? 'Chrome 오른쪽 상단 ⋮ 버튼을 탭한 후 "홈 화면에 추가"를 선택하면 주소창 없이 앱처럼 설치되어 더 넓은 화면으로 사용할 수 있어요.'
                      : 'Tap the Chrome menu (⋮) at the top right, then select "Add to Home Screen" to install and use it like an app without the address bar.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Share className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{isKo ? 'Chrome 공유 → 홈 화면에 추가' : 'Chrome share → Add to Home Screen'}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isKo
                      ? 'Chrome 하단 공유 버튼을 탭한 후 "홈 화면에 추가"를 선택하면 주소창 없이 앱처럼 설치되어 더 넓은 화면으로 사용할 수 있어요.'
                      : 'Tap the share button in Chrome, then select "Add to Home Screen" to install and use it like an app without the address bar.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button onClick={dismissChromeHint} className="w-full mt-5">
            {isKo ? '확인했습니다' : 'Got it!'}
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ExamSession;
