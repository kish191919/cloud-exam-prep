-- blog_posts 테이블에 일본어·스페인어·포르투갈어 컬럼 추가
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS title_ja   TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_ja TEXT,
  ADD COLUMN IF NOT EXISTS content_ja TEXT,
  ADD COLUMN IF NOT EXISTS title_es   TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_es TEXT,
  ADD COLUMN IF NOT EXISTS content_es TEXT,
  ADD COLUMN IF NOT EXISTS title_pt   TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_pt TEXT,
  ADD COLUMN IF NOT EXISTS content_pt TEXT;
