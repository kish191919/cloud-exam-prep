-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  certification TEXT NOT NULL CHECK (certification IN ('AWS', 'GCP', 'Azure')),
  description TEXT NOT NULL,
  time_limit_minutes INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  correct_option_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty IN (1, 2, 3)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create question_options table
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  UNIQUE(question_id, option_id)
);

-- Create question_tags table
CREATE TABLE IF NOT EXISTS question_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE(question_id, tag)
);

-- Create exam_sessions table
CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  exam_title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'paused', 'submitted')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paused_elapsed INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  time_limit_sec INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  bookmarks TEXT[] NOT NULL DEFAULT '{}',
  current_index INTEGER NOT NULL DEFAULT 0,
  score INTEGER,
  correct_count INTEGER,
  total_count INTEGER,
  tag_breakdown JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_question_id ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag ON question_tags(tag);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam_id ON exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON exam_sessions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_sessions_updated_at
  BEFORE UPDATE ON exam_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to exams, questions, options, and tags
CREATE POLICY "Allow public read access to exams"
  ON exams FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to question_options"
  ON question_options FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to question_tags"
  ON question_tags FOR SELECT
  USING (true);

-- Create policies for exam_sessions
-- Allow anonymous users to create sessions (for guests)
CREATE POLICY "Allow anonymous insert on exam_sessions"
  ON exam_sessions FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own sessions (including anonymous)
CREATE POLICY "Allow users to read own sessions"
  ON exam_sessions FOR SELECT
  USING (
    user_id IS NULL OR
    user_id = auth.uid()
  );

-- Allow users to update their own sessions
CREATE POLICY "Allow users to update own sessions"
  ON exam_sessions FOR UPDATE
  USING (
    user_id IS NULL OR
    user_id = auth.uid()
  );

-- Allow users to delete their own sessions
CREATE POLICY "Allow users to delete own sessions"
  ON exam_sessions FOR DELETE
  USING (
    user_id IS NULL OR
    user_id = auth.uid()
  );

-- Create view for exam with question count
CREATE OR REPLACE VIEW exam_list AS
SELECT
  e.*,
  COUNT(q.id) AS question_count
FROM exams e
LEFT JOIN questions q ON e.id = q.exam_id
GROUP BY e.id, e.title, e.code, e.certification, e.description,
         e.time_limit_minutes, e.passing_score, e.version,
         e.created_at, e.updated_at;

-- Grant access to the view
GRANT SELECT ON exam_list TO anon, authenticated;
