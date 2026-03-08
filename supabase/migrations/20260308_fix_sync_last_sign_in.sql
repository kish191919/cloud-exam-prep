-- sync_last_sign_in 트리거에 예외 처리 추가
-- handle_new_user와 동일한 패턴 (20260303_fix_handle_new_user.sql 참조)
-- 트리거 실패 시 auth.users UPDATE가 롤백되어 모든 로그인이 실패하는 버그 수정

CREATE OR REPLACE FUNCTION sync_last_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE profiles
    SET last_sign_in_at = NEW.last_sign_in_at
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE LOG 'sync_last_sign_in failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
