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

  // Determine option styling based on mode
  const getOptionStyle = (optionId: string) => {
    const isSelected = selectedOptionId === optionId;
    const isCorrect = optionId === question.correctOptionId;

    if (isStudy) {
      // Study mode: always highlight correct answer
      if (isCorrect) return 'border-green-500 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-400';
      if (isSelected && !isCorrect) return 'border-red-400 bg-red-50 dark:bg-red-950/30';
      return 'border-border bg-card hover:border-muted-foreground/30';
    }

    if (isPractice && isAnswered) {
      // Practice mode after answering: show correct/incorrect feedback
      if (isCorrect) return 'border-green-500 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-400';
      if (isSelected && !isCorrect) return 'border-red-400 bg-red-50 dark:bg-red-950/30 ring-1 ring-red-300';
      return 'border-border bg-card opacity-60';
    }

    // Exam mode or practice mode before answering
    if (isSelected) return 'border-accent bg-accent/5 shadow-sm';
    return 'border-border bg-card hover:border-muted-foreground/30';
  };

  const getCircleStyle = (optionId: string) => {
    const isSelected = selectedOptionId === optionId;
    const isCorrect = optionId === question.correctOptionId;

    if (isStudy) {
      if (isCorrect) return 'bg-green-500 text-white';
      if (isSelected && !isCorrect) return 'bg-red-400 text-white';
      return 'bg-secondary text-secondary-foreground';
    }

    if (isPractice && isAnswered) {
      if (isCorrect) return 'bg-green-500 text-white';
      if (isSelected && !isCorrect) return 'bg-red-400 text-white';
      return 'bg-secondary text-secondary-foreground';
    }

    if (isSelected) return 'bg-accent text-accent-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  // In study mode or practice mode after answering, disable further selection
  const canSelect = !isStudy && !(isPractice && isAnswered);

  // Show explanation panel
  const showExplanation = isStudy || (isPractice && isAnswered);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-muted-foreground">
          Question {questionNumber} of {totalQuestions}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleBookmark}
          className={isBookmarked ? 'text-accent' : 'text-muted-foreground'}
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
          const showIcon = isStudy || (isPractice && isAnswered);

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
                    {/* Per-option explanation */}
                    {option.explanation && showIcon && (
                      <p className="text-xs mt-1 italic text-muted-foreground">{option.explanation}</p>
                    )}
                  </div>
                  {showIcon && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  {showIcon && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Explanation panel for practice (after answering) and study modes */}
      {showExplanation && question.explanation && (
        <div className="mt-5 p-4 rounded-lg bg-muted/60 border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">해설 / Explanation</p>
          <p className="text-sm leading-relaxed">{question.explanation}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-6">
        {question.tags.map(tag => (
          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
            {tag}
          </span>
        ))}
        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
          Difficulty: {'★'.repeat(question.difficulty)}{'☆'.repeat(3 - question.difficulty)}
        </span>
      </div>
    </div>
  );
};

export default QuestionDisplay;
