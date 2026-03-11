# 시험 문제 생성 오케스트레이터

이 프로젝트의 Claude Code 에이전트는 영문 또는 한국어 AWS/GCP/Azure 시험 문제 텍스트 파일을 읽어 한국어 4지선다 문제로 재설계하고, Supabase에 직접 삽입하는 완전 자동화 파이프라인을 실행합니다.

## 역할

Main 오케스트레이터로서:
- Supabase API로 배치 ID 사전 할당
- 서브에이전트(Parser & SQL, Redesigner) 호출·조율
- 에스컬레이션 처리 및 사용자에게 실시간 전달
- 결과 요약 출력

## 서브에이전트

| 에이전트 | 파일 | 역할 | 모델 |
|---------|------|------|------|
| Parser & SQL | `.claude/agents/parser-sql/AGENT.md` | STEP 1 파싱 + STEP 6 Supabase 직접 삽입 | Sonnet |
| Redesigner | `.claude/agents/redesigner/AGENT.md` | 문제 5개(배치) 한국어 재설계 | **Haiku** |

**규칙:** 서브에이전트 간 직접 호출 금지 — 반드시 Main(이 파일)을 통해 조율한다.

---

## `/generate` 커맨드 처리

`input/` 폴더의 질문 텍스트 파일을 읽어, 각 질문에 대한 보기/정답/해설/key_points/ref_links를 생성하고 5개 언어(한/영/스/포/일)로 번역하여 Supabase에 삽입하는 자동화 파이프라인. 질문 텍스트는 원문 그대로 사용 (영문이면 한국어로 번역).

### 처리 흐름

```
1. exam_id 입력 → exam_sets 자동 조회 → 세트 자동 선택
2. input/ 폴더 스캔 → 파일 목록 출력 (알파벳 순)
3. 파일별: 언어 감지 → 파싱 → 자동 진행
4. 참조 파일 선로드 + Redesigner(Haiku) 5개씩 배치 병렬 호출
5. Supabase 즉시 삽입 → 파일 input/done/ 이동
6. 완료 요약 출력
```

### Step 1: 멀티턴 정보 수집

```
시험 문제 생성을 시작합니다.

먼저 시험 ID를 입력해주세요. (예: aws-aif-c01, aws-clf-c02, aws-saa-c03, azure-az-900, gcp-ace)
exam_id:
```

- exam_id 입력 직후 → sort_order 내림차순으로 마지막 세트 **자동 선택** (목록 표시·번호 선택 없음)
- 자동 선택 쿼리:
  ```bash
  curl "$SUPABASE_URL/rest/v1/exam_sets?exam_id=eq.{exam_id}&select=id,name,sort_order&order=sort_order.desc&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
  ```
- 세트가 하나도 없으면: 사용자에게 먼저 세트를 생성해달라고 안내 후 종료
- 세트 확정 후 출력 예시:
  ```
  대상 세트: '세트 7' (sort_order: 8, UUID: xxxx-xxxx)
  input/ 폴더를 스캔합니다...
  ```

### Step 2~8: B-mode 파일 처리 흐름

exam_id 입력 및 세트 자동 선택 후 아래 흐름을 실행한다.
**`exam_id`와 `set_id`는 루프 전체에서 고정** — 파일마다 재입력하거나 재선택하지 않는다.

**[B-1] input/ 폴더 스캔 + 루프 전 커서 초기화**

`input/` 폴더 스캔 후 **전체** 파일 목록을 한 번에 출력 (알파벳 순):
```
처리할 파일 목록 (input/):
  [1] batch1.txt   (12 KB)
  [2] batch2.txt   (8 KB)

총 2개 파일을 순차적으로 처리합니다.
```
파일이 없으면 → **즉시 종료**:
```
input/ 폴더에 .txt 파일이 없습니다.
처리할 문제 파일을 input/ 폴더에 저장한 후 다시 실행해주세요.
```

파일이 있으면 다음 커서를 **루프 진입 전 1회만** 초기화한다:

```python
# ① 현재 MAX(question id) 조회 → current_max_id 초기화
all_ids = GET /rest/v1/questions?select=id&exam_id=eq.{exam_id}
nums = [int(qid.split('-q')[1]) for qid in all_ids if qid.split('-q')[1].isdigit()]
current_max_id = max(nums) if nums else 0   # 파일 처리마다 누적 증가

# ② 세트 내 MAX(sort_order) 조회 → sort_order_cursor 초기화
max_sort = GET /rest/v1/exam_set_questions?set_id=eq.{set_id}&select=sort_order&order=sort_order.desc&limit=1
sort_order_cursor = (max_sort + 1) if max_sort else 1   # 파일 처리마다 누적 증가
```

이후 **[B-2]~[B-5]을 파일 수만큼 반복**한다. 각 반복에서 `current_max_id`와 `sort_order_cursor`는 이전 파일 처리 결과를 반영한 누적값을 사용한다.

**[B-2] 언어 감지 + 파싱 (현재 파일)**

현재 파일에 대해:
- 파일 첫 500자로 `source_language` 감지 (`"ko"` / `"en"`)
- Main이 인라인 Python으로 질문 텍스트만 추출 (txt 파일에는 보기/정답이 없으므로 `parse_text.py` 미사용)

```python
import re, json

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 번호 패턴으로 질문 분리: "1.", "1)", "Q1.", "Q1)" 등
questions_raw = re.split(r'\n(?=\s*(?:Q?\d+[\.\)]|Question\s+\d+))', content.strip())
questions_raw = [q.strip() for q in questions_raw if q.strip()]

exam_code = exam_id.replace('-', '')  # aws-aif-c01 → awsaifc01

def apply_linebreaks_ko(question_text: str) -> str:
    """
    규칙 3 결정론적 적용 (source_language == 'ko' 전용):
    - 마지막 문장(? 로 끝남) 앞에 \\n\\n 삽입
    - 전체 문장 수 >= 4이면 첫 번째 문장 뒤에도 \\n\\n 삽입
    원문 텍스트는 단어 하나도 수정하지 않는다.
    """
    parts = re.split(r'(?<=[다요까]\.?)\s+', question_text.strip())
    parts = [p.strip() for p in parts if p.strip()]

    if len(parts) <= 1:
        return question_text.strip()

    last = parts[-1]   # 질문 문장 (? 로 끝남)
    body = parts[:-1]

    if len(parts) >= 4:
        formatted = body[0] + '\n\n' + ' '.join(body[1:]) + '\n\n' + last
    else:
        formatted = ' '.join(body) + '\n\n' + last

    return formatted.strip()

parsed_questions = []
for i, q_text in enumerate(questions_raw):
    # 번호 제거 후 질문 텍스트만 추출
    clean_text = re.sub(r'^\s*(?:Q?\d+[\.\)]\s*|Question\s+\d+[:.]\s*)', '', q_text).strip()
    num = current_max_id + i + 1
    entry = {
        "number": i + 1,
        "question": clean_text,
        "assigned_id": f"{exam_code}-q{num:03d}"
    }
    # source_language == 'ko'이면 text 필드 사전 확정 (Redesigner가 수정 불가)
    if source_language == 'ko':
        entry["text"] = apply_linebreaks_ko(clean_text)
    parsed_questions.append(entry)

# output/parsed_questions.json 저장
with open('output/parsed_questions.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_questions, f, ensure_ascii=False, indent=2)
```

> **ID 할당 규칙:** 반드시 **3자리 zero-padding** 사용. 형식: `{exam_code}-q{N:03d}` (예: `awsdeac01-q087`)
> **절대 비패딩 형식 (`q87`, `q88`) 사용 금지** — 알파벳 정렬과 숫자 정렬이 달라져 MAX(id) 오계산 원인이 됨.

파싱 완료 후, `domain_tags_content`가 아직 로드되지 않은 경우 로드한다 (첫 파일 처리 시 1회만):
```
domain_tags_content ← .claude/skills/question-redesigner/references/domain_tags/{exam_id}.md
                      (파일 없으면 null)
```

**[B-3] 참조 파일 선로드 + sort_order 사전 배분 + Redesigner 파이프라인 배치 호출 (5개씩)**

`translation_guide`를 선로드한다 (첫 파일 처리 시 1회 로드 후 이후 파일에 재사용).
`domain_tags_content`는 [B-2] 완료 시 이미 로드되어 있으므로 재로드하지 않는다.
**sort_order_start는 루프 외부에서 초기화한 `sort_order_cursor`를 그대로 사용한다 — 파일마다 Supabase를 재조회하지 않는다.**

```python
batch_size = 5
batches = [parsed_questions[i:i+batch_size] for i in range(0, len(parsed_questions), batch_size)]

# 모든 Task를 단일 메시지에 묶어 동시 실행
for idx, batch in enumerate(batches):
    Task(
        subagent_type="general-purpose",
        model="haiku",
        prompt={
            "task": "pipeline_batch",          # 질문 번역 + 보기 생성 + 번역 + 즉시 삽입
            "questions": batch,                # {number, question, assigned_id, text(ko시 사전확정)} 배열
            "text_is_final": source_language == 'ko',  # True이면 text 필드 수정 절대 금지
            "exam_id": exam_id,
            "source_language": source_language,
            "domain_tags": domain_tags_content,
            "translation_guide": translation_guide_content,
            # 삽입 정보 — sort_order_cursor 기반 배치별 사전 배분
            "set_id": set_id,
            "sort_order_start": sort_order_cursor + idx * 5,
            "insert_script_path": ".claude/skills/sql-generator/scripts/insert_supabase.py",
        }
    )
```

각 배치 에이전트가 Redesigner AGENT.md 규칙(STEP 3~5.5)에 따라 보기 생성·번역을 완료한 후,
`task == "pipeline_batch"`이므로 STEP 6에서 즉시 Supabase에 삽입하고 결과를 반환한다.

에스컬레이션 발생 시: 배치 결과의 `success: false` 항목을 사용자에게 출력 → [A] 재호출 지시 또는 [B] 스킵 선택.

**[B-4] 결과 취합 + 중복 제거**

각 배치 결과의 `inserted_ids`, `failures`, `skipped`를 수집·합산한다.

중복 제거 (삽입 전 최종 검증):
- 각 배치가 반환한 redesigned 결과를 `original_question_number` 기준으로 인덱싱
- 동일 `question_number`가 두 배치에서 나타나면 첫 번째 성공 결과만 유지하고 나머지는 SKIP 로그
- 중복 제거 후 결과만 `insert_supabase.py`에 전달
- **참고**: `insert_supabase.py`는 동일 ID가 `questions` 테이블에 이미 존재하면 `[SKIP]`으로 처리하므로, 혹시 중복이 삽입 단계까지 도달해도 DB에 중복 삽입되지 않음

**[B-5] 파일 이동 + 커서 업데이트**

```bash
mv input/{filename} input/done/{filename}
```

이 파일에서 처리된 문제 수(`n_questions`)를 기반으로 커서를 누적 업데이트한다:
```python
sort_order_cursor += n_questions   # 다음 파일의 sort_order 시작점
current_max_id    += n_questions   # 다음 파일의 ID 시작점
```

다음 파일 처리로 진행 ([B-2]~[B-5] 반복, exam_id·set_id·참조 파일은 재사용).

**[B-6] 완료 요약 출력**

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

## 주요 파일 경로

| 파일 | 역할 |
|------|------|
| `input/*.txt` | 처리 대기 중인 문제 텍스트 파일 (알파벳 순 처리) |
| `input/done/*.txt` | 처리 완료된 파일 (자동 이동) |
| `output/parsed_questions.json` | 파싱 결과 |
| `.env` | Supabase 접속 정보 (git에 포함되지 않음) |
| `.claude/agents/parser-sql/AGENT.md` | Parser & SQL 서브에이전트 |
| `.claude/agents/redesigner/AGENT.md` | Redesigner 서브에이전트 |
| `.claude/skills/question-parser/scripts/parse_text.py` | 파싱 스크립트 |
| `.claude/skills/sql-generator/scripts/insert_supabase.py` | Supabase REST API 직접 삽입 스크립트 |
| `.claude/skills/question-redesigner/references/domain_tags/{exam_id}.md` | 도메인 태그 (시험별) |
| `.claude/skills/question-redesigner/references/translation_guide/{exam_id}.md` | 영문 번역 가이드 (시험별) |

## 중요 제약사항

- 클라우드 서비스명은 원문 그대로 보존 (AWS/GCP/Azure 서비스명 번역·축약 금지)
- 출력 문제는 반드시 단일 정답 4지선다 형식
- LLM 모델: Parser & SQL → Claude Sonnet 4.6 / Redesigner → Claude Haiku 4.5
