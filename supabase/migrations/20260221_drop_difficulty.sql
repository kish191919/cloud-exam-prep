-- difficulty 컬럼 삭제
-- 난이도 필드는 더 이상 사용하지 않으므로 questions 테이블에서 제거합니다.

ALTER TABLE questions DROP COLUMN IF EXISTS difficulty;
