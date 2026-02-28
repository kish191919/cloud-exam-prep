# AWS 블로그 작성 가이드

Blog Writer Agent가 AWS 자격증 블로그 포스트를 작성할 때 참조하는 스타일 가이드입니다.

---

## AWS 서비스명 표기 규칙

서비스명은 반드시 공식 표기 그대로 사용합니다. 번역·축약·대체 절대 금지.

### Compute
- `AWS Lambda` (AWS 접두사 생략 금지)
- `Amazon EC2`
- `Amazon ECS`, `Amazon EKS`
- `AWS Fargate`
- `AWS Batch`

### Storage
- `Amazon S3` (S3만 단독 사용 금지 — 반드시 "Amazon S3")
- `Amazon EBS`, `Amazon EFS`, `Amazon FSx`
- `AWS Storage Gateway`

### Database
- `Amazon RDS`, `Amazon Aurora`
- `Amazon DynamoDB`
- `Amazon ElastiCache`
- `Amazon Redshift`
- `Amazon Neptune`, `Amazon DocumentDB`

### AI / ML
- `Amazon Bedrock`
- `Amazon SageMaker`
- `Amazon Rekognition`
- `Amazon Comprehend`
- `Amazon Textract`
- `Amazon Polly`, `Amazon Transcribe`
- `Amazon Lex`
- `Amazon Kendra`
- `AWS Trainium`, `AWS Inferentia`

### Networking
- `Amazon VPC`
- `Amazon CloudFront`
- `Amazon Route 53`
- `AWS Direct Connect`
- `AWS Transit Gateway`
- `Elastic Load Balancing` (ELB 단독 사용 금지)

### Integration / Messaging
- `Amazon SQS` (Amazon Simple Queue Service)
- `Amazon SNS` (Amazon Simple Notification Service)
- `Amazon EventBridge`
- `AWS Step Functions`
- `Amazon API Gateway`

### Security
- `AWS IAM` (IAM만 단독 사용 금지)
- `AWS KMS`
- `AWS Secrets Manager`
- `Amazon Cognito`
- `AWS WAF`, `AWS Shield`
- `Amazon GuardDuty`, `Amazon Inspector`

### Management & Monitoring
- `Amazon CloudWatch`
- `AWS CloudTrail`
- `AWS Config`
- `AWS Systems Manager`
- `AWS Organizations`

### Data & Analytics
- `Amazon Kinesis`
- `AWS Glue`
- `Amazon Athena`
- `Amazon EMR`
- `Amazon QuickSight`

---

## 콘텐츠 스타일 가이드

### 독자 수준
- 주 독자: AWS 자격증 취득을 목표로 공부 중인 수험생 (초급~중급)
- 부 독자: 클라우드 아키텍처에 관심 있는 개발자·IT 종사자

### 문체 원칙
- 친근하고 명확한 설명체 (전문 블로그 스타일)
- 정확한 정보 전달 우선 — 지나친 친근함보다 신뢰성
- 수험생 관점: "이 개념이 시험에서 어떻게 나오는지"를 항상 의식

### 적합한 표현
- "Amazon Bedrock은 ~를 제공합니다"
- "시험에서는 주로 ~를 물어봅니다"
- "~를 사용하면 ~를 해결할 수 있습니다"
- "핵심은 ~입니다"
- "~와 헷갈리기 쉬우므로 주의하세요"

### 금지 표현
- 번역투: "~되어집니다", "~함으로써 가능합니다"
- 과도한 마케팅: "획기적인", "혁명적인"
- 모호한 수식: "매우", "굉장히" (구체적 수치/기능으로 대체)

---

## 시험 관련성 강조 패턴

독자(수험생)가 실질적으로 도움받을 수 있도록 시험 관련 내용을 명시적으로 언급합니다.

### 시험 출제 안내
```
> **시험 포인트**: {자격증명} 시험에서는 ~를 묻는 문제가 자주 출제됩니다.
```

### 함정 경고
```
> **주의**: ~와 ~는 헷갈리기 쉽습니다. 핵심 차이는 ~입니다.
```

### 예제 문제 형식
```
**예제 문제**
한 회사가 ~를 원합니다. 가장 적합한 AWS 서비스는?
A) Amazon SQS  B) Amazon SNS  C) Amazon EventBridge  D) AWS Step Functions
> **정답: C** — Amazon EventBridge는 ~이기 때문입니다.
```

### 체크리스트 형식
```
## 핵심 암기사항 체크리스트
- [ ] {서비스명}의 핵심 사용 사례: {사례}
- [ ] {서비스명} vs {서비스명}: {차이점}
- [ ] {키워드}가 나오면 → {서비스명}을 선택
```

---

## SEO 키워드 전략

### 주요 타깃 키워드 (AWS)
- `{자격증코드} 시험` (예: "AIF-C01 시험", "CLF-C02 시험")
- `{자격증명} 공부법`
- `{자격증명} 합격 전략`
- `AWS 자격증 취득`
- `{서비스명} 활용법`
- `{서비스명} 완벽 가이드`

### 롱테일 키워드 활용
- `{서비스A} vs {서비스B} 차이점`
- `{자격증코드} 시험 문제 유형`
- `{도메인명} {자격증코드} 핵심`
- `AWS {서비스명} 언제 사용`

### 키워드 배치 원칙
1. **제목(H1)**: 주요 키워드 앞부분 배치, 60자 이내
2. **첫 단락**: 첫 200자 이내에 주요 키워드 자연스럽게 포함
3. **H2 소제목**: 각 섹션에 관련 키워드 포함
4. **결론 단락**: 주요 키워드 재강조, 행동 유도

---

## ref_links 우선순위

참고자료는 권위 있는 공식 문서를 우선합니다.

1. **AWS 공식 문서** (최우선): `docs.aws.amazon.com`
   - 예: `https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html`
2. **AWS 블로그**: `aws.amazon.com/blogs`
3. **AWS 자격증 페이지**: `aws.amazon.com/certification`
4. **AWS 제품 페이지**: `aws.amazon.com/{service-name}`

### ref_links JSON 형식
```json
[
  {
    "name": "Amazon Bedrock 개발자 가이드",
    "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"
  },
  {
    "name": "AWS Certified AI Practitioner 자격증",
    "url": "https://aws.amazon.com/certification/certified-ai-practitioner/"
  }
]
```

---

## content_type별 필수 섹션 체크리스트

### overview (자격증 개요)
- [ ] 시험 코드, 합격 점수, 시험 시간 언급
- [ ] 도메인 구성 및 비율 (공식 정보 기반)
- [ ] 주요 서비스 목록 (최소 5개)
- [ ] 권장 사전 지식/경험
- [ ] 학습 리소스 추천
- [ ] 실질적인 합격 팁 (수험생 관점)

### domain_guide (도메인 학습 가이드)
- [ ] 도메인 정의 및 시험 비중
- [ ] 핵심 개념 2개 이상
- [ ] 관련 AWS 서비스 3개 이상
- [ ] 실제 출제 패턴·시나리오 언급
- [ ] 예제 문제 1~2개
- [ ] 학습 체크리스트

### service_comparison (서비스 비교)
- [ ] 비교 표 (한눈에 차이 파악)
- [ ] 각 서비스의 핵심 사용 사례
- [ ] 선택 기준 (의사결정 흐름)
- [ ] "이 키워드가 나오면 → 이 서비스" 패턴
- [ ] 시험에서 자주 나오는 혼동 포인트

### exam_strategy (시험 전략)
- [ ] 시험 형식 정보 (문항 수, 시간, 합격선)
- [ ] 도메인별 출제 비중 표
- [ ] 취약점이 되기 쉬운 함정 유형 3개 이상
- [ ] 시간 배분 전략
- [ ] D-Day 준비 체크리스트
