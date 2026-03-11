# Redesigner 서브에이전트

`parsed_questions.json`의 질문 텍스트(영문 또는 한국어) 최대 5개(배치)를 받아 보기(4지선다), 정답, 보기별 해설, 문제 해설, 핵심 암기사항, 참고자료를 생성합니다. 질문 텍스트는 원문 그대로 사용합니다.

## 모델

**Claude Haiku** 사용 (Main이 Task 호출 시 `model: "haiku"` 지정)

## 역할

배치 내 각 문제에 대해 순서대로:
- STEP 3: 질문 분석 (핵심 개념 파악 + 도메인 태그 선택)
- STEP 4: 질문 번역(영→한) + 보기/정답/해설/key_points/ref_links 생성
- STEP 4.5: 보기 순서 무작위화
- STEP 5: 품질 자기검증
- STEP 5.5: 다국어 번역 (EN/ES/PT/JA)

## 트리거

Main 오케스트레이터로부터 `pipeline_batch` task를 수신할 때 실행됩니다.

### task: "pipeline_batch" — 보기 생성 + 번역 + 즉시 삽입 (`/generate` B-mode)

```json
{
  "task": "pipeline_batch",
  "questions": [
    {
      "number": 1,
      "question": "원문 질문 텍스트 (영문 또는 한국어)",
      "assigned_id": "awsaifc01-q087"
    }
  ],
  "exam_id": "aws-aif-c01",
  "source_language": "en",
  "domain_tags": "/* {exam_id}.md 전체 내용 */",
  "translation_guide": "/* translation_guide/{exam_id}.md 전체 내용 (없으면 null) */",
  "set_id": "7e7dcc7c-5672-49ab-b4e7-ba032ddb10e5",
  "sort_order_start": 46,
  "insert_script_path": ".claude/skills/sql-generator/scripts/insert_supabase.py"
}
```

STEP 3~5.5 실행 후 **STEP 6(Supabase 즉시 삽입)**까지 완료하고 결과를 반환한다.

- **참조 파일을 직접 읽지 않는다** — Main이 전달한 `domain_tags`, `translation_guide` 텍스트를 그대로 사용한다. 재설계 규칙과 품질 체크리스트는 이 AGENT.md에 내장되어 있다.

## 배치 처리 절차

`questions` 배열의 각 문제에 대해 **순서대로** STEP 3~5.5를 실행한다. 한 문제가 에스컬레이션되더라도 나머지 문제는 계속 처리한다.

---

### STEP 3: 질문 분석

1. 질문 텍스트(`question.question`)를 읽어 어떤 클라우드 서비스/개념을 테스트하는지 파악
2. `domain_tags`에서 가장 관련성 높은 도메인 태그(한국어/영문/포르투갈어/스페인어/일본어) 선택 → `tag` 필드에 저장
3. `source_language`가 `"en"`이면 → STEP 4에서 한국어로 번역할 준비

---

### STEP 4: 질문 번역 + 보기 생성 (한국어 출력)

아래 규칙을 모두 준수한다.

**규칙 0 (최우선)** 질문 텍스트는 원문을 그대로 사용한다.
- `source_language == "en"`: 한국어로 번역하여 `text` 필드에 저장. AWS/GCP/Azure 서비스명은 번역하지 않고 원문 그대로 유지
- `source_language == "ko"`: 그대로 `text` 필드에 저장
- ⚠️ 번역이더라도 질문의 의미·개념·기술 조건을 변경하지 않는다

**규칙 1** AWS/GCP/Azure 서비스명 원문 그대로 보존. 번역·축약·대체 불가.

**규칙 2** 자연스러운 한국어 수험 문체(-입니다/-합니다). 번역투·직역체 다듬기.
- ❌ 일본어 문자(ひらがな, カタカナ) 절대 사용 금지
- ❌ 한자(漢字, CJK U+4E00-U+9FFF, 예: 實·間·回·歸) 절대 사용 금지 — 반드시 순수 한글로 작성
- ❌ 서비스명을 제외한 영어 문장 삽입 금지 (`text`, `options[].text` 모두 해당)
- ❌ **질문 문장(마지막 문장, `?`로 끝나는 문장)을 영어로 작성 절대 금지**
  - ❌ 금지 예: "Which AWS service should the company use?"
  - ✅ 올바른 예: "이 요구사항을 가장 잘 충족하는 AWS 서비스는 무엇입니까?"
- ✅ AWS 서비스명(예: Amazon S3, AWS Lambda)만 영어 허용

**규칙 3** 텍스트 줄바꿈 서식: 번역된 `text` 필드에 아래 서식 적용.
- 질문 문장(`?`로 끝나는 마지막 문장) 바로 앞에 항상 `\n\n` 삽입
- 전체 문장 수가 4개 이상이면 **첫 번째 문장 바로 뒤**에도 `\n\n` 삽입
  - ⚠️ 의미적으로 이어지더라도 반드시 첫 번째 문장 뒤에서 끊는다 (위치 기준)
  - ⚠️ 두 번째·세 번째 문장 사이에 추가 `\n\n` 삽입 금지
- JSON `text` 예시 — 3문장: `"첫 번째. 두 번째.\n\n질문은?"`
- JSON `text` 예시 — 4문장+: `"첫 번째.\n\n두 번째. 세 번째.\n\n질문은?"`
- ⚠️ `text` 필드는 반드시 첫 문장(한글 또는 서비스명)으로 시작 — `\n`, `\n\n`, 공백으로 시작 절대 금지

**규칙 4** 보기 40자 이내, 4개 길이 균일(최대 50% 차이). 형식 우선순위:
- ✅ 서비스명 단독 > 서비스 A+B 조합(2개까지) > 간결한 명사구
- ❌ 파이프(`|`) 구분 복합 매핑, 한 보기에 3개 이상 서비스 열거 금지
- ❌ `개념 – 설명` 형식 금지: 대시(–, -, —)로 설명을 붙이는 보기 텍스트 절대 금지
  - ❌ 금지 예: `"비지도학습 – 레이블 없이 패턴을 발견"`
  - ✅ 올바른 예: `"비지도학습"` (설명은 `explanation` 필드에만 기재)

**규칙 5 (시험 범위 내 보기 생성)** 4개 보기는 모두 `domain_tags`에 명시된 해당 시험 범위 내의 서비스/개념이어야 한다.
- 정답 1개: 질문에 가장 적합한 서비스/개념 (AI 지식 + 공식 문서 기준으로 결정)
- 오답 3개: 관련 있지만 이 질문에는 부적합한 서비스/개념. 수험생이 고민할 만큼 그럴듯해야 함. 오답끼리 서로 다른 개념

**규칙 5a (보기 해설 필수)** 4개 모든 보기에 `explanation` 필드 필수. 빈 문자열(`""`) 또는 생략 절대 금지.
- 정답 보기: 왜 이 서비스/개념이 이 질문에 가장 적합한지 (1~2문장)
- 오답 보기: 왜 이 서비스/개념이 이 질문에 적합하지 않은지 (1~2문장)
- ❌ 빈 해설 금지: `"explanation": ""` → FAIL
- ❌ 단순 반복 금지: `"explanation": "Amazon Polly"` (보기 텍스트와 동일한 내용) → FAIL

**규칙 6** 보기 간 중복·혼동 금지. 4개 보기가 각각 다른 서비스나 접근법.

**규칙 7** 단일 정답 4지선다. `correct_option_id` = `a`/`b`/`c`/`d` 중 1개.

**규칙 8** key_points: `{핵심 개념 제목}\n• 포인트1\n• 포인트2\n• 포인트3` (3~5개). `key_point_images` 필드 사용 금지.

**규칙 9** ref_links: JSON 배열 1~3개. `docs.aws.amazon.com` 또는 `aws.amazon.com` 도메인만 허용. 각 링크에 name(한국어), name_en, name_pt, name_es, name_ja 포함 필수.

**규칙 10** 하나의 핵심 개념만 테스트. 여러 요구사항→여러 서비스 동시 매핑 구조 금지.

**규칙 11 (기술적 호환성)** 정답으로 선택한 서비스/개념이 질문의 기술적·수치적 조건과 실제로 호환되는지 검토한다. 다른 서비스가 더 명백히 적합하다면 정답을 수정한다.

#### source_language에 따른 처리 방식

| source_language | 처리 방식 |
|----------------|----------|
| `"en"` (영문 입력) | 한국어로 번역 → `text` 필드에 저장. STEP 5.5에서 다시 영문 번역 |
| `"ko"` (한국어 입력) | 그대로 `text` 필드에 저장 |

**문제 1개당 출력 구조 (STEP 5.5 다국어 번역 완료 후 최종):**
```json
{
  "id": "awsaifc01-q166",
  "exam_id": "aws-aif-c01",
  "text": "첫 번째 문장. 두 번째 문장.\n\n질문은?",
  "text_en": "First sentence. Second sentence.\n\nWhich AWS service BEST meets these requirements?",
  "text_pt": "Primeira frase. Segunda frase.\n\nQual serviço AWS MELHOR atende a esses requisitos?",
  "text_es": "Primera oración. Segunda oración.\n\n¿Qué servicio de AWS MEJOR cumple con estos requisitos?",
  "text_ja": "最初の文。2番目の文。\n\nこの要件を最も適切に満たすAWSサービスはどれですか？",
  "correct_option_id": "b",
  "explanation": "문제 전체 해설 (왜 정답인지 + 오답 설명)",
  "explanation_en": "Full explanation in English (why correct + why each distractor is wrong)",
  "explanation_pt": "Explicação completa em Português",
  "explanation_es": "Explicación completa en Español",
  "explanation_ja": "日本語での完全な解説",
  "key_points": "핵심 개념 제목\n• 포인트 1\n• 포인트 2\n• 포인트 3",
  "key_points_en": "Key Concept Title\n• Point 1\n• Point 2\n• Point 3",
  "key_points_pt": "Título do Conceito-Chave\n• Ponto 1\n• Ponto 2\n• Ponto 3",
  "key_points_es": "Título del Concepto Clave\n• Punto 1\n• Punto 2\n• Punto 3",
  "key_points_ja": "重要概念タイトル\n• ポイント1\n• ポイント2\n• ポイント3",
  "ref_links": "[{\"name\": \"한국어 문서명\", \"name_en\": \"English Doc Name\", \"name_pt\": \"Nome do documento\", \"name_es\": \"Nombre del documento\", \"name_ja\": \"ドキュメント名\", \"url\": \"https://docs.aws.amazon.com/...\"}]",
  "options": [
    {
      "option_id": "a",
      "text": "...(한국어)", "text_en": "...(English)", "text_pt": "...(Português)", "text_es": "...(Español)", "text_ja": "...(日本語)",
      "explanation": "왜 오답인지", "explanation_en": "Why incorrect", "explanation_pt": "Por que incorreto", "explanation_es": "Por qué incorrecto", "explanation_ja": "なぜ不正解か",
      "sort_order": 1
    },
    {
      "option_id": "b",
      "text": "...(한국어)", "text_en": "...(English)", "text_pt": "...(Português)", "text_es": "...(Español)", "text_ja": "...(日本語)",
      "explanation": "왜 정답인지", "explanation_en": "Why correct", "explanation_pt": "Por que correto", "explanation_es": "Por qué correcto", "explanation_ja": "なぜ正解か",
      "sort_order": 2
    },
    {
      "option_id": "c",
      "text": "...(한국어)", "text_en": "...(English)", "text_pt": "...(Português)", "text_es": "...(Español)", "text_ja": "...(日本語)",
      "explanation": "왜 오답인지", "explanation_en": "Why incorrect", "explanation_pt": "Por que incorreto", "explanation_es": "Por qué incorrecto", "explanation_ja": "なぜ不正解か",
      "sort_order": 3
    },
    {
      "option_id": "d",
      "text": "...(한국어)", "text_en": "...(English)", "text_pt": "...(Português)", "text_es": "...(Español)", "text_ja": "...(日本語)",
      "explanation": "왜 오답인지", "explanation_en": "Why incorrect", "explanation_pt": "Por que incorreto", "explanation_es": "Por qué incorrecto", "explanation_ja": "なぜ不正解か",
      "sort_order": 4
    }
  ],
  "tag": "도메인 태그 (한국어)",
  "tag_en": "Domain tag (English)",
  "tag_pt": "Tag de domínio (Português — domain_tags 포르투갈어 열에서 복사)",
  "tag_es": "Etiqueta de dominio (Español — domain_tags 스페인어 열에서 복사)",
  "tag_ja": "ドメインタグ（日本語 — domain_tags 日本語列からコピー）"
}
```

---

### STEP 4.5: 보기 순서 무작위화

STEP 4에서 생성한 4개 보기를 무작위로 재배치한다.

1. 정답 보기를 a/b/c/d 중 하나에 무작위 배치
2. 오답 3개를 나머지 위치에 무작위 배치
3. `option_id`(a/b/c/d)와 `sort_order`(1/2/3/4)를 새 배치에 맞게 재할당
4. `correct_option_id`를 새 정답 위치로 업데이트

---

### STEP 5: 품질 자기검증 (간결 형식)

아래 항목을 체크. **결과는 PASS/FAIL 한 줄씩만 출력**한다 (상세 설명 불필요):

```
[PASS] 정답 논리 유효성 (질문에 가장 적합한 서비스/개념인지)
[PASS] 오답 그럴듯함 (수험생이 고민할 만큼 관련성 있음)
[PASS] 한국어 자연스러움 (번역된 text 필드)
[PASS] 원문 서비스명 보존 (AWS/GCP/Azure 서비스명 원문 유지)
[PASS] 보기 길이·형식 단순성: 40자 이내, 대시(–, -, —) + 설명 형식 없음
[PASS] 항목 간 쏠림 없음 (4개 보기가 각각 다른 서비스/개념)
[PASS] 질문 명확성 (단일 정답을 특정할 수 있음)
[PASS] 단일 개념 집중
[PASS] 시험 범위 준수: 보기 4개가 모두 domain_tags 시험 범위 내 서비스/개념
[PASS] 규칙 3: 줄바꿈 서식 (질문 앞 \n\n 확인, 4문장+ 시 첫 문장 뒤 \n\n 확인)
[PASS] 기술적 호환성: 정답 서비스가 질문의 수치·패턴 조건과 실제 호환됨
[PASS] 보기 해설 완결성: options 4개 모두 explanation 필드에 1문장 이상 (빈 문자열·null 불가)
[PASS] 참고자료: ref_links 1~3개 유효 URL + name/name_en/name_pt/name_es/name_ja 모두 포함
[PASS] 언어 순수성: text 및 options[].text에 영어 문장 없음 — 특히 질문 문장(마지막 문장, ?로 끝나는 문장)이 한국어인지 확인
[PASS] options 완결성: a, b, c, d 4개 보기 모두 text + explanation 필드 누락 없음
[PASS] 영문 언어 순수성: text_en 및 options[].text_en에 한국어·일본어 등 비영어 문자 없음
[PASS] text 선행 공백 없음: text 및 text_en 필드가 \n, 공백 없이 첫 문장으로 바로 시작
```

- **전체 PASS** → STEP 5.5로 진행
- **하나라도 FAIL** → 해당 항목만 수정 후 재검증 (최대 2회)
  - 보기 해설 완결성 FAIL: 빈/누락된 explanation에 1~2문장 작성 후 재검증
  - 언어 순수성 FAIL: 영어 문장(특히 질문 문장)을 한국어로 교체 후 재검증
  - options 완결성 FAIL: 누락된 보기 추가 후 재검증
  - 영문 언어 순수성 FAIL: 비영어 문자를 영어로 교체 후 재검증
  - text 선행 공백 FAIL: 선행 \n/공백 제거 후 재검증
- **2회 재시도 후에도 FAIL** → 해당 문제 에스컬레이션 결과 저장 후 다음 문제로 진행

---

### STEP 5.5: 다국어 번역 (EN/ES/PT/JA)

STEP 5 품질 검증이 전체 PASS된 후 실행한다. `translation_guide`가 `null`이면 일반 번역을 수행한다.

**번역 대상 필드:**

| 필드 | 설명 |
|------|------|
| `text_en` | 문제 전체 (질문 문장 포함) — 영어 |
| `text_pt` | 문제 전체 — 포르투갈어 (브라질) |
| `text_es` | 문제 전체 — 스페인어 (라틴아메리카) |
| `text_ja` | 문제 전체 — 일본어 |
| `explanation_en/pt/es/ja` | 전체 해설 |
| `key_points_en/pt/es/ja` | 핵심 암기사항 |
| `options[].text_en/pt/es/ja` | 각 보기 텍스트 |
| `options[].explanation_en/pt/es/ja` | 각 보기별 해설 |
| `ref_links[].name_en/pt/es/ja` | 참고자료 링크 이름 |
| `tag_en` | 도메인 태그 영문명 (domain_tags 파일의 영문 태그 사용) |
| `tag_pt` | 도메인 태그 포르투갈어명 (domain_tags 파일 포르투갈어 열에서 복사) |
| `tag_es` | 도메인 태그 스페인어명 (domain_tags 파일 스페인어 열에서 복사) |
| `tag_ja` | 도메인 태그 일본어명 (domain_tags 파일 일본어 열에서 복사) |

**번역 필수 규칙:**

1. **서비스명 원문 보존** — 모든 언어에서 번역하거나 축약하지 않는다 (Amazon SageMaker, Amazon Bedrock 등)
2. **영어 번역 (text_en, explanation_en 등)**: AWS 시험 공식 문체
   - 질문 문장: "Which AWS service BEST meets these requirements?", "What is the MOST cost-effective solution?"
   - 강조 표현: MOST, BEST, LEAST, MINIMUM, MAXIMUM 등 대문자 사용
3. **포르투갈어 번역 (text_pt, explanation_pt 등)**: 브라질 포르투갈어 기준
   - 질문 문장: "Qual serviço AWS MELHOR atende a esses requisitos?"
4. **스페인어 번역 (text_es, explanation_es 등)**: 라틴아메리카 표준 스페인어
   - 질문 문장: "¿Qué servicio de AWS MEJOR cumple con estos requisitos?"
5. **일본어 번역 (text_ja, explanation_ja 등)**: 자연스러운 일본어 시험 문체
   - 질문 문장: "この要件を最も適切に満たすAWSサービスはどれですか？"
6. **기술 용어**: translation_guide의 공식 영문 표현 우선 사용 (영어), 각 언어별 자연스러운 번역 적용
7. **언어 순수성 (절대 규칙)**:
   - `_en` 접미사 필드 → 반드시 **영어(English)**로만 작성. 한국어·일본어·포르투갈어 절대 금지
   - `_pt` 접미사 필드 → 반드시 **포르투갈어(Português)**로만 작성. 한국어·영어 절대 금지
   - `_es` 접미사 필드 → 반드시 **스페인어(Español)**로만 작성. 한국어·영어 절대 금지
   - `_ja` 접미사 필드 → 반드시 **일본어(日本語)**로만 작성. 한국어·영어 절대 금지
   - 접미사 없는 필드(`text`, `explanation`, `key_points`, `options[].text`, `options[].explanation`, `tag`) → 반드시 **한국어(한글)**로만 작성. 한자(漢字)·일본어·영어 문장 절대 금지 (서비스명 영문 제외)
   - AWS/GCP/Azure 서비스명만 모든 언어에서 원문 유지
8. **번역 자기검증** (text, explanation, key_points, options[], ref_links[].name* 모든 언어 필드 대상):
   - `_ja` 필드에 한글(가-힣) 포함 → 일본어로 재번역
   - `_pt` 필드에 한글/일본어 문자 포함 → 포르투갈어로 재번역
   - `_es` 필드에 한글/일본어 문자 포함 → 스페인어로 재번역
   - `_en` 필드에 한글/일본어 포함 → 영어로 재번역
   - 접미사 없는 필드(한국어)에 일본어 문자(ひ, カ 등) 또는 한자(U+4E00-U+9FFF, 예: 實·間·回) 포함 → 순수 한글로 재작성
9. **선행 공백 금지**: 모든 `text_*` 필드는 첫 문장으로 바로 시작. `\n`, `\n\n`, 공백으로 시작 금지

번역 검증 실패 시: 해당 필드만 재번역 (최대 1회). 재시도 후에도 실패하면 일반 번역으로 대체하고 계속 진행한다 (에스컬레이션 없이).

---

### STEP 6: Supabase 즉시 삽입 (`task == "pipeline_batch"` 전용)

STEP 5.5까지 성공한 문제를 **임시 파일 없이** `--questions-json` 인자로 직접 삽입한다:

```python
import subprocess, json

# 성공한 문제만 추출
successful_questions = [r["result"] for r in batch_results if r["success"]]

# 임시 파일 저장 없이 --questions-json으로 직접 전달
questions_json_str = json.dumps(successful_questions, ensure_ascii=False)
result = subprocess.run(
    [
        'python3', insert_script_path,
        '--questions-json', questions_json_str,
        '--set-id', set_id,
        '--sort-order-start', str(sort_order_start),
    ],
    capture_output=True, text=True
)
print(result.stdout)
if result.returncode != 0:
    print(result.stderr)
```

- 삽입 성공 ID는 `inserted_ids`에 기록
- 삽입 실패 ID는 `failures`에 기록
- 에스컬레이션으로 스킵된 문제는 `skipped`에 기록

---

## 에스컬레이션 처리

에스컬레이션이 발생한 문제는 결과 배열에 실패 항목으로 포함하고 다음 문제 처리를 계속한다.

```
❌ 문제 {number}번 에스컬레이션 필요
사유: {실패 항목} — {이유}
원문 질문: {원문 질문 텍스트 요약}
시도 1: 실패 ({이유})
시도 2: 실패 ({이유})
[A] 재생성 지시 입력 / [B] 스킵
```

---

## Main에 반환

배치 내 모든 문제 처리 완료 후 결과 배열을 반환한다.

```json
{
  "task": "pipeline_batch",
  "results": [
    {
      "question_number": 1,
      "success": true,
      "inserted_id": "awsaifc01-q717",
      "result": { /* 생성된 문제 객체 */ }
    },
    {
      "question_number": 2,
      "success": false,
      "escalation_type": "quality_fail",
      "escalation_message": "❌ 문제 2번 에스컬레이션 필요\n..."
    }
  ],
  "inserted_ids": ["awsaifc01-q717", "awsaifc01-q718"],
  "failures": [],
  "skipped": [2]
}
```

## 중요 사항

- Main을 통하지 않고 Parser & SQL Agent를 직접 호출하지 않는다
- `key_points`는 반드시 "제목\n• 포인트" 형식 (`key_point_images` 필드 없음)
- `ref_links`는 JSON 문자열로 직렬화: `"[{\"name\": \"한국어\", \"name_en\": \"English\", \"name_pt\": \"Português\", \"name_es\": \"Español\", \"name_ja\": \"日本語\", \"url\": \"...\"}]"`
- AWS/GCP/Azure 서비스명은 반드시 원문 그대로 보존
- **파일을 읽거나 쓰지 않는다** — 입력은 프롬프트, 출력은 JSON 텍스트 반환
- 에스컬레이션이 발생해도 배치 내 나머지 문제 처리를 중단하지 않는다
- ⚠️ **`options[].explanation`과 `options[].explanation_en`은 4개 모든 보기에 필수** — 누락 시 STEP 5 FAIL
- ⚠️ **`ref_links`는 빈 배열 불가** — 반드시 관련 공식 문서 링크 1~3개 포함, 각 링크에 name/name_en/name_pt/name_es/name_ja 필수 (누락 시 STEP 5 FAIL)
