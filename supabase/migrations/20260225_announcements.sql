-- ── announcements table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  category    TEXT        NOT NULL
                CHECK (category IN ('notice', 'info', 'tip', 'update')),
  title       TEXT        NOT NULL,
  title_en    TEXT,
  content     TEXT        NOT NULL,
  content_en  TEXT,
  exam_id     TEXT        REFERENCES exams(id) ON DELETE SET NULL,
  is_pinned   BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  author_id   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: public list query sorts by pinned-first, then date
CREATE INDEX idx_announcements_list
  ON announcements(is_active, is_pinned DESC, created_at DESC);

-- Index: category filter
CREATE INDEX idx_announcements_category
  ON announcements(category);

-- Index: optional exam association
CREATE INDEX idx_announcements_exam_id
  ON announcements(exam_id)
  WHERE exam_id IS NOT NULL;

-- updated_at trigger (reuses existing function from initial schema)
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read: only active rows
CREATE POLICY "Public read active announcements"
  ON announcements FOR SELECT
  USING (is_active = TRUE);

-- Admin write: authenticated users only
-- (admin identity is enforced client-side via VITE_ADMIN_EMAIL)
CREATE POLICY "Authenticated insert announcements"
  ON announcements FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update announcements"
  ON announcements FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete announcements"
  ON announcements FOR DELETE
  USING (auth.role() = 'authenticated');
