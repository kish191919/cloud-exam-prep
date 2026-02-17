import { Question, ExamMode } from '@/types/exam';
import { Bookmark, BookmarkCheck, CheckCircle2, XCircle, ExternalLink, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';

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

// Simple seeded shuffle function for deterministic randomization
function seededShuffle<T>(array: T[], seed: string): T[] {
  if (!array || array.length === 0) return array;

  const arr = [...array];
  let hash = 0;

  // Create hash from seed
  for (let i = 0; i < seed.length; i++) {
    const chr = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash = hash | 0; // Convert to 32-bit integer
  }

  // Fisher-Yates shuffle with seeded random
  for (let i = arr.length - 1; i > 0; i--) {
    // Generate next hash value using LCG algorithm
    hash = (hash * 1664525 + 1013904223) | 0;

    // Get random index in range [0, i] - guaranteed to be valid
    const j = Math.abs(hash) % (i + 1);

    // Defensive check to ensure no undefined values
    if (j >= 0 && j <= i && arr[i] !== undefined && arr[j] !== undefined) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  return arr;
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

  return (
    <div className="w-full animate-fade-in">
      <div className={`${showFeedback ? 'flex gap-6 max-w-6xl mx-auto' : 'max-w-3xl mx-auto'}`}>
        {/* Main question content */}
        <div className={showFeedback ? 'flex-1 min-w-0' : ''}>
          {/* Header row: question number + tags + difficulty + bookmark */}
          <div className="flex items-start justify-between mb-5 gap-3">
        <div className="flex items-center flex-wrap gap-2 min-w-0">
          <span className="text-sm font-medium text-muted-foreground shrink-0">
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
          className={`shrink-0 ${isBookmarked ? 'text-accent' : 'text-muted-foreground'}`}
        >
          {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </Button>
      </div>

      <h2 className="text-lg font-semibold leading-relaxed mb-6 whitespace-pre-line">{question.text}</h2>

      <div className="space-y-3">
        {displayOptions.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.id === question.correctOptionId;

          // Per-option explanation: show own explanation if available,
          // or fall back to the overall question.explanation for the correct option
          const perOptionExplanation = option.explanation
            || (showFeedback && isCorrect ? question.explanation : undefined);

          return (
            <div key={option.id}>
              <button
                onClick={() => canSelect && onSelectOption(option.id)}
                disabled={!canSelect}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(option.id)} ${
                  canSelect ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getCircleStyle(option.id)}`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm leading-relaxed pt-1 block ${
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
        {showFeedback && (question.keyPoints || (question.refLinks && question.refLinks.length > 0)) && (
          <div className="w-[28rem] shrink-0">
            <Card className="sticky top-4">
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
