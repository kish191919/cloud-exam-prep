import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllExams } from '@/services/examService';
import { getQuestionsForExam } from '@/services/questionService';
import { createSession, getAllSessions } from '@/hooks/useExamSession';
import { Clock, HelpCircle, Target, Play, ArrowRight, Loader2 } from 'lucide-react';
import type { ExamConfig } from '@/types/exam';
import { useTranslation } from 'react-i18next';

const certColors: Record<string, string> = {
  AWS: 'bg-accent text-accent-foreground',
  GCP: 'bg-primary text-primary-foreground',
  Azure: 'bg-primary text-primary-foreground',
};

const ExamList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('pages');
  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const sessions = getAllSessions();

  useEffect(() => {
    async function loadExams() {
      try {
        const examData = await getAllExams();
        setExams(examData);
      } catch (error) {
        console.error('Error loading exams:', error);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  const handleStart = async (examId: string) => {
    const config = exams.find(e => e.id === examId);
    if (!config) return;
    try {
      const questions = await getQuestionsForExam(examId);
      if (questions.length === 0) return;
      const sessionId = await createSession(examId, config.title, questions, config.timeLimitMinutes);
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error starting exam:', error);
    }
  };

  const getInProgressSession = (examId: string) =>
    sessions.find(s => s.examId === examId && s.status === 'in_progress');

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('examList.title')}</h1>
          <p className="text-muted-foreground">{t('examList.subtitle')}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map(exam => {
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
                        <span className="flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> {exam.questionCount} {t('examList.questions')}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {exam.timeLimitMinutes} {t('examList.minutes')}</span>
                        <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {exam.passingScore}% {t('examList.toPass')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {inProgress && (
                        <Button variant="outline" onClick={() => navigate(`/session/${inProgress.id}`)}>
                          {t('examList.resume')} <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                      <Button
                        disabled={!available}
                        onClick={() => handleStart(exam.id)}
                        className={available ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}
                      >
                        {available ? <><Play className="h-4 w-4 mr-1" /> {t('examList.startExam')}</> : t('examList.comingSoon')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ExamList;
