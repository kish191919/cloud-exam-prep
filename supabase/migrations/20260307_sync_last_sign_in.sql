-- auth.users.last_sign_in_at → profiles.last_sign_in_at 동기화

-- 1. 기존 사용자 즉시 백필
UPDATE profiles p
SET last_sign_in_at = u.last_sign_in_at
FROM auth.users u
WHERE p.id = u.id
  AND u.last_sign_in_at IS NOT NULL;

-- 2. 트리거 함수: auth.users 업데이트 시 profiles 자동 동기화
CREATE OR REPLACE FUNCTION sync_last_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE profiles
    SET last_sign_in_at = NEW.last_sign_in_at
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
CREATE TRIGGER on_auth_user_sign_in
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE sync_last_sign_in();
