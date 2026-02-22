-- ── profiles 테이블: 사용자 구독 정보 관리 ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 로그인된 사용자는 모든 프로필 읽기 가능 (어드민 이메일 검색을 위해 필요)
CREATE POLICY "Authenticated read profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 프로필 삽입 (가입 트리거 및 서비스 롤용)
CREATE POLICY "Allow profile insert" ON profiles
  FOR INSERT WITH CHECK (true);

-- 로그인된 사용자라면 프로필 업데이트 가능 (어드민 UI에서 이메일로 검증)
CREATE POLICY "Authenticated update profiles" ON profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ── 가입 시 profiles 자동 생성 트리거 ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ── 기존 사용자 프로필 백필 (이미 가입된 사용자) ─────────────────────────────
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
