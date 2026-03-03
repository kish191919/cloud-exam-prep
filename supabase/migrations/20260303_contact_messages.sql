-- contact_messages: 회원이 관리자에게 문의/건의/불편사항을 전달하는 테이블

CREATE TABLE IF NOT EXISTS contact_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email   TEXT NOT NULL,
  user_name    TEXT,
  category     TEXT NOT NULL CHECK (category IN ('complaint', 'suggestion', 'inquiry', 'other')),
  subject      TEXT NOT NULL,
  message      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'unread'
               CHECK (status IN ('unread', 'read', 'responded', 'closed')),
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id    ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status     ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_contact_messages_updated_at();

-- RLS 활성화
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 정책 1: 로그인한 사용자는 자신의 문의만 조회 가능
CREATE POLICY "users_select_own_contact"
  ON contact_messages FOR SELECT
  USING (auth.uid() = user_id);

-- 정책 2: 로그인한 회원만 자신 명의로 제출 가능
CREATE POLICY "users_insert_contact"
  ON contact_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 정책 3: 관리자(service_role)는 모든 작업 가능 — service_role은 RLS 우회하므로 별도 정책 불필요

-- Realtime 활성화 (관리자 신규 문의 알림, 회원 답변 알림용)
ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
