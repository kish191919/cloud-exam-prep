-- question_reports: 학생이 문제 오류를 신고하고 관리자가 처리하는 테이블

CREATE TABLE IF NOT EXISTS question_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email  TEXT,
  reason      TEXT NOT NULL CHECK (reason IN ('wrong_answer', 'unclear', 'typo', 'other')),
  comment     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_note  TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_question_reports_question_id ON question_reports(question_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_user_id     ON question_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_status      ON question_reports(status);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_question_reports_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_question_reports_updated_at
  BEFORE UPDATE ON question_reports
  FOR EACH ROW EXECUTE FUNCTION update_question_reports_updated_at();

-- RLS 활성화
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- 정책 1: 로그인한 사용자는 자신의 신고만 조회 가능
CREATE POLICY "users_select_own_reports"
  ON question_reports FOR SELECT
  USING (auth.uid() = user_id);

-- 정책 2: 누구나 신고 제출 가능 (비회원 포함)
CREATE POLICY "anyone_insert_reports"
  ON question_reports FOR INSERT
  WITH CHECK (true);

-- 정책 3: 관리자(service_role)는 모든 작업 가능 — service_role은 RLS 우회하므로 별도 정책 불필요

-- Realtime 활성화 (학생 알림용)
ALTER PUBLICATION supabase_realtime ADD TABLE question_reports;
