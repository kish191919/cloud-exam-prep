import { useCallback, useState } from 'react';
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

const ExamSession = () => {
  const { t } = useTranslation('pages');
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, loading, selectAnswer, toggleBookmark, goToQuestion, submitExam } = useExamSession(sessionId || null);
  const [showPanel, setShowPanel] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const handleTimeUp = useCallback(() => {
    submitExam();
    if (sessionId) navigate(`/results/${sessionId}`, { replace: true });
  }, [submitExam, sessionId, navigate]);

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

  const handleSubmit = () => {
    submitExam();
    navigate(`/results/${session.id}`);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setShowPanel(!showPanel)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Cloud className="h-5 w-5 text-accent flex-shrink-0" />
            <span className="font-semibold text-sm truncate">{session.examTitle}</span>
          </div>
        </div>
        <ExamTimer startedAt={session.startedAt} timeLimitSec={session.timeLimitSec} onTimeUp={handleTimeUp} />
        <Button size="sm" onClick={() => setShowSubmitDialog(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Send className="h-4 w-4 mr-1" /> {t('examSession.submit')}
        </Button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {showPanel && (
          <QuestionPanel
            questions={session.questions}
            answers={session.answers}
            bookmarks={session.bookmarks}
            currentIndex={session.currentIndex}
            onSelect={goToQuestion}
          />
        )}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={session.currentIndex + 1}
            totalQuestions={session.questions.length}
            selectedOptionId={session.answers[currentQuestion.id]}
            isBookmarked={session.bookmarks.includes(currentQuestion.id)}
            onSelectOption={(optionId) => selectAnswer(currentQuestion.id, optionId)}
            onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
          />
        </div>
      </div>

      {/* Mobile question strip */}
      <div className="md:hidden flex gap-1 px-3 py-2 overflow-x-auto border-t bg-card">
        {session.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => goToQuestion(i)}
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

      {/* Footer nav */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-card">
        <Button
          variant="outline"
          disabled={session.currentIndex === 0}
          onClick={() => goToQuestion(session.currentIndex - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> {t('examSession.prev')}
        </Button>
        <span className="text-sm text-muted-foreground font-medium">
          {t('examSession.questionCounter', { current: session.currentIndex + 1, total: session.questions.length })}
        </span>
        <Button
          variant="outline"
          disabled={session.currentIndex === session.questions.length - 1}
          onClick={() => goToQuestion(session.currentIndex + 1)}
        >
          {t('examSession.next')} <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Submit confirmation */}
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
