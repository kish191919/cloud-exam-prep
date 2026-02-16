import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSession, createSession } from '@/hooks/useExamSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle, XCircle, RotateCcw, ArrowLeft, BookOpen, Trophy, Target,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const ExamResults = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const session = sessionId ? getSession(sessionId) : null;

  if (!session || session.status !== 'submitted') {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Results not found.</p>
          <Link to="/exams"><Button className="mt-4">Back to Exams</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const passed = (session.score || 0) >= 70;

  const handleRetry = () => {
    const newId = createSession(session.examId, session.examTitle, session.questions, session.timeLimitSec / 60);
    navigate(`/session/${newId}`);
  };

  const handleRetryWrong = () => {
    const wrong = session.questions.filter(q => session.answers[q.id] !== q.correctOptionId);
    if (wrong.length === 0) return;
    const newId = createSession(session.examId, `${session.examTitle} (Wrong Only)`, wrong, Math.ceil(wrong.length * 1.5));
    navigate(`/session/${newId}`);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Score header */}
        <Card className={`mb-6 ${passed ? 'border-success' : 'border-destructive'}`}>
          <CardContent className="p-8 text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              passed ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              {passed ? <Trophy className="h-10 w-10 text-success" /> : <Target className="h-10 w-10 text-destructive" />}
            </div>
            <h1 className="text-3xl font-bold mb-1">{session.score}%</h1>
            <p className={`text-lg font-semibold ${passed ? 'text-success' : 'text-destructive'}`}>
              {passed ? 'PASSED' : 'NOT PASSED'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {session.correctCount} correct out of {session.totalCount} questions
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="h-4 w-4 mr-1" /> Retry All
              </Button>
              {(session.totalCount || 0) - (session.correctCount || 0) > 0 && (
                <Button onClick={handleRetryWrong} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <BookOpen className="h-4 w-4 mr-1" /> Retry Wrong Only
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tag breakdown */}
        {session.tagBreakdown && Object.keys(session.tagBreakdown).length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-lg">Performance by Topic</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(session.tagBreakdown).map(([tag, data]) => {
                const pct = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={tag}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{tag}</span>
                      <span className="text-sm text-muted-foreground">{data.correct}/{data.total} ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Question review */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Question Review</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {session.questions.map((q, i) => {
              const userAnswer = session.answers[q.id];
              const isCorrect = userAnswer === q.correctOptionId;
              return (
                <div key={q.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect
                      ? <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      : <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-sm font-semibold mb-1">Q{i + 1}. {q.text}</p>
                      <div className="space-y-1">
                        {q.options.map(opt => {
                          const isUserPick = opt.id === userAnswer;
                          const isAnswer = opt.id === q.correctOptionId;
                          return (
                            <div
                              key={opt.id}
                              className={`text-sm px-3 py-2 rounded ${
                                isAnswer
                                  ? 'bg-success/10 text-success font-medium'
                                  : isUserPick
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              <span className="font-semibold mr-2">{opt.id.toUpperCase()}.</span>
                              {opt.text}
                              {isAnswer && ' ✓'}
                              {isUserPick && !isAnswer && ' ✗'}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 p-3 rounded bg-muted text-sm text-muted-foreground">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="text-center mt-6 mb-10">
          <Link to="/dashboard"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard</Button></Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default ExamResults;
