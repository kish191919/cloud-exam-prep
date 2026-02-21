# sql-generator 스킬

`redesigned_questions.json`을 읽어 Supabase에 바로 실행 가능한 SQL INSERT 파일을 생성합니다.

## 역할

- STEP 6: `redesigned_questions.json` → `{exam_id}-YYYYMMDD-{batch:03d}.sql`

## 입력

- `output/redesigned_questions.json` 경로
- `set_id` (exam_sets UUID)
- `exam_id` (예: `aws-aif-c01`)
- `sort_order_start` (exam_set_questions의 sort_order 시작값)

## 출력

`output/{exam_id}-YYYYMMDD-{batch:03d}.sql`

- 같은 날짜에 여러 번 실행 시 배치번호 자동 증가 (001, 002, ...)
- 항상 새 파일 생성 (기존 파일 덮어쓰기 없음)

## 실행 방법

```bash
python3 .claude/skills/sql-generator/scripts/generate_sql.py \
  --input-file output/redesigned_questions.json \
  --set-id 550e8400-e29b-41d4-a716-446655440001 \
  --exam-id aws-aif-c01 \
  --output-dir output \
  --sort-order-start 66
```

## 생성되는 INSERT 순서 (문제당)

```sql
-- 1. questions 테이블
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, key_points, ref_links)
VALUES (...);

-- 2. question_options 테이블 (항상 4개)
INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  (...), (...), (...), (...);

-- 3. question_tags 테이블 (1개)
INSERT INTO question_tags (question_id, tag) VALUES (...);

-- 4. exam_set_questions 테이블
INSERT INTO exam_set_questions (set_id, question_id, sort_order) VALUES (...);
```

## 중요 사항

- ⚠️ `key_point_images` 컬럼 미포함 (DB에 존재하지 않음)
- `ref_links`는 `::jsonb` 캐스트 사용
- 작은따옴표(') 포함 텍스트는 `''`로 이스케이프
- 참조용 샘플: `docs/sample.sql`

## 검증

SQL 파일 생성 후:
1. 파일이 정상적으로 생성되었는지 확인
2. 생성된 파일을 열어 문법 오류 여부 육안 확인
3. INSERT 구문 수가 (문제 수 × 4)개인지 확인

생성 실패 시 1회 재시도. 재시도 후 실패 시 Main에 에스컬레이션.
