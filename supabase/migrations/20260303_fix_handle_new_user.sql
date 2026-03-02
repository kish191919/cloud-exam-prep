-- handle_new_user 트리거에 예외 처리 추가
-- profiles INSERT 실패 시에도 auth.users 생성이 롤백되지 않도록 수정
-- 원인: profiles 테이블 스키마 불일치 또는 기타 DB 오류로 인한 트리거 실패
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE LOG 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
