-- Add multilingual columns (Portuguese, Spanish, Japanese) to questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS text_pt TEXT,
  ADD COLUMN IF NOT EXISTS text_es TEXT,
  ADD COLUMN IF NOT EXISTS text_ja TEXT,
  ADD COLUMN IF NOT EXISTS explanation_pt TEXT,
  ADD COLUMN IF NOT EXISTS explanation_es TEXT,
  ADD COLUMN IF NOT EXISTS explanation_ja TEXT,
  ADD COLUMN IF NOT EXISTS key_points_pt TEXT,
  ADD COLUMN IF NOT EXISTS key_points_es TEXT,
  ADD COLUMN IF NOT EXISTS key_points_ja TEXT;

-- Add multilingual columns (Portuguese, Spanish, Japanese) to question_options table
ALTER TABLE question_options
  ADD COLUMN IF NOT EXISTS text_pt TEXT,
  ADD COLUMN IF NOT EXISTS text_es TEXT,
  ADD COLUMN IF NOT EXISTS text_ja TEXT,
  ADD COLUMN IF NOT EXISTS explanation_pt TEXT,
  ADD COLUMN IF NOT EXISTS explanation_es TEXT,
  ADD COLUMN IF NOT EXISTS explanation_ja TEXT;
