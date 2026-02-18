import { Question, ExamMode } from '@/types/exam';
import { Bookmark, BookmarkCheck, CheckCircle2, XCircle, ExternalLink, Lightbulb, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { seededShuffle } from '@/utils/shuffle';

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
}: QuestionDisplayProps) => {
  const isStudy = mode === 'study';
  const isPractice = mode === 'practice';
  const isAnswered = !!selectedOptionId;

  // Whether to show answer feedback (correct/wrong colors, icons, explanations)
  const showFeedback = isStudy || (isPractice && isAnswered);

  // Feedback animation state (for practice mode when answer is first selected)
  const [feedbackAnimation, setFeedbackAnimation] = useState<'correct' | 'wrong' | null>(null);
  const prevAnswerRef = useRef<string | undefined>(undefined);

  // Lightbox state for image preview
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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
    question.keyPoints ||
    (question.keyPointImages && question.keyPointImages.length > 0) ||
    (question.refLinks && question.refLinks.length > 0)
  );

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      {/* Header row: question number + tags + bookmark */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center flex-wrap gap-1.5 min-w-0">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground shrink-0">
            Question {questionNumber} of {totalQuestions}
          </span>
          {/* Tags */}
          {question.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {tag}
            </span>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleBookmark}
          className={`shrink-0 px-2 sm:px-3 ${isBookmarked ? 'text-accent' : 'text-muted-foreground'}`}
        >
          {isBookmarked ? <BookmarkCheck className="h-4 w-4 sm:mr-1" /> : <Bookmark className="h-4 w-4 sm:mr-1" />}
          <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
        </Button>
      </div>

      <h2 className="text-base md:text-lg font-semibold leading-relaxed mb-5 whitespace-pre-line">{question.text}</h2>

      <div className="space-y-2.5 sm:space-y-3">
        {displayOptions.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.id === question.correctOptionId;

          // Per-option explanation: show own explanation if available,
          // or fall back to the overall question.explanation for the correct option
          const perOptionExplanation = option.explanation
            || (showFeedback && isCorrect ? question.explanation : undefined);

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
                    }`}>{option.text}</span>
                    {/* Per-option explanation (shown in feedback state) */}
                    {showFeedback && perOptionExplanation && (
                      <p className={`text-xs mt-2 leading-relaxed ${
                        isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {perOptionExplanation}
                      </p>
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

      {/* ── 핵심 암기사항 + 참고자료 (answers 아래 표시) ── */}
      {hasKeySection && (
        <div className="mt-6 space-y-4">
          {/* 핵심 암기사항 */}
          {(question.keyPoints || (question.keyPointImages && question.keyPointImages.length > 0)) && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">핵심 암기사항</span>
              </div>
              {question.keyPoints && (
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-line mb-3">
                  {question.keyPoints}
                </p>
              )}
              {question.keyPointImages && question.keyPointImages.length > 0 && (
                <div className={`grid gap-3 ${question.keyPointImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {question.keyPointImages.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxSrc(src)}
                      className="relative rounded-lg overflow-hidden border border-amber-200 dark:border-amber-800/50 hover:opacity-90 transition-opacity group"
                    >
                      <img
                        src={src}
                        alt={`핵심 암기 이미지 ${idx + 1}`}
                        className="w-full object-contain max-h-64 bg-background"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                        <ImageIcon className="h-6 w-6 text-white drop-shadow" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 참고자료 */}
          {question.refLinks && question.refLinks.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-sm font-semibold">참고자료</span>
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

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="확대 보기"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none"
            onClick={() => setLightboxSrc(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
