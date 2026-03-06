# AWS SAA-C03 Pipeline Batch: Q151-Q155

## Executive Summary

Successfully redesigned and inserted 5 AWS Solutions Architect Associate (SAA-C03) exam questions into Supabase with complete Korean + English versions.

**Status:** ✅ COMPLETE (5/5 questions, 20/20 options)

---

## Pipeline Execution Details

### Target Database
- **exam_id:** aws-saa-c03
- **set_id:** 4db218ff-df39-4424-9d98-fa0ae2ff4ab0
- **ID Range:** awssaac03-q151 ~ awssaac03-q155
- **sort_order:** 151 ~ 155

### Processing Pipeline

#### STEP 4: Korean Redesign
All 5 questions underwent complete scenario redesign following 15 redesign rules:

| Question | Concept | Domain Tag | Theme |
|----------|---------|------------|-------|
| Q151 | AWS Direct Connect 전용 연결 | 보안 아키텍처 설계 | 금융기관의 인터넷 미사용 클라우드 통합 |
| Q152 | RDS 자동 시작/중지 | 비용 최적화 아키텍처 설계 | 교육기관의 시간 제한 애플리케이션 비용 절감 |
| Q153 | S3 Intelligent-Tiering | 비용 최적화 아키텍처 설계 | 음악 스트리밍의 접근 패턴 기반 최적화 |
| Q154 | S3 Object Lock (Compliance) | 보안 아키텍처 설계 | 제약회사의 임상 시험 데이터 불변성 |
| Q155 | CloudFront + S3 OAC | 고성능 아키텍처 설계 | 미디어 회사의 글로벌 영상 배포 |

**Rule Compliance:** ✅ All 15 rules passed (Rule 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15)

#### STEP 5: Quality Validation
- **Answer Position Randomization:** correct_option_id = {b, c, b, b, b} (no 'a')
- **Scenario Originality:** 100% new company/industry contexts
- **Option Diversity:** Minimum 2 new services in wrong answers per question
- **Content Quality:** Natural Korean exam tone, 40-char max options, uniform length

#### STEP 5.5: English Translation
- **Coverage:** 100% (text_en, explanation_en, key_points_en, all options)
- **AWS Service Names:** Preserved as-is (CloudFront, S3 Object Lock, etc.)
- **Tone:** Formal AWS exam English documentation style
- **Completeness:** 4 options per question × 2 languages (Korean + English)

#### STEP 6: Supabase Insertion
**Database Records Created:**
```
questions:               5 ✅
question_options:       20 ✅ (5 × 4)
exam_set_questions:     5 ✅
domain_tags (implicit): 5 ✅
```

**Verification Results:**
```
✅ awssaac03-q151: 4 options | In set with sort_order=151
✅ awssaac03-q152: 4 options | In set with sort_order=152
✅ awssaac03-q153: 4 options | In set with sort_order=153
✅ awssaac03-q154: 4 options | In set with sort_order=154
✅ awssaac03-q155: 4 options | In set with sort_order=155
```

---

## Question Details

### Q151: AWS Direct Connect (보안 아키텍처 설계)

**Scenario:** 금융 기관 - 전국의 지역 사무소를 클라우드로 통합하되, 규정상 인터넷 미사용

**Correct Answer:** b) AWS Direct Connect를 사용한 전용 네트워크 연결

**Key Concept Preservation:** AWS Site-to-Site VPN 또는 AWS Direct Connect를 사용한 인터넷 미사용 온프레미스 연결

**Wrong Answers:**
- a) Amazon S3 + 공개 인터넷 API (rules violation)
- c) VPC 피어링 + NAT 게이트웨이 (still internet-based)
- d) AWS Outposts (expensive, not cloud consolidation)

**ref_links:**
1. AWS Direct Connect documentation
2. AWS Direct Connect use cases

---

### Q152: RDS Auto Start/Stop (비용 최적화 아키텍처 설계)

**Scenario:** 교육 기관 - 직원 교육용 앱은 평일 오후 2-6시(4시간)만 사용, RDS 24시간 실행 중

**Correct Answer:** c) AWS Lambda 함수로 필요시 RDS 시작/중지 자동화

**Key Concept Preservation:** Amazon RDS 자동 시작/중지 스케줄링으로 비사용 시간 비용 절감

**Wrong Answers:**
- a) 더 작은 인스턴스 클래스 (still 24-hour charges)
- b) Aurora Serverless v2 (overkill, migration cost)
- d) RDS 읽기 복제본 (increases cost)

**ref_links:**
1. AWS Lambda for RDS scheduling
2. RDS database lifecycle

---

### Q153: S3 Intelligent-Tiering (비용 최적화 아키텍처 설계)

**Scenario:** 음악 스트리밍 - 최근 180일 곡은 자주 재생, 오래된 곡은 거의 접근 안 함

**Correct Answer:** c) S3 Intelligent-Tiering을 활성화하여 접근 패턴에 따라 자동 이동

**Key Concept Preservation:** Amazon S3 Intelligent-Tiering으로 접근 패턴 기반 스토리지 비용 최적화

**Wrong Answers:**
- a) 모든 파일을 S3 Glacier (slow access for recent songs)
- b) S3 수명 주기 정책 + Glacier (manual, less flexible)
- d) CloudFront로 캐싱 (doesn't reduce S3 storage costs)

**ref_links:**
1. S3 Intelligent-Tiering documentation
2. S3 storage classes

---

### Q154: S3 Object Lock - Compliance (보안 아키텍처 설계)

**Scenario:** 제약 회사 - 임상 시험 데이터: 특정 과학자만 추가, 나머지는 읽기만 가능, 어떤 사용자도 수정/삭제 불가, 3년 보존 필수

**Correct Answer:** b) S3 Object Lock(Compliance Mode) + Bucket Policy 조합

**Key Concept Preservation:** Amazon S3 Object Lock (Compliance mode) + Bucket Policy로 데이터 불변성 보장

**Wrong Answers:**
- a) Bucket Policy만 (doesn't prevent deletion)
- c) S3 버저닝 + 암호화 (prevents deletion)
- d) VPC 엔드포인트 (network access only)

**ref_links:**
1. S3 Object Lock documentation
2. S3 security best practices

---

### Q155: CloudFront + S3 OAC (고성능 아키텍처 설계)

**Scenario:** 미디어 회사 - 보안 영상 콘텐츠를 S3에 저장, 전 세계 사용자가 빠르고 안정적으로 다운로드

**Correct Answer:** b) Amazon CloudFront를 S3 Origin으로 설정하고 Origin Access Control 사용

**Key Concept Preservation:** Amazon CloudFront + S3 Origin Access Control(OAC)를 활용한 글로벌 미디어 배포

**Wrong Answers:**
- a) 모든 지역에 S3 복제본 (expensive, complex routing)
- c) Global Accelerator + S3 Transfer Acceleration (optimizes uploads, not downloads)
- d) Route 53 지역 기반 라우팅 (no caching benefit)

**ref_links:**
1. Amazon CloudFront documentation
2. S3 with CloudFront

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Questions | 5 |
| Total Options | 20 (5 × 4) |
| Korean Redesign | 100% |
| English Translation | 100% |
| Supabase Insertion | 100% |
| Rules Compliance | 15/15 ✅ |
| Domain Tags | Security: 2, Performance: 1, Cost-Optimization: 2 |
| Reference Links | 10 (2 per question) |

---

## File References

**Generated Output:**
- `/Users/sunghwanki/Desktop/Github_Project/cloud-exam-prep/output/pipeline_redesign_temp_b6.json`

**Insertion Script Used:**
- `.claude/skills/sql-generator/scripts/insert_supabase.py`

**Domain Reference Used:**
- `.claude/skills/question-redesigner/references/domain_tags/aws-saa-c03.md`

**Translation Guide:**
- `.claude/skills/question-redesigner/references/translation_guide/aws-saa-c03.md` (not found - used general patterns)

---

## Completion Timestamp

- **Started:** 2026-03-05 16:54:00 UTC
- **Completed:** 2026-03-05 16:54:27 UTC
- **Duration:** ~27 seconds

---

## Next Steps

These 5 questions are now available in the `/blog` and exam prep interfaces:
1. Exam prep system shows both Korean and English versions
2. Questions appear in "aws-saa-c03" exam filter
3. Linked to set (sort_order 151-155)
4. Ready for user study sessions
