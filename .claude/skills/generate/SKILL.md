# /generate 스킬

원본 문제 텍스트, 개념 설명, AWS 서비스명, 또는 input/ 폴더 파일로부터
한국어 4지선다 문제를 생성합니다.

## 트리거

사용자가 `/generate` 커맨드를 실행할 때 이 스킬이 활성화됩니다.

## 역할

CLAUDE.md의 `/generate 커맨드 처리` 섹션에 따라 진행합니다.

## 지원 입력 방식

- **[A]** 전체 문제 직접 붙여넣기 (보기 + 정답 포함) — 단일 생성
- **[B1]** 문제 텍스트 직접 붙여넣기 (보기/정답 없이) — 단일 생성
- **[B2]** `input/` 폴더 파일 자동 처리 — 질문 텍스트에서 핵심 개념 추출 후 배치 생성
- **[C]** 개념 설명 또는 AWS 서비스명 직접 입력 — 단일 생성

## B2 파일 처리 흐름

`[B] → [2] input/ 폴더 자동 처리` 선택 시:
1. `input/*.txt` 파일 스캔 (알파벳 순)
2. `parse_text.py`로 파싱 → `parsed_questions.json`
3. Main(Sonnet)이 각 **질문 텍스트만** 읽어 핵심 AWS 개념 추출
   (`options[answer]` 미사용 — 질문의 의도를 직접 분석)
4. 추출 개념 목록 출력 → 사용자 검토·수정·승인
5. Redesigner(Haiku) 5개씩 배치 병렬 호출
6. 결과 취합 → `output/redesigned_question_generate.json`
7. Supabase 삽입 → 파일 `input/done/` 이동
8. 완료 요약 출력

## 주의사항

- **[B2]**: 개념 추출 결과를 사용자가 검토·수정 후 배치 생성 진행
- **[A]/[B1]/[C]**: 단일 문제 생성 후 검토 루프 (재생성 횟수 제한 없음)
- 중간 파일: `output/redesigned_question_generate.json` (`output/redesigned_questions.json`과 분리)
