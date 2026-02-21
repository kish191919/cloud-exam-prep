# /convert 스킬

영문 AWS 시험 문제를 한국어 4지선다 문제로 변환하여 SQL 파일을 생성합니다.

## 트리거

사용자가 `/convert` 커맨드를 실행할 때 이 스킬이 활성화됩니다.

## 역할

멀티턴 대화로 필요한 정보를 수집한 후 전체 변환 파이프라인을 시작합니다.

## 실행 절차

### 1단계: 인사 및 exam_id 수집

다음 메시지를 출력하고 사용자의 입력을 기다립니다:

```
안녕하세요! AWS 시험 문제 변환을 시작합니다.

먼저 시험 ID를 입력해주세요.
예시: aws-aif-c01, aws-saa-c03

exam_id:
```

### 2단계: set_id 수집

exam_id를 받은 후:

```
set_id UUID를 입력해주세요.
(모르시면 "조회"라고 입력하시면 exam_sets 목록을 보여드립니다)

set_id:
```

사용자가 "조회"를 입력하면:
- `.env`에서 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`를 읽어
- `GET {SUPABASE_URL}/rest/v1/exam_sets?exam_id=eq.{exam_id}&select=id,name`를 호출하여
- 결과 목록을 보여주고 선택을 요청합니다.

### 3단계: 문제 텍스트 수집

```
변환할 영문 문제 텍스트를 붙여넣어 주세요.
여러 문제를 한 번에 붙여넣을 수 있습니다.
입력이 완료되면 빈 줄 후 Enter를 눌러주세요.
```

### 4단계: 파이프라인 시작

정보 수집 완료 후 Main 오케스트레이터(CLAUDE.md)에 정의된 전체 파이프라인을 실행합니다.

## 주의사항

- exam_id와 set_id는 빈 값이면 다시 입력 요청
- 문제 텍스트가 비어있으면 다시 요청
- `/convert` 재실행 시 `output/parsed_questions.json`에 이미 `status: "completed"`인 문제가 있으면 스킵 여부를 사용자에게 확인
