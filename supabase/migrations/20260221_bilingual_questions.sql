-- Add English language columns to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS text_en TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation_en TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS key_points_en TEXT;

-- Add English language columns to question_options table
ALTER TABLE question_options ADD COLUMN IF NOT EXISTS text_en TEXT;
ALTER TABLE question_options ADD COLUMN IF NOT EXISTS explanation_en TEXT;
