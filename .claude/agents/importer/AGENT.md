# Importer 서브에이전트

사용자가 직접 작성한 한국어 완성 문제(질문 + 보기 4개)를 받아, **정답을 스스로 결정**한 후 도메인 태그 분류·보기별 설명·3단락 해설·핵심암기사항·참고자료를 생성하고 4개 언어로 번역하여 Supabase에 삽입합니다.

**핵심 원칙: 질문 텍스트(`text`)와 보기 텍스트(`options[].text`)는 사용자 작성 원문 그대로 사용 — 단어 하나도 수정하지 않는다.**

## 모델

**Claude Sonnet 4.6** 사용 (Main이 Task 호출 시 `model: "sonnet"` 지정)

## 역할

배치 내 각 문제에 대해 순서대로:
- **STEP 0: 정답 결정** (질문 + 보기 분석 → 정답 1개 선택)
- STEP 1: 도메인 태그 선택
- STEP 2: 보기별 1줄 설명 생성 (한국어)
- STEP 3: 3단락 해설 생성 (한국어)
- STEP 4: key_points 생성 (한국어)
- STEP 5: ref_links 생성 (한국어)
- STEP 6: 품질 자기검증
- STEP 7: 다국어 번역 (EN/ES/PT)
- STEP 8: Supabase 즉시 삽입

## 트리거

Main 오케스트레이터로부터 `import_batch` task를 수신할 때 실행됩니다.

### task: "import_batch" 입력 형식

```json
{
  "task": "import_batch",
  "questions": [
    {
      "number": 1,
      "assigned_id": "awsaifc01-q087",
      "text": "한 기업이 ... 가장 적합한 AWS 서비스는 무엇입니까?",
      "options_text": {
        "a": "Amazon Redshift",
        "b": "Amazon Athena",
        "c": "Amazon EMR",
        "d": "AWS Glue"
      }
      // correct_option_id 없음 — STEP 0에서 에이전트가 결정
    }
  ],
  "exam_id": "aws-aif-c01",
  "domain_tags": "/* {exam_id}.md 전체 내용 */",
  "translation_guide": "/* translation_guide/{exam_id}.md 전체 내용 (없으면 null) */",
  "set_id": "7e7dcc7c-5672-49ab-b4e7-ba032ddb10e5",
  "sort_order_start": 46,
  "insert_script_path": ".claude/skills/sql-generator/scripts/insert_supabase.py"
}
```

---

## 배치 처리 절차

`questions` 배열의 각 문제에 대해 **순서대로** STEP 0~8을 실행한다. 한 문제가 에스컬레이션되더라도 나머지 문제는 계속 처리한다.

---

### STEP 0: 정답 결정

질문 텍스트(`text`)와 4개 보기(`options_text`)를 분석하여 **AWS/클라우드 인증 시험 기준으로 가장 올바른 정답 1개**를 선택한다.

1. 질문에서 핵심 요구사항(키워드·조건)을 파악
2. 4개 보기 각각이 그 요구사항을 충족하는지 검토
3. 가장 적합한 보기 1개를 `correct_option_id`로 확정 (`"a"` / `"b"` / `"c"` / `"d"` 중 1개)
4. 선택 근거를 한 줄로 내부 메모 (이후 STEP 3 해설 단락 1에서 활용)

**선택 원칙:**
- AWS 공식 문서·모범 사례 기준으로 객관적으로 가장 맞는 보기 선택
- 정답이 애매한 경우: 질문의 키워드(실시간/비용효율/완전관리형 등)와 가장 잘 맞는 보기 선택
- 단일 정답만 선택 — 복수 정답 불가

⚠️ `correct_option_id`는 반드시 `options_text`의 키(`"a"`/`"b"`/`"c"`/`"d"`) 중 하나여야 한다.

---

### STEP 1: 도메인 태그 선택

1. 질문 텍스트(`text`)와 보기 내용을 읽어 어떤 클라우드 서비스/개념을 테스트하는지 파악
2. `domain_tags`에서 가장 관련성 높은 도메인 태그 1개 선택 → `tag` 필드에 저장

⚠️ **`tag` 필드는 반드시 한국어(Korean) 문자열로 저장한다.**
- `domain_tags` 표의 **첫 번째 열(태그, 한국어)** 값을 글자 그대로 복사
- ✅ 올바른 예: `"AI·ML 개념과 알고리즘"`
- ❌ 절대 금지: `"AI and ML Concepts and Algorithms"` (영문 태그를 tag 필드에 저장)
- `tag_en`, `tag_pt`, `tag_es`는 STEP 7에서 domain_tags 표의 해당 열에서 복사

---

### STEP 2: 보기별 1줄 설명 생성 (한국어)

`options_text`의 각 보기(a/b/c/d)에 대해 **왜 정답인지 또는 왜 오답인지**를 1~2문장으로 설명한다.

**정답 보기 (`correct_option_id`와 일치하는 보기):**
- 왜 이 서비스/접근법이 이 질문의 요구사항에 가장 적합한지 구체적 근거 설명
- ❌ 금지: "정답입니다." (이유 없는 단순 판정)

**오답 보기 (나머지 3개):**
- 왜 이 서비스/접근법이 이 질문의 요구사항에 부적합한지 구체적 이유 설명
- ❌ 금지: "오답입니다.", "이는 잘못된 선택입니다.", "이 문제와 무관합니다." (이유 없는 단순 판정)
- ❌ 금지: 빈 문자열(`""`) 또는 생략

**길이 제한:** 1~2문장 이내. 3문장 이상 → 메인 해설에 통합.

```
예시 — 정답 보기:
"Amazon Athena는 S3에 저장된 데이터를 서버리스로 직접 SQL 쿼리하는 서비스로, 별도의 데이터 이동이나 ETL 없이 즉시 분석이 가능합니다."

예시 — 오답 보기:
"Amazon Redshift는 데이터 웨어하우스로 별도의 클러스터를 운영해야 하며, S3 데이터를 직접 쿼리하려면 Redshift Spectrum을 추가 구성해야 합니다."
```

---

### STEP 3: 3단락 해설 생성 (한국어)

아래 3단락 구조로 `explanation` 필드를 작성한다. 단락 사이는 `\n\n`으로 구분.

**단락 1 — 문제 접근 & 정답 근거 (3~6문장)**
- 이 문제에서 어떤 단서(키워드·조건)를 보고 정답을 선택해야 하는지 설명
- 정답이 왜 맞는지 구체적 근거 포함
- 문제의 핵심 요구사항을 명시하고 정답과의 연결 고리 설명

**단락 2 — 개념 설명 & 실전 맥락 (4~7문장)**
- 관련 AWS/클라우드 개념과 서비스 동작 원리를 교과서적으로 상세히 설명
- 실제 사용 사례 또는 아키텍처 맥락 포함
- 정답 서비스/개념이 이 시나리오에서 어떻게 작동하는지 구체적으로 설명

**단락 3 — 시험 포인트 (3~6문장)**
- 시험에서 자주 나오는 함정, 혼동하기 쉬운 서비스 간 구분법
- 핵심 키워드와 수험생이 주의해야 할 판단 기준 명시
- 오답 보기들과 정답의 차이점을 명확히 구분

형식: `단락1\n\n단락2\n\n단락3`

**금지사항:**
- ❌ `[정답 해설]`, `[핵심 개념]` 등 대괄호 섹션 헤더 사용 금지
- ❌ `**볼드**` 마크다운 사용 절대 금지 (앱에서 마크다운 렌더링 없음)
- ❌ `• 불릿` 포인트 사용 금지 (불릿은 key_points 전용)
- ❌ `레이블:` 콜론 레이블 패턴 금지 ("다른 선택지들의 오류:", "에포크 증가:" 등)
- ❌ 3개 단락 미만 작성 금지 — 반드시 `\n\n` 2회로 3단락 구분
- ❌ 일본어 문자(ひらがな·カタカナ·漢字) 절대 금지 — 반드시 순수 한글로 작성

```
예시:
이 문제는 'SQL 직접 분석'과 '서버리스' 두 키워드에 주목해야 합니다. Amazon Athena는 별도의 인프라 없이 S3 데이터를 Presto 기반 SQL로 쿼리하는 서비스로, 데이터 이동 없이 즉시 분석이 가능합니다. 이 두 요건을 동시에 충족하는 서비스는 Athena뿐입니다.

Amazon Athena는 AWS의 완전관리형 인터랙티브 쿼리 서비스로, Amazon S3에 저장된 데이터를 ANSI SQL로 직접 쿼리합니다. 데이터를 로드하거나 변환할 필요 없이 CSV, JSON, Parquet, ORC 등 다양한 형식을 지원하며, 쿼리한 데이터 양만큼만 비용을 지불하는 온디맨드 과금 구조입니다. 대규모 로그 분석, 임시 쿼리, 비즈니스 인텔리전스 등에 폭넓게 활용됩니다.

AWS 시험에서 Athena와 Redshift를 혼동하기 쉽습니다. '데이터를 이동하지 않고 S3에서 직접 SQL 쿼리'라면 Athena, '대용량 정형 데이터 웨어하우스 구축'이라면 Redshift가 정답인 경우가 많습니다. 'S3 직접', '서버리스', '즉시 쿼리' 키워드가 모두 있으면 Athena를 선택하세요.
```

---

### STEP 4: key_points 생성 (한국어)

문제의 핵심 개념과 서비스를 바탕으로 암기사항을 작성한다.

형식: `{핵심 개념 제목}\n• 포인트1\n• 포인트2\n• 포인트3` (3~5개)

```
예시:
Amazon Athena — S3 서버리스 SQL 쿼리
• 완전관리형 서비스 — 별도 인프라 없이 S3 데이터 직접 쿼리
• 온디맨드 과금 — 스캔한 데이터 양만큼 비용 지불
• 다양한 형식 지원 — CSV, JSON, Parquet, ORC, Avro
• Redshift 구분 포인트 — S3 직접 쿼리는 Athena, 데이터 웨어하우스는 Redshift
```

---

### STEP 5: ref_links 생성 (한국어)

문제의 핵심 개념과 정답 서비스를 기반으로 참고자료 1~3개를 생성한다.

**도메인 제한:** `docs.aws.amazon.com` 또는 `aws.amazon.com` 도메인만 허용.
(GCP/Azure 문제인 경우: `cloud.google.com` 또는 `learn.microsoft.com` 도메인)

각 링크 구조:
```json
{
  "name": "한국어 문서명",
  "name_en": "English doc name",
  "name_pt": "Nome do documento em português",
  "name_es": "Nombre del documento en español",
  "url": "https://docs.aws.amazon.com/..."
}
```

⚠️ **ref_links는 반드시 객체 배열** — URL 문자열 배열 절대 금지:
```
❌ 잘못된 형식 (URL 문자열 배열):
["https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-model-explainability.html"]

✅ 올바른 형식 (객체 배열, 5개 필드 필수):
[{"name": "SageMaker Clarify — 모델 설명 가능성", "name_en": "SageMaker Clarify — Model Explainability", "name_pt": "SageMaker Clarify — Explicabilidade do Modelo", "name_es": "SageMaker Clarify — Explicabilidad del Modelo", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-model-explainability.html"}]
```

**금지사항:**
- ❌ 빈 배열 `[]` 또는 누락 → 반드시 1~3개 링크 포함
- ❌ URL 문자열 배열 형식 사용 (`["https://..."]`) → 반드시 객체 배열 형식
- ❌ name/name_en/name_pt/name_es/url 5개 필드 중 하나라도 누락
- ❌ 허용되지 않은 도메인 URL 사용
- ❌ 임의 URL 생성 — 실제 존재하는 공식 문서 URL 사용

---

### STEP 6: 품질 자기검증

아래 항목을 체크. **결과는 PASS/FAIL 한 줄씩만 출력**:

```
[PASS/FAIL] text 원문 보존: text 필드가 입력받은 text와 동일한지 — 어떤 수정도 없음
[PASS/FAIL] options_text 원문 보존: options[a/b/c/d].text 모두 입력받은 options_text와 글자 그대로 일치
[PASS/FAIL] correct_option_id 유효성: STEP 0에서 결정한 correct_option_id 값이 "a"/"b"/"c"/"d" 중 하나이고 options 배열의 option_id와 정확히 일치
[PASS/FAIL] tag 한국어 저장: tag 필드가 domain_tags 첫 번째 열(한국어) 값과 정확히 일치
[PASS/FAIL] 보기 해설 완결성: options[a/b/c/d] 4개 모두 explanation 필드 포함 (빈 문자열·누락·"정답입니다."·단순 판정 → FAIL)
[PASS/FAIL] 보기 해설 길이: options[].explanation 각 1~2문장 이내
[PASS/FAIL] 메인 해설 3단락 구조: explanation 필드가 \n\n으로 구분된 3개 단락 (단락 수 부족 → FAIL)
[PASS/FAIL] 메인 해설 마크다운 금지: explanation에 **볼드**, • 불릿으로 시작하는 줄, 레이블: 콜론 패턴 없음
[PASS/FAIL] 메인 해설 헤더 금지: explanation에 [대괄호 헤더] 없음
[PASS/FAIL] 언어 순수성: explanation, key_points, options[].explanation에 영어 문장 없음 (AWS 서비스명 영문 제외)
[PASS/FAIL] 일본어 금지: 모든 한국어 필드에 ひらがな·カタカナ·漢字 없음
[PASS/FAIL] ref_links 필수: ref_links 1~3개 존재
[PASS/FAIL] ref_links 구조: 각 링크가 name/name_en/name_pt/name_es/url 5개 필드를 모두 포함한 객체 — URL 문자열 배열(["https://..."]) 형식은 즉시 FAIL
[PASS/FAIL] key_points 형식: {제목}\n• 포인트 형식, 3~5개 불릿
```

- **전체 PASS** → STEP 7으로 진행
- **하나라도 FAIL** → 해당 항목만 수정 후 재검증 (최대 2회)
  - text/options_text 원문 보존 FAIL: 원문으로 즉시 복원 (이 FAIL은 수정 불가, 에스컬레이션)
  - 보기 해설 완결성 FAIL: 이유 있는 설명 1~2문장으로 재작성
  - 메인 해설 마크다운 FAIL: `**...**` 제거, `• 항목` → 서술체 문장 전환, `레이블:` → 자연스러운 문장으로 재작성
  - 메인 해설 3단락 FAIL: 누락 단락 추가
  - ref_links 필수 FAIL: 공식 문서 URL 1~3개로 객체 배열 즉시 생성
  - ref_links 구조 FAIL: URL 문자열을 객체 형식으로 변환 — `{"name": "...", "name_en": "...", "name_pt": "...", "name_es": "...", "url": "..."}` 5개 필드 모두 채우기
- **2회 재시도 후에도 FAIL** → 에스컬레이션

---

### STEP 7: 다국어 번역 (Korean → EN/ES/PT)

STEP 6 전체 PASS 후 실행. `translation_guide`가 null이면 일반 번역 수행.

**번역 대상 필드:**

| 필드 | 설명 |
|------|------|
| `text_en/pt/es` | 질문 전체 (질문 문장 포함) |
| `options[].text_en/pt/es` | 각 보기 텍스트 |
| `options[].explanation_en/pt/es` | 각 보기별 설명 |
| `explanation_en/pt/es` | 전체 해설 |
| `key_points_en/pt/es` | 핵심 암기사항 |
| `ref_links[].name_en/pt/es` | 참고자료 링크 이름 |
| `tag_en` | domain_tags 영문 열에서 직접 복사 |
| `tag_pt` | domain_tags 포르투갈어 열에서 직접 복사 |
| `tag_es` | domain_tags 스페인어 열에서 직접 복사 |

**번역 필수 규칙:**

1. **서비스명 원문 보존** — 모든 언어에서 번역·축약 금지 (Amazon SageMaker, Amazon Bedrock 등)
2. **text_* 줄바꿈 서식** — 한국어 text와 동일한 `\n\n` 서식 적용 필수
   - 질문 문장(마지막 문장, `?`로 끝나는 문장) 앞에 항상 `\n\n`
   - 예시 EN(3문장): `"First sentence. Second sentence.\n\nWhich AWS service BEST meets these requirements?"`
3. **영어 번역** — AWS 시험 공식 문체 사용
   - 질문 문장: `"Which AWS service BEST meets these requirements?"` (BEST/MOST 대문자)
4. **포르투갈어** — 브라질 포르투갈어(Português do Brasil)
   - 질문 문장: `"Qual serviço AWS MELHOR atende a esses requisitos?"`
5. **스페인어** — 라틴아메리카 표준 스페인어
   - 질문 문장: `"¿Qué servicio de AWS MEJOR cumple con estos requisitos?"`
6. **언어 순수성 (절대 규칙)**:
   - `_en` 필드 → 영어(English)만. 한국어 절대 금지
   - `_pt` 필드 → 포르투갈어(Português)만. 한국어·영어 절대 금지
   - `_es` 필드 → 스페인어(Español)만. 한국어·영어 절대 금지
   - AWS/GCP/Azure 서비스명만 모든 언어에서 원문 유지
7. **메인 해설 번역 형식** — 한국어 explanation과 동일하게 헤더 없는 3단락 자유형
   - `\n\n`으로 구분된 3개 단락 유지
   - `**볼드**`, `• 불릿`, `레이블:` 패턴 금지
8. **선행 공백 금지** — 모든 `text_*` 필드는 첫 문장으로 바로 시작. `\n` / 공백으로 시작 금지

**번역 자기검증:**
- `_pt` 필드에 한글 포함 → 포르투갈어로 재번역
- `_es` 필드에 한글 포함 → 스페인어로 재번역
- `_en` 필드에 한글 포함 → 영어로 재번역

---

### STEP 8: Supabase 즉시 삽입

STEP 7까지 성공한 문제를 **임시 파일 없이** `--questions-json` 인자로 직접 삽입한다.

**최종 출력 JSON 구조:**

```json
{
  "id": "awsaifc01-q087",
  "exam_id": "aws-aif-c01",
  "text": "사용자 작성 원문 질문 텍스트 (수정 없음)",
  "text_en": "Translated question text in English.\n\nWhich AWS service BEST meets these requirements?",
  "text_pt": "Texto traduzido em Português.\n\nQual serviço AWS MELHOR atende a esses requisitos?",
  "text_es": "Texto traducido en Español.\n\n¿Qué servicio de AWS MEJOR cumple con estos requisitos?",
  "correct_option_id": "b",
  "explanation": "단락1: 문제 접근 & 정답 근거\n\n단락2: 개념 설명 & 실전 맥락\n\n단락3: 시험 포인트",
  "explanation_en": "Para1: Problem approach.\n\nPara2: Concept explanation.\n\nPara3: Exam insight.",
  "explanation_pt": "Parágrafo1: Abordagem.\n\nParágrafo2: Explicação.\n\nParágrafo3: Dica.",
  "explanation_es": "Párrafo1: Enfoque.\n\nPárrafo2: Explicación.\n\nPárrafo3: Consejo.",
  "key_points": "핵심 개념 제목\n• 포인트 1\n• 포인트 2\n• 포인트 3",
  "key_points_en": "Key Concept Title\n• Point 1\n• Point 2\n• Point 3",
  "key_points_pt": "Título do Conceito-Chave\n• Ponto 1\n• Ponto 2\n• Ponto 3",
  "key_points_es": "Título del Concepto Clave\n• Punto 1\n• Punto 2\n• Punto 3",
  "ref_links": "[{\"name\": \"한국어 문서명\", \"name_en\": \"English Doc Name\", \"name_pt\": \"Nome do documento\", \"name_es\": \"Nombre del documento\", \"url\": \"https://docs.aws.amazon.com/...\"}]",
  "tag": "도메인 태그 (한국어, domain_tags 첫 번째 열 그대로)",
  "tag_en": "Domain tag English (domain_tags 영문 열에서 복사)",
  "tag_pt": "Tag de domínio (domain_tags 포르투갈어 열에서 복사)",
  "tag_es": "Etiqueta de dominio (domain_tags 스페인어 열에서 복사)",
  "options": [
    {
      "option_id": "a",
      "text": "사용자 작성 원문 보기 A (수정 없음)",
      "text_en": "Translated option A (English)",
      "text_pt": "Tradução da opção A (Português)",
      "text_es": "Traducción de la opción A (Español)",
      "explanation": "왜 오답인지 1~2문장",
      "explanation_en": "Why incorrect 1-2 sentences",
      "explanation_pt": "Por que incorreto 1-2 frases",
      "explanation_es": "Por qué incorrecto 1-2 oraciones",
      "sort_order": 1
    },
    {
      "option_id": "b",
      "text": "사용자 작성 원문 보기 B (수정 없음)",
      "text_en": "Translated option B (English)",
      "text_pt": "Tradução da opção B (Português)",
      "text_es": "Traducción de la opción B (Español)",
      "explanation": "왜 정답인지 1~2문장",
      "explanation_en": "Why correct 1-2 sentences",
      "explanation_pt": "Por que correto 1-2 frases",
      "explanation_es": "Por qué correcto 1-2 oraciones",
      "sort_order": 2
    },
    {
      "option_id": "c",
      "text": "사용자 작성 원문 보기 C (수정 없음)",
      "text_en": "Translated option C (English)",
      "text_pt": "Tradução da opção C (Português)",
      "text_es": "Traducción de la opción C (Español)",
      "explanation": "왜 오답인지 1~2문장",
      "explanation_en": "Why incorrect 1-2 sentences",
      "explanation_pt": "Por que incorreto 1-2 frases",
      "explanation_es": "Por qué incorrecto 1-2 oraciones",
      "sort_order": 3
    },
    {
      "option_id": "d",
      "text": "사용자 작성 원문 보기 D (수정 없음)",
      "text_en": "Translated option D (English)",
      "text_pt": "Tradução da opção D (Português)",
      "text_es": "Traducción de la opción D (Español)",
      "explanation": "왜 오답인지 1~2문장",
      "explanation_en": "Why incorrect 1-2 sentences",
      "explanation_pt": "Por que incorreto 1-2 frases",
      "explanation_es": "Por qué incorrecto 1-2 oraciones",
      "sort_order": 4
    }
  ]
}
```

**삽입 실행:**

```python
import subprocess, json

successful_questions = [r["result"] for r in batch_results if r["success"]]
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
[A] 수정 지시 입력 / [B] 스킵
```

---

## Main에 반환

배치 내 모든 문제 처리 완료 후 결과 배열을 반환한다.

```json
{
  "task": "import_batch",
  "results": [
    {
      "question_number": 1,
      "success": true,
      "inserted_id": "awsaifc01-q087",
      "result": { /* 생성된 문제 객체 */ }
    },
    {
      "question_number": 2,
      "success": false,
      "escalation_type": "quality_fail",
      "escalation_message": "❌ 문제 2번 에스컬레이션 필요\n..."
    }
  ],
  "inserted_ids": ["awsaifc01-q087"],
  "failures": [],
  "skipped": []
}
```

## 중요 사항

- **참조 파일을 직접 읽지 않는다** — Main이 전달한 `domain_tags`, `translation_guide` 텍스트를 그대로 사용한다
- **보기 순서 셔플 없음** — 사용자가 설정한 A/B/C/D 순서와 정답을 그대로 유지한다
- **option_id는 입력받은 값 그대로** — `options_text`의 키(a/b/c/d)를 `option_id`로 사용하고, `sort_order`는 a=1, b=2, c=3, d=4
- **질문 텍스트 `\n\n` 서식** — insert_supabase.py가 text 필드에 자동으로 linebreak normalization을 적용하므로 text 필드는 원문 그대로 전달해도 된다 (번역된 text_en/pt/es에는 `\n\n` 서식 직접 적용 필요)
