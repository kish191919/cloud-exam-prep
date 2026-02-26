import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Pin, ExternalLink, Clock, Calendar, ArrowLeft,
  Megaphone, Info, Lightbulb, RefreshCw, Share2,
  CheckCircle2, ChevronRight, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SalaryBarChart, MarketShareChart } from '@/components/BoardCharts';
import { getAnnouncements, getAnnouncementById } from '@/services/boardService';
import type { Announcement, AnnouncementCategory } from '@/types/announcement';

// ─── Category Config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<AnnouncementCategory, {
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  heroBg: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}> = {
  notice: {
    label: '공지', labelEn: 'Notice',
    icon: Megaphone,
    heroBg: 'from-rose-50 via-red-50 to-pink-50 dark:from-rose-950/40 dark:via-red-950/30 dark:to-pink-950/20',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
    badgeBg: 'bg-red-100 dark:bg-red-900/40',
    badgeText: 'text-red-700 dark:text-red-300',
    accentColor: 'border-red-400',
  },
  info: {
    label: '정보', labelEn: 'Info',
    icon: Info,
    heroBg: 'from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-sky-950/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    accentColor: 'border-blue-400',
  },
  tip: {
    label: '팁', labelEn: 'Tip',
    icon: Lightbulb,
    heroBg: 'from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/20',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
    badgeBg: 'bg-green-100 dark:bg-green-900/40',
    badgeText: 'text-green-700 dark:text-green-300',
    accentColor: 'border-green-400',
  },
  update: {
    label: '업데이트', labelEn: 'Update',
    icon: RefreshCw,
    heroBg: 'from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    accentColor: 'border-amber-400',
  },
};

// ─── Content Parser ───────────────────────────────────────────────────────────
type ContentBlock =
  | { type: 'section'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string; icon: string; level: number }
  | { type: 'label'; text: string }
  | { type: 'note'; text: string }
  | { type: 'chart'; chartType: 'salary' | 'market-share' }
  | { type: 'blank' };

function parseContent(raw: string): ContentBlock[] {
  const lines = raw.split('\n');
  const blocks: ContentBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) { blocks.push({ type: 'blank' }); continue; }

    // {{chart:salary}} or {{chart:market-share}} markers
    if (trimmed === '{{chart:salary}}') {
      blocks.push({ type: 'chart', chartType: 'salary' }); continue;
    }
    if (trimmed === '{{chart:market-share}}') {
      blocks.push({ type: 'chart', chartType: 'market-share' }); continue;
    }

    // ━━ Section Header ━━
    if (/^━━\s+.+\s+━━$/.test(trimmed)) {
      const text = trimmed.replace(/^━━\s+/, '').replace(/\s+━━$/, '');
      blocks.push({ type: 'section', text }); continue;
    }

    // [Label] lines
    if (/^\[.+\]$/.test(trimmed)) {
      blocks.push({ type: 'label', text: trimmed.slice(1, -1) }); continue;
    }

    // Ranked bullets: 🥇🥈🥉
    if (/^[🥇🥈🥉]/.test(trimmed)) {
      blocks.push({ type: 'bullet', text: trimmed.slice(2).trim(), icon: trimmed[0], level: 1 }); continue;
    }

    // Check / todo bullets
    if (/^[✅✓□☐]/.test(trimmed)) {
      blocks.push({ type: 'bullet', text: trimmed.slice(1).trim(), icon: trimmed[0], level: 1 }); continue;
    }

    // Dot bullets
    if (/^[•·]/.test(trimmed)) {
      blocks.push({ type: 'bullet', text: trimmed.slice(1).trim(), icon: '•', level: 1 }); continue;
    }

    // Arrow sub-bullets (indented ≥2 spaces + →) or → at start of indented line
    if (line.match(/^\s{2,}→/) || (trimmed.startsWith('→') && line.startsWith('  '))) {
      blocks.push({ type: 'bullet', text: trimmed.slice(1).trim(), icon: '→', level: 2 }); continue;
    }

    // Top-level → bullets
    if (trimmed.startsWith('→ ')) {
      blocks.push({ type: 'bullet', text: trimmed.slice(2).trim(), icon: '→', level: 1 }); continue;
    }

    // Note / source line
    if (/^\*\s/.test(trimmed)) {
      blocks.push({ type: 'note', text: trimmed.slice(2).trim() }); continue;
    }

    blocks.push({ type: 'paragraph', text: trimmed });
  }

  return blocks;
}

// Highlight numbers like 26%, $130,000, 47%, 31%
function highlightNumbers(text: string): React.ReactNode {
  const parts = text.split(/(\d[\d,]*%|\$[\d,]+(?:,\d+)*(?:K)?|₩[\d,]+[MW]?(?:\s*~\s*₩[\d,]+[MW]?)?)/g);
  return parts.map((part, i) =>
    /^\d[\d,]*%$|^\$[\d,]|^₩[\d,]/.test(part)
      ? <strong key={i} className="text-accent font-bold">{part}</strong>
      : part
  );
}

// Extract source citations from text
function extractSources(content: string): string[] {
  const sources = new Set<string>();

  // Pattern: (Source Name, Year)
  const inline = content.matchAll(/\(([A-Za-z][^)]{2,30},\s*\d{4})\)/g);
  for (const m of inline) sources.add(m[1]);

  // Pattern: * 출처: X, Y, Z, Year
  const noteMatch = content.match(/[*•]\s*출처[:：]\s*(.+)/);
  if (noteMatch) {
    noteMatch[1].split(',').map(s => s.trim()).forEach(s => {
      if (s && !/^\d{4}$/.test(s)) sources.add(s);
    });
  }

  return Array.from(sources);
}

// Estimate reading time
function readingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─── Article Content Renderer ─────────────────────────────────────────────────
function ArticleContent({ content, accentColor }: { content: string; accentColor: string }) {
  const blocks = parseContent(content);

  return (
    <div className="space-y-1">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'blank':
            return <div key={i} className="h-3" />;

          case 'section':
            return (
              <div key={i} className={`mt-8 mb-3 pl-3 border-l-4 ${accentColor}`}>
                <h2 className="text-base font-bold text-foreground tracking-wide">
                  {block.text}
                </h2>
              </div>
            );

          case 'label':
            return (
              <div key={i} className="mt-4 mb-1">
                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                  {block.text}
                </span>
              </div>
            );

          case 'bullet': {
            const isCheck = ['✅', '✓', '□', '☐'].includes(block.icon);
            const isRank  = ['🥇', '🥈', '🥉'].includes(block.icon);
            const isArrow = block.icon === '→';
            const isDot   = block.icon === '•';

            if (block.level === 2) {
              return (
                <div key={i} className="flex items-start gap-2 pl-6 py-0.5">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground leading-relaxed">{highlightNumbers(block.text)}</span>
                </div>
              );
            }

            return (
              <div key={i} className="flex items-start gap-3 py-1">
                {isCheck && <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />}
                {isRank  && <span className="text-lg leading-none shrink-0">{block.icon}</span>}
                {isArrow && <ChevronRight className="h-4 w-4 text-accent mt-0.5 shrink-0" />}
                {isDot   && <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />}
                <span className="text-sm leading-relaxed">{highlightNumbers(block.text)}</span>
              </div>
            );
          }

          case 'note':
            return (
              <p key={i} className="text-xs text-muted-foreground italic pl-1 mt-2">
                * {block.text}
              </p>
            );

          case 'chart':
            return block.chartType === 'salary'
              ? <SalaryBarChart key={i} />
              : <MarketShareChart key={i} />;

          case 'paragraph':
          default:
            return (
              <p key={i} className="text-sm leading-relaxed text-foreground">
                {highlightNumbers(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}

// ─── Sources Section ──────────────────────────────────────────────────────────
interface RefLink { name: string; url: string; }

function SourcesSection({ sources, refLinks }: { sources: string[]; refLinks: string | null }) {
  const links: RefLink[] = (() => {
    try { return refLinks ? JSON.parse(refLinks) : []; }
    catch { return []; }
  })();

  const hasLinks = links.length > 0;
  const hasSources = sources.length > 0;
  if (!hasLinks && !hasSources) return null;

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        출처 및 참고자료 / Sources & References
      </h3>
      <ul className="space-y-1.5">
        {links.map((link, i) => (
          <li key={`link-${i}`} className="flex items-center gap-2 text-xs">
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0 text-muted-foreground">
              {i + 1}
            </span>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline inline-flex items-center gap-1"
            >
              {link.name}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </li>
        ))}
        {!hasLinks && sources.map((src, i) => (
          <li key={`src-${i}`} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
              {i + 1}
            </span>
            {src}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Related Posts ────────────────────────────────────────────────────────────
function RelatedPosts({ current }: { current: Announcement }) {
  const [posts, setPosts] = useState<Announcement[]>([]);
  const { i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';

  useEffect(() => {
    getAnnouncements({ limit: 6 })
      .then(({ data }) => setPosts(data.filter(p => p.id !== current.id).slice(0, 3)))
      .catch(() => {});
  }, [current.id]);

  if (posts.length === 0) return null;

  return (
    <section className="bg-muted/30 dark:bg-muted/10 py-10 mt-0">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-base font-bold mb-5 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          다른 글 더 보기
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {posts.map(post => {
            const cfg = CATEGORY_CONFIG[post.category];
            const postTitle = !isKo && post.titleEn ? post.titleEn : post.title;
            const Icon = cfg.icon;
            return (
              <Link
                key={post.id}
                to={`/board/${post.id}`}
                className="group block rounded-xl border border-border bg-card p-4 hover:border-accent/40 hover:shadow-sm transition-all"
              >
                <div className={`inline-flex p-1.5 rounded-lg ${cfg.iconBg} mb-2`}>
                  <Icon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
                </div>
                <p className="text-xs font-medium leading-snug line-clamp-3 group-hover:text-accent transition-colors">
                  {postTitle}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {new Date(post.createdAt).toLocaleDateString(isKo ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' })}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const BoardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';

  const [item, setItem] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAnnouncementById(id)
      .then(data => { if (!data) setNotFound(true); else setItem(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-20">
          <div className="h-56 bg-muted animate-pulse" />
          <div className="container mx-auto px-4 max-w-3xl py-8 space-y-4">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-40 bg-muted rounded animate-pulse mt-6" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center py-20 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">{t('board.notFound')}</p>
            <Link to="/board" className="text-sm text-accent hover:underline">
              {t('board.backToList')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!item) return null;

  const cfg = CATEGORY_CONFIG[item.category];
  const Icon = cfg.icon;
  const title   = !isKo && item.titleEn   ? item.titleEn   : item.title;
  const content = !isKo && item.contentEn ? item.contentEn : item.content;
  const catLabel = isKo ? cfg.label : cfg.labelEn;
  const sources = extractSources(item.content + (item.contentEn ?? ''));
  const mins = readingTime(content);
  const date = new Date(item.createdAt).toLocaleDateString(isKo ? 'ko-KR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <div className={`pt-20 bg-gradient-to-br ${cfg.heroBg} relative overflow-hidden`}>
        {/* decorative blur circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/20 dark:bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/20 dark:bg-white/5 blur-2xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-3xl py-10 relative">
          {/* breadcrumb */}
          <Link
            to="/board"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('board.backToList')}
          </Link>

          {/* category + pin */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}>
              <Icon className="h-3 w-3" />
              {catLabel}
            </div>
            {item.isPinned && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-medium">
                <Pin className="h-3 w-3" />
                {t('board.pinned')}
              </div>
            )}
          </div>

          {/* title */}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground mb-4">
            {title}
          </h1>

          {/* meta row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {isKo ? `약 ${mins}분 읽기` : `${mins} min read`}
            </span>
            {item.examId && (
              <Link to="/exams" className="flex items-center gap-1 text-accent hover:underline">
                <ExternalLink className="h-3 w-3" />
                {t('board.examBadge')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Article ── */}
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 max-w-3xl py-10">

          {/* content card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Cover image */}
            {item.coverImageUrl && (
              <div className="w-full h-48 sm:h-64 overflow-hidden">
                <img
                  src={item.coverImageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 sm:p-8">
              <ArticleContent content={content} accentColor={cfg.accentColor} />
              <SourcesSection sources={sources} refLinks={item.refLinks} />
            </div>
          </div>

          {/* action bar */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <Link
              to="/board"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('board.backToList')}
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? (isKo ? '복사됨!' : 'Copied!') : (isKo ? '링크 복사' : 'Copy Link')}
            </Button>
          </div>

          {/* CTA */}
          <div className="mt-8 rounded-2xl bg-accent/10 border border-accent/20 p-6 text-center">
            <p className="text-sm font-semibold mb-1">
              {isKo ? '지금 바로 실전 문제로 연습하세요' : 'Practice with real exam questions now'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {isKo
                ? '한국어 해설과 함께 AWS·GCP·Azure CBT 환경을 무료로 체험해보세요.'
                : 'Try our free CBT practice for AWS, GCP & Azure with Korean explanations.'}
            </p>
            <Link to="/exams">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm gap-1.5">
                <BookOpen className="h-4 w-4" />
                {isKo ? '무료로 시작하기' : 'Start Free'}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* ── Related Posts ── */}
      <RelatedPosts current={item} />

      <Footer />
    </div>
  );
};

export default BoardDetailPage;
