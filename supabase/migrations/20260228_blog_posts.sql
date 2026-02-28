-- ── blog_posts table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- URL & 분류
  slug            TEXT        UNIQUE NOT NULL,
  provider        TEXT        NOT NULL
                  CHECK (provider IN ('aws', 'gcp', 'azure', 'general')),
  exam_id         TEXT        REFERENCES exams(id) ON DELETE SET NULL,
  category        TEXT,

  -- 태그 (question_tags.tag 와 연결 키)
  tags            TEXT[]      NOT NULL DEFAULT '{}',

  -- 콘텐츠 (한/영 양방향)
  title           TEXT        NOT NULL,
  title_en        TEXT,
  excerpt         TEXT,
  excerpt_en      TEXT,
  content         TEXT        NOT NULL DEFAULT '',
  content_en      TEXT,

  -- 블로그 메타
  cover_image_url TEXT,
  read_time_minutes INT,
  ref_links       JSONB       NOT NULL DEFAULT '[]',

  -- 발행
  is_published    BOOLEAN     NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  is_pinned       BOOLEAN     NOT NULL DEFAULT FALSE,

  -- 관리
  author_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  view_count      INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_blog_posts_list
  ON blog_posts(is_published, is_pinned DESC, published_at DESC);

CREATE INDEX idx_blog_posts_provider
  ON blog_posts(provider, is_published);

CREATE INDEX idx_blog_posts_exam_id
  ON blog_posts(exam_id)
  WHERE exam_id IS NOT NULL;

CREATE INDEX idx_blog_posts_tags
  ON blog_posts USING GIN (tags);

-- updated_at trigger (reuses existing function from initial schema)
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read: only published posts
CREATE POLICY "Public read published blog posts"
  ON blog_posts FOR SELECT
  USING (is_published = TRUE);

-- Admin write: authenticated users only
CREATE POLICY "Authenticated insert blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update blog posts"
  ON blog_posts FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete blog posts"
  ON blog_posts FOR DELETE
  USING (auth.role() = 'authenticated');
