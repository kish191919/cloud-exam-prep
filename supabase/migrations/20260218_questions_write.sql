-- ══════════════════════════════════════════════════════
-- Allow authenticated (admin) users to write questions
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════

-- questions table write policies
CREATE POLICY "questions_auth_insert"
  ON questions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "questions_auth_update"
  ON questions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "questions_auth_delete"
  ON questions FOR DELETE TO authenticated USING (true);

-- question_options table write policies
CREATE POLICY "question_options_auth_insert"
  ON question_options FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "question_options_auth_update"
  ON question_options FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "question_options_auth_delete"
  ON question_options FOR DELETE TO authenticated USING (true);

-- question_tags table write policies
CREATE POLICY "question_tags_auth_insert"
  ON question_tags FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "question_tags_auth_update"
  ON question_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "question_tags_auth_delete"
  ON question_tags FOR DELETE TO authenticated USING (true);

-- Grant table-level privileges
GRANT INSERT, UPDATE, DELETE ON questions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON question_options TO authenticated;
GRANT INSERT, UPDATE, DELETE ON question_tags TO authenticated;

-- Also update the exam_list view to stay current after question changes
-- (No action needed — the view queries live data automatically)
