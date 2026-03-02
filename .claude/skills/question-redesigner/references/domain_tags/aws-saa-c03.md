# SAA-C03 도메인 태그 목록

AWS Certified Solutions Architect - Associate (SAA-C03) 문제에 사용하는 도메인 태그입니다.
각 문제에 태그를 **정확히 1개** 부여합니다.

---

## 태그 목록

| 태그 | 영문 태그 | 설명 | 키워드 예시 |
|------|----------|------|------------|
| `보안 아키텍처 설계` | `Design Secure Architectures` | IAM·계정 보안, VPC 보안 구성, 데이터 암호화·접근 제어, 규정 준수 (시험 비중 30%) | IAM, IAM Identity Center, AWS STS, Control Tower, SCP, MFA, VPC 보안 그룹, 네트워크 ACL, NAT 게이트웨이, AWS Shield, AWS WAF, Amazon Cognito, Amazon GuardDuty, Amazon Macie, AWS Secrets Manager, AWS KMS, AWS Certificate Manager(ACM), 공동 책임 모델, 최소 권한 원칙, 암호화, AWS Direct Connect, VPN, AWS PrivateLink |
| `탄력적인 아키텍처 설계` | `Design Resilient Architectures` | 확장 가능한 느슨한 결합·이벤트 기반 아키텍처, 고가용성·내결함성·재해 복구 설계 (시험 비중 26%) | Amazon SQS, Amazon SNS, Amazon EventBridge, Amazon API Gateway, AWS Lambda, AWS Fargate, Amazon ECS, Amazon EKS, AWS Step Functions, EC2 Auto Scaling, ALB, Amazon Route 53, 재해 복구(DR), RPO, RTO, 멀티 AZ, 멀티 리전, 파일럿 라이트, 웜 스탠바이, 액티브-액티브, Amazon RDS Proxy, AWS X-Ray, 마이크로서비스, 이벤트 기반 아키텍처, 읽기 전용 복제본 |
| `고성능 아키텍처 설계` | `Design High-Performing Architectures` | 스토리지·컴퓨팅·데이터베이스·네트워크·데이터 파이프라인 성능 최적화 서비스 선택 (시험 비중 24%) | Amazon S3, Amazon EFS, Amazon EBS, EC2 Auto Scaling, Amazon ElastiCache, Amazon Aurora, Amazon DynamoDB, Amazon CloudFront, AWS Global Accelerator, Amazon Kinesis, AWS Glue, Amazon Athena, Amazon EMR, AWS Lake Formation, AWS DataSync, AWS PrivateLink, 읽기 전용 복제본, 캐싱 전략, 스트리밍, Amazon Redshift, OpenSearch |
| `비용 최적화 아키텍처 설계` | `Design Cost-Optimized Architectures` | 스토리지·컴퓨팅·DB·네트워크 비용 효율 극대화, AWS 요금 모델 및 비용 관리 도구 선택 (시험 비중 20%) | S3 수명 주기, S3 Glacier, Amazon FSx, Spot 인스턴스, 예약 인스턴스(Reserved Instances), Savings Plans, 온디맨드, AWS Cost Explorer, AWS Budgets, AWS Cost and Usage Report, AWS Compute Optimizer, NAT 게이트웨이 비용, AWS Transit Gateway, VPC 피어링, 데이터 전송 비용, 스토리지 티어링, DynamoDB vs RDS 비용 비교 |

---

## 태그 선택 기준

1. 문제의 **핵심 주제**를 기준으로 선택 (보기 내용이 아닌 질문이 무엇을 묻는지)
2. IAM·SCP·KMS·암호화·WAF·보안 그룹·규정 준수 등 **보안·접근 제어** → `보안 아키텍처 설계`
3. SQS·SNS·Lambda·Auto Scaling·DR·멀티 AZ·파일럿 라이트 등 **확장성·고가용성·느슨한 결합** → `탄력적인 아키텍처 설계`
4. ElastiCache·Aurora·DynamoDB·CloudFront·Kinesis 등 **성능 극대화 서비스 선택·비교** → `고성능 아키텍처 설계`
5. Spot·Reserved·Savings Plans·비용 도구·NAT 비용·스토리지 티어 등 **비용 절감·요금 모델** → `비용 최적화 아키텍처 설계`
6. 경계가 모호한 경우:
   - Auto Scaling이 **HA/DR·내결함성** 목적 → `탄력적인 아키텍처 설계`
   - Auto Scaling이 **처리량·지연 시간·성능** 목적 → `고성능 아키텍처 설계`
   - VPC 구성이 **보안 그룹·NACL·네트워크 격리** 목적 → `보안 아키텍처 설계`
   - VPC 구성이 **CloudFront·Global Accelerator·네트워크 성능** 목적 → `고성능 아키텍처 설계`
   - 비용 절감을 위한 인스턴스 유형·구매 옵션 선택 → `비용 최적화 아키텍처 설계`
   - 성능을 위한 인스턴스 유형·DB 엔진 선택 → `고성능 아키텍처 설계`
   - AWS Shield·WAF·GuardDuty 등 **보안 서비스 선택** → `보안 아키텍처 설계`
   - 서버리스(Lambda·Fargate) 전환이 **비용 절감** 목적 → `비용 최적화 아키텍처 설계`
   - 서버리스 전환이 **확장성·느슨한 결합** 목적 → `탄력적인 아키텍처 설계`
