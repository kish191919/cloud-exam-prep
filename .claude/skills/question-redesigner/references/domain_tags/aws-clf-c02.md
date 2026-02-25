# CLF-C02 도메인 태그 목록

AWS Certified Cloud Practitioner (CLF-C02) 문제에 사용하는 도메인 태그입니다.
각 문제에 태그를 **정확히 1개** 부여합니다.

---

## 태그 목록

| 태그 | 영문 태그 | 설명 | 키워드 예시 |
|------|----------|------|------------|
| `클라우드 개념` | `Cloud Concepts` | 클라우드 컴퓨팅 정의, 장점, 배포/서비스 모델, 글로벌 인프라 | 퍼블릭/프라이빗/하이브리드 클라우드, IaaS/PaaS/SaaS, 고가용성, 탄력성, 확장성, 민첩성, 리전, 가용 영역, 엣지 로케이션, Well-Architected Framework, 온프레미스 vs 클라우드, 클라우드 경제성, 자본 지출(CapEx) vs 운영 지출(OpEx) |
| `보안 및 규정 준수` | `Security and Compliance` | 공동 책임 모델, IAM, 보안 서비스, 규정 준수 프로그램 | 공동 책임 모델, AWS IAM, MFA, 루트 사용자, 최소 권한 원칙, 암호화, AWS Shield, AWS WAF, Amazon GuardDuty, AWS Inspector, AWS Artifact, AWS Security Hub, GDPR, HIPAA, PCI DSS, SOC, 규정 준수 프로그램 |
| `클라우드 기술 및 서비스` | `Cloud Technology and Services` | AWS 핵심 서비스 선택·비교, 아키텍처 구성 | Amazon EC2, Amazon S3, Amazon RDS, Amazon VPC, AWS Lambda, Amazon CloudFront, AWS Auto Scaling, Elastic Load Balancing, Amazon DynamoDB, Amazon ECS, AWS Elastic Beanstalk, AWS CloudFormation, Amazon Route 53, Amazon SNS, Amazon SQS, 서버리스, 컨테이너, 마이그레이션, AWS Snow Family |
| `청구, 가격 책정 및 지원` | `Billing, Pricing, and Support` | AWS 요금 모델, 비용 관리 도구, 지원 플랜 | AWS Pricing Calculator, AWS Cost Explorer, AWS Budgets, AWS Cost and Usage Report, AWS Free Tier, 예약 인스턴스(Reserved Instances), Savings Plans, 스팟 인스턴스(Spot Instances), 온디맨드(On-Demand), AWS Support 플랜(Basic/Developer/Business/Enterprise), AWS Marketplace, TCO 계산기 |

---

## 태그 선택 기준

1. 문제의 **핵심 주제**를 기준으로 선택 (보기 내용이 아닌 질문이 무엇을 묻는지)
2. 클라우드 컴퓨팅 개념·모델·인프라 구조·장점 → `클라우드 개념`
3. IAM·보안 서비스·규정 준수·공동 책임 모델 → `보안 및 규정 준수`
4. AWS 서비스를 직접 선택·비교·아키텍처 구성 → `클라우드 기술 및 서비스`
5. 요금 모델·비용 관리 도구·지원 플랜 → `청구, 가격 책정 및 지원`
6. 경계가 모호한 경우:
   - 보안 서비스(Shield, WAF, GuardDuty 등) 선택·비교 → `보안 및 규정 준수`
   - 비용 절감을 위한 아키텍처 서비스 선택 → `클라우드 기술 및 서비스`
   - 총소유비용(TCO) 계산·비교 → `청구, 가격 책정 및 지원`
   - 글로벌 인프라(리전·AZ·엣지 로케이션) 개념 → `클라우드 개념`
