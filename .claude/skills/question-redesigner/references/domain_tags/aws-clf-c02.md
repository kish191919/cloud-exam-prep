# CLF-C02 도메인 태그 목록

AWS Certified Cloud Practitioner (CLF-C02) 문제에 사용하는 도메인 태그입니다.
각 문제에 태그를 **정확히 1개** 부여합니다.

공식 시험 가이드 기준: 4개 도메인, 14개 Task Statement → 15개 세분화 태그.

---

## 태그 목록

| 태그 | 영문 태그 | 포르투갈어 태그 | 스페인어 태그 | 일본어 태그 | 설명 | 키워드 예시 |
|------|----------|----------------|--------------|------------|------|------------|
| `클라우드 이점과 가치 제안` | `Cloud Benefits and Value Proposition` | `Benefícios da Nuvem e Proposta de Valor` | `Beneficios de la Nube y Propuesta de Valor` | `クラウドの利点と価値提案` | 클라우드 컴퓨팅 정의, 배포 모델(퍼블릭/프라이빗/하이브리드), 서비스 모델(IaaS/PaaS/SaaS), 클라우드 장점(고가용성, 탄력성, 민첩성, 글로벌 도달 범위) (D1 Task 1.1) | 퍼블릭 클라우드, 프라이빗 클라우드, 하이브리드 클라우드, IaaS, PaaS, SaaS, 고가용성(HA), 탄력성(elasticity), 확장성(scalability), 민첩성(agility), 글로벌 인프라, 온프레미스 vs 클라우드, 종량제(pay-as-you-go), 셀프 서비스 프로비저닝, 광범위한 네트워크 접근, 리소스 풀링, 빠른 탄력성, 측정 가능한 서비스, 내결함성 |
| `Well-Architected 설계 원칙` | `Well-Architected Design Principles` | `Princípios de Design Well-Architected` | `Principios de Diseño Well-Architected` | `Well-Architected設計原則` | AWS Well-Architected Framework 6개 기둥, 설계 원칙, 아키텍처 모범 사례, Well-Architected Tool (D1 Task 1.2) | Well-Architected Framework, 운영 우수성(Operational Excellence), 보안(Security), 안정성(Reliability), 성능 효율성(Performance Efficiency), 비용 최적화(Cost Optimization), 지속 가능성(Sustainability), 설계 원칙, 장애 대비 설계, 자동화, 변경 관리, 수요 예측, AWS Well-Architected Tool, 아키텍처 모범 사례, 기둥 간 트레이드오프 |
| `마이그레이션과 클라우드 도입` | `Migration and Cloud Adoption` | `Migração e Adoção da Nuvem` | `Migración y Adopción de la Nube` | `移行とクラウド導入` | AWS CAF(Cloud Adoption Framework), 마이그레이션 전략(6R), Snow Family, 마이그레이션 서비스, 클라우드 도입 여정 (D1 Task 1.3) | AWS Cloud Adoption Framework(CAF), 6R 전략(Rehost/Replatform/Refactor/Repurchase/Retire/Retain), AWS Migration Hub, AWS Application Migration Service(MGN), AWS Database Migration Service(DMS), AWS Schema Conversion Tool(SCT), AWS Snow Family(Snowcone/Snowball/Snowmobile), AWS DataSync, AWS Transfer Family, VMware Cloud on AWS, 온프레미스 마이그레이션, AWS Professional Services, 클라우드 변환 여정, CAF 관점(비즈니스/인력/거버넌스/플랫폼/보안/운영) |
| `공동 책임 모델` | `Shared Responsibility Model` | `Modelo de Responsabilidade Compartilhada` | `Modelo de Responsabilidad Compartida` | `共有責任モデル` | AWS와 고객의 보안 책임 분리, 서비스 유형별 책임 변동(EC2/RDS/Lambda), 물리적 보안 vs 논리적 보안 (D2 Task 2.1) | 공동 책임 모델, AWS 책임(클라우드의 보안), 고객 책임(클라우드에서의 보안), 물리적 보안, 인프라 보안, 데이터 보안, 패치 관리, 운영체제 패치, 네트워크 구성, 서비스별 책임 변동, 관리형 서비스 vs 비관리형 서비스, EC2 고객 책임(OS 패치·방화벽), RDS AWS 책임(DB 엔진 패치), Lambda 공유 책임, 데이터 암호화 책임 |
| `보안 거버넌스와 규정 준수` | `Security Governance and Compliance` | `Governança de Segurança e Conformidade` | `Gobernanza de Seguridad y Cumplimiento` | `セキュリティガバナンスとコンプライアンス` | 규정 준수 프로그램, 감사·로깅, 암호화(전송 중·저장 시), 보안 거버넌스 서비스, 리소스 구성 추적 (D2 Task 2.2) | AWS Artifact, AWS CloudTrail, AWS Config, AWS Audit Manager, Amazon Inspector, 암호화(전송 중/저장 시), AWS KMS, AWS Certificate Manager(ACM), GDPR, HIPAA, PCI DSS, SOC, ISO 27001, 규정 준수 프로그램, 감사 로그, 보안 로깅, Amazon Macie, AWS Security Hub, 데이터 보호, 암호화 키 관리, 리소스 구성 변경 이력, SCP(서비스 제어 정책), AWS Organizations(거버넌스) |
| `접근 관리와 자격 증명` | `Access Management and Credentials` | `Gerenciamento de Acesso e Credenciais` | `Gestión de Acceso y Credenciales` | `アクセス管理と認証情報` | IAM 사용자·그룹·역할·정책, 루트 사용자 보호, 최소 권한 원칙, MFA, 연합 인증, SSO (D2 Task 2.3) | AWS IAM, IAM 사용자, IAM 그룹, IAM 역할, IAM 정책(JSON), 루트 사용자, 최소 권한 원칙(least privilege), MFA(다단계 인증), AWS IAM Identity Center(SSO), 연합 인증(federation), AWS STS, 임시 보안 자격 증명, 액세스 키(Access Key ID/Secret Access Key), 비밀번호 정책, AWS Secrets Manager, Amazon Cognito, 크로스 계정 접근, 서비스 연결 역할, AWS Systems Manager |
| `보안 서비스와 위협 방어` | `Security Services and Threat Defense` | `Serviços de Segurança e Defesa contra Ameaças` | `Servicios de Seguridad y Defensa contra Amenazas` | `セキュリティサービスと脅威防御` | 네트워크 방어 서비스, 위협 탐지, DDoS 방어, 보안 자동화, Marketplace 보안 솔루션 (D2 Task 2.4) | AWS WAF, AWS Shield(Standard/Advanced), Amazon GuardDuty, AWS Firewall Manager, Amazon Detective, AWS Network Firewall, AWS Trusted Advisor(보안 점검), DDoS 방어, SQL 인젝션 방어, XSS 방어, 침입 탐지, 위협 인텔리전스, AWS Marketplace 보안 솔루션, AWS Trust and Safety, 보안 모범 사례 |
| `배포 방법과 글로벌 인프라` | `Deployment Methods and Global Infrastructure` | `Métodos de Implantação e Infraestrutura Global` | `Métodos de Despliegue e Infraestructura Global` | `デプロイ方法とグローバルインフラストラクチャ` | AWS 접근 방법(콘솔/CLI/SDK), IaC, 배포 모델, 리전·AZ·엣지 로케이션, 고가용성·재해 복구 아키텍처 (D3 Task 3.1+3.2) | AWS Management Console, AWS CLI, AWS SDK, AWS CloudFormation, AWS CDK, AWS Elastic Beanstalk, IaC(Infrastructure as Code), 리전(Region), 가용 영역(AZ), 엣지 로케이션, AWS Local Zones, AWS Wavelength, AWS Outposts, 멀티 AZ 배포, 멀티 리전 배포, 고가용성(HA), 재해 복구(DR), AWS CloudShell, API 호출, 프로그래밍 방식 접근, 클라우드/하이브리드/온프레미스 배포 모델, 데이터 주권 |
| `컴퓨팅 서비스` | `Compute Services` | `Serviços de Computação` | `Servicios de Cómputo` | `コンピューティングサービス` | EC2 인스턴스 유형, 컨테이너(ECS/EKS/Fargate/ECR), 서버리스(Lambda), Auto Scaling, 로드 밸런싱 (D3 Task 3.3) | Amazon EC2, EC2 인스턴스 유형(범용/컴퓨팅 최적화/메모리 최적화/스토리지 최적화/가속 컴퓨팅), Amazon ECS, Amazon EKS, AWS Fargate, AWS Lambda, Amazon Lightsail, AWS Batch, EC2 Auto Scaling, Elastic Load Balancing(ALB/NLB/GLB), Amazon Machine Image(AMI), 서버리스, 컨테이너, Amazon ECR, 전용 호스트(Dedicated Hosts), 전용 인스턴스(Dedicated Instances), EC2 초 단위 과금 |
| `데이터베이스 서비스` | `Database Services` | `Serviços de Banco de Dados` | `Servicios de Base de Datos` | `データベースサービス` | 관계형·비관계형 DB 선택, 인메모리 캐시, DB 마이그레이션 도구, 읽기 전용 복제본, 멀티 AZ (D3 Task 3.4) | Amazon RDS, Amazon Aurora, Amazon DynamoDB, Amazon ElastiCache(Redis/Memcached), Amazon MemoryDB, Amazon Redshift, Amazon Neptune, Amazon DocumentDB, Amazon Keyspaces, Amazon QLDB, DynamoDB Global Tables, RDS 멀티 AZ, 읽기 전용 복제본(Read Replica), AWS DMS, AWS SCT, 관계형 DB vs NoSQL, 인메모리 데이터베이스, 그래프 데이터베이스, 문서 데이터베이스 |
| `네트워킹 서비스` | `Networking Services` | `Serviços de Rede` | `Servicios de Red` | `ネットワーキングサービス` | VPC 구성, 서브넷·게이트웨이, 보안 그룹·NACL, DNS 라우팅, 하이브리드 연결, CDN (D3 Task 3.5) | Amazon VPC, 서브넷(퍼블릭/프라이빗), 인터넷 게이트웨이(IGW), NAT 게이트웨이, 라우팅 테이블, 보안 그룹(Security Groups), 네트워크 ACL(NACLs), Amazon Route 53(라우팅 정책: 단순/가중치/지연/장애 조치/지리적), VPC 피어링, AWS Transit Gateway, AWS VPN(Site-to-Site/Client), AWS Direct Connect, VPC 엔드포인트(게이트웨이/인터페이스), AWS PrivateLink, Amazon CloudFront, AWS Global Accelerator, Elastic IP, 지역 제한(Geo-restriction) |
| `스토리지 서비스` | `Storage Services` | `Serviços de Armazenamento` | `Servicios de Almacenamiento` | `ストレージサービス` | 객체·블록·파일 스토리지 선택, S3 스토리지 클래스, 수명 주기 정책, 버전 관리, 백업 (D3 Task 3.6) | Amazon S3, S3 스토리지 클래스(Standard/IA/One Zone-IA/Glacier Instant Retrieval/Glacier Flexible Retrieval/Glacier Deep Archive/Intelligent-Tiering), Amazon EBS(SSD/HDD), EC2 인스턴스 스토어, Amazon EFS, Amazon FSx(Windows/Lustre), AWS Storage Gateway, S3 수명 주기 정책, S3 버전 관리, S3 Replication, AWS Backup, 객체 스토리지 vs 블록 스토리지 vs 파일 스토리지, S3 Transfer Acceleration, S3 Object Lock, 공유 파일 시스템 |
| `애플리케이션 통합과 기타 서비스` | `Application Integration and Other Services` | `Integração de Aplicações e Outros Serviços` | `Integración de Aplicaciones y Otros Servicios` | `アプリケーション統合とその他のサービス` | 애플리케이션 통합(SQS/SNS/EventBridge), AI/ML 서비스, 분석 서비스, 개발자 도구, 모니터링, 기타 AWS 서비스 (D3 Task 3.7+3.8) | Amazon SQS, Amazon SNS, Amazon EventBridge, AWS Step Functions, Amazon API Gateway, Amazon SageMaker, Amazon Lex, Amazon Kendra, Amazon Comprehend, Amazon Rekognition, Amazon Transcribe, Amazon Translate, Amazon Polly, Amazon Textract, Amazon Athena, Amazon Kinesis, AWS Glue, Amazon QuickSight, Amazon EMR, AWS CodeBuild, AWS CodePipeline, AWS CodeDeploy, AWS CodeCommit, AWS X-Ray, Amazon CloudWatch(모니터링/알림), Amazon Connect, Amazon SES, Amazon AppStream 2.0, Amazon WorkSpaces, AWS Amplify, AWS AppSync, AWS IoT Core, 디커플링, 마이크로서비스 통합, Amazon MQ, AWS Systems Manager(Session Manager) |
| `요금 모델과 클라우드 경제성` | `Pricing Models and Cloud Economics` | `Modelos de Preços e Economia da Nuvem` | `Modelos de Precios y Economía de la Nube` | `料金モデルとクラウドエコノミクス` | EC2 구매 옵션(온디맨드/예약/스팟/Savings Plans), 데이터 전송 비용, 비용 관리 도구, CapEx vs OpEx, 규모의 경제, 라이트사이징 (D1 Task 1.4 + D4 Task 4.1+4.2) | 온디맨드(On-Demand), 예약 인스턴스(Reserved Instances), 스팟 인스턴스(Spot Instances), Savings Plans, 전용 호스트(Dedicated Hosts), 데이터 전송 비용(인바운드 무료/아웃바운드 과금), AWS Free Tier, AWS Pricing Calculator, AWS Cost Explorer, AWS Budgets, AWS Cost and Usage Report, 비용 할당 태그(Cost Allocation Tags), AWS Organizations(통합 결제), AWS Compute Optimizer, 볼륨 할인, 계층형 가격, 자본 지출(CapEx), 운영 지출(OpEx), 고정 비용 vs 가변 비용, 규모의 경제(economies of scale), TCO(총소유비용), 라이트사이징(rightsizing), BYOL(Bring Your Own License), AWS License Manager |
| `AWS 지원과 리소스` | `AWS Support and Resources` | `Suporte e Recursos AWS` | `Soporte y Recursos de AWS` | `AWSサポートとリソース` | AWS Support 플랜(Basic~Enterprise), Trusted Advisor, Partner Network, Health Dashboard, Marketplace, 기술 지원 채널 (D4 Task 4.3) | AWS Support 플랜(Basic/Developer/Business/Enterprise On-Ramp/Enterprise), AWS Trusted Advisor, AWS Partner Network(APN), AWS Personal Health Dashboard, AWS Service Health Dashboard, AWS Marketplace, AWS Professional Services, AWS re:Post, AWS Knowledge Center, AWS IQ, 기술 계정 관리자(TAM), Concierge 지원 팀, AWS Training and Certification, AWS Prescriptive Guidance, AWS Solutions Architects, 24시간 전화 지원, AWS Trust and Safety(악용 신고) |

---

## 태그 선택 기준

1. 문제의 **핵심 주제**를 기준으로 선택 (보기 내용이 아닌 질문이 무엇을 묻는지)
2. 클라우드 정의·배포 모델(퍼블릭/프라이빗/하이브리드)·서비스 모델(IaaS/PaaS/SaaS)·클라우드 장점(탄력성/민첩성/HA) → `클라우드 이점과 가치 제안`
3. Well-Architected Framework·6개 기둥·설계 원칙·아키텍처 모범 사례 검토 → `Well-Architected 설계 원칙`
4. CAF·6R 전략·Snow Family·마이그레이션 서비스·클라우드 도입 여정 → `마이그레이션과 클라우드 도입`
5. AWS vs 고객 책임 분리·서비스별 책임 변동·물리적/논리적 보안 분담 → `공동 책임 모델`
6. Artifact·CloudTrail·Config·Audit Manager·암호화·규정 준수 프로그램(GDPR/HIPAA/PCI DSS) → `보안 거버넌스와 규정 준수`
7. IAM 사용자·그룹·역할·정책·MFA·SSO·루트 사용자·액세스 키·최소 권한 원칙 → `접근 관리와 자격 증명`
8. WAF·Shield·GuardDuty·DDoS 방어·SQL 인젝션/XSS 방어 → `보안 서비스와 위협 방어`
9. 콘솔·CLI·SDK·CloudFormation·IaC·리전·AZ·엣지 로케이션·멀티 AZ/리전 배포 → `배포 방법과 글로벌 인프라`
10. EC2·Lambda·ECS/EKS·Fargate·Auto Scaling·로드 밸런서·인스턴스 유형 → `컴퓨팅 서비스`
11. RDS·Aurora·DynamoDB·ElastiCache·DMS·관계형 vs NoSQL 비교 → `데이터베이스 서비스`
12. VPC·서브넷·Route 53·VPN·Direct Connect·CloudFront·보안 그룹·NACL(네트워크 설계 맥락) → `네트워킹 서비스`
13. S3·EBS·EFS·FSx·스토리지 클래스·수명 주기 정책·백업 → `스토리지 서비스`
14. SQS·SNS·EventBridge·디커플링·Athena·Kinesis·X-Ray·CloudWatch·개발자 도구·AI/ML 서비스 → `애플리케이션 통합과 기타 서비스`
15. 온디맨드·예약·스팟·Cost Explorer·Budgets·Organizations 통합 결제·CapEx vs OpEx·TCO → `요금 모델과 클라우드 경제성`
16. Support 플랜(Basic~Enterprise)·Trusted Advisor·Health Dashboard·Marketplace·TAM → `AWS 지원과 리소스`

**경계 모호 케이스:**

17. 보안 그룹·NACL:
    - **VPC 네트워크 구성·서브넷 트래픽 제어·상태 저장 vs 비저장** 맥락 → `네트워킹 서비스`
    - **위협 방어·침입 차단·보안 아키텍처 전체** 맥락 → `보안 서비스와 위협 방어`

18. CloudFront:
    - **콘텐츠 전송·지연 시간 감소·글로벌 배포·지역 제한** 맥락 → `네트워킹 서비스`
    - **DDoS 방어·WAF 연동·엣지 보안** 맥락 → `보안 서비스와 위협 방어`

19. Auto Scaling:
    - **EC2/컴퓨팅 리소스 확장·축소·서버리스 비교** 맥락 → `컴퓨팅 서비스`
    - **탄력성·고가용성 개념 설명·클라우드 장점** 맥락 → `클라우드 이점과 가치 제안`

20. 전용 호스트(Dedicated Hosts):
    - **BYOL 라이선스·규모의 경제·비용 구조** 맥락 → `요금 모델과 클라우드 경제성`
    - **EC2 구매 옵션 비교·인스턴스 배치** 맥락 → `컴퓨팅 서비스`

21. Trusted Advisor:
    - **비용 최적화 권고·리소스 활용률** 맥락 → `요금 모델과 클라우드 경제성`
    - **보안 점검·모범 사례 위반 탐지** 맥락 → `보안 서비스와 위협 방어`
    - **Support 플랜별 기능 차이·Trusted Advisor 접근 범위** 맥락 → `AWS 지원과 리소스`

22. AWS Organizations:
    - **통합 결제·볼륨 할인·비용 할당** 맥락 → `요금 모델과 클라우드 경제성`
    - **SCP·거버넌스·다중 계정 보안 관리** 맥락 → `보안 거버넌스와 규정 준수`

23. CloudWatch·CloudTrail:
    - **지표 모니터링·알림·대시보드·서비스 기능** 맥락 → `애플리케이션 통합과 기타 서비스`
    - **감사 로그·규정 준수·API 호출 기록·거버넌스** 맥락 → `보안 거버넌스와 규정 준수`

24. 데이터 전송 비용:
    - **비용 계산·절감 전략·인바운드/아웃바운드 과금** 맥락 → `요금 모델과 클라우드 경제성`
    - **네트워크 아키텍처·리전 간 통신 설계** 맥락 → `네트워킹 서비스`
