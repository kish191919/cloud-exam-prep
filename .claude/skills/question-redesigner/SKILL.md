# question-redesigner 스킬

`parsed_questions.json`의 영문 문제를 한국어 4지선다 문제로 재설계합니다.

## 역할

- STEP 2: 구조 분석 및 핵심 개념 추출
- STEP 3: 복수 정답 감지 및 통합 처리
- STEP 4: 한국어 재설계 (시나리오, 질문, 보기, 해설, key_points)
- STEP 5: 7개 체크리스트 품질 자기검증 (최대 2회 재시도)

## 참조 파일

- `references/redesign_rules.md` — 재설계 규칙 10개
- `references/domain_tags/{exam_id}.md` — 도메인 태그 목록
- `references/quality_checklist.md` — 품질 자기검증 체크리스트 7개

## 입력

`output/parsed_questions.json` 경로

## 출력

`output/redesigned_questions.json`

```json
[{
  "id": "awsaifc01-q166",
  "exam_id": "aws-aif-c01",
  "text": "한국어로 재설계된 문제 본문...",
  "correct_option_id": "d",
  "explanation": "전체 해설 텍스트...",
  "key_points": "AWS Management Console 핵심 기능\n• 웹 브라우저 기반 AWS 리소스 관리 인터페이스\n• 별도 설치 없이 브라우저에서 직접 접근 가능\n• 시각적 대시보드로 서비스 상태 및 리소스 모니터링\n• CLI, SDK와 달리 프로그래밍 지식 없이 사용 가능",
  "ref_links": "[{\"name\": \"AWS Management Console\", \"url\": \"https://docs.aws.amazon.com/awsconsolehelpdocs/latest/gsg/learn-whats-new.html\"}]",
  "options": [
    {"option_id": "a", "text": "AWS CLI", "explanation": "CLI는 명령줄 인터페이스로 터미널에서 사용합니다.", "sort_order": 1},
    {"option_id": "b", "text": "AWS API", "explanation": "API는 프로그래밍 방식으로 AWS 서비스를 직접 호출하는 인터페이스입니다.", "sort_order": 2},
    {"option_id": "c", "text": "AWS SDK", "explanation": "SDK는 프로그래밍 언어별 라이브러리로 코드에서 AWS 서비스를 사용합니다.", "sort_order": 3},
    {"option_id": "d", "text": "AWS Management Console", "explanation": "Management Console은 웹 브라우저로 접근하는 AWS의 시각적 관리 인터페이스입니다.", "sort_order": 4}
  ],
  "tag": "파운데이션 모델의 적용",
  "conversion_log": {
    "original_answer_count": 1,
    "original_answers": ["d"],
    "integration_method": null,
    "note": "단일 정답 문제, 직접 재설계"
  }
}]
```

## STEP 2: 구조 분석

각 문제에 대해 분석:
1. 핵심 AWS 서비스명 목록 추출
2. 도메인 태그 결정 (`references/domain_tags/{exam_id}.md` 참조)
3. 정답 논리 파악 (왜 이 보기가 정답인가?)
4. 복수 정답 여부 확인 (`answer` 필드에 쉼표가 있거나 `option_count >= 5`)

## STEP 3: 복수 정답 통합 처리

`answer`에 복수 정답이 있거나 `option_count >= 5`인 경우:

1. 각 정답 개념 분석
2. 두 개념을 포괄하는 단일 보기 작성
3. 통합 보기가 자연스럽지 않으면 질문·시나리오도 함께 재설계
4. 오답 3개: 개념 일부만 맞거나 전혀 다른 접근법으로 구성
5. `conversion_log`에 통합 방법 기록

## STEP 4: 한국어 재설계

`references/redesign_rules.md`의 10개 규칙을 준수하여:
- 글로벌 중립적 시나리오 + 명확한 질문 작성
- 4개 보기 (정답 1 + 오답 3) 작성
- 보기별 해설 작성
- 전체 문제 해설 작성
- key_points 작성 (제목 + 3~5 불릿)
- ref_links 작성 (1~3개 AWS 문서 URL)

## STEP 5: 품질 자기검증

`references/quality_checklist.md`의 7개 항목을 검증:
- 모두 통과 → `redesigned_questions.json`에 추가
- 실패 항목 있음 → 해당 부분 수정 후 재시도 (최대 2회)
- 2회 후 실패 → `status: "escalation"` 마킹 후 Main에 보고

## 에스컬레이션 보고 형식

```
❌ 문제 {number}번 에스컬레이션 필요
사유: {실패한 체크리스트 항목 및 이유}

원문:
  Q. {원문 질문}
  Correct: {원문 정답}

2회 시도 결과:
  시도 1: "{시도 1 정답 보기}" → 실패 ({실패 이유})
  시도 2: "{시도 2 정답 보기}" → 실패 ({실패 이유})

어떻게 처리할까요?
  [A] 재설계 지시를 직접 입력해주세요
  [B] 이 문제를 스킵하고 다음으로 진행합니다
```
