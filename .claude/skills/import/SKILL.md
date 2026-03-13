# /import 스킬

`input/` 폴더의 한국어 완성 문제 파일(질문 + 보기 4개 + 정답 포함)을 읽어, LLM이 태그·해설·번역만 생성하고 Supabase에 삽입합니다.

## 트리거

사용자가 `/import` 커맨드를 실행할 때 이 스킬이 활성화됩니다.

## 역할

CLAUDE.md의 `/import 커맨드 처리` 섹션에 따라 진행합니다.

## /generate와의 차이

| 항목 | /generate | /import |
|------|-----------|---------|
| 입력 | 질문 텍스트만 | 질문 + 보기 4개 (정답 표시 없음) |
| LLM 역할 | 보기 생성 + 번역 + 해설 전체 | **정답 결정** + 태그·보기설명·해설·key_points·ref_links·번역 |
| 질문·보기 수정 | LLM이 자유 변경 가능 | 절대 수정 금지 — 원문 그대로 사용 |

## 입력 파일 형식 (input/*.txt)

정답 표시 없이 질문과 보기 4개만 작성합니다. LLM이 정답을 스스로 결정합니다.

```
1. 한 기업이 Amazon S3에 저장된 대용량 데이터를 SQL로 직접 분석하려 합니다.
   가장 적합한 AWS 서비스는 무엇입니까?
A. Amazon Redshift
B. Amazon Athena
C. Amazon EMR
D. AWS Glue

2. ...
```

- 질문 번호: `1.` / `1)` / `Q1.` 형식 지원
- 보기: `A.` / `A)` 형식 지원 (대소문자 무관)
- 정답 표시 불필요 — LLM이 AWS 인증 시험 기준으로 정답 결정

## 처리 흐름

1. exam_id 입력 → exam_sets 자동 선택 (sort_order 최대값)
2. input/ 파일 스캔 → 전체 목록 출력
3. 파일별: 파싱(질문+보기+정답 추출) → importer 배치 에이전트 5개씩 호출
4. 에이전트가 태그·해설·번역 생성 → Supabase 즉시 삽입
5. 파일 input/done/ 이동 → 완료 요약 출력

## 주의사항

- 질문 텍스트(`text`)와 보기 텍스트(`options[].text`)는 사용자 작성 원문 그대로 사용
- LLM은 설명·태그·번역만 생성하며 원문 내용을 변경하지 않는다
- 중간 파일: `output/import_parsed.json` (`output/parsed_questions.json`과 분리)
