import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Pin, Megaphone, Info, Lightbulb, RefreshCw,
  Clock, Calendar, ArrowRight, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAnnouncements } from '@/services/boardService';
import type { Announcement, AnnouncementCategory } from '@/types/announcement';

const PAGE_SIZE = 12;

const CATEGORY_CONFIG: Record<AnnouncementCategory | 'all', {
  label: string; labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  cardAccent: string;
  badgeBg: string; badgeText: string;
  iconBg: string; iconColor: string;
}> = {
  all:    { label: '전체',     labelEn: 'All',    icon: Megaphone, cardAccent: 'border-l-accent',   badgeBg: 'bg-muted',              badgeText: 'text-muted-foreground', iconBg: 'bg-muted',              iconColor: 'text-muted-foreground' },
  notice: { label: '공지',     labelEn: 'Notice', icon: Megaphone, cardAccent: 'border-l-red-400',  badgeBg: 'bg-red-100 dark:bg-red-900/30',    badgeText: 'text-red-700 dark:text-red-300',  iconBg: 'bg-red-100 dark:bg-red-900/30',    iconColor: 'text-red-500 dark:text-red-400' },
  info:   { label: '정보',     labelEn: 'Info',   icon: Info,      cardAccent: 'border-l-blue-400', badgeBg: 'bg-blue-100 dark:bg-blue-900/30',  badgeText: 'text-blue-700 dark:text-blue-300', iconBg: 'bg-blue-100 dark:bg-blue-900/30',  iconColor: 'text-blue-500 dark:text-blue-400' },
  tip:    { label: '팁',       labelEn: 'Tip',    icon: Lightbulb, cardAccent: 'border-l-green-400',badgeBg: 'bg-green-100 dark:bg-green-900/30',badgeText: 'text-green-700 dark:text-green-300',iconBg: 'bg-green-100 dark:bg-green-900/30',iconColor: 'text-green-500 dark:text-green-400' },
  update: { label: '업데이트', labelEn: 'Update', icon: RefreshCw, cardAccent: 'border-l-amber-400',badgeBg: 'bg-amber-100 dark:bg-amber-900/30',badgeText: 'text-amber-700 dark:text-amber-300',iconBg: 'bg-amber-100 dark:bg-amber-900/30',iconColor: 'text-amber-500 dark:text-amber-400' },
};

function readingTime(text: string) {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

function stripSpecial(text: string): string {
  return text
    .replace(/━━[^━]*━━/g, '')
    .replace(/[•✅✓→🥇🥈🥉□☐\[\]]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function AnnouncementCard({ item }: { item: Announcement }) {
  const { i18n } = useTranslation('pages');
  const lang = i18n.language;
  const isKo = lang === 'ko';
  const cfg = CATEGORY_CONFIG[item.category];
  const Icon = cfg.icon;

  const title = (
    lang === 'ja' && item.titleJa ? item.titleJa :
    lang === 'es' && item.titleEs ? item.titleEs :
    lang === 'pt' && item.titlePt ? item.titlePt :
    lang !== 'ko' && item.titleEn ? item.titleEn :
    item.title
  );
  const rawContent = (
    lang === 'ja' && item.contentJa ? item.contentJa :
    lang === 'es' && item.contentEs ? item.contentEs :
    lang === 'pt' && item.contentPt ? item.contentPt :
    lang !== 'ko' && item.contentEn ? item.contentEn :
    item.content
  );
  const excerpt = stripSpecial(rawContent).slice(0, 120) + '…';
  const mins    = readingTime(rawContent);
  const catLabel = isKo ? cfg.label : cfg.labelEn;
  const date    = new Date(item.createdAt).toLocaleDateString(isKo ? 'ko-KR' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <Link
      to={`/board/${item.id}`}
      className={`group flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-accent/30 transition-all border-l-4 ${cfg.cardAccent}`}
    >
      {/* Thumbnail image */}
      {item.coverImageUrl && (
        <div className="w-full h-32 overflow-hidden shrink-0">
          <img
            src={item.coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Card header */}
      <div className="p-5 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-lg ${cfg.iconBg} shrink-0`}>
            <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}>
              {catLabel}
            </span>
            {item.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
                <Pin className="h-2.5 w-2.5" />
                고정
              </span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
          {title}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {excerpt}
        </p>
      </div>

      {/* Card footer */}
      <div className="px-5 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isKo ? `${mins}분` : `${mins}m`}
          </span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

// ─── Pinned Banner ────────────────────────────────────────────────────────────
function PinnedBanner({ item }: { item: Announcement }) {
  const { t, i18n } = useTranslation('pages');
  const lang = i18n.language;
  const isKo = lang === 'ko';
  const title = (
    lang === 'ja' && item.titleJa ? item.titleJa :
    lang === 'es' && item.titleEs ? item.titleEs :
    lang === 'pt' && item.titlePt ? item.titlePt :
    lang !== 'ko' && item.titleEn ? item.titleEn :
    item.title
  );

  return (
    <Link
      to={`/board/${item.id}`}
      className="group flex items-center gap-3 p-3.5 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors"
    >
      <div className="p-1.5 rounded-lg bg-accent/15 shrink-0">
        <Pin className="h-3.5 w-3.5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-accent mr-2">{t('board.pinned')}</span>
        <span className="text-sm font-medium truncate">{title}</span>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-accent/60 group-hover:translate-x-0.5 transition-transform shrink-0" />
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const BoardPage = () => {
  const { t, i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? 'all';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnnouncements({ category, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
      .then(({ data, count }) => { setAnnouncements(data); setTotal(count); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pinned = announcements.filter(a => a.isPinned);
  const regular = announcements.filter(a => !a.isPinned);

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

      {/* ── Page Hero ── */}
      <div className="pt-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950/50 dark:via-blue-950/20 dark:to-indigo-950/10 border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-accent/15">
              <Megaphone className="h-5 w-5 text-accent" />
            </div>
            <h1 className="text-2xl font-bold">{t('board.title')}</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-11">{t('board.subtitle')}</p>
        </div>
      </div>

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 max-w-5xl py-8">

          {/* Category filter tabs */}
          <div className="flex flex-wrap gap-2 mb-7">
            {categories.map(cat => {
              const cfg = CATEGORY_CONFIG[cat];
              const label = isKo ? cfg.label : cfg.labelEn;
              const Icon = cfg.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    category === cat
                      ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                      : 'border-border text-muted-foreground hover:border-accent/40 hover:text-foreground bg-card'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl border border-border bg-muted animate-pulse" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Megaphone className="h-8 w-8 opacity-30" />
              </div>
              <p className="font-medium mb-1">{t('board.empty')}</p>
              <p className="text-xs text-muted-foreground/70">
                {isKo ? '조만간 새로운 글이 올라올 예정입니다.' : 'New posts are coming soon.'}
              </p>
            </div>
          ) : (
            <>
              {/* Pinned banners */}
              {pinned.length > 0 && (
                <div className="space-y-2 mb-6">
                  {pinned.map(item => <PinnedBanner key={item.id} item={item} />)}
                </div>
              )}

              {/* Grid of cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {regular.map(item => (
                  <AnnouncementCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                이전
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                다음
              </Button>
            </div>
          )}

          {/* CTA banner */}
          {!loading && announcements.length > 0 && (
            <div className="mt-12 rounded-2xl bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm mb-1">
                  {isKo ? '지금 바로 실전 CBT로 연습하세요' : 'Practice with real CBT questions now'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? 'AWS·GCP·AZURE 한국어 해설 문제 500개 이상 무료 제공'
                    : '500+ Korean-explained practice questions for AWS, GCP & AZURE — free'}
                </p>
              </div>
              <Link to="/exams" className="shrink-0">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {isKo ? '무료로 시작하기' : 'Start Free'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BoardPage;
