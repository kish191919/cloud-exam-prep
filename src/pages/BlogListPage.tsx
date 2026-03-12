import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Pin, Clock, Calendar, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBlogPosts, getExamIdsForProvider } from '@/services/blogService';
import type { BlogPost, BlogProvider } from '@/services/blogService';

const PAGE_SIZE = 12;

const EXAM_NAMES: Record<string, string> = {
  'aws-aif-c01': 'AI Practitioner',
  'aws-clf-c02': 'Cloud Practitioner',
  'aws-clf-c01': 'Cloud Practitioner',
  'aws-saa-c03': 'Solutions Architect Associate',
  'aws-saa-c02': 'Solutions Architect Associate',
  'aws-sap-c02': 'Solutions Architect Professional',
  'aws-dva-c02': 'Developer Associate',
  'aws-dea-c01': 'Data Engineer Associate',
  'aws-soa-c02': 'SysOps Administrator',
  'aws-mls-c01': 'Machine Learning Specialty',
  'gcp-ace':     'Associate Cloud Engineer',
  'gcp-pde':     'Professional Data Engineer',
  'az-900':      'AZURE Fundamentals',
  'az-104':      'AZURE Administrator',
  'az-204':      'AZURE Developer',
};

function getExamLabel(examId: string): string {
  return EXAM_NAMES[examId] ?? examId.toUpperCase();
}

const PROVIDER_CONFIG: Record<BlogProvider | 'all', {
  label: string; color: string; bg: string; border: string;
}> = {
  all:     { label: '전체',   color: 'text-foreground',            bg: 'bg-muted',                    border: 'border-muted-foreground/30' },
  aws:     { label: 'AWS',    color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-300 dark:border-orange-700' },
  gcp:     { label: 'GCP',    color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950/30',     border: 'border-blue-300 dark:border-blue-700' },
  azure:   { label: 'AZURE',  color: 'text-sky-600 dark:text-sky-400',      bg: 'bg-sky-50 dark:bg-sky-950/30',       border: 'border-sky-300 dark:border-sky-700' },
  general: { label: '일반',   color: 'text-purple-600 dark:text-purple-400',bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-300 dark:border-purple-700' },
};

function BlogCard({ post }: { post: BlogPost }) {
  const { i18n } = useTranslation('pages');
  const lang = i18n.language;
  const isKo = lang === 'ko';

  const title = (
    lang === 'es' && post.titleEs ? post.titleEs :
    lang === 'pt' && post.titlePt ? post.titlePt :
    lang !== 'ko' && post.titleEn ? post.titleEn :
    post.title
  );
  const excerpt = (
    lang === 'es' && post.excerptEs ? post.excerptEs :
    lang === 'pt' && post.excerptPt ? post.excerptPt :
    lang !== 'ko' && post.excerptEn ? post.excerptEn :
    (post.excerpt ?? '')
  );
  const readMin = post.readTimeMinutes ?? 1;
  const providerCfg = PROVIDER_CONFIG[post.provider];
  const dateLocale = isKo ? 'ko-KR' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : 'en-US';
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(dateLocale, {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '';

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-accent/30 transition-all"
    >
      {/* Cover image */}
      {post.coverImageUrl ? (
        <div className="w-full h-40 overflow-hidden shrink-0 bg-muted">
          <img
            src={post.coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className={`w-full h-40 shrink-0 flex items-center justify-center ${providerCfg.bg}`}>
          <BookOpen className={`h-10 w-10 opacity-30 ${providerCfg.color}`} />
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Provider badge + pinned */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${providerCfg.bg} ${providerCfg.color} ${providerCfg.border}`}>
            {providerCfg.label}
          </span>
          {post.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
              {post.category}
            </span>
          )}
          {post.isPinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
              <Pin className="h-2.5 w-2.5" />
              {isKo ? '고정' : 'Pinned'}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2 flex-1">
          {title}
        </h3>

        {excerpt && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground/60">+{post.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {date}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isKo ? `${readMin}분` : `${readMin}m`}
          </span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const BlogListPage = () => {
  const { t, i18n } = useTranslation('pages');
  const isKo = i18n.language === 'ko';
  const [searchParams, setSearchParams] = useSearchParams();
  const provider = (searchParams.get('provider') ?? 'all') as BlogProvider | 'all';
  const examId = searchParams.get('exam_id') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [availableExams, setAvailableExams] = useState<string[]>([]);

  useEffect(() => {
    if (provider === 'all') {
      setAvailableExams([]);
      return;
    }
    getExamIdsForProvider(provider).then(setAvailableExams).catch(() => setAvailableExams([]));
  }, [provider]);

  useEffect(() => {
    setLoading(true);
    getBlogPosts({
      provider: provider !== 'all' ? provider : undefined,
      examId:   examId || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
      .then(({ data, count }) => { setPosts(data); setTotal(count); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [provider, examId, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pinned = posts.filter(p => p.isPinned);
  const regular = posts.filter(p => !p.isPinned);

  const setProvider = (prov: string) => {
    const next = new URLSearchParams();
    if (prov !== 'all') next.set('provider', prov);
    // exam_id는 provider 변경 시 초기화
    setSearchParams(next);
  };

  const setExamId = (eid: string) => {
    const next = new URLSearchParams(searchParams);
    if (eid) {
      next.set('exam_id', eid);
    } else {
      next.delete('exam_id');
    }
    next.delete('page');
    setSearchParams(next);
  };

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  const providerTabs = ['all', 'aws', 'gcp', 'azure', 'general'] as const;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t('blog.seoTitle')}</title>
        <meta name="description" content={t('blog.seoDesc')} />
        <meta property="og:title" content={t('blog.seoTitle')} />
        <meta property="og:description" content={t('blog.seoDesc')} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cloudmasterit.com/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <link rel="canonical" href="https://cloudmasterit.com/blog" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'CloudMaster 블로그 - AWS·GCP·AZURE 학습 자료',
          description: 'AWS, GCP, AZURE 클라우드 자격증 학습을 위한 도메인 가이드, 서비스 비교, 시험 전략 아티클',
          url: 'https://cloudmasterit.com/blog',
          publisher: { '@type': 'Organization', name: 'CloudMaster', url: 'https://cloudmasterit.com' },
        })}</script>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <div className="pt-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950/50 dark:via-blue-950/20 dark:to-indigo-950/10 border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-accent/15">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <h1 className="text-2xl font-bold">{t('blog.title')}</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-11">{t('blog.subtitle')}</p>
        </div>
      </div>

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 max-w-5xl py-8">

          {/* Provider tabs */}
          <div className="flex flex-wrap gap-2 mb-7">
            {providerTabs.map(prov => {
              const cfg = PROVIDER_CONFIG[prov];
              const isActive = provider === prov;
              const label = prov === 'all'
                ? (isKo ? '전체' : 'All')
                : prov === 'general'
                ? (isKo ? '일반' : 'General')
                : prov.toUpperCase();
              return (
                <button
                  key={prov}
                  onClick={() => setProvider(prov)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isActive
                      ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                      : `border-border text-muted-foreground hover:border-accent/40 hover:text-foreground bg-card`
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Certification sub-tabs */}
          {provider !== 'all' && availableExams.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5 pl-1">
              <button
                onClick={() => setExamId('')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  !examId
                    ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                    : 'border-border text-muted-foreground hover:border-accent/40 hover:text-foreground bg-card'
                }`}
              >
                {isKo ? `전체 ${provider.toUpperCase()}` : `All ${provider.toUpperCase()}`}
              </button>
              {availableExams.map(eid => (
                <button
                  key={eid}
                  onClick={() => setExamId(eid)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    examId === eid
                      ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                      : 'border-border text-muted-foreground hover:border-accent/40 hover:text-foreground bg-card'
                  }`}
                >
                  {getExamLabel(eid)}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-xl border border-border bg-muted animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 opacity-30" />
              </div>
              <p className="font-medium mb-1">{t('blog.noResults')}</p>
            </div>
          ) : (
            <>
              {/* Pinned */}
              {pinned.length > 0 && (
                <div className="space-y-2 mb-6">
                  {pinned.map(post => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group flex items-center gap-3 p-3.5 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-accent/15 shrink-0">
                        <Pin className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-accent mr-2">{isKo ? '고정' : 'Pinned'}</span>
                        <span className="text-sm font-medium truncate">
                          {!isKo && post.titleEn ? post.titleEn : post.title}
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-accent/60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {regular.map(post => <BlogCard key={post.id} post={post} />)}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {isKo ? '이전' : 'Prev'}
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                {isKo ? '다음' : 'Next'}
              </Button>
            </div>
          )}

          {/* CTA */}
          {!loading && posts.length > 0 && (
            <div className="mt-12 rounded-2xl bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm mb-1">
                  {isKo ? '공부한 내용을 실전 CBT로 확인해보세요' : 'Test what you learned with real CBT questions'}
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
                  {isKo ? '문제 풀기' : 'Start Practice'}
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

export default BlogListPage;
