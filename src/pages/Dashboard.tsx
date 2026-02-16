import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllSessions } from '@/hooks/useExamSession';
import { BookOpen, Target, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation('pages');
  const sessions = getAllSessions();
  const submitted = sessions.filter(s => s.status === 'submitted');
  const inProgress = sessions.filter(s => s.status === 'in_progress');
  const avgScore = submitted.length > 0
    ? Math.round(submitted.reduce((sum, s) => sum + (s.score || 0), 0) / submitted.length)
    : 0;

  const stats = [
    { icon: BookOpen, label: t('dashboard.stats.examsTaken'), value: submitted.length },
    { icon: Target, label: t('dashboard.stats.averageScore'), value: `${avgScore}%` },
    { icon: TrendingUp, label: t('dashboard.stats.inProgress'), value: inProgress.length },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.welcome')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.quickActions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/exams">
                <Button className="w-full justify-between bg-accent text-accent-foreground hover:bg-accent/90">
                  {t('dashboard.quickActions.startNewExam')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/review">
                <Button variant="outline" className="w-full justify-between">
                  {t('dashboard.quickActions.reviewWrongAnswers')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('dashboard.recentSessions.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">{t('dashboard.recentSessions.noExams')}</p>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map(s => (
                    <Link
                      key={s.id}
                      to={s.status === 'submitted' ? `/results/${s.id}` : `/session/${s.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-secondary transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{s.examTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {s.status === 'submitted' ? (
                          <span className={`text-sm font-semibold ${(s.score || 0) >= 70 ? 'text-success' : 'text-destructive'}`}>
                            {s.score}%
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
                            {t('dashboard.recentSessions.inProgress')}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
