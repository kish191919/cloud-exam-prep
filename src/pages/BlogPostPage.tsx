import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MermaidBlock } from '@/components/MermaidBlock';
import {
  ArrowLeft, Clock, Calendar, Tag, ExternalLink,
  BookOpen, Share2, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBlogPostBySlug, getRelatedPosts } from '@/services/blogService';
import type { BlogPost } from '@/services/blogService';

const PROVIDER_LABEL: Record<string, string> = {
  aws: 'AWS', gcp: 'GCP', azure: 'AZURE', general: '일반',
};

const PROVIDER_COLORS: Record<string, string> = {
  aws:     'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700',
  gcp:     'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700',
  azure:   'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-700',
  general: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700',
};

function RelatedPostCard({ post }: { post: BlogPost }) {
  const { i18n } = useTranslation('pages');
  const lang = i18n.language;
  const title = (
    lang === 'ja' && post.titleJa ? post.titleJa :
    lang === 'es' && post.titleEs ? post.titleEs :
    lang === 'pt' && post.titlePt ? post.titlePt :
    lang !== 'ko' && post.titleEn ? post.titleEn :
    post.title
  );
  const isKo = lang === 'ko';
  const readMin = post.readTimeMinutes ?? 1;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-accent/40 hover:bg-accent/5 transition-all"
    >
      {post.coverImageUrl ? (
        <img
          src={post.coverImageUrl}
          alt={title}
          className="w-14 h-14 rounded-md object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center shrink-0">
          <BookOpen className="h-5 w-5 text-muted-foreground/40" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium line-clamp-2 group-hover:text-accent transition-colors leading-snug mb-1">
          {title}
        </p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {isKo ? `${readMin}분` : `${readMin}m`}
        </p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-accent shrink-0 mt-0.5 transition-colors" />
    </Link>
  );
}

// ─── Markdown custom components ───────────────────────────────────────────────
const mdComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-2xl font-bold mt-8 mb-4 first:mt-0">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xl font-bold mt-7 mb-3 border-b border-border pb-2">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg font-semibold mt-5 mb-2">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-3 leading-relaxed text-foreground/90">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-3 pl-5 space-y-1 list-disc marker:text-accent">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-3 pl-5 space-y-1 list-decimal marker:text-accent">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-4 pl-4 border-l-4 border-accent/50 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  code: ({ inline, children, className, ...props }: { inline?: boolean; children?: React.ReactNode; className?: string }) => {
    if (!inline && className === 'language-mermaid') {
      return <MermaidBlock code={String(children).trim()} />;
    }
    return inline ? (
      <code className="px-1.5 py-0.5 rounded bg-muted text-accent text-[0.85em] font-mono" {...props}>
        {children}
      </code>
    ) : (
      <code className="block p-4 rounded-lg bg-slate-900 dark:bg-slate-800 text-slate-100 text-sm font-mono overflow-x-auto" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-4 rounded-lg overflow-hidden">{children}</pre>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-muted">{children}</thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-3 py-2 text-left font-semibold border-b border-border">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-3 py-2 border-b border-border/50">{children}</td>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors inline-flex items-center gap-0.5"
    >
      {children}
      <ExternalLink className="h-3 w-3 inline-block" />
    </a>
  ),
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <img
      src={src}
      alt={alt ?? ''}
      className="my-4 rounded-lg max-w-full border border-border"
    />
  ),
  hr: () => <hr className="my-6 border-border" />,
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation('pages');
  const lang = i18n.language;
  const isKo = lang === 'ko';

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getBlogPostBySlug(slug)
      .then(data => {
        if (!data) { setNotFound(true); return; }
        setPost(data);
        return getRelatedPosts(data, 3);
      })
      .then(rel => { if (rel) setRelated(rel); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <p className="text-2xl font-bold">404</p>
          <p className="text-muted-foreground">
            {isKo ? '공부자료를 찾을 수 없습니다.' : 'Study resource not found.'}
          </p>
          <Link to="/blog">
            <Button variant="outline" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              {t('blog.backToList')}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const title = (
    lang === 'ja' && post.titleJa ? post.titleJa :
    lang === 'es' && post.titleEs ? post.titleEs :
    lang === 'pt' && post.titlePt ? post.titlePt :
    lang !== 'ko' && post.titleEn ? post.titleEn :
    post.title
  );
  const content = (
    lang === 'ja' && post.contentJa ? post.contentJa :
    lang === 'es' && post.contentEs ? post.contentEs :
    lang === 'pt' && post.contentPt ? post.contentPt :
    lang !== 'ko' && post.contentEn ? post.contentEn :
    post.content
  );
  const excerpt = (
    lang === 'ja' && post.excerptJa ? post.excerptJa :
    lang === 'es' && post.excerptEs ? post.excerptEs :
    lang === 'pt' && post.excerptPt ? post.excerptPt :
    lang !== 'ko' && post.excerptEn ? post.excerptEn :
    (post.excerpt ?? '')
  );
  const readMin = post.readTimeMinutes ?? 1;
  const dateLocale = isKo ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : 'en-US';
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(dateLocale, {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';
  const providerLabel = PROVIDER_LABEL[post.provider] ?? post.provider;
  const providerColor = PROVIDER_COLORS[post.provider] ?? '';
  const siteUrl = `https://cloudmasterit.com/blog/${post.slug}`;

  const refLinks: { name: string; name_en?: string; name_pt?: string; name_es?: string; name_ja?: string; url: string }[] = Array.isArray(post.refLinks)
    ? post.refLinks as { name: string; name_en?: string; name_pt?: string; name_es?: string; name_ja?: string; url: string }[]
    : [];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: siteUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(siteUrl).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{title} | CloudMaster</title>
        <meta name="description" content={excerpt || title} />
        <meta property="og:title" content={`${title} | CloudMaster`} />
        <meta property="og:description" content={excerpt || title} />
        {post.coverImageUrl && <meta property="og:image" content={post.coverImageUrl} />}
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="article" />
        {post.publishedAt && <meta property="article:published_time" content={post.publishedAt} />}
        <link rel="canonical" href={siteUrl} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: title,
              description: excerpt,
              datePublished: post.publishedAt,
              image: post.coverImageUrl,
              author: { '@type': 'Organization', name: 'CloudMaster', url: 'https://cloudmasterit.com' },
              publisher: { '@type': 'Organization', name: 'CloudMaster', url: 'https://cloudmasterit.com' },
              mainEntityOfPage: { '@type': 'WebPage', '@id': siteUrl },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: '블로그', item: 'https://cloudmasterit.com/blog' },
                { '@type': 'ListItem', position: 2, name: title, item: siteUrl },
              ],
            },
          ],
        })}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 bg-background pt-20">
        <div className="container mx-auto px-4 max-w-5xl py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Link to="/blog" className="hover:text-accent transition-colors">{t('blog.title')}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground truncate max-w-[200px]">{title}</span>
          </nav>

          <div className="flex gap-8 items-start">
            {/* ── Main content ── */}
            <article className="flex-1 min-w-0">
              {/* Cover image */}
              {post.coverImageUrl && (
                <div className="w-full h-56 sm:h-72 rounded-xl overflow-hidden mb-6 bg-muted">
                  <img
                    src={post.coverImageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${providerColor}`}>
                  {providerLabel}
                </span>
                {post.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                    {post.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">{title}</h1>

              {/* Byline */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-6 pb-6 border-b border-border">
                {dateStr && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {dateStr}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {isKo ? `${readMin}분 읽기` : lang === 'ja' ? `${readMin}分` : lang === 'es' ? `${readMin} min de lectura` : lang === 'pt' ? `${readMin} min de leitura` : `${readMin} min read`}
                </span>

                {/* 언어 토글 — 번역된 언어 버전이 있는 포스트에만 표시 */}
                {(() => {
                  const langButtons = [
                    { code: 'ko', label: 'KO', hasContent: true },
                    { code: 'en', label: 'EN', hasContent: !!(post.titleEn || post.contentEn) },
                    { code: 'ja', label: 'JA', hasContent: !!(post.titleJa || post.contentJa) },
                    { code: 'es', label: 'ES', hasContent: !!(post.titleEs || post.contentEs) },
                    { code: 'pt', label: 'PT', hasContent: !!(post.titlePt || post.contentPt) },
                  ].filter(b => b.hasContent);
                  if (langButtons.length < 2) return null;
                  return (
                    <div className="flex items-center gap-0.5 rounded-full border border-border overflow-hidden text-[10px] font-semibold">
                      {langButtons.map(b => (
                        <button
                          key={b.code}
                          onClick={() => i18n.changeLanguage(b.code)}
                          className={`px-2.5 py-1 transition-colors ${
                            lang === b.code
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                <button
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-1 hover:text-accent transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {isKo ? '공유' : lang === 'ja' ? '共有' : lang === 'es' ? 'Compartir' : lang === 'pt' ? 'Compartilhar' : 'Share'}
                </button>
              </div>

              {/* Excerpt */}
              {excerpt && (
                <p className="text-base text-muted-foreground leading-relaxed mb-6 p-4 rounded-lg bg-muted/50 border border-border italic">
                  {excerpt}
                </p>
              )}

              {/* Markdown content */}
              <div className="prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={mdComponents as any}
                >
                  {content}
                </ReactMarkdown>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    {t('blog.tags')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <Link
                        key={tag}
                        to={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-muted hover:bg-accent/10 hover:text-accent border border-border transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference links */}
              {refLinks.length > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    {isKo ? '참고 자료' : lang === 'ja' ? '参考資料' : lang === 'es' ? 'Referencias' : lang === 'pt' ? 'Referências' : 'References'}
                  </p>
                  <ul className="space-y-1">
                    {refLinks.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {(lang === 'en' && link.name_en) || (lang === 'pt' && link.name_pt) || (lang === 'es' && link.name_es) || (lang === 'ja' && link.name_ja) || link.name || link.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Back link */}
              <div className="mt-10">
                <Link to="/blog">
                  <Button variant="outline" className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    {t('blog.backToList')}
                  </Button>
                </Link>
              </div>
            </article>

            {/* ── Sidebar ── */}
            <aside className="hidden lg:block w-56 shrink-0 sticky top-24 space-y-6">
              {/* Practice CTA */}
              {post.examId && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                  <p className="text-xs font-semibold text-accent mb-2">
                    {t('blog.relatedQuestions')}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {isKo ? '이 내용을 시험 문제로 확인해보세요'
                      : lang === 'ja' ? '練習問題でこの知識を確認しましょう'
                      : lang === 'es' ? 'Pon a prueba este conocimiento con preguntas prácticas'
                      : lang === 'pt' ? 'Teste esse conhecimento com questões práticas'
                      : 'Test this knowledge with practice questions'}
                  </p>
                  <Link to={`/exams`}>
                    <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {t('blog.practiceNow')}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Related posts */}
              {related.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-3">
                    {t('blog.relatedPosts')}
                  </p>
                  <div className="space-y-2">
                    {related.map(r => <RelatedPostCard key={r.id} post={r} />)}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* Mobile related posts */}
          {related.length > 0 && (
            <div className="lg:hidden mt-10 pt-8 border-t border-border">
              <p className="text-sm font-semibold mb-4">{t('blog.relatedPosts')}</p>
              <div className="space-y-2">
                {related.map(r => <RelatedPostCard key={r.id} post={r} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
