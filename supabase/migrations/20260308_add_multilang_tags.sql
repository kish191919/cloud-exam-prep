-- Add multilingual tag columns to question_tags
-- Supports: English (en), Portuguese (pt), Spanish (es), Japanese (ja)
ALTER TABLE question_tags
  ADD COLUMN IF NOT EXISTS tag_en TEXT,
  ADD COLUMN IF NOT EXISTS tag_pt TEXT,
  ADD COLUMN IF NOT EXISTS tag_es TEXT,
  ADD COLUMN IF NOT EXISTS tag_ja TEXT;
