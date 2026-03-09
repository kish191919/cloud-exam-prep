import { Question, ExamMode } from '@/types/exam';
import { Bookmark, BookmarkCheck, CheckCircle2, XCircle, ExternalLink, Lightbulb, Lock, Megaphone, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { seededShuffle } from '@/utils/shuffle';
import { translateTag } from '@/utils/tagTranslation';
import PremiumGate from '@/components/PremiumGate';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { submitReport, hasReported, REASON_LABELS, REASON_LABELS_EN, type ReportReason } from '@/services/reportService';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId?: string;
  isBookmarked: boolean;
  onSelectOption: (optionId: string) => void;
  onToggleBookmark: () => void;
  mode?: ExamMode;
  randomizeOptions?: boolean;
  isRestrictedSet?: boolean;
  onRequestUpgrade?: () => void;
}


const QuestionDisplay = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  isBookmarked,
  onSelectOption,
  onToggleBookmark,
  mode = 'exam',
  randomizeOptions = false,
  isRestrictedSet = false,
  onRequestUpgrade,
}: QuestionDisplayProps) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const loc = (ko: string, en?: string, pt?: string, es?: string, ja?: string): string => {
    if (lang === 'en' && en) return en;
    if (lang === 'pt' && pt) return pt;
    if (lang === 'es' && es) return es;
    if (lang === 'ja' && ja) return ja;
    return ko;
  };
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();

  // 신고 다이얼로그 상태
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('wrong_answer');
  const [reportComment, setReportComment] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);

  // 문제가 바뀌면 신고 여부 재확인
  useEffect(() => {
    setAlreadyReported(false);
    if (!user) return;
    hasReported(question.id, user.id).then(setAlreadyReported);
  }, [question.id, user]);

  const handleReportClick = () => {
    if (!user) { openAuthModal('login'); return; }
    setReportOpen(true);
  };

  const handleReportSubmit = async () => {
    if (!user) return;
    setReportSubmitting(true);
    try {
      await submitReport({
        questionId: question.id,
        userId: user.id,
        userEmail: user.email,
        userName: user.user_metadata?.full_name,
        reason: reportReason,
        comment: reportComment.trim() || undefined,
      });
      setAlreadyReported(true);
      setReportOpen(false);
      setReportComment('');
      toast({ description: '신고가 접수되었습니다. 검토 후 결과를 알려드리겠습니다.' });
    } catch {
      toast({ description: '신고 제출 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setReportSubmitting(false);
    }
  };

  // Select language-appropriate content, falling back to Korean if translation not available
  const questionText = loc(question.text, question.textEn, question.textPt, question.textEs, question.textJa);
  const questionExplanation = loc(question.explanation, question.explanationEn, question.explanationPt, question.explanationEs, question.explanationJa);
  const questionKeyPoints = question.keyPoints
    ? loc(question.keyPoints, question.keyPointsEn, question.keyPointsPt, question.keyPointsEs, question.keyPointsJa)
    : undefined;

  const isStudy = mode === 'study';
  const isPractice = mode === 'practice';
  const isAnswered = !!selectedOptionId;

  // Whether to show answer feedback (correct/wrong colors, icons, explanations)
  const showFeedback = isStudy || (isPractice && isAnswered);

  // Feedback animation state (for practice mode when answer is first selected)
  const [feedbackAnimation, setFeedbackAnimation] = useState<'correct' | 'wrong' | null>(null);
  const prevAnswerRef = useRef<string | undefined>(undefined);

  // Trigger feedback animation when answer is first selected in practice mode
  useEffect(() => {
    const prev = prevAnswerRef.current;
    prevAnswerRef.current = selectedOptionId;

    // First time selecting an answer on this question (practice mode only)
    if (selectedOptionId !== undefined && prev === undefined && isPractice) {
      const isCorrect = selectedOptionId === question.correctOptionId;
      setFeedbackAnimation(isCorrect ? 'correct' : 'wrong');

      // Haptic feedback (mobile) - stronger vibration for better feel
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(isCorrect ? [30] : [40, 15, 40]);
      }

      // Clear animation after it completes (matches animation duration)
      const timer = setTimeout(() => setFeedbackAnimation(null), isCorrect ? 500 : 600);
      return () => clearTimeout(timer);
    }
  }, [selectedOptionId, isPractice, question.correctOptionId]);

  // Reset animation state when question changes
  useEffect(() => {
    prevAnswerRef.current = undefined;
    setFeedbackAnimation(null);
  }, [question.id]);

  // Randomize options if enabled (deterministic based on question ID)
  const displayOptions = useMemo(() => {
    if (randomizeOptions) {
      return seededShuffle(question.options, question.id);
    }
    return question.options;
  }, [question.options, question.id, randomizeOptions]);

  // Determine option border/bg styling based on mode
  const getOptionStyle = (optionId: string) => {
    const isSelected = selectedOptionId === optionId;
    const isCorrect = optionId === question.correctOptionId;

    if (showFeedback) {
      if (isCorrect) return 'border-green-500 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-400';
      if (isSelected && !isCorrect) return 'border-red-400 bg-red-50 dark:bg-red-950/30 ring-1 ring-red-300';
      return 'border-border bg-card opacity-60';
    }

    if (isSelected) return 'border-accent bg-accent/5 shadow-sm';
    return 'border-border bg-card hover:border-muted-foreground/30';
  };

  const getCircleStyle = (optionId: string) => {
    const isSelected = selectedOptionId === optionId;
    const isCorrect = optionId === question.correctOptionId;

    if (showFeedback) {
      if (isCorrect) return 'bg-green-500 text-white';
      if (isSelected && !isCorrect) return 'bg-red-400 text-white';
      return 'bg-secondary text-secondary-foreground';
    }

    if (isSelected) return 'bg-accent text-accent-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  // In study mode or practice mode after answering, disable further selection
  const canSelect = !showFeedback;

  const hasKeySection = showFeedback && (
    questionKeyPoints ||
    (question.refLinks && question.refLinks.length > 0)
  );

  return (
    <div
      className={`relative w-full max-w-3xl mx-auto animate-fade-in select-none ${!showFeedback ? 'h-full flex flex-col min-h-0 md:block' : ''}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 워터마크: 스크린샷 도용 억제 */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden rounded-xl">
        <span className="text-4xl font-bold text-foreground opacity-[0.035] rotate-[-25deg] whitespace-nowrap select-none">
          {user?.email ?? 'exam-prep.kr'}
        </span>
      </div>
      {/* 질문 영역: 스크롤 가능한 상단 */}
      <div className={`${!showFeedback ? 'flex-1 overflow-y-auto min-h-0' : ''} px-3 pt-3 sm:px-5 sm:pt-5 md:px-8 md:pt-6 pb-2 md:pb-0`}>
        {/* Header row: question number + tags + bookmark */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center flex-wrap gap-1.5 min-w-0">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground shrink-0">
              Question {questionNumber} of {totalQuestions}
            </span>
            {/* Tags */}
            {question.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {translateTag(tag, isEn)}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleBookmark}
              className={`px-2 sm:px-3 ${isBookmarked ? 'text-accent' : 'text-muted-foreground'}`}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 sm:mr-1" /> : <Bookmark className="h-4 w-4 sm:mr-1" />}
              <span className="hidden sm:inline">{isEn ? (isBookmarked ? 'Saved' : 'Bookmark') : '북마크'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReportClick}
              title={isEn ? (alreadyReported ? 'Reported' : 'Report') : (alreadyReported ? '신고한 문제' : '문제 신고')}
              className={`px-2 sm:px-3 ${alreadyReported ? 'text-orange-500' : 'text-muted-foreground'}`}
            >
              <Megaphone className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{isEn ? 'Report' : '문제 신고'}</span>
            </Button>
          </div>
        </div>

        <h2 className="text-base md:text-lg font-semibold leading-relaxed whitespace-pre-line md:mb-5">{questionText}</h2>
      </div>

      {/* 보기 영역: 하단 고정 (border로 구분) */}
      <div className={`${!showFeedback ? 'shrink-0 max-h-[55%] md:max-h-none overflow-y-auto' : ''} px-3 pb-3 sm:px-5 sm:pb-4 md:px-8 md:pb-6 pt-2.5 sm:pt-3 border-t md:border-t-0 md:pt-0`}>
      <div className="space-y-2.5 sm:space-y-3">
        {displayOptions.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.id === question.correctOptionId;

          // Per-option explanation: show own explanation if available,
          // or fall back to the overall question.explanation for the correct option
          const optionText = loc(option.text, option.textEn, option.textPt, option.textEs, option.textJa);
          const optionExplanation = loc(option.explanation ?? '', option.explanationEn, option.explanationPt, option.explanationEs, option.explanationJa) || undefined;
          const perOptionExplanation = optionExplanation
            || (showFeedback && isCorrect ? questionExplanation : undefined);

          // Apply feedback animation to the selected option (practice mode only)
          const animationClass = (feedbackAnimation && isSelected)
            ? (feedbackAnimation === 'correct' ? 'animate-answer-correct' : 'animate-answer-wrong')
            : '';

          return (
            <div key={option.id}>
              <button
                onClick={() => canSelect && onSelectOption(option.id)}
                disabled={!canSelect}
                className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all ${getOptionStyle(option.id)} ${
                  canSelect ? 'cursor-pointer' : 'cursor-default'
                } ${animationClass}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getCircleStyle(option.id)}`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm leading-relaxed pt-0.5 block ${
                      showFeedback && !isCorrect ? 'text-red-600 dark:text-red-400' : ''
                    }`}>{optionText}</span>
                    {/* Per-option explanation (shown in feedback state) */}
                    {showFeedback && perOptionExplanation && (
                      isRestrictedSet ? (
                        <div
                          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:opacity-80"
                          onClick={(e) => { e.stopPropagation(); onRequestUpgrade?.(); }}
                        >
                          <Lock className="h-3 w-3 shrink-0" />
                          <span>{isEn ? 'Subscribe to see explanation' : '구독하면 해설 확인 가능'}</span>
                        </div>
                      ) : (
                        <p className={`text-xs mt-2 leading-relaxed ${
                          isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {perOptionExplanation}
                        </p>
                      )
                    )}
                  </div>
                  {showFeedback && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── 해설 ── */}
      {showFeedback && questionExplanation && (
        <PremiumGate
          locked={isRestrictedSet}
          onUpgrade={onRequestUpgrade ?? (() => {})}
          isKo={!isEn}
        >
          <div className="mt-6 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/60 dark:bg-blue-950/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                {isEn ? 'Explanation' : '해설'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {questionExplanation}
            </p>
          </div>
        </PremiumGate>
      )}

      {/* ── 핵심 암기사항 + 참고자료 (answers 아래 표시) ── */}
      {hasKeySection && (
        <div className="mt-6 space-y-4">
          {/* 핵심 암기사항 */}
          {questionKeyPoints && (
            <PremiumGate
              locked={isRestrictedSet}
              onUpgrade={onRequestUpgrade ?? (() => {})}
              isKo={!isEn}
            >
              <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {isEn ? 'Key Points' : '핵심 암기사항'}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                  {questionKeyPoints}
                </p>
              </div>
            </PremiumGate>
          )}

          {/* 참고자료 */}
          {question.refLinks && question.refLinks.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-sm font-semibold">{isEn ? 'References' : '참고자료'}</span>
              </div>
              <ul className="space-y-1.5">
                {question.refLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      </div>

      {/* 문제 신고 다이얼로그 */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-orange-500" />
              {isEn ? 'Report Issue' : '문제 신고'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{isEn ? 'What is the issue?' : '어떤 문제가 있나요?'}</p>
            <div className="space-y-2">
              {(Object.keys(REASON_LABELS) as ReportReason[]).map(reason => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    reportReason === reason
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="accent-accent"
                  />
                  <span className="text-sm">{isEn ? REASON_LABELS_EN[reason] : REASON_LABELS[reason]}</span>
                </label>
              ))}
            </div>

            <div>
              <p className="text-sm font-medium mb-1.5">{isEn ? 'Details (optional)' : '상세 설명 (선택)'}</p>
              <Textarea
                placeholder={isEn ? 'Please describe the issue...' : '구체적인 내용을 입력해주세요...'}
                value={reportComment}
                onChange={e => setReportComment(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setReportOpen(false)}>
              {isEn ? 'Cancel' : '취소'}
            </Button>
            <Button
              size="sm"
              onClick={handleReportSubmit}
              disabled={reportSubmitting}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isEn ? (reportSubmitting ? 'Submitting...' : 'Submit Report') : (reportSubmitting ? '제출 중...' : '신고 제출')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionDisplay;
