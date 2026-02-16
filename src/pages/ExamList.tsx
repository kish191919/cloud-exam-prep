import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { examConfigs, getQuestionsForExam } from '@/data/mockQuestions';
import { createSession, getAllSessions } from '@/hooks/useExamSession';
import { Clock, HelpCircle, Target, Play, ArrowRight } from 'lucide-react';

const certColors: Record<string, string> = {
  AWS: 'bg-accent text-accent-foreground',
  GCP: 'bg-primary text-primary-foreground',
  Azure: 'bg-primary text-primary-foreground',
};

const ExamList = () => {
  const navigate = useNavigate();
  const sessions = getAllSessions();

  const handleStart = (examId: string) => {
    const config = examConfigs.find(e => e.id === examId);
    if (!config) return;
    const questions = getQuestionsForExam(examId);
    if (questions.length === 0) return;
    const sessionId = createSession(examId, config.title, questions, config.timeLimitMinutes);
    navigate(`/session/${sessionId}`);
  };

  const getInProgressSession = (examId: string) =>
    sessions.find(s => s.examId === examId && s.status === 'in_progress');

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Practice Exams</h1>
          <p className="text-muted-foreground">Choose a certification exam to practice.</p>
        </div>

        <div className="space-y-4">
          {examConfigs.map(exam => {
            const inProgress = getInProgressSession(exam.id);
            const available = exam.questionCount > 0;

            return (
              <Card key={exam.id} className={`card-hover ${!available ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${certColors[exam.certification]}`}>
                          {exam.certification}
                        </span>
                        <span className="text-xs text-muted-foreground">{exam.code}</span>
                        <span className="text-xs text-muted-foreground">v{exam.version}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{exam.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{exam.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> {exam.questionCount} questions</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {exam.timeLimitMinutes} min</span>
                        <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {exam.passingScore}% to pass</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {inProgress && (
                        <Button variant="outline" onClick={() => navigate(`/session/${inProgress.id}`)}>
                          Resume <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                      <Button
                        disabled={!available}
                        onClick={() => handleStart(exam.id)}
                        className={available ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}
                      >
                        {available ? <><Play className="h-4 w-4 mr-1" /> Start Exam</> : 'Coming Soon'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default ExamList;
