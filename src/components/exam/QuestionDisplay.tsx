import { Question, ExamMode } from '@/types/exam';
import { Bookmark, BookmarkCheck, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId?: string;
  isBookmarked: boolean;
  onSelectOption: (optionId: string) => void;
  onToggleBookmark: () => void;
  mode?: ExamMode;
}

const OPTION_LABELS: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

const QuestionDisplay = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  isBookmarked,
  onSelectOption,
  onToggleBookmark,
  mode = 'exam',
}: QuestionDisplayProps) => {
  const isStudy = mode === 'study';
  const isPractice = mode === 'practice';
  const isAnswered = !!selectedOptionId;

  // Whether to show answer feedback (correct/wrong colors, icons, explanations)
  const showFeedback = isStudy || (isPractice && isAnswered);

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
    <div className="max-w-3xl mx-auto animate-fade-in">
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
          {/* Difficulty */}
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {'★'.repeat(question.difficulty)}{'☆'.repeat(3 - question.difficulty)}
          </span>
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
        {question.options.map((option) => {
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
                    {OPTION_LABELS[option.id] ?? option.id.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm leading-relaxed pt-1 block">{option.text}</span>
                    {/* Per-option explanation (shown in feedback state) */}
                    {showFeedback && perOptionExplanation && (
                      <p className={`text-xs mt-2 leading-relaxed ${
                        isCorrect ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
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
  );
};

export default QuestionDisplay;
