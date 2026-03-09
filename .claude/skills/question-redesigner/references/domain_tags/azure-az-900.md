# AZ-900 도메인 태그 목록

Microsoft AZURE Fundamentals (AZ-900) 문제에 사용하는 도메인 태그입니다.
각 문제에 태그를 **정확히 1개** 부여합니다.

공식 학습 가이드 기준: 2026-01-14 버전 (3개 대도메인 → 9개 세부 태그)

---

## 태그 목록

| 태그 | 영문 태그 | 설명 | 키워드 예시 |
|------|----------|------|------------|
| `클라우드 개념` | `Cloud Concepts` | 클라우드 컴퓨팅 정의·모델·장점·서비스 유형 (IaaS/PaaS/SaaS) | 공유 책임 모델, 퍼블릭/프라이빗/하이브리드 클라우드, IaaS/PaaS/SaaS, 고가용성, 확장성, 안정성, 예측 가능성, 관리 용이성, CapEx/OpEx, 소비 기반 모델, 서버리스, 온프레미스 vs 클라우드 |
| `AZURE 핵심 아키텍처` | `AZURE Core Architecture` | 리전·가용 영역·데이터센터·리소스 계층 구조 | 리전(Region), 리전 쌍(Region Pairs), 소버린 리전, 가용 영역(Availability Zones), 데이터센터, 리소스 그룹(Resource Groups), 구독(Subscription), 관리 그룹(Management Groups), 리소스 계층 구조 |
| `컴퓨팅 및 네트워킹` | `Compute and Networking` | VM·컨테이너·함수·가상 네트워크 서비스 선택·비교 | AZURE Virtual Machines, VM Scale Sets, 가용성 집합(Availability Sets), AZURE Virtual Desktop, AZURE Container Instances, AZURE Kubernetes Service(AKS), AZURE Functions, App Service(웹앱), AZURE Virtual Network, 서브넷, VNet Peering, AZURE DNS, VPN Gateway, ExpressRoute, 공용/프라이빗 엔드포인트 |
| `스토리지 서비스` | `Storage Services` | AZURE 스토리지 유형·계층·이동 옵션·마이그레이션 도구 | AZURE Blob Storage, AZURE Files, AZURE Disks, AZURE Queues, AZURE Tables, 스토리지 계층(핫/쿨/콜드/아카이브), 로컬 중복(LRS)/영역 중복(ZRS)/지역 중복(GRS)/지역 영역 중복(GZRS), 스토리지 계정, AzCopy, AZURE Storage Explorer, AZURE File Sync, AZURE Migrate, AZURE Data Box |
| `ID, 접근 및 보안` | `Identity, Access, and Security` | Entra ID·인증 방법·RBAC·보안 모델·Defender | Microsoft Entra ID, Microsoft Entra Domain Services, SSO(Single Sign-On), MFA(다단계 인증), 암호리스 인증(Passwordless), 외부 ID(External Identities), 조건부 액세스(Conditional Access), AZURE RBAC(역할 기반 액세스 제어), 제로 트러스트(Zero Trust), 심층 방어(Defense-in-Depth), Microsoft Defender for Cloud |
| `비용 관리` | `Cost Management` | AZURE 비용 영향 요소·가격 계산기·예산·태그 | AZURE Pricing Calculator, 비용 영향 요소(리소스 유형/소비/지역/구독), AZURE Cost Management, AZURE Budgets, 태그(Tags), TCO(총소유비용), AZURE Free Account |
| `거버넌스 및 규정 준수` | `Governance and Compliance` | Purview·AZURE Policy·리소스 잠금으로 규정 준수 적용 | Microsoft Purview, AZURE Policy, 정책 이니셔티브(Initiative/Policy Set), 리소스 잠금(Resource Locks, ReadOnly/Delete), 규정 준수(Compliance), 데이터 거버넌스 |
| `리소스 배포 및 관리` | `Resource Deployment and Management` | Portal·CLI·IaC·ARM으로 리소스 배포 및 관리 | AZURE Portal, AZURE Cloud Shell, AZURE CLI, AZURE PowerShell, AZURE Arc, IaC(Infrastructure as Code), AZURE Resource Manager(ARM), ARM 템플릿, Bicep |
| `모니터링 및 서비스 상태` | `Monitoring and Service Health` | Advisor·Service Health·Monitor로 운영 상태 파악 | AZURE Advisor, AZURE Service Health(서비스 상태/계획된 유지 관리/상태 기록), AZURE Monitor, Log Analytics, AZURE Monitor 경고(Alerts), Application Insights |

---

## 태그 선택 기준

1. 문제의 **핵심 주제**를 기준으로 선택 (보기 내용이 아닌 질문이 무엇을 묻는지)
2. 클라우드 개념·모델(IaaS/PaaS/SaaS)·장점·공유 책임 모델 → `클라우드 개념`
3. 리전·가용 영역·구독·관리 그룹·리소스 그룹 계층 → `AZURE 핵심 아키텍처`
4. VM·컨테이너·함수·가상 네트워크·VPN·ExpressRoute 선택·비교 → `컴퓨팅 및 네트워킹`
5. Blob·Files·Disks·스토리지 계층·중복성·AzCopy·Data Box → `스토리지 서비스`
6. Entra ID·인증(SSO/MFA)·RBAC·Zero Trust·Defender for Cloud → `ID, 접근 및 보안`
7. 비용 계산기·Cost Management·예산·태그로 비용 추적 → `비용 관리`
8. AZURE Policy·Purview·리소스 잠금·규정 준수 관리 → `거버넌스 및 규정 준수`
9. AZURE Portal·CLI·PowerShell·ARM 템플릿·Bicep·AZURE Arc → `리소스 배포 및 관리`
10. AZURE Advisor·Service Health·AZURE Monitor·Log Analytics → `모니터링 및 서비스 상태`
11. 경계가 모호한 경우:
    - Defender for Cloud는 보안 서비스이므로 → `ID, 접근 및 보안`
    - 비용 절감을 위한 VM/스토리지 계층 선택 → 해당 서비스 태그 우선
    - 태그(Tags) 기능 자체 → `비용 관리` (비용 추적 목적)
    - 태그(Tags) 기능이 거버넌스 맥락이면 → `거버넌스 및 규정 준수`
    - IaC(ARM/Bicep) 개념 자체 → `리소스 배포 및 관리`
