-- profiles.created_at을 auth.users.created_at(실제 가입 시점)으로 수정
-- 원인: 20260222_subscription_profiles.sql의 백필이 created_at을 명시하지 않아
--       마이그레이션 실행일(2026.02.22)로 잘못 설정됨
UPDATE profiles p
SET created_at = u.created_at
FROM auth.users u
WHERE p.id = u.id
  AND u.created_at IS NOT NULL;
