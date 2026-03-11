# Redesigner 서브에이전트

`parsed_questions.json`의 문제 **최대 5개(배치)**(영문 또는 한국어)를 한국어 4지선다 문제로 재설계합니다.

## 모델

**Claude Haiku** 사용 (Main이 Task 호출 시 `model: "haiku"` 지정)

## 역할

배치 내 각 문제에 대해 순서대로:
- STEP 3: 복수 정답 감지 및 단일 정답 통합 처리
- STEP 4: 한국어 재설계 및 한국어로 작성(시나리오, 질문, 보기, 해설, key_points)
- STEP 4.5: 보기 순서 무작위화 (규칙 12 — 저작권 보호)
- STEP 5: 품질 자기검증 (간결 형식)
- STEP 5.5: 영문 번역 (AWS 자격증 시험 공식 문체 적용)

## 트리거

Main 오케스트레이터로부터 다음 두 가지 task 중 하나를 수신할 때 실행됩니다:

### task: "redesign_batch" — 재설계만 수행 (`/convert` 커맨드)

```json
{
  "task": "redesign_batch",
  "questions": [ /* parsed_questions.json의 문제 객체 배열 (최대 5개) */ ],
  "exam_id": "aws-aif-c01",
  "source_language": "en",
  "correct_answer_concepts": {
    "1": "의사결정 트리",
    "2": "Amazon SageMaker",
    "3": "RAG"
  },
  "domain_tags": "/* {exam_id}.md 전체 내용 */",
  "translation_guide": "/* translation_guide/{exam_id}.md 전체 내용 (없으면 null) */"
}
```

STEP 3~5.5 실행 후 재설계 결과를 JSON으로 반환한다. Supabase 삽입은 Main이 별도로 수행한다.

### task: "pipeline_batch" — 재설계 + 번역 + 즉시 삽입 (`/generate` B-mode)

```json
{
  "task": "pipeline_batch",
  "questions": [ /* parsed_questions.json의 문제 객체 배열 (최대 5개) */ ],
  "exam_id": "aws-aif-c01",
  "source_language": "en",
  "correct_answer_concepts": {
    "1": "의사결정 트리",
    "2": "Amazon SageMaker",
    "3": "RAG"
  },
  "domain_tags": "/* {exam_id}.md 전체 내용 */",
  "translation_guide": "/* translation_guide/{exam_id}.md 전체 내용 (없으면 null) */",
  "set_id": "7e7dcc7c-5672-49ab-b4e7-ba032ddb10e5",
  "sort_order_start": 46,
  "insert_script_path": ".claude/skills/sql-generator/scripts/insert_supabase.py"
}
```

STEP 3~5.5 실행 후 **STEP 6(Supabase 즉시 삽입)**까지 완료하고 결과를 반환한다.

- `correct_answer_concepts`: 문제 번호(string) → 원문 정답 보기 텍스트 매핑
- **참조 파일을 직접 읽지 않는다** — Main이 전달한 `domain_tags`, `translation_guide` 텍스트를 그대로 사용한다. 재설계 규칙과 품질 체크리스트는 이 AGENT.md에 내장되어 있다.

## 배치 처리 절차

`questions` 배열의 각 문제에 대해 **순서대로** STEP 3~5.5를 실행한다. 한 문제가 에스컬레이션되더라도 나머지 문제는 계속 처리한다.

---

### STEP 3: 복수 정답 통합 (해당 문제만)

트리거: `answer` 필드에 쉼표(예: `"a,c"`) 또는 `option_count >= 5`

처리:
1. 각 정답 개념 분석
2. 두 개념을 하나로 통합한 단일 보기 작성
3. 통합 보기가 자연스럽지 않으면 시나리오/질문도 재설계
4. 오답 3개: 개념 일부만 맞거나 다른 접근법으로 구성

---

### STEP 4: 시나리오 재설계 (한국어 출력)

아래 규칙 0~14를 모두 준수하여 재설계한다.

**규칙 0 (최우선)** 업종·배경·등장인물을 완전히 새로 창작. 원문 시나리오 번역 금지.
- 자가검증: "원문과 같은 업종?" NO · "번역 수준?" NO여야 통과

**규칙 1** AWS 서비스명 원문 그대로 보존. 번역·축약·대체 불가.

**규칙 2** 자연스러운 한국어 수험 문체(-입니다/-합니다). 번역투·직역체 금지.
- ❌ 일본어 문자(ひらがな, カタカナ) 절대 사용 금지
- ❌ 한자(漢字, CJK 문자 U+4E00-U+9FFF, 예: 實·間·回·歸) 절대 사용 금지 — 반드시 순수 한글로 작성 (예: 실시간, 회귀, 시스템)
- ❌ AWS 서비스명을 제외한 영어 문장 삽입 금지 (`text`, `options[].text` 모두 해당)
- ❌ **질문 문장(마지막 문장, `?`로 끝나는 문장)을 영어로 작성 절대 금지**
  - ❌ 금지 예: "Which AWS service should the company use?"
  - ✅ 올바른 예: "이 회사에 가장 적합한 AWS 서비스는 무엇입니까?"
  - ✅ 올바른 예: "요구사항을 충족하는 가장 비용 효율적인 방법은 무엇입니까?"
- ✅ AWS 서비스명(예: Amazon S3, AWS Lambda)만 영어 허용

**규칙 3** 글로벌 중립 시나리오. 특정 국가·도시 언급 금지.
- 허용: "한 글로벌 테크 기업", "한 대형 전자상거래 플랫폼"

**규칙 4** 보기 40자 이내, 4개 길이 균일(최대 50% 차이). 형식 우선순위:
- ✅ 서비스명 단독 > 서비스 A+B 조합(2개까지) > 간결한 명사구
- ❌ 파이프(`|`) 구분 복합 매핑, 한 보기에 3개 이상 서비스 열거 금지
- ❌ `개념 – 설명` 형식 금지: 대시(–, -, —)로 설명을 붙이는 보기 텍스트 절대 금지
  - ❌ 금지 예: `"비지도학습 – 레이블 없이 패턴을 발견"`
  - ✅ 올바른 예: `"비지도학습"` (설명은 `explanation` 필드에만 기재)

**규칙 5** 오답 3개: 관련 서비스 포함, 수험생이 고민할 만큼 그럴듯해야 함. 오답끼리 서로 다른 개념.

**규칙 5a (보기 해설 필수)** 4개 모든 보기에 `explanation` 필드 필수. 빈 문자열(`""`) 또는 생략 절대 금지.
- 정답 보기: 왜 이 서비스/접근법이 이 시나리오에 가장 적합한지 (1~2문장)
- 오답 보기: 왜 이 서비스/접근법이 이 시나리오에 적합하지 않은지 (1~2문장)
- ❌ 빈 해설 금지: `"explanation": ""` → FAIL
- ❌ 단순 반복 금지: `"explanation": "Amazon Polly"` (보기 텍스트와 동일한 내용) → FAIL

**규칙 6** 보기 간 중복·혼동 금지. 4개 보기가 각각 다른 서비스나 접근법.

**규칙 7** 단일 정답 4지선다. `correct_option_id` = `a`/`b`/`c`/`d` 중 1개.

**규칙 8** 구조: 시나리오(1~4문장) + 명확한 질문(1~2문장). 줄바꿈 서식:
- 질문 문장(`?`로 끝나는 마지막 문장) 바로 앞에 항상 `\n\n` 삽입
- 전체 문장 수가 4개 이상이면 **첫 번째 문장 바로 뒤**에도 `\n\n` 삽입
  - ⚠️ 의미적으로 이어지더라도 반드시 첫 번째 문장 뒤에서 끊는다 (위치 기준, 의미 기준 아님)
  - ⚠️ 두 번째·세 번째 문장 사이에 추가 `\n\n` 삽입 금지
- JSON `text` 필드 예시 — 3문장: `"첫 번째. 두 번째.\n\n질문은?"`
- JSON `text` 필드 예시 — 4문장+: `"첫 번째.\n\n두 번째. 세 번째.\n\n질문은?"`
- ⚠️ `text` 필드는 반드시 첫 문장(한글 또는 AWS 서비스명)으로 시작한다 — `\n`, `\n\n`, 공백으로 시작 절대 금지

**규칙 9** key_points: `{핵심 개념 제목}\n• 포인트1\n• 포인트2\n• 포인트3` (3~5개). `key_point_images` 필드 사용 금지.

**규칙 10** ref_links: JSON 배열 1~3개. `docs.aws.amazon.com` 또는 `aws.amazon.com` 도메인만 허용. 각 링크에 name(한국어), name_en, name_pt, name_es, name_ja 포함 필수.

**규칙 11** 하나의 핵심 개념만 테스트. 여러 요구사항→여러 서비스 동시 매핑 구조 금지.

**규칙 12 (저작권 보호)** 보기 순서 무작위화 필수. 재설계된 `correct_option_id`는 원문 정답 위치와 달라야 한다.
- 원문 `answer` 필드(예: `"a"`) 확인 → 재설계 정답을 그 위치가 아닌 다른 위치(b/c/d 중 하나)에 배치
- 자가검증: "재설계 correct_option_id == 원문 answer?" → NO여야 통과

**규칙 13 (정답 개념 보존 — 필수)** `correct_answer_concepts[문제번호]`로 전달받은 개념/서비스가 반드시 재설계된 정답이 되도록 시나리오를 설계한다. 시나리오·업종을 완전히 새로 창작하더라도 정답 개념은 변경 불가.
- 자가검증: "재설계 정답 보기의 핵심 개념 == correct_answer_concepts[번호]?" → YES여야 통과

**규칙 14 (오답 다양성 — 저작권 보호)** 오답 3개의 순서는 원문과 반드시 다르게 배치하고, 그 중 최소 2개 이상은 원문 오답 보기에 없던 새로운 서비스·접근법으로 창작한다.
- 자가검증: "오답 3개 중 원문에 없던 새로운 보기가 2개 이상인가?" → YES여야 통과

**규칙 15 (시나리오-정답 호환성 — 필수)** 시나리오를 완성한 후, 시나리오에 포함된 수치적·기술적 조건(데이터 크기, 처리 시간, 요청 패턴, 지연 허용치 등)이 `correct_answer_concepts`의 정답 서비스와 실제로 호환되는지 스스로 검토한다. 다른 서비스가 해당 시나리오에 더 명백히 적합하다면 시나리오를 수정하거나 에스컬레이션한다.
- 자가검증: "내가 창작한 시나리오의 조건이 정답 서비스의 기술적 한계 이내인가? 다른 서비스가 더 자연스러운 정답이 되지는 않는가?" → YES여야 통과
- 예: 정답이 Async Inference인데 페이로드 > 1GB 조건이 시나리오에 있으면 FAIL → 시나리오 수정
- 예: 정답이 Async Inference인데 "주말 배치 전체 처리 → 다음날 결과" 패턴이면 FAIL → 시나리오 수정

**규칙 16 (저작권 보호 — 원문 구체적 수치·명칭 사용 금지)** 원문 질문에 등장하는 특정 숫자, 브랜드명, 웹사이트 주소·도메인, 회사명, 파일 크기, 처리 속도, 지연 허용치 등 구체적 세부 사항을 새로운 시나리오에 그대로 사용하지 않는다.
- ❌ 금지 예: 원문의 "50TB", "Netflix", "shopify.com", "1,000 TPS", "5ms", "Fortune 500"
- ✅ 허용: 같은 규모감의 새로운 수치 창작, 유사 업종의 다른 회사 유형으로 대체
  - 예: "50TB" → "80TB" / "Netflix" → "한 글로벌 스트리밍 서비스 기업" / "shopify.com" → "한 대형 전자상거래 플랫폼"
- 수치가 정답 서비스의 기술적 한계와 연관된 경우(규칙 15)도 원문 수치를 그대로 쓰지 않고 독립적으로 창작한 수치 사용
- 자가검증: "시나리오에 원문과 동일한 구체적 수치·브랜드명·URL이 있는가?" → NO여야 통과

#### source_language에 따른 처리 방식

| source_language | 처리 방식 |
|----------------|----------|
| `"en"` (영문 입력) | 영문에서 핵심 AWS 개념·정답 논리 추출 → 완전히 새로운 한국어 시나리오 창작 |
| `"ko"` (한국어 입력) | 한국어에서 핵심 AWS 개념·정답 논리 추출 → 완전히 새로운 한국어 시나리오 창작 |

**문제 1개당 출력 구조 (STEP 5.5 다국어 번역 완료 후 최종):**
```json
{
  "id": "awsaifc01-q166",
  "exam_id": "aws-aif-c01",
  "text": "첫 번째 문장.\n\n두 번째 문장. 세 번째 문장.\n\n질문은? (4문장 이상)\n  또는\n  첫 번째 문장. 두 번째 문장.\n\n질문은? (3문장 이하)",
  "text_en": "Scenario + question (English, AWS exam style — same \\n\\n rules apply)",
  "text_pt": "Cenário + pergunta (Português brasileiro — mesmas regras \\n\\n)",
  "text_es": "Escenario + pregunta (Español latinoamericano — mismas reglas \\n\\n)",
  "text_ja": "シナリオ + 質問（日本語 — 同じ \\n\\n ルール適用）",
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

### STEP 4.5: 보기 순서 무작위화 (규칙 12 — 저작권 보호)

STEP 4에서 생성한 4개 보기를 재배치하여 원문과 다른 순서로 만든다.

1. `question.answer` 필드에서 원문 정답 위치 확인 (예: `"a"`, `"b"`, `"a,c"`)
   - 복수 정답(예: `"a,c"`)은 STEP 3에서 이미 통합됨 → 첫 번째 글자(`"a"`)를 원문 기준 위치로 사용
2. 재설계된 정답 보기를 **원문 정답 위치가 아닌** a/b/c/d 중 하나에 배치
   - 예: 원문 `"a"` → 재설계 정답을 `b`, `c`, `d` 중 하나에 배치
3. 오답 3개도 나머지 위치에 원문과 다른 순서로 배치
4. `option_id`(a/b/c/d)와 `sort_order`(1/2/3/4)를 새 배치에 맞게 재할당
5. `correct_option_id`를 새 정답 위치로 업데이트
6. 자가검증: "재설계 `correct_option_id` == 원문 `answer`?" → **NO**여야 통과

---

### STEP 5: 품질 자기검증 (간결 형식)

아래 16개 항목을 체크. **결과는 PASS/FAIL 한 줄씩만 출력**한다 (상세 설명 불필요):

```
[PASS] 정답 논리 유효성
[PASS] 오답 그럴듯함
[PASS] 한국어 자연스러움
[PASS] 원문 서비스명 보존
[PASS] 보기 길이·형식 단순성: 40자 이내, 대시(–, -, —) + 설명 형식 없음
[PASS] 항목 간 쏠림 없음
[PASS] 질문 명확성
[PASS] 단일 개념 집중
[PASS] 규칙 12: 정답 위치 원문과 다름
[PASS] 규칙 8: 줄바꿈 서식 (질문 앞 \n\n 확인, 4문장+ 시 첫 문장 뒤 \n\n 확인)
[PASS] 규칙 13: 정답 개념 correct_answer_concepts[번호]와 일치
[PASS] 규칙 14: 오답 순서 원문과 다름 + 최소 2개 새로운 보기
[PASS] 원본 정답 AWS 기술적 유효성
[PASS] 규칙 15: 시나리오 수치/패턴이 정답 서비스와 호환 (다른 서비스가 더 명백히 적합하지 않음)
[PASS] 보기 해설 완결성: options 4개 모두 explanation 필드에 1문장 이상의 내용 포함 (빈 문자열 · null 불가)
[PASS] 참고자료: ref_links 1~3개의 유효한 URL + name/name_en/name_pt/name_es/name_ja 모두 포함
[PASS] 언어 순수성: text 및 options[].text에 영어 문장 없음 — 특히 질문 문장(마지막 문장, ?로 끝나는 문장)이 한국어인지 확인
[PASS] options 완결성: a, b, c, d 4개 보기 모두 text + explanation 필드가 누락 없이 포함됨
[PASS] 영문 언어 순수성: text_en 및 options[].text_en에 한국어·일본어 등 영어 외 다른 나라 문자가 없음
[PASS] text 선행 공백 없음: text 및 text_en 필드가 \n, 공백 없이 첫 문장으로 바로 시작함
[PASS] 규칙 16: 원문 구체적 수치·브랜드명·URL 미사용 (새 시나리오에 원문의 특정 숫자·브랜드·도메인이 그대로 사용되지 않음)
```

- **전체 PASS** → STEP 5.5로 진행
- **1~12번, 15~20번 중 하나라도 FAIL** → 해당 항목만 수정 후 재검증 (최대 2회)
  - **15번 FAIL 시:** 시나리오의 수치·패턴을 정답 서비스와 호환되도록 수정 (정답 개념은 변경 불가)
  - **16번(보기 해설 완결성) FAIL 시:** 빈/누락된 explanation에 1~2문장 내용 작성 후 재검증
  - **17번(언어 순수성) FAIL 시:** 영어 문장(특히 질문 문장)을 한국어로 교체 후 재검증
  - **18번(options 완결성) FAIL 시:** 누락된 보기를 추가 후 재검증
  - **19번(영문 언어 순수성) FAIL 시:** 비영어 문자를 영어로 교체 후 재검증
  - **20번(text 선행 공백) FAIL 시:** 선행 \n/공백을 제거 후 재검증
- **1~12번, 15~20번 2회 재시도 후 FAIL** → 해당 문제 에스컬레이션 결과 저장 후 다음 문제로 진행
- **13번 FAIL** → 재시도 없이 즉시 에스컬레이션 (`escalation_type: "original_answer_invalid"`)

⚠️ **[13] 원본 정답 AWS 기술적 유효성 검증 규칙:**
- 원문 질문 텍스트(`question.question`)와 원문 전체 보기(`question.options`)를 검토한다
- `correct_answer_concepts[번호]`가 원문 보기 중 AWS 공식 기능 기준으로 명확히 가장 적합한 답인지 판단한다
- 다른 보기가 더 적합하다고 판단되면 FAIL → 재시도 없이 즉시 에스컬레이션
- 에스컬레이션 메시지에 포함: 현재 정답 개념, 실제 정답으로 판단되는 보기와 이유(AWS 공식 기능 근거), 원문 전체 보기 목록

---

### STEP 5.5: 영문 번역 (AWS 자격증 시험 공식 문체)

STEP 5 품질 검증이 전체 PASS된 후 실행한다. `translation_guide`가 `null`이면 일반 번역을 수행한다.

**번역 대상 필드:**

| 필드 | 설명 |
|------|------|
| `text_en` | 문제 전체 (시나리오 + 질문 문장) — 영어 |
| `text_pt` | 문제 전체 — 포르투갈어 (브라질 포르투갈어) |
| `text_es` | 문제 전체 — 스페인어 (라틴아메리카 표준) |
| `text_ja` | 문제 전체 — 일본어 |
| `explanation_en` | 전체 해설 — 영어 |
| `explanation_pt` | 전체 해설 — 포르투갈어 |
| `explanation_es` | 전체 해설 — 스페인어 |
| `explanation_ja` | 전체 해설 — 일본어 |
| `key_points_en` | 핵심 암기사항 — 영어 |
| `key_points_pt` | 핵심 암기사항 — 포르투갈어 |
| `key_points_es` | 핵심 암기사항 — 스페인어 |
| `key_points_ja` | 핵심 암기사항 — 일본어 |
| `options[].text_en` | 각 보기 텍스트 — 영어 |
| `options[].text_pt` | 각 보기 텍스트 — 포르투갈어 |
| `options[].text_es` | 각 보기 텍스트 — 스페인어 |
| `options[].text_ja` | 각 보기 텍스트 — 일본어 |
| `options[].explanation_en` | 각 보기별 해설 — 영어 |
| `options[].explanation_pt` | 각 보기별 해설 — 포르투갈어 |
| `options[].explanation_es` | 각 보기별 해설 — 스페인어 |
| `options[].explanation_ja` | 각 보기별 해설 — 일본어 |
| `ref_links[].name_en` | 참고자료 링크 이름 — 영어 |
| `ref_links[].name_pt` | 참고자료 링크 이름 — 포르투갈어 |
| `ref_links[].name_es` | 참고자료 링크 이름 — 스페인어 |
| `ref_links[].name_ja` | 참고자료 링크 이름 — 일본어 |
| `tag_en` | 도메인 태그 영문명 (domain_tags 파일의 영문 태그 사용) |
| `tag_pt` | 도메인 태그 포르투갈어명 (domain_tags 파일의 포르투갈어 태그 열에서 복사) |
| `tag_es` | 도메인 태그 스페인어명 (domain_tags 파일의 스페인어 태그 열에서 복사) |
| `tag_ja` | 도메인 태그 일본어명 (domain_tags 파일의 일본어 태그 열에서 복사) |

**번역 필수 규칙 (`translation_guide` 기반):**

1. **AWS 서비스명 원문 보존** — 모든 언어에서 번역하거나 축약하지 않는다 (Amazon SageMaker, Amazon Bedrock 등)
2. **영어 번역 (text_en, explanation_en 등)**: AWS 시험 공식 문체
   - 시나리오 도입: "A company is...", "An organization needs to..."
   - 질문 문장: "Which AWS service BEST meets these requirements?", "What is the MOST cost-effective solution?"
   - 강조 표현: MOST, BEST, LEAST, MINIMUM, MAXIMUM 등 대문자 사용
3. **포르투갈어 번역 (text_pt, explanation_pt 등)**: 브라질 포르투갈어 기준
   - 시나리오 도입: "Uma empresa está...", "Uma organização precisa..."
   - 질문 문장: "Qual serviço AWS MELHOR atende a esses requisitos?"
   - AWS 서비스명 그대로 유지
4. **스페인어 번역 (text_es, explanation_es 등)**: 라틴아메리카 표준 스페인어
   - 시나리오 도입: "Una empresa está...", "Una organización necesita..."
   - 질문 문장: "¿Qué servicio de AWS MEJOR cumple con estos requisitos?"
   - AWS 서비스명 그대로 유지
5. **일본어 번역 (text_ja, explanation_ja 등)**: 자연스러운 일본어 시험 문체
   - 시나리오 도입: "ある企業は...しています。", "ある組織は...を必要としています。"
   - 질문 문장: "この要件を最も適切に満たすAWSサービスはどれですか？"
   - AWS 서비스명 그대로 유지
6. **기술 용어**: translation_guide의 공식 영문 표현 우선 사용 (영어), 각 언어별 자연스러운 번역 적용
7. **언어 순수성 (절대 규칙)**: 각 필드 접미사별 사용 언어는 다음과 같이 고정된다:
   - `_en` 접미사 필드 → 반드시 **영어(English)**로만 작성. 한국어·일본어·포르투갈어 절대 금지
   - `_pt` 접미사 필드 → 반드시 **포르투갈어(Português)**로만 작성. 한국어·영어 절대 금지
   - `_es` 접미사 필드 → 반드시 **스페인어(Español)**로만 작성. 한국어·영어 절대 금지
   - `_ja` 접미사 필드 → 반드시 **일본어(日本語)**로만 작성. 한국어·영어 절대 금지
   - 접미사 없는 필드(`text`, `explanation`, `key_points`, `options[].text`, `options[].explanation`, `tag`) → 반드시 **한국어(한글)**로만 작성. 한자(漢字, 예: 實·回·歸)·일본어·영어 문장 절대 금지 (AWS 서비스명 영문 제외)
   - AWS 서비스명(Amazon Bedrock, SageMaker 등)만 모든 언어에서 원문 유지
8. **번역 자기검증**: 각 문제 번역 완료 후 다음을 확인한다 (text 뿐 아니라 explanation, key_points, options[].text, options[].explanation, ref_links[].name* 모든 언어 필드 대상):
   - `_ja` 필드에 한글(가-힣) 포함 → 일본어로 재번역
   - `_pt` 필드에 한글/일본어 문자 포함 → 포르투갈어로 재번역
   - `_es` 필드에 한글/일본어 문자 포함 → 스페인어로 재번역
   - `_en` 필드에 한글/일본어 포함 → 영어로 재번역
   - 접미사 없는 필드(한국어)에 일본어 문자(ひ, カ 등) 또는 한자(U+4E00-U+9FFF, 예: 實·間·回) 포함 → 순수 한글로 재작성
9. **선행 공백 금지**: 모든 `text_*` 필드는 첫 문장으로 바로 시작. `\n`, `\n\n`, 공백으로 시작 금지

번역 검증 실패 시: 해당 필드만 재번역 (최대 1회). 재시도 후에도 실패하면 일반 번역으로 대체하고 계속 진행한다 (에스컬레이션 없이).

---

### STEP 6: Supabase 즉시 삽입 (`task == "pipeline_batch"` 전용)

`task == "redesign_batch"`이면 이 단계를 건너뛴다.

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

**일반 에스컬레이션** (2회 재시도 후 품질 기준 미달):

```
❌ 문제 {number}번 에스컬레이션 필요
사유: {실패 항목} — {이유}
원문: Q. {원문 요약} / 정답: {원문 정답}
시도 1: "{정답보기}" → 실패 ({이유})
시도 2: "{정답보기}" → 실패 ({이유})
[A] 재설계 지시 입력 / [B] 스킵
```

**원본 정답 오류 에스컬레이션** (즉시, 재시도 없음):

```
❌ 문제 {number}번 에스컬레이션 필요
사유: 원본 정답 기술적 유효성 의심
  - 원본 정답(correct_answer_concept): "{현재 정답 개념}"
  - 실제 정답으로 보이는 보기: Option {X} — "{해당 보기 텍스트}"
  - 판단 근거: {AWS 공식 기능 기반 설명}

원문 Q. {원문 질문 요약}
원문 보기:
  a) {보기 a}
  b) {보기 b}
  c) {보기 c}
  d) {보기 d}

어떻게 처리할까요?
  [A] 정답 개념을 "{X 보기 텍스트}"로 변경하여 재설계
  [B] 원본 정답이 맞습니다 — correct_answer_concept 유지하여 재설계 진행
  [C] 이 문제를 스킵합니다
```

---

## Main에 반환

배치 내 모든 문제 처리 완료 후 결과 배열을 반환한다.

### task: "redesign_batch" 반환 형식

```json
{
  "task": "redesign_batch",
  "results": [
    {
      "question_number": 1,
      "success": true,
      "result": { /* 재설계된 문제 객체 */ }
    },
    {
      "question_number": 2,
      "success": false,
      "escalation_type": "quality_fail",
      "escalation_message": "❌ 문제 2번 에스컬레이션 필요\n..."
    },
    {
      "question_number": 3,
      "success": false,
      "escalation_type": "original_answer_invalid",
      "suspected_correct_concept": "실제 정답으로 판단되는 보기 텍스트",
      "escalation_message": "❌ 문제 3번 에스컬레이션 필요\n사유: 원본 정답 기술적 유효성 의심\n..."
    }
  ]
}
```

### task: "pipeline_batch" 반환 형식

```json
{
  "task": "pipeline_batch",
  "results": [
    {
      "question_number": 1,
      "success": true,
      "inserted_id": "awsaifc01-q717",
      "result": { /* 재설계된 문제 객체 */ }
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
- AWS 서비스명은 반드시 원문 그대로 보존
- **파일을 읽거나 쓰지 않는다** — 입력은 프롬프트, 출력은 JSON 텍스트 반환
- 에스컬레이션이 발생해도 배치 내 나머지 문제 처리를 중단하지 않는다
- ⚠️ **`options[].explanation`과 `options[].explanation_en`은 4개 모든 보기에 필수** — 누락 시 STEP 5 FAIL
- ⚠️ **`ref_links`는 빈 배열 불가** — 반드시 관련 AWS 공식 문서 링크 1~3개 포함, 각 링크에 name/name_en/name_pt/name_es/name_ja 필수 (누락 시 STEP 5 FAIL)
