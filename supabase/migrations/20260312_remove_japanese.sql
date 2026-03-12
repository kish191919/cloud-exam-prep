-- Remove Japanese language columns from all tables
-- Run this in Supabase Dashboard SQL Editor

-- questions table
ALTER TABLE questions
  DROP COLUMN IF EXISTS text_ja,
  DROP COLUMN IF EXISTS explanation_ja,
  DROP COLUMN IF EXISTS key_points_ja;

-- question_options table
ALTER TABLE question_options
  DROP COLUMN IF EXISTS text_ja,
  DROP COLUMN IF EXISTS explanation_ja;

-- question_tags table
ALTER TABLE question_tags
  DROP COLUMN IF EXISTS tag_ja;

-- blog_posts table
ALTER TABLE blog_posts
  DROP COLUMN IF EXISTS title_ja,
  DROP COLUMN IF EXISTS excerpt_ja,
  DROP COLUMN IF EXISTS content_ja;

-- announcements table
ALTER TABLE announcements
  DROP COLUMN IF EXISTS title_ja,
  DROP COLUMN IF EXISTS content_ja;
