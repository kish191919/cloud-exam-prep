# AWS AIF-C01 문제 변환 에이전트 설계서

> Claude Code 구현 참조용 문서 — 최종 업데이트: 2026-02-21
>
> **권위 있는 실행 스펙은 `CLAUDE.md` 및 각 에이전트/스킬 파일에 있습니다. 이 문서는 전체 아키텍처 개요용입니다.**

---

## 1. 작업 컨텍스트 문서

### 배경 및 목적

영문 AWS Certified AI Practitioner (AIF-C01) 자격증 기출/모의 문제를 단순 번역이 아닌 **한국어 수험 환경에 맞게 재설계**하고, 학습 플랫폼 DB에 바로 적재 가능한 SQL 파일로 저장한다. 재설계된 문제는 한국어·영문 이중 언어(bilingual)로 저장하여 UI에서 언어 전환이 가능하다.

### 범위

- 입력: `input/` 폴더에 저장된 `.txt` 파일 (영문 또는 한국어 AIF-C01 문제)
- 출력: 한국어·영문 이중 언어 문제가 담긴 `.sql` 파일
- 제외: URL fetch, 강의/요약 노트 변환 (Phase 2로 이월)

### 입출력 정의

| 구분 | 내용 |
|------|------|
| **입력** | `input/*.txt` — 처리 대기 중인 문제 텍스트 파일 (알파벳 순 처리) |
| **출력** | `output/{exam_id}-YYYYMMDD-{배치번호3자리}.sql` — INSERT 구문 포함 SQL 파일 |
| **중간 산출물** | `output/parsed_questions.json` — 파싱 결과 + 처리 상태 (체크포인트) |
| **중간 산출물** | `output/redesigned_questions.json` — 재설계 완료 결과 (한/영 이중 언어 필드 포함) |

### 제약조건

- 보기는 반드시 4개 (원문이 5개 이상이면 가장 약한 오답 제거하여 4개로 축소)
- 정답 개념은 원문과 반드시 동일하게 유지 (보기 텍스트·순서는 재설계 가능)
- **AWS 서비스명은 반드시 원문과 동일하게 유지** (번역·축약 불가)
- SQL 스키마는 실제 CLOUD-EXAM-PREP DB 구조를 준수

### 확정된 DB 스키마

```sql
-- questions 테이블
questions (
  id TEXT PRIMARY KEY,                -- 예: 'awsaifc01-q166'
  exam_id TEXT NOT NULL,              -- 예: 'aws-aif-c01'
  text TEXT NOT NULL,                 -- 문제 본문 (한국어)
  text_en TEXT,                       -- 문제 본문 (영문)
  correct_option_id TEXT NOT NULL,    -- 정답 보기 ID: 'a'|'b'|'c'|'d'
  explanation TEXT NOT NULL,          -- 문제 전체 해설 (한국어)
  explanation_en TEXT,                -- 문제 전체 해설 (영문)
  key_points TEXT,                    -- 마크다운 불릿 리스트 3~5개 (한국어)
  key_points_en TEXT,                 -- 마크다운 불릿 리스트 3~5개 (영문)
  ref_links JSONB DEFAULT '[]'        -- [{"name":"...","url":"..."}]
)

-- question_options 테이블
question_options (
  id UUID PRIMARY KEY,
  question_id TEXT NOT NULL,
  option_id TEXT NOT NULL,            -- 'a'|'b'|'c'|'d'
  text TEXT NOT NULL,                 -- 보기 텍스트 (한국어)
  text_en TEXT,                       -- 보기 텍스트 (영문)
  explanation TEXT,                   -- 보기별 해설 (한국어)
  explanation_en TEXT,                -- 보기별 해설 (영문)
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

이 에이전트는 AIF-C01 전용이 아닌 **범용 구조**로 설계한다. `/convert` 실행 시 exam_id를 파라미터로 받아 SAA-C03 등 다른 시험에도 재사용 가능하다. 도메인 태그 목록, 번역 가이드 등 시험별 설정은 exam_id별 파일로 분리 관리한다.

### 용어 정의

| 용어 | 정의 |
|------|------|
| correct_option_id | 정답 보기의 알파벳 ('a'/'b'/'c'/'d') |
| option_id | 보기 식별자: 'a'/'b'/'c'/'d' |
| 재설계 | 원문 개념·서비스명 유지 + 한국어 시나리오·질문·보기 새롭게 작성 |
| 보기 축소 | 5개+ 보기에서 가장 논리적으로 약한 오답을 제거하여 4개로 만드는 작업 |
| 에스컬레이션 | LLM 재시도 한계 초과 시 실시간 채팅으로 사용자에게 개입 요청 |
| correct_answer_concept | 원문 정답 보기 텍스트 — Redesigner에 전달하여 정답 개념 보존 보장 |
| source_language | 입력 파일 언어 감지 결과: "en" 또는 "ko" |

---

## 2. 워크플로우 정의

### 실행 진입점: `/convert` 커맨드

```
사용자: /convert

에이전트: 안녕하세요! AWS 시험 문제 변환을 시작합니다.
  exam_id를 입력해주세요. (예: aws-aif-c01, aws-saa-c03)

사용자: aws-aif-c01

에이전트: [자동으로 exam_sets 목록 조회·출력]
  현재 세트 목록 (aws-aif-c01):
    [1] 샘플 세트  (sample)
    [2] 세트 1     (full)
    [3] 세트 2     (full)
  번호를 선택하거나 새 세트 이름을 입력하세요:

사용자: 3  (또는 "세트 3" 같은 새 이름)

에이전트: [input/ 폴더 스캔 → 파일 목록 출력 → 파이프라인 시작]
```

### 전체 흐름도

```
[/convert 실행]
    │
    ├─ exam_id 입력 → exam_sets 자동 조회·출력 → 번호 선택 or 새 이름 입력(자동 생성)
    │
    ├─ input/ 폴더 스캔 (알파벳 순)
    │    └─ .txt 파일 없으면 즉시 종료
    │
    ├─ Supabase MAX(id) 조회 → start_id 확정
    │
    └─ [파일별 루프] 각 .txt 파일에 대해 반복:
         │
         ├─ 파일 첫 500자로 source_language 감지 (en/ko)
         │
         ├─ [STEP 1] Parser & SQL Agent 호출 → parsed_questions.json 생성
         │
         ├─ [STEP 2~5.5] 참조 파일 선로드 → Redesigner Agent N개 병렬 호출
         │    ├─ 각 Agent: 1개 문제 처리 (STEP 3~5.5)
         │    ├─ STEP 5: 9개 항목 품질검증 (최대 2회 재시도)
         │    ├─ STEP 5.5: 영문 번역 (text_en, explanation_en, key_points_en)
         │    └─ [에스컬레이션 발생 시] 사용자에게 실시간 전달
         │
         ├─ [STEP 6] Parser & SQL Agent 호출 → SQL 파일 생성
         │
         └─ 파일 이동: input/{filename} → input/done/{filename}

[STEP 7] 결과 요약 출력 (전체 파일 합산)
```

### LLM 판단 영역 vs 코드 처리 영역

| 단계 | 처리 주체 | 내용 |
|------|----------|------|
| 텍스트 파싱 | 코드(스크립트) | 정규식으로 문제 블록 추출 |
| 언어 감지 | Main(규칙) | 첫 500자 한글 비율 30% 기준 |
| Supabase ID 조회 | 코드(API 호출) | MAX(id) 조회 후 배치 번호 할당 |
| 구조 분석 | LLM (Redesigner) | 핵심 서비스, 도메인, 정답 논리 파악 |
| 복수 정답 통합 판단 | LLM (Redesigner) | 두 정답 개념을 하나의 보기로 통합하는 재설계 |
| 한국어 재설계 | LLM (Redesigner / Haiku) | 시나리오, 질문, 보기, 해설, key_points 작성 |
| 품질 자기검증 | LLM (Redesigner / Haiku) | 9개 체크리스트 항목 검증 |
| 영문 번역 | LLM (Redesigner / Haiku) | STEP 5.5: _en 필드 생성 |
| SQL 파일 생성 | 코드(스크립트) | 템플릿 기반 INSERT 구문 생성 및 파일 저장 |
| 결과 요약 | LLM (Main) | 처리 결과 메시지 작성 |

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
| STEP 5: 품질검증 | 9개 체크리스트 항목 모두 통과 | LLM 자기검증 | 자동 재시도 (최대 2회) → 에스컬레이션 |
| STEP 5.5: 영문 번역 | _en 필드 모두 생성, AWS 서비스명 원문 그대로 | LLM 자기검증 (번역 가이드 준수) | 자동 재시도 (최대 1회) |
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
  ├── CLAUDE.md                              # 메인 에이전트 지침 (오케스트레이터) ← 권위 스펙
  ├── .env                                   # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  ├── /input                                 # 처리 대기 중인 문제 파일
  │   ├── batch1.txt
  │   └── /done                             # 처리 완료 후 자동 이동
  │       └── batch0.txt
  ├── /.claude
  │   ├── /agents
  │   │   ├── /parser-sql                    # Parser & SQL 서브에이전트 (Sonnet)
  │   │   │   └── AGENT.md
  │   │   └── /redesigner                    # Redesigner 서브에이전트 (Haiku)
  │   │       └── AGENT.md
  │   └── /skills
  │       ├── /convert                       # /convert 슬래시 커맨드
  │       │   └── SKILL.md
  │       ├── /question-parser               # 문제 텍스트 파싱
  │       │   └── /scripts
  │       │       └── parse_text.py          # 텍스트 블록 파싱 (정규식)
  │       ├── /question-redesigner           # 한국어 재설계 지침
  │       │   └── /references
  │       │       ├── redesign_rules_compact.md       # 재설계 규칙 14개
  │       │       ├── quality_checklist_compact.md    # 품질 자기검증 9개 항목
  │       │       ├── /domain_tags
  │       │       │   └── aws-aif-c01.md     # AIF-C01 도메인 태그 목록 (5개)
  │       │       └── /translation_guide
  │       │           └── aws-aif-c01.md     # AIF-C01 영문 번역 가이드
  │       └── /sql-generator                 # SQL 파일 생성
  │           └── /scripts
  │               └── generate_sql.py        # JSON → INSERT 구문 변환
  ├── /output
  │   ├── parsed_questions.json              # 파싱 중간 산출물 + 체크포인트
  │   ├── redesigned_questions.json          # 재설계 중간 산출물 (한/영 이중 언어)
  │   └── {파일명}.sql                        # 최종 SQL 파일
  └── /docs
      └── sample.sql                         # 스키마 참고용 샘플
```

### 에이전트 구성 및 모델

| 에이전트 | 파일 | 역할 | LLM 모델 |
|---------|------|------|---------|
| **Main** | `CLAUDE.md` | 오케스트레이터: /convert 실행, 서브에이전트 호출 조율, 에스컬레이션 전달, 결과 요약 출력 | Claude Sonnet 4.6 |
| **Parser & SQL Agent** | `.claude/agents/parser-sql/AGENT.md` | STEP 1 파싱 + STEP 6 SQL 생성 (스크립트 호출 위주) | Claude Sonnet 4.6 |
| **Redesigner Agent** | `.claude/agents/redesigner/AGENT.md` | STEP 3~5.5: 구조 분석, 복수 정답 통합, 한국어 재설계, 품질 검증, 영문 번역 | **Claude Haiku 4.5** |

> 서브에이전트 간 직접 호출 금지 — 반드시 Main을 통해 조율

### 호출 흐름

```
Main (/convert 실행)
 ├─ Supabase API: exam_sets 자동 조회 → 번호 선택 or 새 세트 자동 생성
 ├─ input/ 폴더 스캔
 ├─ Supabase API: MAX(id) 조회 → 배치 ID 할당
 ├─ Parser & SQL Agent 호출 (STEP 1: 파싱)
 │    └─ parsed_questions.json 반환
 ├─ 참조 파일 4개 선로드 (Main이 직접 읽기)
 │    ├─ redesign_rules_compact.md
 │    ├─ domain_tags/{exam_id}.md
 │    ├─ quality_checklist_compact.md
 │    └─ translation_guide/{exam_id}.md
 ├─ Redesigner Agent N개 병렬 호출 (STEP 3~5.5: 재설계)
 │    ├─ 각 Agent: 문제 1개 처리, correct_answer_concept 전달 (Rule 13 보장)
 │    ├─ redesigned_questions.json 취합
 │    └─ [에스컬레이션 발생 시 Main에 보고 → 사용자에게 실시간 전달]
 ├─ Parser & SQL Agent 호출 (STEP 6: SQL 생성)
 │    └─ {파일명}.sql 반환
 └─ 파일 이동: input/{filename} → input/done/{filename}
```

### 스킬 목록

| 스킬명 | 담당 에이전트 | 역할 | 트리거 조건 |
|--------|-------------|------|------------|
| `convert` | Main | 사용자 입력 수집 진입점 | /convert 커맨드 실행 시 |
| `question-parser` | Parser & SQL Agent | 텍스트 → `parsed_questions.json` | STEP 1: input 파일 수신 직후 |
| `question-redesigner` | Redesigner Agent | 구조 분석, 복수 정답 통합, 한국어 재설계, 품질 검증, 영문 번역 | STEP 3~5.5: 파싱 완료 후 |
| `sql-generator` | Parser & SQL Agent | `redesigned_questions.json` → SQL 파일 | STEP 6: 재설계 완료 후 |

### redesigned_questions.json 스키마 (이중 언어 포함)

```json
[{
  "id": "awsaifc01-q166",
  "exam_id": "aws-aif-c01",
  "text": "한국어 문제 본문",
  "text_en": "English question text",
  "correct_option_id": "b",
  "explanation": "한국어 해설",
  "explanation_en": "English explanation",
  "key_points": "핵심 개념 제목\n• 포인트 1\n• 포인트 2\n• 포인트 3",
  "key_points_en": "Key Concept Title\n• Point 1\n• Point 2\n• Point 3",
  "ref_links": "[{\"name\":\"Amazon SageMaker 개발자 가이드\",\"url\":\"https://docs.aws.amazon.com/sagemaker/latest/dg/\"}]",
  "options": [
    {"option_id":"a","text":"한국어 보기","text_en":"English option","explanation":"한국어 보기 해설","explanation_en":"English option explanation","sort_order":1},
    {"option_id":"b","text":"...","text_en":"...","explanation":"...","explanation_en":"...","sort_order":2},
    {"option_id":"c","text":"...","text_en":"...","explanation":"...","explanation_en":"...","sort_order":3},
    {"option_id":"d","text":"...","text_en":"...","explanation":"...","explanation_en":"...","sort_order":4}
  ],
  "tag": "파운데이션 모델의 적용",
  "conversion_log": {}
}]
```

### Supabase 접근 방식

```bash
# .env 파일 (프로젝트 루트)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

에이전트가 `.env` 파일을 읽어 Supabase REST API를 호출한다:

```bash
# exam_sets 자동 조회
GET /rest/v1/exam_sets?exam_id=eq.{exam_id}&select=id,name,type,sort_order&order=sort_order.asc

# 새 세트 자동 생성 (새 이름 입력 시)
POST /rest/v1/exam_sets
  body: {"exam_id":"...","name":"세트 3","type":"full","sort_order":{max+1},"is_active":true}

# MAX(id) 조회
GET /rest/v1/questions?select=id&exam_id=eq.{exam_id}&order=id.desc&limit=1

# sort_order_start 조회 (SQL 생성 시)
GET /rest/v1/exam_set_questions?set_id=eq.{set_id}&select=sort_order&order=sort_order.desc&limit=1
```

---

## 4. 보기 축소 처리 상세 설계

### 배경

원문 AIF-C01에는 "두 개를 선택하시오 (Choose TWO)" 형식의 복수 정답 문제가 존재한다. 본 시스템은 **정답이 반드시 1개**인 4지선다 형식만 지원하므로, 복수 정답 문제는 반드시 단일 정답 문제로 재설계해야 한다.

### 처리 원칙: 두 정답 개념의 통합 재설계

복수 정답 문제는 **오답을 제거하는 방식이 아니라**, 두 정답 개념을 하나의 새로운 보기로 통합하여 문제 자체를 재설계한다.

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
```

### 실패 처리

- 두 정답 개념의 통합이 논리적으로 어색한 경우: 에스컬레이션
- 2회 시도 후에도 자연스러운 단일 정답 구성 불가: 해당 문제 번호 표시 후 스킵 + 로그

---

## 5. LLM 판단 상세 기준

### 품질 자기검증 체크리스트 (STEP 5 — 9개 항목)

LLM이 자기검증 시 다음 9개 항목을 순서대로 확인한다:

| # | 항목 | 검증 방법 |
|---|------|----------|
| 1 | **정답 논리 유효성** | 정답 보기가 명확히 옳은가? 근거가 있는가? |
| 2 | **오답 그럴듯함** | 각 오답이 수험생이 실제로 고민할 만큼 그럴듯한가? |
| 3 | **한국어 자연스러움** | 번역투 표현 없이 자연스러운 한국어인가? |
| 4 | **원문 AWS 서비스명 보존** | 원문에 등장한 서비스명이 재설계 후에도 동일하게 사용되는가? |
| 5 | **보기 길이·형식** | 40자 이내, 4개 길이 균일, 파이프(`|`) 구분 금지, 서비스 3개+ 나열 금지 |
| 6 | **보기 중복 없음** | 4개 보기가 각각 서로 다른 서비스·접근법인가? |
| 7 | **질문 명확성** | 모호함 없이 정답이 단 하나인가? |
| 8 | **단일 개념 집중** | 하나의 핵심 판단만 테스트하는가? |
| 9 | **규칙 12: 정답 위치 원문과 다름** | 재설계 `correct_option_id`가 원문 `answer` 위치와 다른가? |

**판정:** 9개 중 하나라도 실패 시 → 재설계 재시도 트리거 (최대 2회)

### STEP 5.5: 영문 번역

STEP 5 품질검증 통과 후 수행. `translation_guide/{exam_id}.md` 참조:
- AWS 시험 공식 문체 재현 ("A company is...", "Which AWS service BEST meets...")
- AWS 서비스명 원문 그대로 (번역·축약 금지)
- 생성 필드: `text_en`, `explanation_en`, `key_points_en`, 각 옵션의 `text_en`, `explanation_en`

### 재설계 시나리오 스타일

- **글로벌 중립적 배경 사용** (특정 지역 없이)
- 예: "한 글로벌 테크 기업의 ML 엔지니어가...", "한 금융 서비스 회사의 데이터 사이언티스트가..."

### 문제 본문 줄바꿈 서식 규칙

- 마지막 문장(질문 문장) 앞에 항상 빈 줄 삽입
- 전체 문장 수가 4개 이상이면 첫 번째 문장 다음에도 빈 줄 삽입

---

## 6. 재설계 규칙 14개 요약

| 규칙 | 핵심 내용 |
|------|----------|
| **Rule 0 (최우선)** | 업종·배경·등장인물 완전히 새로 창작. 원문 시나리오 번역 금지. |
| **Rule 1** | AWS 서비스명 원문 그대로 보존. 번역·축약·대체 불가. |
| **Rule 2** | 자연스러운 한국어 수험 문체(-입니다/-합니다). 번역투·직역체 금지. |
| **Rule 3** | 글로벌 중립 시나리오. 특정 국가·도시 언급 금지. |
| **Rule 4** | 보기 40자 이내, 4개 길이 균일. 파이프(`\|`) 구분 금지, 3개+ 서비스 나열 금지. |
| **Rule 5** | 오답 3개: 관련 서비스 포함, 수험생이 고민할 만큼 그럴듯. 오답끼리 서로 다른 개념. |
| **Rule 6** | 보기 간 중복·혼동 금지. 4개 보기가 각각 다른 서비스나 접근법. |
| **Rule 7** | 단일 정답 4지선다. `correct_option_id` = 'a'/'b'/'c'/'d' 중 1개. |
| **Rule 8** | 시나리오(1~4문장) + 명확한 질문(1~2문장). 줄바꿈 서식 규칙 준수. |
| **Rule 9** | key_points: 핵심 개념 제목 + 불릿 3~5개. `key_point_images` 필드 사용 금지. |
| **Rule 10** | ref_links: JSON 배열 1~3개. `docs.aws.amazon.com` 또는 `aws.amazon.com` 도메인만. |
| **Rule 11** | 하나의 핵심 개념만 테스트. 여러 요구사항→여러 서비스 동시 매핑 구조 금지. |
| **Rule 12 (저작권 보호)** | 보기 순서 무작위화 필수. 재설계 `correct_option_id` ≠ 원문 `answer` 위치. |
| **Rule 13 (정답 개념 보존)** | `correct_answer_concept`로 전달받은 개념/서비스가 반드시 재설계 정답. |
| **Rule 14 (오답 다양성)** | 오답 3개 중 최소 2개는 원문 오답에 없던 새로운 서비스·접근법으로 창작. |

> 상세 규칙: `.claude/skills/question-redesigner/references/redesign_rules_compact.md`

---

## 7. 도메인 태그 목록

### AIF-C01 (`domain_tags/aws-aif-c01.md`)

| 태그 | 설명 |
|------|------|
| `AI 및 ML의 기초` | AI/ML/딥러닝 개념, 학습 유형, ML 기법 선택 |
| `GenAI의 기초` | 생성형 AI 개념, LLM, FM, 프롬프트 엔지니어링 |
| `파운데이션 모델의 적용` | AWS AI 서비스, SageMaker, Bedrock 등 실제 적용 |
| `책임 있는 AI에 대한 가이드라인` | 공정성, 편향, 투명성, 설명 가능성 |
| `AI 솔루션의 보안, 규정 준수 및 거버넌스` | 데이터 보안, 규정 준수, 거버넌스 프레임워크 |

> 태그는 문제당 정확히 1개 부여. 다른 시험 태그는 `domain_tags/{exam_id}.md`로 별도 관리.

---

## 8. key_points 작성 형식

```
{핵심 개념 제목}
• {포인트 1}
• {포인트 2}
• {포인트 3}
• {포인트 4 (선택)}
• {포인트 5 (선택)}
```

**예시 (한국어):**
```
Amazon SageMaker 비동기 추론
• 대용량 페이로드(최대 1GB) 요청을 처리하도록 설계
• 요청을 큐에 넣고 비동기로 처리 — 즉각적인 응답 불필요
• 처리 결과는 Amazon S3에 저장 후 조회
• 처리 시간이 1~15분인 워크로드에 적합 (예: 대용량 의료 이미지)
```

**예시 (영문 — STEP 5.5 생성):**
```
Amazon SageMaker Asynchronous Inference
• Designed for large payload requests (up to 1 GB) that require longer processing time
• Requests are queued and processed asynchronously — no need for immediate response
• Results are stored in Amazon S3 for retrieval after processing
• Ideal for workloads with 1–15 minute processing times (e.g., large medical images)
```

---

## 9. ref_links 작성 기준

- LLM이 AWS 공식 문서 URL을 자동 생성
- **허용 도메인:** `docs.aws.amazon.com`, `aws.amazon.com`
- **형식:** `[{"name": "문서 제목", "url": "https://docs.aws.amazon.com/..."}]`
- hallucination 가능성을 인지하되 허용 (사후 검토 방식)

---

## 10. 결과 요약 출력 형식 (STEP 7)

```
✅ 변환 완료
━━━━━━━━━━━━━━━━━━━━━━━━
총 입력 문제 수:      N개
변환 성공:           N개
복수 정답 통합 처리:  N개 (정답 2개 → 단일 정답으로 재설계)
스킵 (파싱 실패):     N개 → [문제 번호 목록]
에스컬레이션 스킵:    N개 → [문제 번호 목록]
━━━━━━━━━━━━━━━━━━━━━━━━
저장 경로: output/aws-aif-c01-20260220-001.sql
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
| ref_links | LLM 자동 생성 (hallucination 허용) | AWS 공식 URL 도메인만 |
| 입력 방식 | `input/*.txt` 파일 기반 | 알파벳 순 자동 스캔, 완료 후 `input/done/`으로 이동 |
| SQL 파일명 | `{exam_id}-YYYYMMDD-{배치번호}.sql` | 날짜+배치번호 자동 생성 |
| 에스컬레이션 | 실시간 채팅 개입 | 원문+시도결과+사유 제시 |
| 배치 실패 처리 | 체크포인트 저장 (재개 가능) | parsed_questions.json의 status 필드 |
| 서비스명 보존 | AWS 서비스명 원문 그대로 | SageMaker → SageMaker (불가: 'ML 관리형 서비스') |
| 시나리오 배경 | 글로벌 중립적 | 특정 지역(한국) 언급 않음 |
| 에이전트 확장성 | 범용 (exam_id 파라미터화) | SAA-C03 등 재사용 가능 |
| exam_sets 처리 | Supabase API 자동 조회 + 번호 선택 or 새 이름 자동 생성 | exam_id 입력 직후 자동 실행 |
| 이중 언어 출력 | 한국어 + 영문 (_en 필드) | STEP 5.5에서 영문 번역 생성 |
| 재설계 규칙 | 14개 확정 (Rules 0~14) | redesign_rules_compact.md 참조 |
| LLM 모델 | Parser & SQL → Sonnet 4.6 / Redesigner → **Haiku 4.5** | 비용·속도 최적화 |
| source_language 감지 | 파일 첫 500자, 한글 30% 기준 | "en" 또는 "ko" |
| correct_answer_concept | 원문 정답 보기 텍스트를 Redesigner에 전달 | Rule 13 (정답 개념 보존) 보장 |
