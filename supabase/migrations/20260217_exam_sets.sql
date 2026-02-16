-- ══════════════════════════════════════════════════════
-- exam_sets & exam_set_questions migration
-- Run this entire script in Supabase SQL Editor
-- ══════════════════════════════════════════════════════

-- 1. exam_sets table
CREATE TABLE IF NOT EXISTS exam_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full', 'sample')),
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Junction table: sets ↔ questions (many-to-many)
CREATE TABLE IF NOT EXISTS exam_set_questions (
  set_id UUID NOT NULL REFERENCES exam_sets(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (set_id, question_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exam_sets_exam_id ON exam_sets(exam_id);
CREATE INDEX IF NOT EXISTS idx_esq_set_id ON exam_set_questions(set_id);
CREATE INDEX IF NOT EXISTS idx_esq_question_id ON exam_set_questions(question_id);

-- 3. RLS
ALTER TABLE exam_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_set_questions ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "exam_sets_public_read" ON exam_sets;
CREATE POLICY "exam_sets_public_read"
  ON exam_sets FOR SELECT USING (true);

DROP POLICY IF EXISTS "exam_set_questions_public_read" ON exam_set_questions;
CREATE POLICY "exam_set_questions_public_read"
  ON exam_set_questions FOR SELECT USING (true);

-- Authenticated write (admin operations)
DROP POLICY IF EXISTS "exam_sets_auth_insert" ON exam_sets;
CREATE POLICY "exam_sets_auth_insert"
  ON exam_sets FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "exam_sets_auth_update" ON exam_sets;
CREATE POLICY "exam_sets_auth_update"
  ON exam_sets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "exam_sets_auth_delete" ON exam_sets;
CREATE POLICY "exam_sets_auth_delete"
  ON exam_sets FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "exam_set_questions_auth_all" ON exam_set_questions;
CREATE POLICY "exam_set_questions_auth_all"
  ON exam_set_questions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 4. View: sets with question count
CREATE OR REPLACE VIEW exam_sets_view AS
SELECT
  es.id,
  es.exam_id,
  es.name,
  es.type,
  es.description,
  es.sort_order,
  es.is_active,
  es.created_at,
  COALESCE(COUNT(esq.question_id), 0)::INTEGER AS question_count
FROM exam_sets es
LEFT JOIN exam_set_questions esq ON esq.set_id = es.id
GROUP BY es.id, es.exam_id, es.name, es.type, es.description,
         es.sort_order, es.is_active, es.created_at;

GRANT SELECT ON exam_sets TO anon, authenticated;
GRANT SELECT ON exam_set_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON exam_sets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON exam_set_questions TO authenticated;
GRANT SELECT ON exam_sets_view TO anon, authenticated;

-- ══════════════════════════════════════════════════════
-- Seed data: AIF-C01 exam sets
-- ══════════════════════════════════════════════════════
INSERT INTO exam_sets (id, exam_id, name, type, description, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'aws-aif-c01', '세트 1', 'full',   'AIF-C01 연습 문제 전체 세트 (10문제)', 0),
  ('550e8400-e29b-41d4-a716-446655440002', 'aws-aif-c01', '샘플 세트', 'sample', '시험 체험용 샘플 세트 (5문제)', 1)
ON CONFLICT (id) DO NOTHING;

-- Set 1: all 10 questions
INSERT INTO exam_set_questions (set_id, question_id, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'aif-q1',  1),
  ('550e8400-e29b-41d4-a716-446655440001', 'aif-q2',  2),
  ('550e8400-e29b-41d4-a716-446655440001', 'aif-q3',  3),
  ('550e8400-e29b-41d4-a716-446655440001', 'aif-q4',  4),
  ('550e8400-e29b-41d4-a716-446655440001', 'aif-q5',  5),
  ('550e8400-e29b-41d4-a716-446655440001', 'aif-q6',  6),
  ('550e8400-e29b-41d4-a716-446655440001', 'aif-q7',  7),
  ('550e8400-e29b-41d4-a716-446655440001', 'aif-q8',  8),
  ('550e8400-e29b-41d4-a716-446655440001', 'aif-q9',  9),
  ('550e8400-e29b-41d4-a716-446655440001', 'aif-q10', 10)
ON CONFLICT DO NOTHING;

-- Sample set: first 5 questions
INSERT INTO exam_set_questions (set_id, question_id, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'aif-q1', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'aif-q2', 2),
  ('550e8400-e29b-41d4-a716-446655440002', 'aif-q3', 3),
  ('550e8400-e29b-41d4-a716-446655440002', 'aif-q4', 4),
  ('550e8400-e29b-41d4-a716-446655440002', 'aif-q5', 5)
ON CONFLICT DO NOTHING;
