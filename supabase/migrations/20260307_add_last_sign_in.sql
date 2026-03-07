-- profiles 테이블에 마지막 접속 시간 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;
