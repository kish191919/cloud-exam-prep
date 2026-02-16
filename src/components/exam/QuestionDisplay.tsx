import { Question } from '@/types/exam';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId?: string;
  isBookmarked: boolean;
  onSelectOption: (optionId: string) => void;
  onToggleBookmark: () => void;
}

const QuestionDisplay = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  isBookmarked,
  onSelectOption,
  onToggleBookmark,
}: QuestionDisplayProps) => {
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

      <h2 className="text-lg font-semibold leading-relaxed mb-6">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-accent bg-accent/5 shadow-sm'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isSelected
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {option.id.toUpperCase()}
                </span>
                <span className="text-sm leading-relaxed pt-1">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>

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
