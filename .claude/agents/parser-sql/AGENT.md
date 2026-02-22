# Parser & SQL 서브에이전트

영문 AWS 시험 문제 텍스트를 파싱하고 재설계 결과를 Supabase에 직접 삽입하는 서브에이전트입니다.

## 역할

- **STEP 1:** 원문 텍스트 파싱 → `output/parsed_questions.json`
- **STEP 6:** `output/redesigned_questions.json` → Supabase REST API 직접 삽입

## 트리거

Main 오케스트레이터(CLAUDE.md)로부터 다음 두 가지 요청 중 하나를 수신할 때 실행됩니다:

1. **파싱 요청:** `{"task": "parse", "file_path": "input/batch1.txt", "exam_id": "...", "start_id": 166}`
2. **Supabase 삽입 요청:** `{"task": "insert_supabase", "set_id": "uuid", "exam_id": "...", "sort_order_start": 66}`

## STEP 1: 텍스트 파싱

### 절차

1. Main으로부터 받은 `file_path`를 그대로 `--input-file` 인자로 사용 (임시 파일 저장 불필요)
2. `parse_text.py` 실행:
   ```bash
   python3 .claude/skills/question-parser/scripts/parse_text.py \
     --input-file {file_path} \
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
  --input-file {file_path} \
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

## STEP 6: Supabase 직접 삽입

### 절차

1. Main으로부터 `set_id`, `exam_id`, `sort_order_start` 수신
2. `insert_supabase.py` 실행:
   ```bash
   python3 .claude/skills/sql-generator/scripts/insert_supabase.py \
     --input-file output/redesigned_questions.json \
     --set-id {set_id} \
     --sort-order-start {sort_order_start}
   ```
3. 삽입 결과(성공/실패 수, ID 범위)를 Main에 반환
4. 실패 문제가 있으면 failed_ids 목록을 포함하여 보고

### Main에 반환할 내용

```json
{
  "task": "insert_supabase",
  "success": true,
  "inserted_count": 3,
  "failed_count": 0,
  "failed_ids": [],
  "id_range": {"first": "awsaifc01-q166", "last": "awsaifc01-q168"}
}
```

> `--patch-en` 영문 백필이 필요한 경우에는 기존 `generate_sql.py --patch-en` 모드를 별도 사용한다.

## 에러 처리

- **파싱 실패:** 해당 문제 `status: "failed"` 마킹 후 나머지 문제 계속 처리
- **Supabase 삽입 실패:** 해당 문제를 failed_ids에 기록 후 나머지 계속 처리, 완료 후 Main에 보고
- **스크립트 실행 오류:** stderr 내용을 Main에 전달

## 중요 사항

- Main을 통하지 않고 Redesigner Agent를 직접 호출하지 않는다
- 스크립트 실행 전 Python 3.8+ 버전 확인: `python3 --version`
- 모든 파일 입출력은 프로젝트 루트 기준 상대 경로 사용
- `key_point_images` 컬럼은 SQL에 포함하지 않는다 (DB에 없음)
