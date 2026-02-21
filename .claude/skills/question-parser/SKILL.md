# question-parser 스킬

영문 AWS 시험 문제 텍스트를 파싱하여 `output/parsed_questions.json`을 생성합니다.

## 역할

- STEP 1: 원문 텍스트 → `parsed_questions.json`

## 입력

- 원문 영문 문제 텍스트 (문자열)
- `exam_id` (예: `aws-aif-c01`)
- `start_id` (Supabase에서 조회한 MAX(id) + 1)

## 출력

`output/parsed_questions.json` — 파싱된 문제 배열

```json
[{
  "number": 1,
  "question": "AWS allows users to manage their resources using a web based user interface. What is the name of this interface?",
  "options": {
    "a": "AWS CLI.",
    "b": "AWS API.",
    "c": "AWS SDK.",
    "d": "AWS Management Console."
  },
  "answer": "d",
  "option_count": 4,
  "status": "pending",
  "assigned_id": "awsaifc01-q166"
}]
```

## 실행 방법

프로젝트 루트에서:

```bash
python3 .claude/skills/question-parser/scripts/parse_text.py \
  --input-file /path/to/input.txt \
  --output-file output/parsed_questions.json \
  --exam-id aws-aif-c01 \
  --start-id 166
```

또는 stdin으로:

```bash
echo "문제 텍스트..." | python3 .claude/skills/question-parser/scripts/parse_text.py \
  --exam-id aws-aif-c01 \
  --start-id 166
```

## 지원 입력 형식

```
Question text here...

A. Option A
B. Option B
C. Option C
D. Option D
Answer
Correct answer: D
```

번호 포함 형식도 지원:
```
21. Question text...
A. Option A
...
Correct answer: D
```

복수 정답도 파싱됨 (Redesigner가 처리):
```
Correct answer: A, C
```

## 파싱 실패 처리

- 필수 필드(question, options, answer) 누락 시 `status: "failed"` 마킹
- 실패 문제 목록을 stderr에 출력
- 실패 문제가 있으면 종료 코드 1 반환
- Main이 실패 목록을 수집하여 결과 요약에 포함
