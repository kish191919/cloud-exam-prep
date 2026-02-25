# /generate 스킬

`input/` 폴더의 문제 텍스트 파일로부터 한국어 4지선다 문제를 배치 생성합니다.

## 트리거

사용자가 `/generate` 커맨드를 실행할 때 이 스킬이 활성화됩니다.

## 역할

CLAUDE.md의 `/generate 커맨드 처리` 섹션에 따라 진행합니다.

## 입력 방식 (고정)

항상 **`input/` 폴더 자동 처리** 방식으로 동작합니다. 입력 형식이나 처리 방법을 사용자에게 묻지 않습니다.

## 처리 흐름

1. `input/*.txt` 파일 스캔 (알파벳 순)
2. 파일 첫 500자로 언어 감지 (`en` / `ko`)
3. Main(Sonnet)이 각 **질문 텍스트만** 읽어 핵심 AWS 개념 추출
   (`options[answer]` 미사용 — 질문의 의도를 직접 분석)
4. 추출 개념 목록 출력 → 사용자 검토·수정·승인
5. Redesigner(Haiku) 5개씩 배치 병렬 호출
6. 결과 취합 → `output/redesigned_question_generate.json`
7. Supabase 삽입 → 파일 `input/done/` 이동
8. 완료 요약 출력

## 주의사항

- 개념 추출 결과를 사용자가 검토·수정 후 배치 생성 진행
- 중간 파일: `output/redesigned_question_generate.json` (`output/redesigned_questions.json`과 분리)
- `parse_text.py`는 옵션+정답이 없는 파일에서는 동작하지 않으므로, B-mode에서는 Main이 인라인 Python으로 질문만 추출
