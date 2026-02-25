# AWS CLF-C02 영문 번역 가이드

이 파일은 한국어로 재설계된 CLF-C02 문제를 AWS 자격증 시험 공식 문체의 영문으로 번역할 때 사용한다.
**일반 번역이 아닌 실제 AWS 시험 스타일을 그대로 재현하는 것이 목표다.**

---

## 1. 시나리오 문장 패턴

### 도입부 (첫 문장)
```
A company is [동사-ing]...
A startup wants to...
An organization needs to...
A solutions architect is designing...
A DevOps engineer must...
A Cloud Practitioner is evaluating...
A business is migrating its [workload] to AWS...
A company has [N] servers in an on-premises data center...
```

### 조건/제약 문장
```
The company wants to minimize operational overhead.
The solution must be highly available across multiple Availability Zones.
The company requires the LEAST operational effort.
The team has no prior cloud experience.
The company wants to reduce costs compared to its on-premises infrastructure.
The workload has unpredictable traffic patterns.
The company needs a dedicated connection to AWS.
The application requires low latency for end users across the globe.
```

### 질문 문장 (항상 마지막, 빈 줄로 분리)
```
Which AWS service BEST meets these requirements?
Which solution MOST cost-effectively meets these requirements?
Which AWS service should the company use?
Which combination of AWS services meets these requirements?
What is the MOST cost-effective purchasing option?
Which AWS service provides this capability?
Which action should the company take?
What is the shared responsibility of AWS in this scenario?
```

---

## 2. 보기(옵션) 문체 규칙

- AWS 서비스명 단독: `Amazon EC2 Reserved Instances`
- 인스턴스 옵션: `On-Demand Instances` / `Spot Instances` / `Dedicated Hosts`
- 서비스 조합: `Amazon SQS + Amazon SNS`
- 간결한 명사구: `Multi-AZ deployment` / `Auto Scaling group`
- **절대 금지**: 서비스명 번역, 파이프(`|`) 구분, 3개 이상 서비스 나열

---

## 3. 해설(explanation) 문체 규칙

### 정답 해설 패턴
```
[Service] is designed to [기능]. It provides [특징] and [특징], making it the BEST fit for [use case].
[Service/Option] allows customers to [기능], which [왜 이 시나리오에 맞는지].
```

### 오답 해설 패턴
```
[Service] is used for [다른 용도], not for [이 문제의 용도].
Although [Service] [관련 기능], it [왜 부적합한지].
[Option] is more suitable for [다른 use case], not for workloads with [이 시나리오 특성].
```

### 전체 해설 구조
```
[정답 서비스/옵션] [핵심 기능 설명]. [왜 이 시나리오에 가장 적합한지].

• [오답 A]: [오답 이유 — 간결하게]
• [오답 B]: [오답 이유 — 간결하게]
• [오답 C]: [오답 이유 — 간결하게]
```

---

## 4. key_points 번역 문체

```
[핵심 개념 제목 (영문)]
• [포인트 1 — 간결한 영문 bullet]
• [포인트 2]
• [포인트 3]
```

예시:
```
Amazon EC2 Purchasing Options
• On-Demand: pay by the second with no long-term commitment — ideal for unpredictable workloads
• Reserved Instances: up to 72% discount in exchange for a 1- or 3-year commitment
• Spot Instances: up to 90% discount using spare EC2 capacity — can be interrupted
• Dedicated Hosts: physical servers dedicated to a single customer for license compliance
```

---

## 5. CLF-C02 핵심 용어 대역표

### 클라우드 개념 (Cloud Concepts)
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 고가용성 | high availability |
| 내결함성 | fault tolerance |
| 탄력성 | elasticity |
| 확장성 | scalability |
| 민첩성 | agility |
| 글로벌 인프라 | global infrastructure |
| 리전 | Region |
| 가용 영역 | Availability Zone (AZ) |
| 엣지 로케이션 | edge location |
| 온프레미스 | on-premises |
| 자본 지출 | capital expenditure (CapEx) |
| 운영 지출 | operational expenditure (OpEx) |
| 총소유비용 | Total Cost of Ownership (TCO) |
| 퍼블릭 클라우드 | public cloud |
| 프라이빗 클라우드 | private cloud |
| 하이브리드 클라우드 | hybrid cloud |
| IaaS | Infrastructure as a Service (IaaS) |
| PaaS | Platform as a Service (PaaS) |
| SaaS | Software as a Service (SaaS) |
| 서버리스 | serverless |
| 관리형 서비스 | managed service |
| 공동 책임 모델 | shared responsibility model |

### 보안 / IAM
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 최소 권한 원칙 | principle of least privilege |
| 루트 사용자 | root user |
| IAM 사용자 | IAM user |
| IAM 역할 | IAM role |
| IAM 정책 | IAM policy |
| IAM 그룹 | IAM group |
| 다중 인증 | multi-factor authentication (MFA) |
| 자격 증명 | credentials |
| 암호화 | encryption |
| 전송 중 암호화 | encryption in transit |
| 저장 중 암호화 | encryption at rest |
| 규정 준수 | compliance |
| 감사 | audit |
| 침투 테스트 | penetration testing |
| DDoS 방어 | DDoS protection |
| 방화벽 | firewall |
| 웹 방화벽 | Web Application Firewall (WAF) |
| 보안 그룹 | security group |
| 네트워크 ACL | network access control list (NACL) |
| VPN | VPN (Virtual Private Network) |
| 전용 네트워크 연결 | dedicated network connection |

### EC2 / 컴퓨팅
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 온디맨드 인스턴스 | On-Demand Instances |
| 예약 인스턴스 | Reserved Instances |
| 스팟 인스턴스 | Spot Instances |
| 전용 호스트 | Dedicated Hosts |
| 전용 인스턴스 | Dedicated Instances |
| 자동 확장 | Auto Scaling |
| 로드 밸런서 | load balancer |
| 부하 분산 | load balancing |
| 서버리스 컴퓨팅 | serverless computing |
| 컨테이너 | container |
| 마이크로서비스 | microservices |
| 디커플링 | decoupling |

### 스토리지
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 객체 스토리지 | object storage |
| 블록 스토리지 | block storage |
| 파일 스토리지 | file storage |
| 스토리지 클래스 | storage class |
| 수명 주기 정책 | lifecycle policy |
| 버킷 | bucket |
| 버전 관리 | versioning |
| 스냅샷 | snapshot |

### 네트워킹
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 가상 사설 클라우드 | Virtual Private Cloud (VPC) |
| 서브넷 | subnet |
| 퍼블릭 서브넷 | public subnet |
| 프라이빗 서브넷 | private subnet |
| 인터넷 게이트웨이 | internet gateway |
| NAT 게이트웨이 | NAT gateway |
| 라우팅 테이블 | route table |
| 피어링 | peering |
| 콘텐츠 전송 네트워크 | content delivery network (CDN) |
| 지연 시간 | latency |
| DNS | Domain Name System (DNS) |
| 라우팅 정책 | routing policy |
| 가중치 기반 라우팅 | weighted routing |
| 장애 조치 라우팅 | failover routing |
| 지리 근접성 라우팅 | geoproximity routing |

### 데이터베이스
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 관계형 데이터베이스 | relational database |
| NoSQL 데이터베이스 | NoSQL database |
| 다중 AZ 배포 | Multi-AZ deployment |
| 읽기 전용 복제본 | read replica |
| 자동 백업 | automated backup |
| 관리형 데이터베이스 | managed database |
| 글로벌 테이블 | global tables |
| 인메모리 캐시 | in-memory cache |
| 데이터 웨어하우스 | data warehouse |

### 청구 / 비용
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 사용한 만큼 지불 | pay-as-you-go |
| 예약 할인 | reservation discount |
| Savings Plans | Savings Plans |
| 비용 탐색기 | AWS Cost Explorer |
| 예산 | AWS Budgets |
| 청구 알림 | billing alarm |
| 비용 배분 태그 | cost allocation tags |
| 프리 티어 | AWS Free Tier |
| 통합 결제 | consolidated billing |
| 볼륨 할인 | volume discount |
| 데이터 전송 비용 | data transfer cost |
| 총소유비용 계산기 | TCO Calculator |

### 지원 플랜
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 기본 지원 | Basic Support |
| 개발자 지원 | Developer Support |
| 비즈니스 지원 | Business Support |
| 엔터프라이즈 지원 | Enterprise Support |
| 기술 계정 관리자 | Technical Account Manager (TAM) |
| 신뢰할 수 있는 어드바이저 | AWS Trusted Advisor |
| 응답 시간 | response time |

---

## 6. CLF-C02에 등장하는 주요 AWS 서비스 (번역 없이 그대로 사용)

```
# 컴퓨팅
Amazon EC2                    AWS Lambda
Amazon ECS                    Amazon EKS
AWS Elastic Beanstalk         AWS Batch
AWS Fargate                   Amazon Lightsail

# 스토리지
Amazon S3                     Amazon EBS
Amazon EFS                    AWS Storage Gateway
AWS Snow Family               Amazon S3 Glacier

# 데이터베이스
Amazon RDS                    Amazon DynamoDB
Amazon Aurora                 Amazon Redshift
Amazon ElastiCache            Amazon Neptune
Amazon DocumentDB

# 네트워킹
Amazon VPC                    Amazon CloudFront
Amazon Route 53               AWS Direct Connect
AWS VPN                       Elastic Load Balancing
AWS Transit Gateway           Amazon API Gateway

# 보안
AWS IAM                       AWS Shield
AWS WAF                       Amazon GuardDuty
Amazon Inspector              AWS Artifact
AWS Security Hub              AWS Config
AWS CloudTrail                Amazon Macie
AWS Key Management Service (AWS KMS)
AWS Secrets Manager

# 모니터링 / 관리
Amazon CloudWatch             AWS CloudFormation
AWS Systems Manager           AWS Trusted Advisor
AWS Personal Health Dashboard AWS Control Tower
AWS Organizations

# 애플리케이션 통합
Amazon SNS                    Amazon SQS
Amazon EventBridge            AWS Step Functions

# 분석
Amazon Athena                 AWS Glue
Amazon Kinesis                Amazon QuickSight
Amazon EMR

# 마이그레이션
AWS Migration Hub             AWS Database Migration Service (AWS DMS)
AWS Application Migration Service  AWS DataSync
AWS Transfer Family

# 비용 관리
AWS Cost Explorer             AWS Budgets
AWS Pricing Calculator        AWS Cost and Usage Report
```

---

## 7. CLF-C02 시험 특화 문체 패턴

### 공동 책임 모델 관련
```
Which of the following is the responsibility of AWS under the shared responsibility model?
Which of the following is the customer's responsibility?
AWS is responsible for [security OF the cloud], while the customer is responsible for [security IN the cloud].
```

### 비용 최적화 관련
```
Which purchasing option provides the GREATEST cost savings for a steady-state workload?
Which AWS service helps the company monitor and control its AWS spending?
Which action will reduce the company's AWS costs?
```

### 인프라 / 고가용성 관련
```
Which AWS feature allows the company to distribute its application across multiple geographic areas?
Which architecture BEST ensures high availability?
The company wants to avoid a single point of failure. Which solution should the company use?
```
