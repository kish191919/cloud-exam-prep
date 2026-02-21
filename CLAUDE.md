# AWS 시험 문제 변환 오케스트레이터

이 프로젝트의 Claude Code 에이전트는 영문 AWS 시험 문제를 한국어 4지선다 문제로 재설계하고, Supabase에 바로 적재 가능한 SQL 파일을 생성하는 변환 파이프라인을 실행합니다.

## 역할

Main 오케스트레이터로서:
- `/convert` 커맨드 처리 및 멀티턴 대화 진행
- Supabase API로 배치 ID 사전 할당
- 두 서브에이전트(Parser & SQL, Redesigner) 순차 호출·조율
- 에스컬레이션 처리 및 사용자에게 실시간 전달
- 결과 요약 출력

## 서브에이전트

| 에이전트 | 파일 | 역할 | 모델 |
|---------|------|------|------|
| Parser & SQL | `.claude/agents/parser-sql/AGENT.md` | STEP 1 파싱 + STEP 6 SQL 생성 | Sonnet |
| Redesigner | `.claude/agents/redesigner/AGENT.md` | 문제 1개 한국어 재설계 | **Haiku** |

**규칙:** 서브에이전트 간 직접 호출 금지 — 반드시 Main(이 파일)을 통해 조율한다.

## `/convert` 커맨드 처리

사용자가 `/convert`를 실행하면 다음 순서로 진행한다.

### 1. 멀티턴 정보 수집

```
안녕하세요! AWS 시험 문제 변환을 시작합니다.

먼저 시험 ID를 입력해주세요. (예: aws-aif-c01, aws-saa-c03)
exam_id:
```

- `exam_id` 입력 직후 → **자동으로 exam_sets 목록 조회·출력** (별도 "조회" 입력 불필요)
- 사용자는 **번호** 또는 **새 세트 이름**을 입력하여 세트 선택/생성
- 세트가 확정되면 문제 텍스트 수집으로 진행

### 2. exam_sets 자동 조회 및 세트 선택/생성

exam_id 입력 직후 아래 API를 호출하여 목록을 자동 출력한다:

```bash
curl -s \
  -H "apikey: {SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}" \
  "{SUPABASE_URL}/rest/v1/exam_sets?exam_id=eq.{exam_id}&select=id,name,type,sort_order&order=sort_order.asc"
```

출력 형식:
```
현재 세트 목록 (aws-aif-c01):
  [1] 샘플 세트  (sample)
  [2] 세트 1     (full)
  [3] 세트 2     (full)

번호를 선택하거나 새 세트 이름을 입력하세요:
```

**번호 입력 시:** 해당 세트의 UUID를 `set_id`로 사용

**새 이름 입력 시 (예: "세트 3"):** Supabase에 자동 생성
```bash
curl -s -X POST \
  -H "apikey: {SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  "{SUPABASE_URL}/rest/v1/exam_sets" \
  -d '{
    "exam_id": "{exam_id}",
    "name": "{입력한 이름}",
    "type": "full",
    "sort_order": {기존 최대 sort_order + 1},
    "is_active": true
  }'
```
- 응답 JSON에서 생성된 `id`(UUID)를 `set_id`로 사용
- 생성 확인 메시지 출력: `"세트 3" 세트가 생성되었습니다. (UUID: ...)`

**세트가 없는 경우:** 목록 없이 이름 입력만 요청

### 3. Supabase에서 MAX(id) 조회

`.env` 파일에서 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`를 읽어 API 호출:

```bash
curl -s \
  -H "apikey: {SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}" \
  "{SUPABASE_URL}/rest/v1/questions?select=id&exam_id=eq.{exam_id}&order=id.desc&limit=1"
```

응답 예: `[{"id":"awsaifc01-q165"}]`

- `awsaifc01-q165` → 숫자 `165` 추출 → `start_id = 166`
- 결과가 없으면 `start_id = 1`
- `.env` 파일이 없으면 사용자에게 안내:
  ```
  .env 파일이 없습니다. 다음 형식으로 프로젝트 루트에 생성해주세요:
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  ```

## 전체 파이프라인

```
[/convert] → exam_id 입력 → exam_sets 자동 조회 → 번호 선택 or 새 이름 입력(자동 생성) → Supabase MAX(id) 조회
    │
    ├─ [STEP 1] Parser & SQL Agent 호출 (파싱)
    │    └─ parsed_questions.json 생성
    │
    ├─ 파싱 실패 문제 목록 수집 → 결과 요약에 포함 예정
    │
    ├─ [STEP 2~5] 참조 파일 선로드 → Redesigner Agent 병렬 호출
    │    ├─ Main이 redesign_rules.md, domain_tags, quality_checklist.md 미리 읽기
    │    ├─ 문제 N개 → N개 Redesigner Agent 동시 실행 (각 1개 문제 처리)
    │    ├─ 결과 취합 → redesigned_questions.json 생성
    │    └─ [에스컬레이션 발생 시] 사용자에게 실시간 전달 → 응답 → 해당 Agent 재호출
    │
    └─ [STEP 6] Parser & SQL Agent 호출 (SQL 생성)
         └─ {exam_id}-YYYYMMDD-{batch}.sql 생성
    │
    └─ [STEP 7] 결과 요약 출력
```

## STEP 2~5: 병렬 재설계 실행 절차

### 1. 참조 파일 선로드 (Main이 직접 읽기)

Redesigner Agent 호출 전에 다음 3개 파일을 읽어 텍스트로 보관한다:

```
redesign_rules_content  ← .claude/skills/question-redesigner/references/redesign_rules_compact.md
domain_tags_content     ← .claude/skills/question-redesigner/references/domain_tags/{exam_id}.md
quality_checklist_content ← .claude/skills/question-redesigner/references/quality_checklist_compact.md
```

### 2. Redesigner Agent 병렬 호출

`parsed_questions.json`의 각 문제에 대해 **동시에** Task 호출한다:

```python
# 예: 5개 문제 → 5개 에이전트 동시 실행
for q in parsed_questions:
    Task(
        subagent_type="general-purpose",
        model="haiku",          # Haiku 모델 사용
        prompt={
            "task": "redesign_single",
            "question": q,
            "exam_id": exam_id,
            "redesign_rules": redesign_rules_content,
            "domain_tags": domain_tags_content,
            "quality_checklist": quality_checklist_content
        }
    )
# 모든 Task를 단일 메시지에 묶어 동시 실행
```

### 3. 결과 취합

- 성공한 결과를 `question_number` 기준으로 정렬
- 에스컬레이션 결과는 사용자에게 전달 후 처리 (아래 참조)
- 최종 성공 결과를 배열로 `output/redesigned_questions.json`에 저장

## 에스컬레이션 처리

Redesigner Agent로부터 에스컬레이션 보고를 받으면:

1. 사용자에게 에스컬레이션 내용을 그대로 출력
2. 사용자 응답 대기:
   - **[A] 직접 지시:** 해당 문제만 Redesigner를 단독으로 재호출 (지시 포함)
   - **[B] 스킵:** 해당 문제 스킵 처리

## STEP 7: 결과 요약 출력

```
✅ 변환 완료
━━━━━━━━━━━━━━━━━━━━━━━━
총 입력 문제 수:      {total}개
변환 성공:           {success}개
복수 정답 통합 처리:  {multi}개 (정답 2개 → 단일 정답으로 재설계)
스킵 (파싱 실패):     {parse_failed}개 → [문제 번호 목록]
에스컬레이션 스킵:    {escalated_skipped}개 → [문제 번호 목록]
━━━━━━━━━━━━━━━━━━━━━━━━
저장 경로: output/{sql_filename}
할당된 ID 범위: {first_id} ~ {last_id}
```

## 체크포인트 재개

`/convert` 재실행 시:
1. `output/parsed_questions.json`이 존재하면 확인:
   ```
   이전 실행 결과가 있습니다 (완료: N개, 미완료: M개).
   [A] 이어서 진행합니다 (완료된 문제 스킵)
   [B] 처음부터 다시 시작합니다
   ```
2. [A] 선택 시: Parser & SQL Agent에 `--append` 플래그로 파싱 요청

## SQL 파일 저장 규칙

- 경로: `output/{exam_id}-YYYYMMDD-{batch:03d}.sql`
- 예시: `output/aws-aif-c01-20260220-001.sql`
- 같은 날짜 여러 번 실행 시 배치번호 자동 증가
- 기존 파일 덮어쓰기 없음

## 주요 파일 경로

| 파일 | 역할 |
|------|------|
| `output/parsed_questions.json` | 파싱 결과 + 체크포인트 |
| `output/redesigned_questions.json` | 재설계 완료 결과 |
| `output/{exam_id}-YYYYMMDD-{batch}.sql` | 최종 SQL 파일 |
| `.env` | Supabase 접속 정보 (git에 포함되지 않음) |
| `docs/sample.sql` | SQL 형식 참조용 샘플 |
| `.claude/skills/question-parser/scripts/parse_text.py` | 파싱 스크립트 |
| `.claude/skills/sql-generator/scripts/generate_sql.py` | SQL 생성 스크립트 |

## 중요 제약사항

- `key_point_images` 컬럼은 DB에 존재하지 않으므로 SQL INSERT에서 반드시 제외
- AWS 서비스명은 원문 그대로 보존 (번역·축약 금지)
- 출력 문제는 반드시 단일 정답 4지선다 형식
- LLM 모델: Parser & SQL → Claude Sonnet 4.6 / Redesigner → Claude Haiku 4.5
