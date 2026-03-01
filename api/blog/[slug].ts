import type { IncomingMessage, ServerResponse } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';

const BOT_PATTERN =
  /Googlebot|Yeti|Baiduspider|bingbot|DuckDuckBot|facebookexternalhit|Twitterbot|LinkedInBot|Slack|Discord|WhatsApp|KakaoTalk|Kakaostory|Line|Telegram|Pinterest|redditbot/i;

const DEFAULT_OG_IMAGE =
  'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/28d758b7-0e01-4fd3-b21c-669a09eb1f3e/id-preview-aae6d66f--3a6ba45c-ae84-4153-bd49-4912d78332fc.lovable.app-1771245809132.png';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/`{1,3}[^`]+`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function readTemplate(): string {
  const candidates = [
    join(process.cwd(), 'dist', 'index.html'),
    join(__dirname, '..', '..', 'dist', 'index.html'),
  ];
  for (const p of candidates) {
    try {
      return readFileSync(p, 'utf-8');
    } catch {
      // try next
    }
  }
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CloudMaster</title></head><body><div id="root"></div></body></html>';
}

function extractSlug(url: string): string {
  const path = url.split('?')[0];
  const match = path.match(/\/blog\/(.+)$/);
  return match ? decodeURIComponent(match[1].replace(/\/$/, '')) : '';
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const slug = extractSlug(req.url ?? '');
  const ua = (req.headers['user-agent'] as string) ?? '';

  // 일반 사용자: SPA index.html 그대로 반환
  if (!BOT_PATTERN.test(ua)) {
    const html = readTemplate();
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    });
    res.end(html);
    return;
  }

  // 봇: Supabase에서 포스트 메타 조회 → SSR HTML 반환
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !slug) {
    const html = readTemplate();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  try {
    const apiResp = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=title,excerpt,content,cover_image_url,published_at,tags&is_published=eq.true&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    const posts = (await apiResp.json()) as Array<{
      title: string;
      excerpt?: string;
      content?: string;
      cover_image_url?: string;
      published_at?: string;
      tags?: string[];
    }>;

    const post = posts?.[0];

    if (!post) {
      // 포스트 없음: SPA 폴백
      const html = readTemplate();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    const title = post.title;
    const excerpt = post.excerpt ?? '';
    const coverImage = post.cover_image_url ?? DEFAULT_OG_IMAGE;
    const siteUrl = `https://cloudmasterit.com/blog/${slug}`;
    const publishedAt = post.published_at ?? new Date().toISOString();

    const contentPreview = post.content
      ? stripMarkdown(post.content).substring(0, 2000)
      : '';

    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: excerpt || title,
      datePublished: publishedAt,
      image: coverImage,
      url: siteUrl,
      inLanguage: 'ko',
      publisher: {
        '@type': 'Organization',
        name: 'CloudMaster',
        url: 'https://cloudmasterit.com',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': siteUrl,
      },
    });

    const ssrHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | CloudMaster</title>
  <meta name="description" content="${escapeHtml(excerpt || title)}">
  <meta property="og:title" content="${escapeHtml(title)} | CloudMaster">
  <meta property="og:description" content="${escapeHtml(excerpt || title)}">
  <meta property="og:image" content="${escapeHtml(coverImage)}">
  <meta property="og:url" content="${siteUrl}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:site_name" content="CloudMaster">
  <meta property="article:published_time" content="${publishedAt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)} | CloudMaster">
  <meta name="twitter:description" content="${escapeHtml(excerpt || title)}">
  <meta name="twitter:image" content="${escapeHtml(coverImage)}">
  <link rel="canonical" href="${siteUrl}">
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <article>
    <h1>${escapeHtml(title)}</h1>
    ${excerpt ? `<p><em>${escapeHtml(excerpt)}</em></p>` : ''}
    ${contentPreview ? `<div>${escapeHtml(contentPreview)}</div>` : ''}
  </article>
</body>
</html>`;

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      Vary: 'User-Agent',
    });
    res.end(ssrHtml);
  } catch (err) {
    console.error('[blog-ssr] error:', err);
    const html = readTemplate();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
}
