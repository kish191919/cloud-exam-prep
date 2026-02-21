# AWS AIF-C01 문제 변환 에이전트 설계서

> Claude Code 구현 참조용 계획서

---

## 1. 작업 컨텍스트 문서

### 배경 및 목적

영문 AWS Certified AI Practitioner (AIF-C01) 자격증 기출/모의 문제를 단순 번역이 아닌 **한국어 수험 환경에 맞게 재설계**하고, 학습 플랫폼 DB에 바로 적재 가능한 SQL 파일로 저장한다.

### 범위

- 입력: 영문 AIF-C01 문제 텍스트 붙여넣기 (Phase 1: URL 입력 미지원)
- 출력: 한국어로 재설계된 문제가 담긴 `.sql` 파일
- 제외: 문제 외 학습 콘텐츠(강의, 요약 노트 등) 변환 작업, URL fetch (Phase 2로 이월)

### 입출력 정의

| 구분 | 내용 |
|------|------|
| **입력** | 영문 문제 텍스트 (붙여넣기 — `/convert` 커맨드 실행 후 멀티턴 대화) |
| **출력** | `/output/{exam_id}-YYYYMMDD-{배치번호3자리}.sql` — INSERT 구문 포함 SQL 파일 |
| **중간 산출물** | `/output/parsed_questions.json` — 파싱 결과 + 처리 상태 (체크포인트) |
| **중간 산출물** | `/output/redesigned_questions.json` — 재설계 완료 결과 |

### 제약조건

- 보기는 반드시 4개 (원문이 5개 이상이면 가장 약한 오답 제거하여 4개로 축소)
- 정답 개념은 원문과 반드시 동일하게 유지 (보기 텍스트·순서는 재설계 가능)
- **AWS 서비스명은 반드시 원문과 동일하게 유지** (예: Amazon SageMaker → Amazon SageMaker, 개념만 유지하는 방식 불가)
- SQL 스키마는 실제 CLOUD-EXAM-PREP DB 구조를 준수 (아래 확정 스키마 참고)

### 확정된 DB 스키마

```sql
-- questions 테이블
questions (
  id TEXT PRIMARY KEY,                -- 예: 'awsaifc01-q166'
  exam_id TEXT NOT NULL,              -- 예: 'aws-aif-c01'
  text TEXT NOT NULL,                 -- 문제 본문
  correct_option_id TEXT NOT NULL,    -- 정답 보기 ID: 'a'|'b'|'c'|'d'
  explanation TEXT NOT NULL,          -- 문제 전체 해설
  key_points TEXT,                    -- 마크다운 불릿 리스트 3~5개
  ref_links JSONB DEFAULT '[]'        -- [{"name":"...","url":"..."}]
)

-- question_options 테이블
question_options (
  id UUID PRIMARY KEY,
  question_id TEXT NOT NULL,
  option_id TEXT NOT NULL,            -- 'a'|'b'|'c'|'d'
  text TEXT NOT NULL,                 -- 보기 텍스트
  explanation TEXT,                   -- 보기별 해설
  sort_order INTEGER NOT NULL         -- 1|2|3|4
)

-- question_tags 테이블
question_tags (
  id UUID PRIMARY KEY,
  question_id TEXT NOT NULL,
  tag TEXT NOT NULL
)

-- exam_set_questions 테이블 (exam_sets는 별도 관리)
exam_set_questions (
  set_id UUID NOT NULL,               -- exam_sets.id (UUID, Supabase API로 조회)
  question_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL
)
```

> ⚠️ `key_point_images` 컬럼은 DB에 존재하지 않으므로 INSERT 구문에서 제외한다.

### Question ID 규칙

**형식:** `{exam_code}-q{3자리번호}`
- exam_code: hyphens 제거 후 소문자 (예: `aws-aif-c01` → `awsaifc01`)
- 3자리번호: 현재 DB의 MAX(id) 숫자 조회 후 +1 (Supabase API 사용)

**예시:** `awsaifc01-q166`, `awsaifc01-q167`, ...

**충돌 방지:** 에이전트 실행 시작 시 Supabase API로 현재 최대 번호를 조회하여 배치 전체에 순차 번호를 사전 할당한다.

### SQL 파일명 규칙

**형식:** `{exam_id}-YYYYMMDD-{배치번호3자리}.sql`
- 예: `aws-aif-c01-20260220-001.sql`
- 같은 날짜에 여러 번 실행 시 배치번호 자동 증가 (001, 002, ...)
- 항상 새 파일 생성 (덮어쓰기 없음)

### 범용 에이전트 설계 (exam_id 파라미터화)

이 에이전트는 AIF-C01 전용이 아닌 **범용 구조**로 설계한다. `/convert` 실행 시 exam_id를 파라미터로 받아 SAA-C03 등 다른 시험에도 재사용 가능하다. 도메인 태그 목록 등 시험별 설정은 exam_id별 파일로 분리 관리한다.

### 용어 정의

| 용어 | 정의 |
|------|------|
| correct_option_id | 정답 보기의 알파벳 ('a'/'b'/'c'/'d') |
| option_id | 보기 식별자: 'a'/'b'/'c'/'d' |
| 재설계 | 원문 개념·서비스명 유지 + 한국어 시나리오·질문·보기 새롭게 작성 |
| 보기 축소 | 5개+ 보기에서 가장 논리적으로 약한 오답을 제거하여 4개로 만드는 작업 |
| 에스컬레이션 | LLM 재시도 한계 초과 시 실시간 채팅으로 사용자에게 개입 요청 |

---

## 2. 워크플로우 정의

### 실행 진입점: `/convert` 커맨드

```
사용자: /convert

에이전트: 안녕하세요! 문제 변환을 시작합니다. 다음 정보를 순서대로 입력해주세요.
  1. exam_id (예: aws-aif-c01)
  2. set_id UUID (Supabase exam_sets 테이블의 UUID)
  3. 변환할 영문 문제 텍스트를 붙여넣어 주세요.

사용자: aws-aif-c01 [입력]
에이전트: set_id UUID를 입력해주세요.

사용자: 550e8400-e29b-41d4-a716-446655440001 [입력]
에이전트: 변환할 영문 문제 텍스트를 붙여넣어 주세요. (여러 문제 한 번에 가능)

사용자: [문제 텍스트 붙여넣기]
→ 파이프라인 시작
```

### 전체 흐름도

```
[/convert 실행 — 멀티턴 대화로 exam_id, set_id, 텍스트 수집]
    │
    ├─ Supabase API: MAX(question id) 조회 → 배치 ID 사전 할당
    │
[STEP 1: 텍스트 파싱] (parse_text.py)
    │
[파싱 결과 검증] ──실패─→ [해당 문제 스킵 + 로그 + 결과 요약에 표시]
    │ 성공
[STEP 2: 구조 분석 및 개념 추출] (LLM 판단)
    │
[STEP 3: 복수 정답 여부 확인]
    ├─ 정답 2개 이상 (또는 보기 5개+) → [STEP 3A: 두 정답 개념 통합 재설계] → [STEP 3B: 단일 정답 구성 확인]
    └─ 정답 1개, 보기 4개 → 통과
    │
[STEP 4: 한국어 재설계] (LLM 생성 — 글로벌 중립적 시나리오)
    │
[STEP 5: 품질 자기검증] (LLM 자기검증) ──실패(최대 2회 재시도)──┐
    │ 통과                                                        │
    └────────────────────────────────────────────────────────────┘
    │
[체크포인트 저장: parsed_questions.json에 처리 상태 기록]
    │
[STEP 6: SQL 파일 생성] (generate_sql.py)
    │
[STEP 7: 결과 요약 출력]
```

### LLM 판단 영역 vs 코드 처리 영역

| 단계 | 처리 주체 | 내용 |
|------|----------|------|
| 텍스트 파싱 | 코드(스크립트) | 정규식으로 문제 블록 추출 |
| Supabase ID 조회 | 코드(스크립트) | API로 MAX(id) 조회 후 배치 번호 할당 |
| 구조 분석 | LLM | 핵심 서비스, 도메인, 정답 논리 파악 |
| 복수 정답 통합 판단 | LLM | 두 정답 개념을 하나의 보기로 통합하는 재설계 |
| 한국어 재설계 | LLM | 시나리오, 질문, 보기, 해설, key_points 작성 |
| 품질 자기검증 | LLM | 7개 체크리스트 항목 검증 |
| SQL 파일 생성 | 코드(스크립트) | 템플릿 기반 INSERT 구문 생성 및 파일 저장 |
| 결과 요약 | LLM | 처리 결과 메시지 작성 |

### 보기 축소 상세 흐름 (STEP 3A)

```
보기 5개 이상 감지
    │
    ├─ 각 오답 보기에 대해 "헷갈림 점수" 평가 (LLM 판단)
    │    기준: 정답과의 개념 유사도, 수험생이 혼동할 가능성
    │
    ├─ 헷갈림 점수 최하위 오답 제거 (5개→4개, 6개→4개 등)
    │
    └─ 정답 보기가 제거 대상에 포함되지 않았는지 확인
         ├─ 포함됨 → 다음 후보 오답 제거 후 재확인
         └─ 미포함 → 통과
```

### 배치 체크포인트 전략

`parsed_questions.json` 파일에 각 문제의 처리 상태를 기록하여, 중간 실패 시 완료된 문제는 건너뛰고 실패 지점부터 재개할 수 있다.

```json
[{
  "number": 21,
  "question": "...",
  "options": {"a":"...","b":"...","c":"...","d":"..."},
  "answer": "b",
  "option_count": 4,
  "status": "completed" | "redesigned" | "pending" | "failed",
  "assigned_id": "awsaifc01-q166"
}]
```

- `/convert` 재실행 시 `status: "completed"` 문제는 자동 스킵
- `status: "failed"` 문제는 에스컬레이션 목록에 포함

### 각 단계별 성공 기준 및 실패 처리

| 단계 | 성공 기준 | 검증 방법 | 실패 시 처리 |
|------|----------|----------|-------------|
| STEP 1: 파싱 | 문제 번호, 질문, 보기, 정답이 모두 추출됨 | 스키마 검증 (필수 필드 존재) | 해당 문제 번호 별도 표시 후 스킵 + 로그 |
| STEP 3A: 복수 정답 통합 | 단일 정답 보기 1개 + 오답 3개가 자연스럽게 구성됨 | LLM 자기검증 | 자동 재시도 (최대 2회) → 에스컬레이션 |
| STEP 4: 재설계 | 4개 보기, 정답 명시, 해설·key_points·ref_links 포함 | 스키마 검증 + LLM 자기검증 | 자동 재시도 (최대 2회) |
| STEP 5: 품질검증 | 7개 체크리스트 항목 모두 통과 | LLM 자기검증 | 자동 재시도 (최대 2회) → 에스컬레이션 |
| STEP 6: SQL 생성 | 파일 생성 성공, SQL 문법 오류 없음 | 규칙 기반 (INSERT 구문 파싱 가능 여부) | 자동 재시도 (최대 1회) → 에스컬레이션 |

### 에스컬레이션 처리 방식

2회 재시도 후에도 실패하면 에이전트가 **실시간 채팅으로 사용자에게 개입을 요청**한다.

```
[에이전트 메시지 예시]
❌ 문제 21번 에스컬레이션 필요
사유: 두 정답 개념의 통합이 자연스럽지 않습니다.

원문:
  Q. A company wants to... [원문 텍스트]
  Correct: A, C

2회 시도 결과:
  시도 1: "..." → 검증 실패 (정답-오답 구분 모호)
  시도 2: "..." → 검증 실패 (보기가 지나치게 유사)

어떻게 처리할까요?
  [A] 재설계 지시를 직접 입력해 주세요
  [B] 이 문제를 스킵하고 다음으로 진행합니다
```

---

## 3. 구현 스펙

### 폴더 구조

```
/project-root
  ├── CLAUDE.md                              # 메인 에이전트 지침 (오케스트레이터)
  ├── .env                                   # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  ├── /.claude
  │   ├── /agents
  │   │   ├── /parser-sql                    # Parser & SQL 서브에이전트
  │   │   │   └── AGENT.md
  │   │   └── /redesigner                    # Redesigner 서브에이전트
  │   │       └── AGENT.md
  │   └── /skills
  │       ├── /convert                       # /convert 슬래시 커맨드
  │       │   └── SKILL.md
  │       ├── /question-parser               # 문제 텍스트 파싱
  │       │   ├── SKILL.md
  │       │   └── /scripts
  │       │       └── parse_text.py          # 텍스트 블록 파싱 (정규식)
  │       ├── /question-redesigner           # 한국어 재설계 지침
  │       │   ├── SKILL.md
  │       │   └── /references
  │       │       ├── redesign_rules.md      # 재설계 규칙 (TBD)
  │       │       ├── domain_tags/
  │       │       │   └── aws-aif-c01.md     # AIF-C01 도메인 태그 목록
  │       │       └── quality_checklist.md   # 품질 자기검증 체크리스트 (7개 항목)
  │       └── /sql-generator                 # SQL 파일 생성
  │           ├── SKILL.md
  │           └── /scripts
  │               ├── generate_sql.py        # JSON → INSERT 구문 변환
  │               └── /templates
  │                   └── insert_template.sql # SQL INSERT 템플릿
  ├── /output
  │   ├── parsed_questions.json              # 파싱 중간 산출물 + 체크포인트
  │   ├── redesigned_questions.json          # 재설계 중간 산출물
  │   └── {파일명}.sql                        # 최종 SQL 파일
  └── /docs
      └── sample.sql                         # 스키마 참고용 샘플
```

> ⚠️ Phase 1에서 URL fetch는 지원하지 않으므로 `fetch_url.py`는 포함하지 않는다.

### CLAUDE.md 핵심 섹션 목록 (Main 오케스트레이터)

- 역할 정의: 오케스트레이터로서 전체 워크플로우 조율
- `/convert` 커맨드 처리: 멀티턴 대화로 exam_id, set_id, 텍스트 수집
- Supabase API 접근 방법: `.env`에서 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 읽기
- 배치 ID 사전 할당: 시작 시 MAX(id) 조회 → 배치 번호 할당
- 서브에이전트 호출 순서 및 데이터 전달 방식 (파일 경로 기반)
- 실패 처리 규칙 (재시도 횟수, 에스컬레이션 조건 및 사용자 개입 방식)
- 체크포인트 전략 (재개 로직)
- SQL 파일 명명 규칙 및 저장 경로
- 결과 요약 출력 형식

### AGENT.md 핵심 섹션 목록

**Parser & SQL Agent (`parser-sql/AGENT.md`)**
- 트리거 조건: Main으로부터 파싱 요청 또는 SQL 생성 요청 수신 시
- 입출력: 텍스트 → `parsed_questions.json` / `redesigned_questions.json` → `.sql`
- 참조 스킬: `question-parser`, `sql-generator`
- 체크포인트: `parsed_questions.json`의 `status` 필드 업데이트
- 에러 처리: 파싱 실패 문제 목록 Main에 반환

**Redesigner Agent (`redesigner/AGENT.md`)**
- 트리거 조건: Main으로부터 `parsed_questions.json` 경로 수신 시
- 입출력: `parsed_questions.json` → `redesigned_questions.json`
- 참조 스킬: `question-redesigner`
- 복수 정답 감지 및 통합 처리 기준 명시
- 재설계 품질 기준 및 자기검증 체크리스트 참조
- 에스컬레이션 발생 시 Main에 보고 (Main이 사용자에게 전달)

### 스킬 목록

| 스킬명 | 담당 에이전트 | 역할 | 트리거 조건 |
|--------|-------------|------|------------|
| `convert` | Main | 사용자 입력 수집 진입점 | /convert 커맨드 실행 시 |
| `question-parser` | Parser & SQL Agent | 텍스트 → `parsed_questions.json` | STEP 1: 입력 수신 직후 |
| `question-redesigner` | Redesigner Agent | 구조 분석, 복수 정답 통합, 한국어 재설계, 품질 검증 | STEP 2~5: 파싱 완료 후 |
| `sql-generator` | Parser & SQL Agent | `redesigned_questions.json` → SQL 파일 | STEP 6: 재설계 완료 후 |

**3개 에이전트** (Main 오케스트레이터 + 2개 서브에이전트)

재설계 단계는 재설계 규칙, 도메인 지식, 품질 체크리스트, 복수 정답 처리 로직 등 지침이 집중되므로 독립 서브에이전트로 분리한다. 파싱과 SQL 생성은 모두 스크립트 위주로 지침이 짧아 하나의 서브에이전트로 묶는다.

| 에이전트 | 파일 | 역할 |
|---------|------|------|
| **Main** | `CLAUDE.md` | 오케스트레이터: /convert 실행, 서브에이전트 호출 조율, 에스컬레이션 전달, 결과 요약 출력 |
| **Parser & SQL Agent** | `/.claude/agents/parser-sql/AGENT.md` | STEP 1 파싱 + STEP 6 SQL 생성 (스크립트 호출 위주) |
| **Redesigner Agent** | `/.claude/agents/redesigner/AGENT.md` | STEP 2~5: 구조 분석, 복수 정답 통합, 한국어 재설계, 품질 검증 |

**호출 흐름:**
```
Main (/convert 실행)
 ├─ Supabase API: MAX(id) 조회 → 배치 ID 할당
 ├─ Parser & SQL Agent 호출 (STEP 1: 파싱)
 │    └─ parsed_questions.json 반환
 ├─ Redesigner Agent 호출 (STEP 2~5: 재설계)
 │    ├─ redesigned_questions.json 반환
 │    └─ [에스컬레이션 발생 시 Main에 보고 → 사용자에게 실시간 전달]
 └─ Parser & SQL Agent 호출 (STEP 6: SQL 생성)
      └─ {파일명}.sql 반환
```

> 서브에이전트 간 직접 호출 금지 — 반드시 Main을 통해 조율

### 스킬별 상세

**`question-parser`**
- 입력: 원문 텍스트 문자열
- 출력: `/output/parsed_questions.json`
  ```json
  [{
    "number": 21,
    "question": "...",
    "options": {"a":"...","b":"...","c":"...","d":"...","e":"..."},
    "answer": "b",
    "option_count": 5,
    "status": "pending",
    "assigned_id": "awsaifc01-q166"
  }]
  ```
- 스크립트: `parse_text.py` (정규식 기반 텍스트 블록 파싱)
- 입력 텍스트 형식: TBD (첫 실제 사용 시 형식 확인 후 파서 업데이트)

**`question-redesigner`**
- 입력: `/output/parsed_questions.json` 경로
- 출력: `/output/redesigned_questions.json`
  ```json
  [{
    "id": "awsaifc01-q166",
    "exam_id": "aws-aif-c01",
    "text": "...",
    "correct_option_id": "b",
    "explanation": "...",
    "key_points": "핵심 개념 제목\n• 포인트 1\n• 포인트 2\n• 포인트 3",
    "ref_links": "[{\"name\":\"Amazon SageMaker 개발자 가이드\",\"url\":\"https://docs.aws.amazon.com/sagemaker/latest/dg/\"}]",
    "options": [
      {"option_id":"a","text":"...","explanation":"...","sort_order":1},
      {"option_id":"b","text":"...","explanation":"...","sort_order":2},
      {"option_id":"c","text":"...","explanation":"...","sort_order":3},
      {"option_id":"d","text":"...","explanation":"...","sort_order":4}
    ],
    "tag": "파운데이션 모델의 적용",
    "conversion_log": {...}
  }]
  ```
- 참조 파일: `redesign_rules.md`, `domain_tags/aws-aif-c01.md`, `quality_checklist.md`

**`sql-generator`**
- 입력: `/output/redesigned_questions.json` 경로, set_id (UUID)
- 출력: `/output/{exam_id}-YYYYMMDD-{배치번호}.sql`
- 스크립트: `generate_sql.py` + `insert_template.sql`
- 생성 테이블 순서: `questions` → `question_options` → `question_tags` → `exam_set_questions`

### 주요 산출물 파일 형식

| 파일 | 형식 | 설명 |
|------|------|------|
| `parsed_questions.json` | JSON Array | 파싱된 원문 문제 + 체크포인트 상태 |
| `redesigned_questions.json` | JSON Array | 재설계 완료 문제 |
| `{파일명}.sql` | SQL | 최종 INSERT 구문 파일 |

### 데이터 전달 방식

중간 산출물은 모두 `/output/` 디렉토리에 JSON 파일로 저장하고 다음 단계에는 **파일 경로만 전달**한다.

### Supabase 접근 방식

```
# .env 파일 (프로젝트 루트)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

에이전트가 `.env` 파일을 읽어 Supabase REST API를 호출한다:
- **MAX(id) 조회:** `GET /rest/v1/questions?select=id&exam_id=eq.{exam_id}&order=id.desc&limit=1`
- **set_id 조회 (선택):** 사용자가 set_id를 모르는 경우 `GET /rest/v1/exam_sets?exam_id=eq.{exam_id}` 목록을 보여주고 선택 요청

### LLM 모델 선택

**전 단계 Claude Sonnet 4.6 사용** (품질 우선)

---

## 4. 보기 축소 처리 상세 설계

### 배경

원문 AIF-C01에는 "두 개를 선택하시오 (Choose TWO)" 형식의 복수 정답 문제가 존재한다. 본 시스템은 **정답이 반드시 1개**인 4지선다 형식만 지원하므로, 복수 정답 문제는 반드시 단일 정답 문제로 재설계해야 한다.

### 트리거 조건

`parsed_questions.json`의 `option_count` 값이 5 이상이거나, `answer` 필드에 정답이 2개 이상인 문제

### 처리 원칙: 두 정답 개념의 통합 재설계

복수 정답 문제는 **오답을 제거하는 방식이 아니라**, 두 정답 개념을 하나의 새로운 보기로 통합하여 문제 자체를 재설계한다.

**처리 흐름:**

```
복수 정답 감지 (예: 정답 A + 정답 B)
    │
    ├─ 두 정답 개념 분석
    │    예) A = "Amazon SageMaker로 모델 학습"
    │        B = "S3에 학습 데이터 저장"
    │
    ├─ 두 개념을 포괄하는 단일 보기 작성
    │    예) "Amazon SageMaker로 모델을 학습하고 S3에 데이터를 저장한다"
    │
    ├─ 이 통합 보기가 정답(correct_option_id)이 됨
    │
    └─ 나머지 3개 오답 보기: 개념 일부만 맞거나 전혀 다른 접근법으로 재작성
         (수험생이 헷갈릴 수 있는 그럴듯한 오답으로 구성)
```

**재설계 시 유의사항:**
- 통합 보기가 지나치게 길어지면, 두 개념의 핵심만 요약하여 간결하게 작성
- 오답 3개는 각각 독립적으로 그럴듯해야 하며, 통합 보기와 명확히 구별되어야 함
- 통합된 내용이 자연스럽지 않을 경우, 질문(시나리오)도 함께 재설계하여 통합 보기가 자연스럽게 정답이 되도록 맥락을 조정

### 실패 처리

- 두 정답 개념의 통합이 논리적으로 어색한 경우: 에스컬레이션 (실시간 채팅으로 사용자에게 확인 요청)
- 2회 시도 후에도 자연스러운 단일 정답 구성 불가: 해당 문제 번호 표시 후 스킵 + 로그

### 처리 기록

재설계 결과를 `redesigned_questions.json`의 `conversion_log` 필드에 기록:
```json
{
  "conversion_log": {
    "original_answer_count": 2,
    "original_answers": ["A", "C"],
    "integration_method": "두 개념 통합",
    "note": "SageMaker 학습 + S3 데이터 저장을 하나의 보기로 통합"
  }
}
```

---

## 5. LLM 판단 상세 기준

### 품질 자기검증 체크리스트 (STEP 5 — 7개 항목)

LLM이 자기검증 시 다음 7개 항목을 순서대로 확인한다:

| # | 항목 | 검증 방법 |
|---|------|----------|
| 1 | **정답 논리 유효성** | 정답 보기가 명확히 옳은가? 근거가 있는가? |
| 2 | **오답 그럴듯함** | 각 오답이 수험생이 실제로 고민할 만큼 그럴듯한가? |
| 3 | **한국어 자연스러움** | 번역투 표현 없이 자연스러운 한국어인가? |
| 4 | **원문 AWS 서비스명 보존** | 원문에 등장한 서비스명이 재설계 후에도 동일하게 사용되는가? |
| 5 | **보기 길이 유사성** | 정답 보기만 유독 길거나 짧아서 힌트가 되지 않는가? |
| 6 | **항목 간 쏠림 없음** | 두 보기가 거의 같은 말이어서 혼동을 주지는 않는가? |
| 7 | **두 번 읽으면 답이 명확** | 문제를 두 번 읽었을 때 정답이 일관되게 동일한가? |

**판정:** 7개 중 하나라도 실패 시 → 재설계 재시도 트리거

### 재설계 시나리오 스타일

- **글로벌 중립적 배경 사용** (특정 지역 없이)
- 예: "한 글로벌 테크 기업의 ML 엔지니어가...", "한 금융 서비스 회사의 데이터 사이언티스트가..."
- 언어는 한국어이지만 지역 특정 맥락(서울, 한국 기업 등)은 사용하지 않음

---

## 6. 도메인 태그 목록

### AIF-C01 (`domain_tags/aws-aif-c01.md`)

| 태그 | 설명 |
|------|------|
| `AI 및 ML의 기초` | AI/ML/딥러닝 개념, 학습 유형, ML 기법 선택 |
| `GenAI의 기초` | 생성형 AI 개념, LLM, FM, 프롬프트 엔지니어링 |
| `파운데이션 모델의 적용` | AWS AI 서비스, SageMaker, Bedrock 등 실제 적용 |
| `책임 있는 AI에 대한 가이드라인` | 공정성, 편향, 투명성, 설명 가능성 |
| `AI 솔루션의 보안, 규정 준수 및 거버넌스` | 데이터 보안, 규정 준수, 거버넌스 프레임워크 |

> 다른 시험(SAA-C03 등) 태그는 `domain_tags/{exam_id}.md` 파일로 별도 관리

---

## 7. key_points 작성 형식

```
{핵심 개념 제목}
• {포인트 1}
• {포인트 2}
• {포인트 3}
• {포인트 4 (선택)}
• {포인트 5 (선택)}
```

**예시:**
```
Amazon SageMaker 핵심 기능
• 인프라 관리 없이 ML 모델 학습·배포 가능한 완전 관리형 서비스
• 학습 데이터는 Amazon S3에 저장, SageMaker가 자동으로 로드
• 내장 알고리즘 및 커스텀 컨테이너 모두 지원
• SageMaker Studio로 통합 개발 환경 제공
```

---

## 8. ref_links 작성 기준

- LLM이 AWS 공식 문서 URL을 자동 생성
- **허용 도메인:** `docs.aws.amazon.com`, `aws.amazon.com`
- **형식:** `[{"name": "문서 제목", "url": "https://docs.aws.amazon.com/..."}]`
- hallucination 가능성을 인지하되 허용 (사후 검토 방식)

**예시:**
```json
[{"name": "Amazon SageMaker 개발자 가이드", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/"}]
```

---

## 9. 결과 요약 출력 형식 (STEP 7)

```
✅ 변환 완료
━━━━━━━━━━━━━━━━━━━━━━━━
총 입력 문제 수:      N개
변환 성공:           N개
복수 정답 통합 처리:  N개 (정답 2개 → 단일 정답으로 재설계)
스킵 (파싱 실패):     N개 → [문제 번호 목록]
에스컬레이션:        N개 → [문제 번호 및 사유]
━━━━━━━━━━━━━━━━━━━━━━━━
저장 경로: /output/aws-aif-c01-20260220-001.sql
할당된 ID 범위: awsaifc01-q166 ~ awsaifc01-q175
```

---

## 부록: 설계 결정 요약

| 항목 | 결정 | 비고 |
|------|------|------|
| Question ID 형식 | `awsaifc01-q{3자리번호}` | Supabase API로 MAX(id) 조회 후 자동 할당 |
| correct_option_id | `'a'`/`'b'`/`'c'`/`'d'` 텍스트 | 기존 DB 방식 준수 |
| option_id | `'a'`/`'b'`/`'c'`/`'d'` 텍스트 | 기존 DB 방식 준수 |
| key_point_images | 제거 | DB에 컬럼 없음 |
| 난이도 | 1~3 LLM 자체 판단 | 1=하, 2=중, 3=상 |
| ref_links | LLM 자동 생성 (hallucination 허용) | AWS 공식 URL 도메인만 |
| URL fetch | Phase 1 미지원 | 텍스트 붙여넣기만 |
| SQL 파일명 | `{exam_id}-YYYYMMDD-{배치번호}.sql` | 날짜+배치번호 자동 생성 |
| 에스컬레이션 | 실시간 채팅 개입 | 원문+시도결과+사유 제시 |
| 배치 실패 처리 | 체크포인트 저장 (재개 가능) | parsed_questions.json의 status 필드 |
| 서비스명 보존 | AWS 서비스명 원문 그대로 | SageMaker → SageMaker (불가: 'ML 관리형 서비스') |
| 시나리오 배경 | 글로벌 중립적 | 특정 지역(한국) 언급 않음 |
| 에이전트 확장성 | 범용 (exam_id 파라미터화) | SAA-C03 등 재사용 가능 |
| set_id | Supabase API로 조회 or 사용자 직접 입력 | `.env`에 Service Role Key |
| 재설계 규칙 (10개) | TBD | redesign_rules.md에 별도 정의 예정 |
| LLM 모델 | Claude Sonnet 4.6 (전 단계) | 품질 우선 |
