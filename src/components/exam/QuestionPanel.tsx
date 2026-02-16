import { Question } from '@/types/exam';
import { Bookmark } from 'lucide-react';

interface QuestionPanelProps {
  questions: Question[];
  answers: Record<string, string>;
  bookmarks: string[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const QuestionPanel = ({ questions, answers, bookmarks, currentIndex, onSelect }: QuestionPanelProps) => {
  return (
    <div className="w-64 border-r bg-card p-4 overflow-auto hidden md:block">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Questions</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = i === currentIndex;
          const isBookmarked = bookmarks.includes(q.id);

          return (
            <button
              key={q.id}
              onClick={() => onSelect(i)}
              className={`relative w-10 h-10 rounded-md text-xs font-semibold transition-all ${
                isCurrent
                  ? 'ring-2 ring-accent bg-accent text-accent-foreground'
                  : isAnswered
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              {i + 1}
              {isBookmarked && (
                <Bookmark className="absolute -top-1 -right-1 h-3 w-3 text-accent fill-accent" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-primary" /> Answered
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-secondary" /> Unanswered
        </div>
        <div className="flex items-center gap-2">
          <Bookmark className="h-3 w-3 text-accent fill-accent" /> Bookmarked
        </div>
      </div>
    </div>
  );
};

export default QuestionPanel;
