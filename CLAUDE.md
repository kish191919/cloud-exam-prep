# AWS 시험 문제 변환 오케스트레이터

이 프로젝트의 Claude Code 에이전트는 영문 또는 한국어 AWS 시험 문제를 한국어 4지선다 문제로 재설계하고, Supabase에 직접 삽입하는 완전 자동화 변환 파이프라인을 실행합니다.

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
| Parser & SQL | `.claude/agents/parser-sql/AGENT.md` | STEP 1 파싱 + STEP 6 Supabase 직접 삽입 | Sonnet |
| Redesigner | `.claude/agents/redesigner/AGENT.md` | 문제 5개(배치) 한국어 재설계 | **Haiku** |

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
- 세트가 확정되면 `input/` 폴더 스캔으로 진행

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

### 3. input/ 폴더 스캔

세트 확정 후 `input/` 폴더의 `.txt` 파일을 알파벳 순으로 스캔하여 출력한다:

```
처리할 파일 목록 (input/):
  [1] batch1.txt   (12 KB)
  [2] batch2.txt   (8 KB)

총 2개 파일을 순차적으로 처리합니다.
```

**파일이 없는 경우** — 즉시 종료:
```
input/ 폴더에 .txt 파일이 없습니다.
처리할 문제 파일을 input/ 폴더에 저장한 후 다시 실행해주세요.
```

### 4. Supabase에서 MAX(id) 조회

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

### 5. 파일별 처리 루프

`input/` 스캔에서 확인된 각 파일에 대해 순차 실행한다:

1. **언어 감지**: 파일의 첫 500자를 읽어 한글 비율로 `source_language` 판별
   - 한글 문자 30% 이상 → `source_language = "ko"`, 미만 → `source_language = "en"`
   - (파일 전체를 프롬프트에 올리지 않음 — 첫 500자만 확인)
2. **STEP 1**: Parser & SQL Agent에 `file_path` 전달 → `parse_text.py` 실행 → `parsed_questions.json` 생성
3. **STEP 2~5.5**: Redesigner Agent 병렬 호출 → `redesigned_questions.json` 생성
4. **STEP 6**: Supabase 직접 삽입
5. **파일 이동**: 처리 완료 후 `input/done/`으로 이동
   ```bash
   mv input/{filename} input/done/{filename}
   ```
6. 다음 파일로 진행

## 전체 파이프라인

```
[/convert] → exam_id 입력 → exam_sets 자동 조회 → 번호 선택 or 새 이름 입력(자동 생성)
    │
    ├─ input/ 폴더 스캔 → 파일 목록 출력 (알파벳 순)
    │    └─ 파일 없으면 즉시 종료
    │
    ├─ Supabase MAX(id) 조회 → start_id 확정
    │
    ├─ [파일별 루프] 각 .txt 파일에 대해 반복:
    │    │
    │    ├─ 파일 첫 500자로 source_language 감지 (en/ko)
    │    │
    │    ├─ [STEP 1] Parser & SQL Agent 호출 (file_path 전달)
    │    │    └─ parsed_questions.json 생성
    │    │
    │    ├─ 파싱 실패 문제 목록 수집 → 결과 요약에 포함 예정
    │    │
    │    ├─ [STEP 2~5.5] 참조 파일 선로드 → Redesigner Agent 배치 호출
    │    │    ├─ Main이 domain_tags, translation_guide.md 미리 읽기 (규칙/체크리스트는 AGENT.md 내장)
    │    │    ├─ 문제 5개씩 배치 → ceil(N/5)개 Redesigner Agent 동시 실행
    │    │    ├─ 각 Agent가 5개 문제를 순서대로 STEP 3→4→4.5→5→5.5 처리
    │    │    ├─ 결과 취합 → redesigned_questions.json 생성 (한/영 양방향 필드 포함)
    │    │    └─ [에스컬레이션 발생 시] 사용자에게 실시간 전달 → 응답 → 해당 Agent 재호출
    │    │
    │    ├─ [STEP 6] Parser & SQL Agent 호출 (Supabase 직접 삽입)
    │    │    └─ questions / question_options / question_tags / exam_set_questions INSERT
    │    │
    │    └─ 파일 이동: input/{filename} → input/done/{filename}
    │
    └─ [STEP 7] 결과 요약 출력 (전체 파일 합산)
```

## STEP 2~5.5: 배치 재설계 + 영문 번역 실행 절차

### 1. 참조 파일 선로드 (Main이 직접 읽기)

Redesigner Agent 호출 전에 다음 2개 파일을 읽어 텍스트로 보관한다:

```
domain_tags_content       ← .claude/skills/question-redesigner/references/domain_tags/{exam_id}.md
translation_guide_content ← .claude/skills/question-redesigner/references/translation_guide/{exam_id}.md
                            (파일 없으면 null — Redesigner가 일반 번역 수행)
```

재설계 규칙과 품질 체크리스트는 AGENT.md에 내장되어 있으므로 별도 읽기 불필요.

### 2. Redesigner Agent 배치 호출

`parsed_questions.json`의 문제를 **5개씩 묶어** Task 호출한다:

```python
# 예: 15개 문제 → 3개 에이전트 동시 실행 (각 5개 문제 처리)
import math
batch_size = 5
batches = [parsed_questions[i:i+batch_size] for i in range(0, len(parsed_questions), batch_size)]

for batch in batches:
    # correct_answer_concepts: 문제 번호 → 원문 정답 보기 텍스트 매핑 (규칙 13)
    correct_answer_concepts = {
        str(q["number"]): q["options"].get(q["answer"].split(",")[0].strip(), "")
        for q in batch
    }
    Task(
        subagent_type="general-purpose",
        model="haiku",          # Haiku 모델 사용
        prompt={
            "task": "redesign_batch",
            "questions": batch,
            "exam_id": exam_id,
            "source_language": source_language,   # "en" 또는 "ko"
            "correct_answer_concepts": correct_answer_concepts,   # 문제번호 → 정답 개념 매핑
            "domain_tags": domain_tags_content,
            "translation_guide": translation_guide_content   # AWS 자격증 영문 번역 가이드
        }
    )
# 모든 Task를 단일 메시지에 묶어 동시 실행
```

### 3. 결과 취합

- 각 배치 결과의 `results` 배열을 하나로 합산
- 성공한 결과를 `question_number` 기준으로 정렬
- 에스컬레이션 결과는 사용자에게 전달 후 처리 (아래 참조)
- 최종 성공 결과를 배열로 `output/redesigned_questions.json`에 저장

## 에스컬레이션 처리

배치 결과의 `results` 배열에서 `success: false` 항목을 순서대로 처리한다:

1. 사용자에게 에스컬레이션 내용을 그대로 출력
2. 사용자 응답 대기:
   - **[A] 직접 지시:** 해당 문제만 Redesigner를 단독(`questions` 배열에 1개만) 재호출 (지시 포함)
   - **[B] 스킵:** 해당 문제 스킵 처리
3. 모든 에스컬레이션 처리 완료 후 STEP 6(Supabase 삽입) 진행

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
Supabase 삽입 완료: {inserted}개 성공 | {failed}개 실패
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

---

## `/patch-en` 커맨드 처리

Supabase에 이미 저장된 문제 중 영어 필드(`text_en`, `explanation_en`, `key_points_en`)가
누락된 항목을 탐지하고 Haiku로 번역하여 PATCH하는 백필 파이프라인.

### 처리 흐름

```
1. exam_id 입력 (Enter 스킵 시 전체 exam 대상)
2. set_name 입력 (Enter 스킵 시 해당 exam 전체, exam_id 없으면 생략)
3. --fetch 실행 → needs_translation.json 생성 및 통계 출력
4. needs_translation.json이 비어있으면 종료
5. translation_guide/{exam_id}.md 로드 (없으면 null)
6. Haiku 배치 호출 (5문제씩, ceil(N/5)개 동시 실행)
7. 결과 취합 → output/translated_questions.json 저장
8. --patch 실행 → Supabase PATCH
9. 결과 요약 출력
```

### Step 1: 멀티턴 정보 수집

```
영문 백필을 시작합니다.

exam_id를 입력하세요 (전체 대상이면 Enter):
exam_id: aws-aif-c01

세트 이름을 입력하세요 (전체 대상이면 Enter, 예: 샘플 세트):
set_name: 샘플 세트
```

- `exam_id`를 Enter로 스킵하면 set_name 입력 없이 전체 대상 진행
- `set_name`을 입력하면 해당 세트 소속 문제만 처리 (문제 수 대폭 축소)

### Step 2: --fetch 실행

```bash
python3 .claude/skills/sql-generator/scripts/patch_en_supabase.py \
  --fetch \
  [--exam-id {exam_id}] \
  [--set-name "{set_name}"]   # set_name 입력 시 추가 (--exam-id 필수)
```

- `--set-name` 지정 시 `--exam-id`도 반드시 함께 전달
- 세트 필터가 없으면 기존 동작(exam 전체 또는 전체 exam) 그대로

출력 예:
```
[결과] 미번역 문제: 43개
  - 질문 text_en 누락:         5개
  - 질문 explanation_en 누락:  12개
  - 옵션 text_en 누락:         38개 (항목 기준)
  - 옵션 explanation_en 누락:  30개 (항목 기준)
저장: output/needs_translation.json
```

### Step 3: Haiku 배치 호출 (5문제씩)

`output/needs_translation.json`의 각 항목을 5개씩 묶어 동시 실행:

```python
Task(
    subagent_type="general-purpose",
    model="haiku",
    prompt={
        "task": "translate_to_en",
        "questions": batch,          # needs_translation.json의 항목 5개
        "translation_guide": translation_guide_content,  # 없으면 null
    }
)
```

**Haiku 번역 지시사항 (프롬프트에 포함):**
```
각 질문의 'needs' 객체 안에 있는 필드만 영어로 번역하여 반환하라.
- AWS 서비스명(Amazon Bedrock, SageMaker 등)은 원문 그대로 유지
- translation_guide의 용어 대역표를 우선 적용
- 번역 불필요한 필드(needs에 없는 필드)는 출력에서 생략

출력 형식:
{
  "results": [
    {
      "id": "{question_id}",
      "text_en": "...",          // needs.text_en이 있을 때만
      "explanation_en": "...",   // needs.explanation_en이 있을 때만
      "key_points_en": "...",    // needs.key_points_en이 있을 때만
      "options": [
        {
          "option_id": "A",
          "text_en": "...",         // needs.text_en이 있을 때만
          "explanation_en": "..."   // needs.explanation_en이 있을 때만
        }
      ]
    }
  ]
}
```

### Step 4: --patch 실행

```bash
python3 .claude/skills/sql-generator/scripts/patch_en_supabase.py \
  --patch \
  --input-file output/translated_questions.json
```

### Step 5: 결과 요약 출력

```
✅ 영문 백필 완료
━━━━━━━━━━━━━━━━━━━━━━━━
미번역 탐지:   {total}개 문제
번역 성공:     {translated}개
PATCH 완료:    질문 {q_patched}개, 옵션 {opt_patched}개
━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## `/patch-content` 커맨드 처리

Supabase에 이미 저장된 문제 중 보기별 해설(`options[].explanation`/`explanation_en`)과
참고자료(`ref_links`)가 누락된 항목을 탐지하고 Haiku로 생성하여 PATCH하는 백필 파이프라인.

### 처리 흐름

```
1. exam_id 입력 (Enter 스킵 시 전체 exam 대상)
2. set_name 입력 (Enter 스킵 시 해당 exam 전체, exam_id 없으면 생략)
3. --fetch-content 실행 → needs_content.json 생성 및 통계 출력
4. needs_content.json이 비어있으면 종료
5. translation_guide/{exam_id}.md 로드 (없으면 null)
6. Haiku 배치 호출 (5문제씩, ceil(N/5)개 동시 실행)
7. 결과 취합 → output/generated_content.json 저장
8. --patch 실행 (--input-file output/generated_content.json)
9. 결과 요약 출력
```

### Step 1: 멀티턴 정보 수집

```
보기 해설·참고자료 백필을 시작합니다.

exam_id를 입력하세요 (전체 대상이면 Enter):
exam_id: aws-aif-c01

세트 이름을 입력하세요 (전체 대상이면 Enter, 예: 세트 2):
set_name: 세트 2
```

### Step 2: --fetch-content 실행

```bash
python3 .claude/skills/sql-generator/scripts/patch_en_supabase.py \
  --fetch-content \
  [--exam-id {exam_id}] \
  [--set-name "{set_name}"]
```

출력 예:
```
[결과] 콘텐츠 누락 문제: 45개
  - ref_links 누락:              45개
  - 옵션 explanation(한) 누락:   180개 (항목 기준)
  - 옵션 explanation_en(영) 누락: 180개 (항목 기준)
저장: output/needs_content.json
```

### Step 3: Haiku 배치 호출 (5문제씩)

`output/needs_content.json`의 각 항목을 5개씩 묶어 동시 실행:

```python
Task(
    subagent_type="general-purpose",
    model="haiku",
    prompt={
        "task": "generate_content",
        "questions": batch,          # needs_content.json의 항목 5개
        "translation_guide": translation_guide_content,  # 없으면 null
    }
)
```

**Haiku 생성 지시사항 (프롬프트에 포함):**
```
각 질문의 'needs' 객체를 보고 누락된 필드만 생성하여 반환하라.

규칙:
- needs에 없는 필드는 출력 생략
- AWS 서비스명 원문 보존 (Amazon Bedrock, SageMaker 등)
- translation_guide의 용어 대역표 우선 적용
- ref_links: docs.aws.amazon.com 또는 aws.amazon.com 도메인만, 1~3개
- options[].explanation(한국어): is_correct가 true이면 "왜 정답인지", false이면 "왜 오답인지" (2~3문장)
- options[].explanation_en: 동일 내용 영어로 (AWS 시험 공식 문체)
- 각 옵션의 text와 question의 text를 충분히 참고하여 정확한 설명 생성

출력 형식:
{
  "results": [
    {
      "id": "{question_id}",
      "ref_links": "[{\"name\": \"...\", \"url\": \"...\"}]",  // needs.ref_links가 true일 때만
      "options": [
        {
          "option_id": "a",
          "explanation": "...",       // needs에 포함된 경우만
          "explanation_en": "..."     // needs에 포함된 경우만
        }
      ]
    }
  ]
}
```

### Step 4: --patch 실행

```bash
python3 .claude/skills/sql-generator/scripts/patch_en_supabase.py \
  --patch \
  --input-file output/generated_content.json
```

### Step 5: 결과 요약 출력

```
✅ 콘텐츠 백필 완료
━━━━━━━━━━━━━━━━━━━━━━━━
누락 탐지:   {total}개 문제
생성 성공:   {generated}개
PATCH 완료:  질문(ref_links) {q_patched}개, 옵션 {opt_patched}개
━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 주요 파일 경로

| 파일 | 역할 |
|------|------|
| `input/*.txt` | 처리 대기 중인 문제 텍스트 파일 (알파벳 순 처리) |
| `input/done/*.txt` | 처리 완료된 파일 (자동 이동) |
| `output/parsed_questions.json` | 파싱 결과 + 체크포인트 |
| `output/redesigned_questions.json` | 재설계 완료 결과 (한/영 양방향 필드 포함) |
| `output/needs_translation.json` | 영문 백필 대상 목록 (`/patch-en` 생성) |
| `output/translated_questions.json` | 번역 완료 결과 (`/patch-en` 생성) |
| `output/needs_content.json` | 보기 해설·참고자료 누락 목록 (`/patch-content` 생성) |
| `output/generated_content.json` | 생성 완료 결과 (`/patch-content` 생성) |
| `.env` | Supabase 접속 정보 (git에 포함되지 않음) |
| `.claude/skills/question-parser/scripts/parse_text.py` | 파싱 스크립트 |
| `.claude/skills/sql-generator/scripts/insert_supabase.py` | Supabase REST API 직접 삽입 스크립트 |
| `.claude/skills/sql-generator/scripts/patch_en_supabase.py` | 영문 백필·콘텐츠 백필 스크립트 (`--fetch` / `--fetch-content` / `--patch` 모드) |
| `.claude/skills/sql-generator/scripts/generate_sql.py` | 영문 백필 전용 (`--patch-en` 모드) |
| `.claude/skills/question-redesigner/references/translation_guide/{exam_id}.md` | AWS 자격증 영문 번역 가이드 (문장 패턴 + 용어 대역표) |

## 중요 제약사항

- AWS 서비스명은 원문 그대로 보존 (번역·축약 금지)
- 출력 문제는 반드시 단일 정답 4지선다 형식
- LLM 모델: Parser & SQL → Claude Sonnet 4.6 / Redesigner → Claude Haiku 4.5
