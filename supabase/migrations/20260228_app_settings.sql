-- app_settings: 전역 앱 설정 (이벤트, 기능 플래그 등)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본값: 무료 이벤트 비활성
INSERT INTO app_settings (key, value)
VALUES ('free_access_event', '{"expires_at": null}')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (이벤트 상태는 비로그인 사용자에게도 적용)
CREATE POLICY "Public read app_settings"
  ON app_settings FOR SELECT USING (true);

-- 인증된 사용자만 수정 (실제 admin 검증은 앱 레이어에서 수행)
CREATE POLICY "Auth update app_settings"
  ON app_settings FOR UPDATE USING (auth.role() = 'authenticated');
