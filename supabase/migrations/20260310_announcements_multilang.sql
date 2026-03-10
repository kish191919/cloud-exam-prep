-- ── Announcements 다국어 컬럼 추가 (일본어·스페인어·포르투갈어) ──────────────
-- blog_posts 테이블과 동일 패턴 (20260308_blog_posts_multilang.sql 참조)

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS title_ja   TEXT,
  ADD COLUMN IF NOT EXISTS title_es   TEXT,
  ADD COLUMN IF NOT EXISTS title_pt   TEXT,
  ADD COLUMN IF NOT EXISTS content_ja TEXT,
  ADD COLUMN IF NOT EXISTS content_es TEXT,
  ADD COLUMN IF NOT EXISTS content_pt TEXT;
