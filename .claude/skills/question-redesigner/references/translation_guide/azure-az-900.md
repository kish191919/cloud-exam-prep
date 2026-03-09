# AZURE AZ-900 영문 번역 가이드

이 파일은 한국어로 재설계된 AZ-900 문제를 Microsoft AZURE 자격증 시험 공식 문체의 영문으로 번역할 때 사용한다.
**일반 번역이 아닌 실제 Microsoft AZURE 시험 스타일을 그대로 재현하는 것이 목표다.**

---

## 1. 시나리오 문장 패턴

### 도입부 (첫 문장)
```
A company is migrating its [workload] to AZURE...
A company wants to [목표]...
An organization needs to [요구사항]...
A cloud administrator is responsible for [역할]...
A solutions architect is designing a [system/solution]...
A company has [N] servers in an on-premises data center...
A startup is planning to deploy its application on AZURE...
Your company is evaluating AZURE services for [use case]...
```

### 조건/제약 문장
```
The solution must minimize operational overhead.
The company requires the LEAST administrative effort.
The solution must be highly available.
The company wants to reduce costs compared to its on-premises infrastructure.
The team has no prior cloud experience.
The workload has unpredictable traffic patterns.
The company needs a dedicated connection to AZURE.
The application must remain available during a datacenter failure.
The company must comply with data residency requirements.
The solution must scale automatically based on demand.
```

### 질문 문장 (항상 마지막, 빈 줄로 분리)
```
Which AZURE service BEST meets these requirements?
Which solution MOST cost-effectively meets these requirements?
Which AZURE feature should the administrator configure?
Which AZURE service should the company use?
Which action should the administrator take?
What is the MOST appropriate AZURE service for this scenario?
Which combination of AZURE services meets these requirements?
Which AZURE tool provides this capability?
```

---

## 2. 보기(옵션) 문체 규칙

- AZURE 서비스명 단독: `AZURE Virtual Machines` / `AZURE Functions` / `AZURE Blob Storage`
- 조합: `AZURE Blob Storage + AZURE File Sync`
- 기능/옵션명: `availability zone` / `resource group` / `management group` / `role assignment`
- 중복성 옵션: `Locally redundant storage (LRS)` / `Zone-redundant storage (ZRS)` / `Geo-redundant storage (GRS)`
- **절대 금지**: 서비스명 번역, 파이프(`|`) 구분, 3개 이상 서비스 나열

---

## 3. 해설(explanation) 문체 규칙

### 정답 해설 패턴
```
[Service] is designed to [기능]. It provides [특징] and [특징], making it the BEST fit for [use case].
[Service] allows administrators to [기능], which [왜 이 시나리오에 맞는지].
[Feature] enables [기능] without requiring [불필요한 작업], minimizing operational overhead.
```

### 오답 해설 패턴
```
[Service] is used for [다른 용도], not for [이 문제의 용도].
Although [Service] provides [관련 기능], it [왜 부적합한지].
[Option] is more suitable for [다른 use case], not for [이 시나리오 특성].
```

### 전체 해설 구조
```
[정답 서비스/기능] [핵심 기능 설명]. [왜 이 시나리오에 가장 적합한지].

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
AZURE Storage Redundancy Options
• LRS (Locally Redundant Storage): 3 copies within a single datacenter — lowest cost
• ZRS (Zone-Redundant Storage): 3 copies across availability zones in the same region
• GRS (Geo-Redundant Storage): 6 copies across two paired regions — protects against regional outage
• GZRS: combines zone redundancy within primary region + geo-replication to secondary region
```

---

## 5. AZ-900 핵심 용어 대역표

### 클라우드 개념 (Cloud Concepts)
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 공유 책임 모델 | shared responsibility model |
| 고가용성 | high availability |
| 확장성 | scalability |
| 탄력성 | elasticity |
| 안정성 | reliability |
| 예측 가능성 | predictability |
| 관리 용이성 | manageability |
| 보안 | security |
| 거버넌스 | governance |
| 자본 지출 | capital expenditure (CapEx) |
| 운영 지출 | operational expenditure (OpEx) |
| 소비 기반 모델 | consumption-based model |
| 퍼블릭 클라우드 | public cloud |
| 프라이빗 클라우드 | private cloud |
| 하이브리드 클라우드 | hybrid cloud |
| IaaS | Infrastructure as a Service (IaaS) |
| PaaS | Platform as a Service (PaaS) |
| SaaS | Software as a Service (SaaS) |
| 서버리스 | serverless |
| 관리형 서비스 | managed service |
| 온프레미스 | on-premises |
| 총소유비용 | Total Cost of Ownership (TCO) |

### AZURE 핵심 아키텍처
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 리전 | region |
| 리전 쌍 | region pair |
| 소버린 리전 | sovereign region |
| 가용 영역 | availability zone |
| 데이터센터 | datacenter |
| 리소스 그룹 | resource group |
| 구독 | subscription |
| 관리 그룹 | management group |
| 리소스 계층 구조 | resource hierarchy |

### 컴퓨팅 및 네트워킹
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 가상 머신 | virtual machine (VM) |
| 가용성 집합 | availability set |
| 웹앱 | web app |
| 컨테이너 | container |
| 함수 | function |
| 가상 네트워크 | virtual network (VNet) |
| 서브넷 | subnet |
| 가상 네트워크 피어링 | virtual network peering |
| 공용 엔드포인트 | public endpoint |
| 프라이빗 엔드포인트 | private endpoint |
| 전용 연결 | dedicated connection |
| 지연 시간 | latency |

### 스토리지
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 스토리지 계층 (핫) | hot access tier |
| 스토리지 계층 (쿨) | cool access tier |
| 스토리지 계층 (콜드) | cold access tier |
| 스토리지 계층 (아카이브) | archive access tier |
| 로컬 중복 스토리지 | Locally Redundant Storage (LRS) |
| 영역 중복 스토리지 | Zone-Redundant Storage (ZRS) |
| 지역 중복 스토리지 | Geo-Redundant Storage (GRS) |
| 지역 영역 중복 스토리지 | Geo-Zone-Redundant Storage (GZRS) |
| 스토리지 계정 | storage account |
| 블록 Blob | block blob |
| 파일 공유 | file share |
| 관리 디스크 | managed disk |

### ID, 접근 및 보안
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 디렉터리 서비스 | directory service |
| 단일 로그인 | single sign-on (SSO) |
| 다단계 인증 | multifactor authentication (MFA) |
| 암호리스 인증 | passwordless authentication |
| 외부 ID | external identity |
| 조건부 액세스 | Conditional Access |
| 역할 기반 액세스 제어 | role-based access control (RBAC) |
| 역할 할당 | role assignment |
| 제로 트러스트 | Zero Trust |
| 심층 방어 | defense in depth |
| 최소 권한 원칙 | principle of least privilege |
| 암호화 | encryption |
| 전송 중 암호화 | encryption in transit |
| 저장 중 암호화 | encryption at rest |
| 규정 준수 | compliance |
| 감사 | audit |
| DDoS 방어 | DDoS protection |

### 비용 관리
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 가격 계산기 | pricing calculator |
| 예산 | budget |
| 태그 | tag |
| 비용 배분 | cost allocation |
| 프리 계정 | AZURE free account |
| 사용한 만큼 지불 | pay-as-you-go |

### 거버넌스 및 규정 준수
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 정책 이니셔티브 | policy initiative (policy set) |
| 정책 할당 | policy assignment |
| 리소스 잠금 (읽기 전용) | resource lock — ReadOnly |
| 리소스 잠금 (삭제 방지) | resource lock — Delete |
| 데이터 거버넌스 | data governance |
| 데이터 카탈로그 | data catalog |

### 리소스 배포 및 관리
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 코드형 인프라 | infrastructure as code (IaC) |
| ARM 템플릿 | ARM template |
| 명령줄 인터페이스 | command-line interface (CLI) |
| 클라우드 셸 | Cloud Shell |

### 모니터링
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 계획된 유지 관리 | planned maintenance |
| 서비스 상태 기록 | health history |
| 경고 | alert |
| 쿼리 | query |
| 로그 | log |
| 메트릭 | metric |
| 애플리케이션 성능 관리 | application performance management (APM) |

---

## 6. AZ-900 주요 AZURE 서비스 (번역 없이 그대로 사용)

```
# 컴퓨팅
AZURE Virtual Machines                AZURE Virtual Machine Scale Sets
AZURE Virtual Desktop                 AZURE Container Instances
AZURE Kubernetes Service (AKS)        AZURE Functions
AZURE App Service                     AZURE Batch

# 스토리지
AZURE Blob Storage                    AZURE Files
AZURE Disks                           AZURE Queues
AZURE Tables                          AzCopy
AZURE Storage Explorer                AZURE File Sync
AZURE Migrate                         AZURE Data Box

# 네트워킹
AZURE Virtual Network                 AZURE VPN Gateway
AZURE ExpressRoute                    AZURE DNS
AZURE Load Balancer                   AZURE Application Gateway
AZURE Front Door                      AZURE Content Delivery Network (CDN)
AZURE Firewall                        AZURE DDoS Protection

# ID 및 보안
Microsoft Entra ID                    Microsoft Entra Domain Services
Microsoft Defender for Cloud          AZURE Key Vault
Microsoft Sentinel

# 관리 및 거버넌스
AZURE Portal                          AZURE Cloud Shell
AZURE CLI                             AZURE PowerShell
AZURE Resource Manager (ARM)          AZURE Arc
AZURE Policy                          Microsoft Purview
AZURE Blueprints

# 모니터링
AZURE Advisor                         AZURE Service Health
AZURE Monitor                         Log Analytics
Application Insights

# 비용 관리
AZURE Cost Management                 AZURE Pricing Calculator
AZURE Budgets
```

---

## 7. AZ-900 시험 특화 문체 패턴

### 공유 책임 모델 관련
```
Which responsibility belongs to Microsoft under the shared responsibility model?
Which of the following is the customer's responsibility when using AZURE IaaS?
Under the shared responsibility model, Microsoft is responsible for [security OF the cloud infrastructure], while the customer is responsible for [security IN the cloud].
```

### 비용 최적화 관련
```
Which action will MOST reduce the company's AZURE costs?
Which AZURE tool allows the company to estimate costs before deploying resources?
Which AZURE feature allows the company to set spending limits and receive alerts?
Which AZURE pricing model charges only for resources that are consumed?
```

### 아키텍처 / 고가용성 관련
```
Which AZURE feature ensures the application remains available during a datacenter failure?
Which AZURE architectural component allows the company to distribute its resources across multiple physical locations within a region?
Which AZURE service provides a dedicated, private connection between on-premises infrastructure and AZURE?
The company wants to avoid a single point of failure. Which AZURE feature should the architect use?
```

### ID / 보안 관련
```
Which AZURE service allows the administrator to enforce MFA without changing application code?
Which AZURE feature allows the company to define and enforce organizational standards across all AZURE resources?
Which AZURE service provides centralized identity management and single sign-on?
Which AZURE security principle ensures that users have only the permissions required to perform their job?
```

### 거버넌스 관련
```
Which AZURE feature prevents administrators from accidentally deleting a critical resource?
Which AZURE service allows the company to define compliance policies and audit resource configurations?
Which AZURE tool provides recommendations to improve security, reliability, and cost efficiency?
```

### 모니터링 관련
```
Which AZURE service notifies the company of planned maintenance events that might affect its resources?
Which AZURE service allows the administrator to query and analyze log data from multiple AZURE resources?
Which AZURE service provides personalized recommendations to optimize AZURE usage?
```
