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
| Blog Writer | `.claude/agents/blog-writer/AGENT.md` | txt 기반 SEO 블로그 포스트 배치 생성 | **Haiku** |
| Generator | `.claude/agents/generator/AGENT.md` | 개념 기반 신규 문제 5개(배치) 자동 창작 | **Haiku** |
| Validator | `.claude/agents/validator/AGENT.md` | 생성 문제와 기존 시나리오 중복 검증 | **Haiku** |

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
  "{SUPABASE_URL}/rest/v1/questions?select=id&exam_id=eq.{exam_id}"
```

응답 예: `[{"id":"awsaifc01-q001"}, ..., {"id":"awsaifc01-q9"}, ..., {"id":"awsaifc01-q165"}]`

**⚠️ 주의: `order=id.desc` 알파벳 정렬을 사용하면 안 된다.**
ID 형식이 혼재(예: `q9`, `q10`, `q071`)하면 알파벳 최댓값 ≠ 숫자 최댓값이 되어 오계산된다.

- 응답 배열의 모든 ID에서 숫자 접미사를 추출: `-q` 뒤 숫자 부분 (예: `q165` → `165`, `q9` → `9`)
- 숫자 최댓값을 계산 → `start_id = max_num + 1`
- 배열이 비어 있으면 `start_id = 1`
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

## `/blog-write` 커맨드 처리

`input/` 폴더의 txt 파일(사용자 제공 공부 자료, 메모, 서비스 설명 등)을 읽어
SEO 최적화된 한/영 양방향 블로그 포스트를 배치 생성하고 Supabase에 삽입하는 파이프라인.

### 인자 파싱

사용자가 `/blog-write` 실행 시 다음 인자를 지원한다:

| 인자 | 동작 |
|------|------|
| (인자 없음) | 기존 대화형 진행 (Step 1 확인 + Step 5 검토 모두 표시) |
| `--draft` | YAML 헤더 완전 시 Step 1 확인 생략 + Step 5 건너뜀 (모두 초안 저장) |
| `--publish` | YAML 헤더 완전 시 Step 1 확인 생략 + Step 5 건너뜀 (모두 즉시 게시) |

예: `/blog-write --draft`, `/blog-write --publish`

### 처리 흐름

```
[/blog-write [--draft|--publish]]
  → 인자 파싱 (--draft / --publish 여부 확인)
  → input/ 폴더 스캔 (.txt 파일, 알파벳 순)
  → 파일별 YAML 헤더 파싱 or Main 자동 감지
  → 파일 목록·주제 출력
      ├─ YAML 헤더 완전 + --draft/--publish → 확인 없이 자동 진행
      └─ 그 외 → [A/B/C] 사용자 확인
  → YAML 자동 감지 파일 있으면: 헤더 추가 힌트 표시
  → 참조 파일 선로드 (domain_tags, blog_guide, translation_guide)
  → Blog Writer Agent (Haiku, 5개씩 배치 병렬) — SEO 최적화 포함
  → 에스컬레이션 처리 → output/draft_blog_posts.json
      ├─ --draft/--publish 지정 시 → 자동으로 삽입 진행 (Step 5 생략)
      └─ 인자 없음 → Step 5 사용자 검토 → 초안/즉시 게시 선택
  → insert_blog_supabase.py 실행
  → 파일 input/done/ 이동
  → 결과 요약 출력
```

### input/ txt 파일 형식

`input/` 폴더의 txt 파일은 **선택적 YAML 헤더 + 본문**으로 구성된다:

```
---
provider: aws
exam_id: aws-aif-c01
content_type: domain_guide
topic: Amazon Bedrock 파운데이션 모델 활용 가이드
slug_hint: aws-aif-c01-bedrock-guide
---
[본문: 공부 메모, 공식 문서 발췌, 핵심 개념 정리 등 자유 형식]
```

- YAML 헤더가 없으면 Main(Sonnet)이 본문 내용에서 provider·content_type·topic 자동 감지
- `exam_id`, `slug_hint`는 선택사항
- `content_type` 선택지: `overview` / `domain_guide` / `service_comparison` / `exam_strategy`

**파일이 없는 경우** — 즉시 종료:
```
input/ 폴더에 .txt 파일이 없습니다.
블로그로 작성할 내용을 .txt 파일로 input/ 폴더에 저장한 후 다시 실행해주세요.
```

### Step 1: input/ 폴더 스캔 + 파일 분석

파일 목록을 알파벳 순으로 스캔하고 각 파일의 YAML 헤더를 파싱한다.
헤더가 없는 파일은 Main(Sonnet)이 첫 500자를 읽어 provider·topic 자동 감지.

출력 예:
```
처리할 파일 목록 (input/):
  [1] bedrock_study.txt      — provider: aws | content_type: domain_guide | 주제: Amazon Bedrock 파운데이션 모델
  [2] clf_overview.txt       — provider: aws | content_type: overview     | 주제: AWS Cloud Practitioner 개요
  [3] sagemaker_vs_bedrock.txt — provider: aws | content_type: service_comparison | 주제: SageMaker vs Bedrock

총 3개 파일을 처리합니다.

[A] 모두 그대로 진행합니다
[B] 특정 파일의 설정을 수정합니다 (예: "2번 content_type: exam_strategy로 변경")
[C] 취소합니다
```

**자동 진행 조건 (Step 1 확인 생략):**

다음 조건이 **모두** 충족되면 [A/B/C] 질문 없이 파일 목록만 출력 후 자동으로 Step 2로 진행한다:
1. 모든 파일의 YAML 헤더에 `provider` + `content_type` + `topic`이 모두 명시되어 있음
2. `--draft` 또는 `--publish` 인자가 전달되었음

자동 진행 시 출력 예:
```
처리할 파일 목록 (input/):
  [1] bedrock_study.txt   — provider: aws | content_type: domain_guide | 주제: Amazon Bedrock 파운데이션 모델
  [2] clf_overview.txt    — provider: aws | content_type: overview     | 주제: AWS Cloud Practitioner 개요

총 2개 파일 처리를 시작합니다. (--draft 모드)
```

**YAML 헤더 없는 파일이 있는 경우 — 힌트 표시:**

자동 감지가 필요한 파일이 하나라도 있으면, 파일 목록 + [A/B/C] 확인 출력 후 다음 힌트를 추가로 표시한다:
```
💡 다음 실행 시 확인 단계를 생략하려면 아래 YAML 헤더를 파일 상단에 추가하세요:
---
provider: aws
exam_id: aws-aif-c01      (선택사항)
content_type: domain_guide
topic: [주제 입력]
slug_hint: [url-slug]     (선택사항)
---
```

### Step 2: 참조 파일 선로드

Blog Writer Agent 호출 전에 다음 파일을 읽어 텍스트로 보관한다:

```
blog_guide_content    ← .claude/skills/blog-write/references/blog_writing_guide/{provider}.md
                        (파일 없으면 null)
domain_tags_content   ← .claude/skills/question-redesigner/references/domain_tags/{exam_id}.md
                        (exam_id가 null이면 null)
translation_guide_content ← .claude/skills/question-redesigner/references/translation_guide/{exam_id}.md
                             (파일 없으면 null)
```

### Step 3: Blog Writer Agent 배치 호출 (5개씩)

파일 목록의 각 항목을 **5개씩 묶어** Task 호출한다.
각 항목에 `source_content` (txt 파일 전체 내용)를 포함해 전달한다:

```python
batch_size = 5
batches = [items[i:i+batch_size] for i in range(0, len(items), batch_size)]

for batch in batches:
    Task(
        subagent_type="general-purpose",
        model="haiku",
        prompt={
            "task": "write_blog_batch",
            "items": [
                {
                    "number": item["number"],
                    "provider": item["provider"],
                    "exam_id": item.get("exam_id"),
                    "content_type": item["content_type"],
                    "topic": item["topic"],
                    "slug_hint": item.get("slug_hint"),
                    "source_content": item["source_content"]   # txt 파일 전체 내용
                }
                for item in batch
            ],
            "blog_guide": blog_guide_content,
            "domain_tags": domain_tags_content,
            "translation_guide": translation_guide_content,
        }
    )
# 모든 Task를 단일 메시지에 묶어 동시 실행
```

**provider가 파일마다 다를 경우:** provider별로 blog_guide 파일을 각각 로드하여 해당 배치에 전달한다.

### Step 4: 결과 취합 → output/draft_blog_posts.json 저장

- 각 배치 결과의 `results` 배열을 number 기준 정렬 후 합산
- 성공 결과만 `output/draft_blog_posts.json`에 배열로 저장
- 에스컬레이션 결과는 사용자에게 전달 (아래 에스컬레이션 처리 참조)

### Step 5: 사용자 검토

**`--draft` 또는 `--publish` 인자가 전달된 경우 → 이 단계를 건너뛴다:**

- `--draft`: 포스트 목록과 수만 간략히 출력 후 자동으로 Step 6 (초안 저장) 진행
  ```
  3개 포스트를 초안으로 저장합니다.
    [1] aws-aif-c01-bedrock-foundation-model-guide — "Amazon Bedrock 완벽 가이드 | AIF-C01"
    [2] aws-clf-c02-overview — "AWS Cloud Practitioner(CLF-C02) 완벽 합격 가이드"
    ...
  ```
- `--publish`: 동일하게 목록 출력 후 자동으로 Step 6 (즉시 게시) 진행

**인자가 없는 경우 → 아래 대화형 선택을 진행한다:**

```
{N}개 포스트 초안이 완성되었습니다:

  [1] aws-aif-c01-bedrock-foundation-model-guide
      제목: "Amazon Bedrock 파운데이션 모델 완벽 가이드 | AIF-C01 합격 전략"
      분량: 약 2,800자 | 읽기 시간: 6분 | provider: aws
  [2] aws-clf-c02-overview
      제목: "AWS Cloud Practitioner(CLF-C02) 완벽 합격 가이드"
      분량: 약 2,300자 | 읽기 시간: 5분 | provider: aws

처리 방법을 선택하세요:
  [A] 모두 초안으로 저장 (is_published=false, 어드민에서 추후 게시)
  [B] 모두 즉시 게시 (is_published=true)
  [C] 개별 선택 (예: "1번 게시, 2번 초안")
  [D] 특정 포스트 수정 후 저장 (예: "1번 수정: 시험 전략 섹션 강화")
```

[D] 수정 선택 시 → 해당 항목만 Blog Writer Agent 단독 재호출 (수정 지시 + source_content 포함).

### Step 6: insert_blog_supabase.py 실행

```bash
# [A] 초안 저장 (기본)
python3 .claude/skills/sql-generator/scripts/insert_blog_supabase.py \
  --input-file output/draft_blog_posts.json

# [B] 즉시 게시
python3 .claude/skills/sql-generator/scripts/insert_blog_supabase.py \
  --input-file output/draft_blog_posts.json \
  --publish
```

### Step 7: 파일 이동

```bash
mv input/{filename} input/done/{filename}
```

### Step 8: 결과 요약 출력

```
✅ 블로그 포스트 생성 완료
━━━━━━━━━━━━━━━━━━━━━━━━
총 입력 파일:    {total}개
작성 성공:       {success}개
에스컬레이션 스킵: {escalated_skipped}개 → [주제 목록]
━━━━━━━━━━━━━━━━━━━━━━━━
Supabase 삽입 완료: {inserted}개 성공 | {failed}개 실패
게시 상태: {published}개 게시됨 | {draft}개 초안
```

## 에스컬레이션 처리 (`/blog-write`)

배치 결과의 `results`에서 `success: false` 항목을 순서대로 처리한다:

1. 사용자에게 에스컬레이션 내용을 그대로 출력
2. 사용자 응답 대기:
   - **[A] 직접 지시:** 해당 항목만 Blog Writer를 단독(`items` 배열에 1개만) 재호출 (지시 + source_content 포함)
   - **[B] 스킵:** 해당 항목 스킵 처리

모든 에스컬레이션 처리 완료 후 Step 5(사용자 검토)로 진행.

---

## `/generate` 커맨드 처리

`input/` 폴더의 문제 텍스트 파일을 읽어 한국어 4지선다 문제를 배치 생성하고,
사용자 개념 검토 후 Supabase에 삽입하는 자동화 파이프라인.

### 처리 흐름

```
1. exam_id 입력 → exam_sets 자동 조회 → 세트 선택/생성
2. input/ 폴더 스캔 → 파일 목록 출력 (알파벳 순)
3. 파일별: 언어 감지 → 질문 텍스트 추출 → 핵심 개념 추출 → 사용자 검토
4. 참조 파일 선로드 + Redesigner(Haiku) 5개씩 배치 병렬 호출
5. 결과 취합 → output/redesigned_question_generate.json 저장
6. Supabase 삽입 → 파일 input/done/ 이동
7. 완료 요약 출력
```

### Step 1: 멀티턴 정보 수집

```
AWS 시험 문제 생성을 시작합니다.

먼저 시험 ID를 입력해주세요. (예: aws-aif-c01, aws-saa-c03)
exam_id:
```

- exam_id 입력 직후 → `/convert`와 동일하게 exam_sets 자동 조회·출력
- 번호 선택 또는 새 이름 입력으로 세트 확정

### Step 2~8: B-mode 파일 처리 흐름

세트 확정 후 아래 흐름을 실행한다.

**[B-1] input/ 폴더 스캔**

`/convert` Step 3과 동일하게 `input/` 폴더 스캔 후 파일 목록 출력 (알파벳 순):
```
처리할 파일 목록 (input/):
  [1] batch1.txt   (12 KB)
  [2] batch2.txt   (8 KB)

총 2개 파일을 순차적으로 처리합니다.
```
파일이 없으면 → **자동 생성 모드 진입** (아래 `### 자동 생성 모드` 섹션 참조).

**[B-2] 파일별 언어 감지 + Parser & SQL Agent 호출 (STEP 1)**

각 파일에 대해 `/convert`의 파일별 처리 루프와 동일하게:
- 파일 첫 500자로 `source_language` 감지 (`"ko"` / `"en"`)
- Parser & SQL Agent에 `file_path` 전달 → `parse_text.py` 실행 → `output/parsed_questions.json` 생성

> **ID 할당 규칙 (인라인 파싱 시):** `parse_text.py`를 사용할 수 없을 때 (options/answers 없는 파일 등)
> Main이 직접 ID를 할당해야 하는 경우, 반드시 **3자리 zero-padding**을 사용한다.
> 형식: `{exam_code}-q{N:03d}` (예: `awsdeac01-q087`, `awsdeac01-q088`, ...)
> **절대 비패딩 형식 (`q87`, `q88`) 사용 금지** — 알파벳 정렬과 숫자 정렬이 달라져 MAX(id) 오계산 원인이 됨.

**[B-3] 핵심 개념 추출 (Main 인라인 분석)**

`parsed_questions.json`의 각 항목에서 **`question` 텍스트만** 읽어 Main(Sonnet)이 직접 판단한다.
`options[answer]` 텍스트는 사용하지 않는다. 질문이 테스트하는 핵심 AWS 서비스/기능/사용 사례를 파악한다.

```python
correct_answer_concepts = {
    str(q["number"]): "<Main이 질문 텍스트로 판단한 핵심 AWS 개념>"
    for q in parsed_questions
}
```

예시:
```
Q56 질문: "헬스케어 회사가 환자 진단 이미지를 분석하여 의사 진단 지원..."
→ 추출 개념: "Amazon Rekognition을 사용한 의료 이미지 분석"

Q57 질문: "회사 내부 문서 기반 Q&A 챗봇 구축, S3에 문서 저장..."
→ 추출 개념: "Amazon Bedrock Knowledge Bases를 사용한 RAG 기반 Q&A 시스템"
```

**[B-4] 추출 개념 목록 출력 → 사용자 검토·승인**

```
{N}개 질문에서 핵심 개념을 추출했습니다:

  [1] Q56: Amazon Rekognition을 사용한 의료 이미지 분석
  [2] Q57: Amazon Bedrock Knowledge Bases를 사용한 RAG 기반 Q&A
  [3] Q58: AWS Glue를 사용한 ETL 데이터 파이프라인
  ...

  [A] 모두 맞습니다 — 재설계를 시작합니다
  [B] 특정 항목을 수정합니다 (예: "2번 수정: Amazon Bedrock Agents를 사용한 태스크 자동화")
  [C] 취소합니다
```

[B] 수정 입력 후 목록 재출력 → [A] 확인 전까지 반복 가능.

**[B-5] 참조 파일 선로드 + Redesigner 배치 호출 (5개씩)**

`/convert`의 STEP 2~5.5와 동일하게 `domain_tags`, `translation_guide` 선로드 후:

```python
batch_size = 5
batches = [parsed_questions[i:i+batch_size] for i in range(0, len(parsed_questions), batch_size)]

# 모든 Task를 단일 메시지에 묶어 동시 실행
for batch in batches:
    Task(
        subagent_type="general-purpose",
        model="haiku",
        prompt={
            "task": "redesign_batch",
            "questions": batch,
            "exam_id": exam_id,
            "source_language": source_language,
            "correct_answer_concepts": {
                str(q["number"]): correct_answer_concepts[str(q["number"])]
                for q in batch
            },
            "domain_tags": domain_tags_content,
            "translation_guide": translation_guide_content
        }
    )
```

에스컬레이션 발생 시: `/convert` 에스컬레이션 처리와 동일 방식으로 사용자에게 전달.

**[B-6] 결과 취합 → output/redesigned_question_generate.json 저장**

`question_number` 기준 정렬 후 저장.

**[B-7] Supabase 삽입**

세트 내 현재 MAX(sort_order) + 1 조회 후:
```bash
python3 .claude/skills/sql-generator/scripts/insert_supabase.py \
  --input-file output/redesigned_question_generate.json \
  --set-id {set_id} \
  --sort-order-start {sort_order}
```

**[B-8] 파일 이동**

```bash
mv input/{filename} input/done/{filename}
```

다음 파일 처리로 진행 ([B-1]~[B-8] 반복).

**[B-9] 완료 요약 출력**

```
✅ 변환 완료
━━━━━━━━━━━━━━━━━━━━━━━━
총 입력 문제 수:      {total}개
변환 성공:           {success}개
스킵 (파싱 실패):     {parse_failed}개
에스컬레이션 스킵:    {escalated_skipped}개
━━━━━━━━━━━━━━━━━━━━━━━━
Supabase 삽입 완료: {inserted}개 성공 | {failed}개 실패
할당된 ID 범위: {first_id} ~ {last_id}
```

---

### 자동 생성 모드 (input/ 파일 없음 시)

`[B-1]`에서 `.txt` 파일이 없음이 감지되면 아래 흐름을 실행한다.
파일 이동(B-8) 단계는 생략한다. Generator가 domain_tags 지식 기반으로 자율 창작하므로
Supabase 기존 문제 조회나 별도 개념 목록 생성·검토 단계는 없다.

**[G-1] 마지막 세트 자동 선택**

exam_sets를 sort_order 내림차순으로 조회하여 첫 번째(가장 높은 sort_order) 세트를 자동 선택:

```bash
curl "$SUPABASE_URL/rest/v1/exam_sets?exam_id=eq.{exam_id}&select=id,name,sort_order&order=sort_order.desc&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

안내 출력:
```
input/ 폴더에 .txt 파일이 없습니다.
자동 생성 모드를 시작합니다.

대상 세트: '{set_name}' (sort_order: {N}, UUID: {set_id})
이 세트에 15개 문제를 새로 생성하여 추가합니다.

[A] 계속합니다
[B] 취소합니다
```

세트가 하나도 없으면: 사용자에게 먼저 세트를 생성해달라고 안내 후 종료.

**[G-2] Supabase MAX(id) 조회 → start_id 계산**

기존 `/generate` Step 4와 동일한 방식:
- 모든 ID 조회 → 숫자 접미사 추출 → `max() + 1` = `start_id`

**[G-3] 개념 로그 읽기**

`output/generated_concepts_log.json` 파일이 있으면 해당 exam_id의 항목을 읽는다:

```json
{
  "aws-aif-c01": [
    "Amazon Bedrock Knowledge Bases를 사용한 RAG Q&A",
    "Amazon SageMaker Clarify를 사용한 편향 탐지",
    ...
  ]
}
```

파일이 없거나 exam_id 키가 없으면 `previous_concepts_log = []`.

**[G-4] 참조 파일 선로드 + Generator Agent 3배치 동시 실행 (5개씩)**

```python
domain_tags_content       = # .claude/skills/question-redesigner/references/domain_tags/{exam_id}.md
translation_guide_content = # .claude/skills/question-redesigner/references/translation_guide/{exam_id}.md (없으면 null)

# 모든 Task를 단일 메시지에 묶어 동시 실행
for idx in range(3):
    Task(
        subagent_type="general-purpose",
        model="haiku",
        prompt={
            "task": "generate_batch",
            "batch_index": idx,                    # 0, 1, 2 — 도메인 영역 자율 분배용
            "total_batches": 3,
            "questions_per_batch": 5,
            "exam_id": exam_id,
            "start_id_num": start_id + idx * 5,   # 배치별 ID 시작 번호
            "domain_tags": domain_tags_content,
            "translation_guide": translation_guide_content,
            "previous_concepts_log": previous_concepts_log,  # 이전 실행 생성 개념 목록
        }
    )
```

Generator는 `batch_index`를 기준으로 domain_tags의 도메인 영역을 자율 분배하고,
`previous_concepts_log`에 없는 AWS 서비스/기능/사용 사례 5개를 선택하여 창작한다.

**[G-5] Validator Agent 호출 (1회, 배치 내 intra-batch 중복 검사)**

3개 배치 결과 취합 후:

```python
Task(
    subagent_type="general-purpose",
    model="haiku",
    prompt={
        "task": "validate_generated",
        "generated_questions": all_generated_questions,  # 최대 15개
    }
)
```

Validator는 15개 문제 내에서 동일 AWS 서비스를 같은 사용 사례로 테스트하는 중복 쌍을 탐지한다.

**[G-6] 중복 감지 처리 (에스컬레이션)**

Validator 결과에서 `is_valid: false` 항목을 순서대로 처리:

```
❌ '{question_id}' 개념 중복 감지
  - 중복 대상: '{duplicate_question_id}'
  - 사유: {similarity_reason}

[A] 이 문제를 재생성합니다 (Generator 단독 재호출)
[B] 이 문제를 스킵합니다
```

[A] 선택 시: Generator를 단독(`batch_index: null`, `escalation_context` 포함) 재호출.

**[G-7] 결과 취합 → output/redesigned_question_generate.json 저장**

`question_id` 기준 정렬 후 저장.

**[G-8] Supabase 삽입**

세트 내 현재 MAX(sort_order) 조회 후 + 1부터 삽입:

```bash
python3 .claude/skills/sql-generator/scripts/insert_supabase.py \
  --input-file output/redesigned_question_generate.json \
  --set-id {set_id} \
  --sort-order-start {sort_order}
```

**[G-9] 개념 로그 업데이트**

삽입 성공한 문제들의 핵심 개념(`key_points` 첫 줄 제목)을 추출하여
`output/generated_concepts_log.json`의 해당 exam_id 배열에 append한다:

```python
# log[exam_id]에 없는 항목만 추가 (중복 방지)
for q in inserted_questions:
    concept = q["key_points"].split("\n")[0]   # key_points 첫 줄 (제목)
    if concept not in log[exam_id]:
        log[exam_id].append(concept)
```

**[G-10] 완료 요약 출력**

```
✅ 자동 생성 완료
━━━━━━━━━━━━━━━━━━━━━━━━
생성 성공:         {success}개
Validator 중복:    {dup}개 → 재생성 {regen}개, 스킵 {skip}개
에스컬레이션 스킵: {escalated}개
━━━━━━━━━━━━━━━━━━━━━━━━
Supabase 삽입 완료: {inserted}개 성공 | {failed}개 실패
대상 세트: '{set_name}' | 할당된 ID 범위: {first_id} ~ {last_id}
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
| `output/draft_blog_posts.json` | 블로그 포스트 초안 (`/blog-write` 생성) |
| `output/generated_concepts_log.json` | 자동 생성 모드에서 생성된 개념 누적 로그 (exam_id별, cross-run 반복 방지) |
| `.env` | Supabase 접속 정보 (git에 포함되지 않음) |
| `.claude/skills/question-parser/scripts/parse_text.py` | 파싱 스크립트 |
| `.claude/skills/sql-generator/scripts/insert_supabase.py` | Supabase REST API 직접 삽입 스크립트 |
| `.claude/skills/sql-generator/scripts/patch_en_supabase.py` | 영문 백필·콘텐츠 백필 스크립트 (`--fetch` / `--fetch-content` / `--patch` 모드) |
| `.claude/skills/sql-generator/scripts/generate_sql.py` | 영문 백필 전용 (`--patch-en` 모드) |
| `.claude/skills/sql-generator/scripts/insert_blog_supabase.py` | 블로그 포스트 Supabase 삽입 스크립트 (`--publish` / `--dry-run` 모드) |
| `.claude/skills/question-redesigner/references/translation_guide/{exam_id}.md` | AWS 자격증 영문 번역 가이드 (문장 패턴 + 용어 대역표) |
| `.claude/skills/blog-write/references/blog_writing_guide/{provider}.md` | 블로그 작성 가이드 (서비스명 표기·SEO 전략·ref_links 우선순위) |

## 중요 제약사항

- AWS 서비스명은 원문 그대로 보존 (번역·축약 금지)
- 출력 문제는 반드시 단일 정답 4지선다 형식
- LLM 모델: Parser & SQL → Claude Sonnet 4.6 / Redesigner → Claude Haiku 4.5 / Blog Writer → Claude Haiku 4.5
- 블로그 포스트 SEO 필수: title 60자 이내, excerpt 150~160자, content H2/H3 구조, ref_links 공식 문서 2개↑
