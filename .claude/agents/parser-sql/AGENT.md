# Parser & SQL 서브에이전트

영문 AWS 시험 문제 텍스트를 파싱하고 재설계 결과를 SQL 파일로 변환하는 서브에이전트입니다.

## 역할

- **STEP 1:** 원문 텍스트 파싱 → `output/parsed_questions.json`
- **STEP 6:** `output/redesigned_questions.json` → SQL 파일

## 트리거

Main 오케스트레이터(CLAUDE.md)로부터 다음 두 가지 요청 중 하나를 수신할 때 실행됩니다:

1. **파싱 요청:** `{"task": "parse", "text": "...", "exam_id": "...", "start_id": 166}`
2. **SQL 생성 요청:** `{"task": "generate_sql", "set_id": "uuid", "exam_id": "...", "sort_order_start": 66}`

## STEP 1: 텍스트 파싱

### 절차

1. Main으로부터 받은 텍스트를 임시 파일(`output/input_raw.txt`)에 저장
2. `parse_text.py` 실행:
   ```bash
   python3 .claude/skills/question-parser/scripts/parse_text.py \
     --input-file output/input_raw.txt \
     --output-file output/parsed_questions.json \
     --exam-id {exam_id} \
     --start-id {start_id}
   ```
3. `output/parsed_questions.json` 내용을 확인하여 검증
4. 파싱 실패 문제 목록(`status: "failed"`)을 추출하여 Main에 보고

### 체크포인트 재개

`--append` 플래그를 사용하면 기존 `parsed_questions.json`에서 `status: "completed"` 문제를 스킵:
```bash
python3 .claude/skills/question-parser/scripts/parse_text.py \
  --input-file output/input_raw.txt \
  --output-file output/parsed_questions.json \
  --exam-id {exam_id} \
  --start-id {start_id} \
  --append
```

### Main에 반환할 내용

```json
{
  "task": "parse",
  "success": true,
  "parsed_count": 3,
  "failed_count": 0,
  "failed_questions": [],
  "output_file": "output/parsed_questions.json"
}
```

## STEP 6: SQL 파일 생성

### 절차

1. Main으로부터 `set_id`, `exam_id`, `sort_order_start` 수신
2. `generate_sql.py` 실행:
   ```bash
   python3 .claude/skills/sql-generator/scripts/generate_sql.py \
     --input-file output/redesigned_questions.json \
     --set-id {set_id} \
     --exam-id {exam_id} \
     --output-dir output \
     --sort-order-start {sort_order_start}
   ```
3. 생성된 SQL 파일 경로를 Main에 반환
4. 실패 시 1회 재시도 → 재시도 후 실패 시 Main에 에스컬레이션 보고

### Main에 반환할 내용

```json
{
  "task": "generate_sql",
  "success": true,
  "output_file": "output/aws-aif-c01-20260220-001.sql",
  "question_count": 3,
  "id_range": {"first": "awsaifc01-q166", "last": "awsaifc01-q168"}
}
```

## 에러 처리

- **파싱 실패:** 해당 문제 `status: "failed"` 마킹 후 나머지 문제 계속 처리
- **SQL 생성 실패:** 1회 재시도 → 실패 시 에스컬레이션
- **스크립트 실행 오류:** stderr 내용을 Main에 전달

## 중요 사항

- Main을 통하지 않고 Redesigner Agent를 직접 호출하지 않는다
- 스크립트 실행 전 Python 3.8+ 버전 확인: `python3 --version`
- 모든 파일 입출력은 프로젝트 루트 기준 상대 경로 사용
- `key_point_images` 컬럼은 SQL에 포함하지 않는다 (DB에 없음)
