import { Question, ExamMode } from '@/types/exam';
import { Bookmark, BookmarkCheck, CheckCircle2, XCircle, ExternalLink, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const hasRightPanel = showFeedback && (question.keyPoints || (question.refLinks && question.refLinks.length > 0));

  return (
    <div className="w-full animate-fade-in">
      {/* On mobile/tablet: stack vertically. On xl+: side by side when feedback is shown */}
      <div className={`${hasRightPanel ? 'flex flex-col xl:flex-row gap-6 max-w-6xl mx-auto' : 'max-w-3xl mx-auto'}`}>
        {/* Main question content */}
        <div className={hasRightPanel ? 'flex-1 min-w-0' : ''}>
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
        </div>

        {/* Right panel - Key points and references (shown when feedback is visible) */}
        {/* On mobile/tablet: shown below question. On xl+: fixed-width sidebar */}
        {hasRightPanel && (
          <div className="w-full xl:w-80 2xl:w-[28rem] xl:shrink-0">
            <Card className="xl:sticky xl:top-4">
              {question.keyPoints && (
                <>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      핵심 암기사항
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                      {question.keyPoints}
                    </p>
                  </CardContent>
                </>
              )}

              {question.refLinks && question.refLinks.length > 0 && (
                <>
                  <CardHeader className={question.keyPoints ? 'pt-4 pb-3 border-t' : 'pb-3'}>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      참고자료
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
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
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDisplay;
