import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pin, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAnnouncementById } from '@/services/boardService';
import type { Announcement, AnnouncementCategory } from '@/types/announcement';

const CATEGORY_COLORS: Record<AnnouncementCategory, string> = {
  notice: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  tip:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  update: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const BoardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';

  const [item, setItem] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAnnouncementById(id)
      .then(data => {
        if (!data) setNotFound(true);
        else setItem(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const title = item && !isKo && item.titleEn ? item.titleEn : item?.title;
  const content = item && !isKo && item.contentEn ? item.contentEn : item?.content;
  const date = item
    ? new Date(item.createdAt).toLocaleDateString(isKo ? 'ko-KR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <Link
            to="/board"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-6"
          >
            {t('board.backToList')}
          </Link>

          {loading && (
            <div className="space-y-4">
              <div className="h-6 w-24 rounded bg-muted animate-pulse" />
              <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-40 rounded bg-muted animate-pulse mt-6" />
            </div>
          )}

          {!loading && notFound && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">{t('board.notFound')}</p>
              <Link to="/board" className="text-sm text-accent hover:underline mt-2 inline-block">
                {t('board.backToList')}
              </Link>
            </div>
          )}

          {!loading && item && (
            <>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {item.isPinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                    <Pin className="h-3.5 w-3.5" />
                    {t('board.pinned')}
                  </span>
                )}
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[item.category]}`}>
                  {t(`board.categories.${item.category}`)}
                </span>
              </div>

              <h1 className="text-xl font-bold leading-snug mb-3">{title}</h1>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6 flex-wrap">
                <span>{t('board.postedOn', { date })}</span>
                {item.examId && (
                  <Link
                    to="/exams"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {t('board.examBadge')}
                  </Link>
                )}
              </div>

              <hr className="border-border mb-6" />

              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {content}
              </div>

              <div className="mt-10">
                <Link
                  to="/board"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('board.backToList')}
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BoardDetailPage;
