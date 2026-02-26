import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pin, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAnnouncements } from '@/services/boardService';
import type { Announcement, AnnouncementCategory } from '@/types/announcement';

const PAGE_SIZE = 15;

const CATEGORY_COLORS: Record<AnnouncementCategory | 'all', string> = {
  all:    'bg-muted text-muted-foreground',
  notice: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  tip:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  update: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function CategoryBadge({ category }: { category: AnnouncementCategory }) {
  const { t } = useTranslation('pages');
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[category]}`}>
      {t(`board.categories.${category}`)}
    </span>
  );
}

function AnnouncementCard({ item }: { item: Announcement }) {
  const { t, i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';
  const title = (!isKo && item.titleEn) ? item.titleEn : item.title;
  const date = new Date(item.createdAt).toLocaleDateString(isKo ? 'ko-KR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Link
      to={`/board/${item.id}`}
      className={`block p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
        item.isPinned ? 'border-accent/40 bg-accent/5' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        {item.isPinned && (
          <Pin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {item.isPinned && (
              <span className="text-xs font-semibold text-accent">{t('board.pinned')}</span>
            )}
            <CategoryBadge category={item.category} />
          </div>
          <p className="font-medium text-sm leading-snug truncate">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('board.postedOn', { date })}
          </p>
        </div>
      </div>
    </Link>
  );
}

const BoardPage = () => {
  const { t } = useTranslation('pages');
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? 'all';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnnouncements({
      category,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
      .then(({ data, count }) => {
        setAnnouncements(data);
        setTotal(count);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const setCategory = (cat: string) => {
    const next = new URLSearchParams();
    if (cat !== 'all') next.set('category', cat);
    setSearchParams(next);
  };

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  const categories = ['all', 'notice', 'info', 'tip', 'update'] as const;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-bold">{t('board.title')}</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-6">{t('board.subtitle')}</p>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  category === cat
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border text-muted-foreground hover:border-accent/40 hover:text-foreground'
                }`}
              >
                {t(`board.categories.${cat}`)}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg border border-border bg-muted animate-pulse" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>{t('board.empty')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map(item => (
                <AnnouncementCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BoardPage;
