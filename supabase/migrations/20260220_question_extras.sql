-- Add key_points and ref_links columns to questions table
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS key_points TEXT;

ALTER TABLE questions
ADD COLUMN IF NOT EXISTS ref_links JSONB DEFAULT '[]';
