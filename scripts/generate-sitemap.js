#!/usr/bin/env node
/**
 * generate-sitemap.js
 * Supabase에서 발행된 blog_posts를 조회하여 public/sitemap.xml을 동적으로 생성합니다.
 *
 * 실행: node scripts/generate-sitemap.js
 * 또는: npm run sitemap
 *
 * 환경변수: .env 파일의 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 사용
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// .env 수동 파싱 (dotenv 없이)
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env 파일이 없습니다. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정하세요.');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)\s*=\s*(.+)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = 'https://cloudmasterit.com';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL(또는 VITE_SUPABASE_URL) 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.');
  process.exit(1);
}

const CERT_LANDING_IDS = [
  'aws-aif-c01',
  'aws-clf-c02',
  'aws-dea-c01',
  'aws-saa-c03',
  'azure-az-900',
];

async function fetchPublishedSlugs() {
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,published_at&is_published=eq.true&order=published_at.desc`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase fetch error: ${res.status}`);
  return res.json();
}

function toISO(dateStr) {
  return dateStr ? new Date(dateStr).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
}

function buildSitemap(posts) {
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/',                priority: '1.0', changefreq: 'weekly',  lastmod: today },
    { url: '/exams',           priority: '0.9', changefreq: 'weekly',  lastmod: today },
    { url: '/blog',            priority: '0.9', changefreq: 'daily',   lastmod: today },
    { url: '/certifications',  priority: '0.8', changefreq: 'monthly', lastmod: today },
    ...CERT_LANDING_IDS.map(id => ({ url: `/cert/${id}`, priority: '0.9', changefreq: 'monthly', lastmod: today })),
    { url: '/board',           priority: '0.7', changefreq: 'weekly',  lastmod: today },
    { url: '/review',          priority: '0.7', changefreq: 'weekly',  lastmod: today },
  ];

  const staticUrls = staticPages.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  const blogUrls = posts.map(p => `  <url>
    <loc>${SITE_URL}/blog/${p.slug}</loc>
    <lastmod>${toISO(p.published_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${blogUrls}
</urlset>`;
}

async function main() {
  console.log('Supabase에서 발행된 블로그 포스트 조회 중...');
  const posts = await fetchPublishedSlugs();
  console.log(`  → ${posts.length}개 포스트 발견`);

  const sitemap = buildSitemap(posts);
  const outPath = path.join(ROOT, 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, sitemap, 'utf8');
  console.log(`sitemap.xml 생성 완료: ${outPath}`);
  const staticCount = 6 + CERT_LANDING_IDS.length;
  console.log(`  총 URL: ${staticCount + posts.length}개 (정적 ${staticCount}개 + 블로그 ${posts.length}개)`);
}

main().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});
