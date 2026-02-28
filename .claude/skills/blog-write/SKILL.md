# /blog-write 스킬

`input/` 폴더의 txt 파일을 기반으로 AWS/GCP/Azure 자격증 학습 블로그 포스트를
SEO 최적화하여 자동 생성하고 Supabase `blog_posts` 테이블에 삽입합니다.

## 트리거

사용자가 `/blog-write` 커맨드를 실행할 때 이 스킬이 활성화됩니다.

## 지원 인자 (선택사항)

| 인자 | 효과 |
|------|------|
| (없음) | 대화형 모드 — Step 1 확인 + Step 5 게시 선택 모두 표시 |
| `--draft` | 자동 모드 — YAML 헤더 완전 시 Step 1 생략, 생성 후 자동 초안 저장 |
| `--publish` | 자동 모드 — YAML 헤더 완전 시 Step 1 생략, 생성 후 자동 즉시 게시 |

**`--draft` / `--publish` 사용 시 생략되는 단계:**
- Step 1 확인 (모든 파일에 YAML 헤더가 완전한 경우)
- Step 5 게시 방식 선택 (대화 없이 자동 진행)

## 역할

CLAUDE.md의 `/blog-write 커맨드 처리` 섹션에 따라 진행합니다.

## 입력 방식

항상 **`input/` 폴더의 txt 파일**을 처리합니다. txt 파일은 선택적 YAML 헤더를 가질 수 있습니다:

```
---
provider: aws
exam_id: aws-aif-c01
content_type: domain_guide
topic: Amazon Bedrock 파운데이션 모델 활용 가이드
slug_hint: aws-aif-c01-bedrock-guide
---
[사용자 작성 내용: 공부 메모, 공식 문서 발췌, 핵심 개념 정리 등 자유 형식]
```

YAML 헤더가 없으면 Main(Sonnet)이 본문 내용에서 자동 감지합니다.

## 처리 흐름

1. 인자 파싱 (`--draft` / `--publish` 여부 확인)
2. `input/*.txt` 파일 스캔 (알파벳 순)
3. 파일별 YAML 헤더 파싱 or Main 자동 감지
4. 파일 목록·주제·provider 출력
   - YAML 헤더 완전 + `--draft`/`--publish` → **확인 없이 자동 진행**
   - 그 외 → [A/B/C] 사용자 확인 (YAML 없는 파일이면 헤더 힌트 표시)
5. 참조 파일 선로드 (domain_tags, blog_guide, translation_guide)
6. Blog Writer (Haiku) 5개씩 배치 병렬 호출 (SEO 최적화 포함)
7. 결과 취합 → `output/draft_blog_posts.json`
8. 게시 방식 결정
   - `--draft`/`--publish` 지정 시 → **자동 진행** (Step 5 생략)
   - 인자 없음 → [A/B/C/D] 사용자 검토
9. `insert_blog_supabase.py` 실행
10. 처리 완료 파일 `input/done/` 이동
11. 완료 요약 출력

## SEO 최적화 대상

Blog Writer Agent가 각 포스트에 대해 자동으로 최적화합니다:
- **title**: 주요 키워드 포함, 60자 이내, 클릭 유발형
- **excerpt**: 150~160자, 주요+보조 키워드 포함
- **content**: H2/H3 구조, 키워드 자연 배치, 2,000자↑
- **slug**: 키워드 포함 영문 URL
- **ref_links**: 공식 문서 2~5개 (권위 있는 외부 링크)
- **content_en**: 국제 SEO용 영문 버전

## 주의사항

- 기본 `is_published=false` (초안 저장) — 사용자 선택으로 즉시 게시 가능
- `exam_id` 없는 경우 GCP/Azure 등 비AWS 자격증으로 처리 (blog_posts.exam_id = null)
- 생성 결과: `output/draft_blog_posts.json`
- 처리 완료 파일: `input/done/{filename}` 이동
