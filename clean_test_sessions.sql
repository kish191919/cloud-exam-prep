-- 오래된 익명 세션(user_id가 null인 세션) 확인
SELECT COUNT(*) as anonymous_session_count 
FROM exam_sessions 
WHERE user_id IS NULL;

-- 필요하다면 오래된 익명 세션 삭제 (선택사항)
-- DELETE FROM exam_sessions WHERE user_id IS NULL;
