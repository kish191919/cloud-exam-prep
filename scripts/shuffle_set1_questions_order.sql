-- ============================================================
-- 세트 1 문제 순서 랜덤 셔플
-- set_id: 550e8400-e29b-41d4-a716-446655440001
-- 실행 전 현재 문제 수 확인 후 Supabase SQL Editor에서 실행하세요
-- ============================================================

-- ── 실행 전: 현재 문제 수 확인 ──
-- SELECT COUNT(*) FROM exam_set_questions
-- WHERE set_id = '550e8400-e29b-41d4-a716-446655440001';

-- ── sort_order를 1~65로 랜덤 재배치 ──
WITH shuffled AS (
  SELECT
    question_id,
    ROW_NUMBER() OVER (ORDER BY RANDOM()) AS new_order
  FROM exam_set_questions
  WHERE set_id = '550e8400-e29b-41d4-a716-446655440001'
)
UPDATE exam_set_questions esq
SET sort_order = s.new_order
FROM shuffled s
WHERE esq.set_id = '550e8400-e29b-41d4-a716-446655440001'
  AND esq.question_id = s.question_id;

-- ── 실행 후: 결과 확인 ──
SELECT esq.sort_order, q.id, LEFT(q.text, 40) AS question_preview
FROM exam_set_questions esq
JOIN questions q ON q.id = esq.question_id
WHERE esq.set_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY esq.sort_order;
