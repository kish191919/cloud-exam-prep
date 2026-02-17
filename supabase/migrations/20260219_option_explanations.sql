-- Add per-option explanation column to question_options
ALTER TABLE question_options
  ADD COLUMN IF NOT EXISTS explanation TEXT;
