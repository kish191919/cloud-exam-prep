-- question_reports: user_name 컬럼 추가 + 신고 로그인 필수화

-- 1. user_name 컬럼 추가
ALTER TABLE question_reports ADD COLUMN IF NOT EXISTS user_name TEXT;

-- 2. RLS: 누구나 삽입 가능 → 로그인한 사용자만 삽입 가능으로 변경
DROP POLICY IF EXISTS "anyone_insert_reports" ON question_reports;

CREATE POLICY "auth_insert_reports"
  ON question_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
