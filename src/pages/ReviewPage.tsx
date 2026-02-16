import AppLayout from '@/components/AppLayout';
import { getAllSessions } from '@/hooks/useExamSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { XCircle, Bookmark, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReviewPage = () => {
  const { t } = useTranslation('pages');
  const sessions = getAllSessions().filter(s => s.status === 'submitted');

  const wrongQuestions = sessions.flatMap(s =>
    s.questions
      .filter(q => s.answers[q.id] !== q.correctOptionId)
      .map(q => ({
        ...q,
        sessionId: s.id,
        examTitle: s.examTitle,
        userAnswer: s.answers[q.id],
        date: s.submittedAt || s.startedAt,
      }))
  );

  const bookmarkedQuestions = sessions.flatMap(s =>
    s.questions
      .filter(q => s.bookmarks.includes(q.id))
      .map(q => ({
        ...q,
        sessionId: s.id,
        examTitle: s.examTitle,
        date: s.submittedAt || s.startedAt,
      }))
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('review.title')}</h1>
          <p className="text-muted-foreground">{t('review.subtitle')}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" /> {t('review.wrongAnswers')} ({wrongQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wrongQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{t('review.noWrong')}</p>
            ) : (
              <div className="space-y-3">
                {wrongQuestions.slice(0, 20).map((q, i) => (
                  <div key={`${q.sessionId}-${q.id}`} className="p-3 rounded-lg bg-muted">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">{q.examTitle}</p>
                        <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                        <div className="flex gap-1 mt-2">
                          {q.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link to={`/results/${q.sessionId}`}>
                        <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-accent" /> {t('review.bookmarked')} ({bookmarkedQuestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookmarkedQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{t('review.noBookmarked')}</p>
            ) : (
              <div className="space-y-3">
                {bookmarkedQuestions.slice(0, 20).map((q) => (
                  <div key={`${q.sessionId}-${q.id}`} className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">{q.examTitle}</p>
                    <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReviewPage;
