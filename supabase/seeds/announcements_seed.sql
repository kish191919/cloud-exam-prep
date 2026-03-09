-- ── CloudMaster 초기 게시글 Seed ─────────────────────────────────────────────
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- 중복 삽입 방지: 동일 title이 이미 존재하면 스킵합니다.

INSERT INTO announcements (category, title, title_en, content, content_en, is_pinned, is_active)
SELECT * FROM (VALUES

-- ─────────────────────────────────────────────────────────────────────────────
-- [1] 공지: CloudMaster 환영 (pinned)
-- ─────────────────────────────────────────────────────────────────────────────
(
  'notice'::text,
  'CloudMaster에 오신 것을 환영합니다 🎉',
  'Welcome to CloudMaster 🎉',
  $KO$안녕하세요! AWS·GCP·AZURE 자격증 준비를 돕는 CloudMaster입니다.

이 게시판(공지·정보)에서는 다음과 같은 내용을 정기적으로 업데이트합니다.

  ✅ 시험 출제 범위·형식 변경 공지
  ✅ 자격증별 취업·연봉 트렌드 분석
  ✅ 합격 팁과 학습 전략
  ✅ 클라우드 기술 최신 업데이트

CloudMaster는 직장인과 취업 준비생이 퇴근 후 30분, 주말 1시간의 짧은 학습으로 첫 시도에 합격할 수 있도록 한국어 해설 중심의 실전 CBT 환경을 제공합니다.

앞으로도 유용한 정보를 꾸준히 공유하겠습니다. 함께 합격을 향해 나아가요!

— CloudMaster 팀$KO$,
  $EN$Hello! Welcome to CloudMaster — your Korean-first prep platform for AWS, GCP and AZURE certifications.

In this board, we regularly publish:

  ✅ Exam scope and format change notices
  ✅ Certification job market and salary trend analysis
  ✅ Study tips and exam strategies
  ✅ Latest cloud technology updates

CloudMaster is built for busy working professionals and job seekers who want to pass on their first attempt with just 30 minutes after work or an hour on weekends — using our Korean-explained CBT practice environment.

We'll keep sharing useful content. Let's pass together!

— The CloudMaster Team$EN$,
  true,
  true
),

-- ─────────────────────────────────────────────────────────────────────────────
-- [2] info: AWS 자격증 취업 현황
-- ─────────────────────────────────────────────────────────────────────────────
(
  'info'::text,
  'AWS 자격증이 취업에 미치는 실질적 영향 (2026년 현황)',
  'Real Impact of AWS Certifications on Your Career (2026 Update)',
  $KO$AWS는 전 세계 클라우드 시장 점유율 약 31%로 1위를 유지하며, 관련 자격증 보유자에 대한 기업 수요가 매년 증가하고 있습니다. 국내외 채용 공고 데이터와 연봉 조사를 바탕으로 2026년 AWS 자격증의 취업 가치를 정리했습니다.


━━ 시장 데이터 요약 ━━

  • 연봉 프리미엄: AWS 자격증 보유자는 비보유자 대비 평균 26% 높은 연봉 (Global Knowledge, 2025)
  • 구인공고 증가율: AWS 관련 직무 공고 전년 대비 34% 증가 (LinkedIn Jobs, 2025)
  • 국내 우대 기업: 삼성SDS, LG CNS, SK C&C, 카카오, 네이버, 현대오토에버 등 주요 IT·대기업이 AWS 자격증을 채용 우대 조건으로 명시
  • 가장 많이 인용되는 자격증: Solutions Architect – Associate (SAA-C03)가 국내외 채용공고 언급 빈도 1위
  • 프리랜서 시장: AWS 숙련 프리랜서의 시간당 단가가 클라우드 미경험자 대비 40~60% 높음


━━ 직군별 추천 자격증 ━━

  [비개발 · 기획 직군]
  → AWS Certified Cloud Practitioner (CLF-C02)
  클라우드 개념을 비기술적 언어로 설명하는 시험. IT 기획자, PM, 영업·마케팅 직군에서도 '클라우드 기초 소양'으로 인정받습니다.

  [개발 · 아키텍처 직군]
  → AWS Certified Solutions Architect – Associate (SAA-C03)
  국내외 채용공고 인용 빈도 1위. 클라우드 시스템 설계·구현 능력을 검증하며 DevOps·백엔드 개발자에게 특히 선호됩니다.

  [운영 · 인프라 직군]
  → AWS Certified SysOps Administrator – Associate (SOA-C02)
  서버 운영, 모니터링, 보안 구성 등 실무 운영 역량을 검증합니다.

  [AI/ML 전문 직군]
  → AWS Certified AI Practitioner (AIF-C01)
  생성형 AI·ML 서비스 활용에 초점을 맞춘 신규 자격증. AI 열풍과 함께 2025년 이후 수요가 급증하고 있습니다.


━━ 취업 준비 전략 ━━

  1단계 (0~2개월): Cloud Practitioner로 클라우드 기초 개념 확립
  2단계 (2~5개월): Solutions Architect – Associate로 핵심 경쟁력 확보
  3단계 (이후): 직군에 맞는 Specialty 자격증 추가 취득

CloudMaster에서는 이 로드맵에 맞춰 한국어 해설 문제를 제공하고 있습니다. 오늘부터 30분씩 시작해보세요.$KO$,
  $EN$AWS holds approximately 31% of the global cloud market — the #1 position — and enterprise demand for certified professionals grows year over year. Here's a data-driven look at the career value of AWS certifications in 2026.


━━ Market Data Snapshot ━━

  • Salary premium: AWS-certified professionals earn on average 26% more than non-certified peers (Global Knowledge, 2025)
  • Job posting growth: AWS-related job listings grew 34% YoY (LinkedIn Jobs, 2025)
  • Major Korean employers listing AWS certs as preferred qualifications: Samsung SDS, LG CNS, SK C&C, Kakao, Naver, Hyundai AutoEver
  • Most cited cert in job postings: Solutions Architect – Associate (SAA-C03), both domestically and globally
  • Freelance premium: AWS-skilled freelancers command 40–60% higher hourly rates than non-cloud specialists


━━ Recommended Certs by Role ━━

  [Non-technical / Planning roles]
  → AWS Certified Cloud Practitioner (CLF-C02)
  Covers cloud concepts in accessible language. Recognized as foundational cloud literacy for IT planners, PMs, sales, and marketing.

  [Development / Architecture roles]
  → AWS Certified Solutions Architect – Associate (SAA-C03)
  The most cited AWS cert in job postings worldwide. Validates cloud system design and implementation; especially valued for DevOps and backend developers.

  [Operations / Infrastructure roles]
  → AWS Certified SysOps Administrator – Associate (SOA-C02)
  Validates hands-on skills in server operations, monitoring, and security configuration.

  [AI/ML specialist roles]
  → AWS Certified AI Practitioner (AIF-C01)
  A newer certification focused on generative AI and ML services. Demand has surged since 2025 as AI adoption accelerates.


━━ Career Preparation Strategy ━━

  Phase 1 (Months 0–2): Cloud Practitioner — build foundational cloud concepts
  Phase 2 (Months 2–5): Solutions Architect – Associate — establish core competitiveness
  Phase 3 (Ongoing): Add Specialty certifications aligned with your target role

CloudMaster provides Korean-explained practice questions aligned with this roadmap. Start your 30-minute daily routine today.$EN$,
  false,
  true
),

-- ─────────────────────────────────────────────────────────────────────────────
-- [3] info: GCP 자격증 취업 현황
-- ─────────────────────────────────────────────────────────────────────────────
(
  'info'::text,
  'Google Cloud 자격증, 지금이 취득 적기인 이유 (2026)',
  'Google Cloud Certifications: Why Now Is the Best Time to Get Certified (2026)',
  $KO$Google Cloud Platform(GCP)은 시장 점유율 약 11%로 AWS, AZURE에 이어 3위이지만, AI·ML 분야에서의 강세와 국내 기업 도입 확대로 인해 자격증 보유자의 몸값이 빠르게 오르고 있습니다.


━━ GCP 자격증 시장 현황 ━━

  • AI/ML 경쟁력: Google의 Vertex AI, BigQuery ML, Gemini API 등 AI 서비스가 기업 채택 1순위로 부상하면서, GCP 전문가 수요가 2024~2025년 사이 47% 급증 (IDC, 2025)
  • 희소성 프리미엄: AWS·AZURE에 비해 GCP 자격증 보유자가 상대적으로 적어, 동일 경력 기준 연봉 협상력이 더 높은 경향
  • 국내 도입 사례: LG, 롯데, 교보생명 등 대기업과 스타트업 생태계 전반에서 GCP 채택 증가
  • 데이터·ML 직군 핵심: 데이터 엔지니어, ML 엔지니어 구인공고에서 GCP Professional Data Engineer·ML Engineer 자격증 인용 증가


━━ 직군별 추천 자격증 ━━

  [입문 / 비개발 직군]
  → Google Cloud Digital Leader
  GCP 서비스 전반에 대한 비기술적 이해를 검증. IT 의사결정자, 비즈니스 분석가에게 적합.

  [개발 · 아키텍처 직군]
  → Professional Cloud Architect (PCA)
  GCP 핵심 자격증. 클라우드 인프라 설계·최적화·보안 역량을 종합 검증하며 국내외 시장에서 가장 많이 요구됩니다.

  [데이터 · AI 직군]
  → Professional Data Engineer
  → Professional Machine Learning Engineer
  데이터 파이프라인 구축, ML 모델 배포·운영 역량 검증. AI 붐과 함께 수요가 급상승 중.

  [DevOps · 인프라 직군]
  → Professional Cloud DevOps Engineer
  CI/CD, 모니터링, SRE 역량 검증. GKE(Kubernetes Engine) 실무 경험과 함께 취득하면 경쟁력 극대화.


━━ GCP를 선택해야 하는 3가지 이유 ━━

  1. AI·데이터 분야 최강자: Vertex AI, BigQuery, Gemini — Google의 AI 생태계와 연동된 GCP는 AI/ML 커리어를 목표로 한다면 최우선 선택
  2. 희소성 = 협상력: 국내 GCP 자격증 보유자가 AWS 대비 적어 같은 레벨에서도 연봉 프리미엄 발생
  3. 성장하는 시장: 기업의 멀티클라우드 전략 채택이 늘면서 GCP 전문가 수요는 지속 확대 전망

CloudMaster에서 GCP 시험도 준비해보세요. 한국어 해설로 개념을 먼저 완벽히 이해하고 실전에 도전하세요.$KO$,
  $EN$Google Cloud Platform (GCP) holds approximately 11% of the global cloud market — third behind AWS and AZURE — but its strength in AI/ML and growing adoption among Korean enterprises is rapidly increasing the market value of GCP-certified professionals.


━━ GCP Certification Market Overview ━━

  • AI/ML leadership: Google's Vertex AI, BigQuery ML, and Gemini API have become the top AI service choices for enterprises, driving a 47% surge in demand for GCP specialists from 2024 to 2025 (IDC, 2025)
  • Scarcity premium: GCP certificate holders are relatively fewer than AWS or AZURE counterparts, giving them stronger negotiating power at equivalent experience levels
  • Korean enterprise adoption: Large corporations including LG, Lotte, and Kyobo Life, as well as the broader startup ecosystem, are increasingly adopting GCP
  • Data/ML role demand: Job postings for Data Engineers and ML Engineers increasingly cite GCP Professional Data Engineer and ML Engineer certifications


━━ Recommended Certs by Role ━━

  [Entry-level / Non-technical roles]
  → Google Cloud Digital Leader
  Validates broad, non-technical understanding of GCP services. Ideal for IT decision-makers and business analysts.

  [Development / Architecture roles]
  → Professional Cloud Architect (PCA)
  The flagship GCP certification. Comprehensively validates cloud infrastructure design, optimization, and security — the most demanded GCP cert in job postings.

  [Data / AI roles]
  → Professional Data Engineer
  → Professional Machine Learning Engineer
  Validates data pipeline construction and ML model deployment/operations. Demand is surging alongside the AI boom.

  [DevOps / Infrastructure roles]
  → Professional Cloud DevOps Engineer
  Validates CI/CD, monitoring, and SRE capabilities. Combining this with GKE (Kubernetes Engine) hands-on experience maximizes your competitiveness.


━━ 3 Reasons to Choose GCP ━━

  1. AI/Data powerhouse: Vertex AI, BigQuery, Gemini — if your career goal is AI/ML, GCP is the top choice
  2. Scarcity = leverage: Fewer Korean GCP cert holders means a salary premium at equivalent levels
  3. Growing market: As enterprises adopt multi-cloud strategies, demand for GCP specialists is projected to expand continuously

Start preparing for GCP exams on CloudMaster. Understand the concepts deeply in Korean first, then conquer the English exam with confidence.$EN$,
  false,
  true
),

-- ─────────────────────────────────────────────────────────────────────────────
-- [4] info: AZURE 자격증 취업 현황
-- ─────────────────────────────────────────────────────────────────────────────
(
  'info'::text,
  'Microsoft AZURE 자격증이 대기업·공공기관에서 주목받는 이유',
  'Why Microsoft AZURE Certifications Are in High Demand at Enterprises and Government',
  $KO$Microsoft AZURE는 시장 점유율 약 22%로 세계 2위 클라우드 플랫폼입니다. 특히 Microsoft 365, Teams, Active Directory와의 깊은 연동성 덕분에 대기업, 금융기관, 공공기관에서 AZURE를 선택하는 경우가 많아, 이 분야의 자격증 보유자 수요가 안정적으로 높습니다.


━━ AZURE 자격증 시장 현황 ━━

  • 대기업·공공기관 강세: Microsoft 제품군(M365, Teams, AZURE AD)과 연동성이 높아 국내 은행·보험사·공공기관의 AZURE 채택 비율이 2025년 기준 61%로 조사됨 (Gartner, 2025)
  • 안정적인 수요: 글로벌 Fortune 500 기업의 95% 이상이 AZURE를 사용 중 (Microsoft, 2025)
  • 연봉 현황: AZURE 자격증 보유자의 국내 평균 연봉은 클라우드 미자격증 개발자 대비 약 22% 높음
  • DevOps·보안 직군 핵심: AZ-400(DevOps), SC-900(보안) 계열 자격증에 대한 기업 수요가 특히 높음


━━ AZURE 자격증 로드맵 ━━

  [입문 단계 — 비개발 직군 포함]
  → AZ-900: Microsoft AZURE Fundamentals
  AZURE 서비스 전반의 개념을 검증하는 입문 자격증. IT 직군이 아니어도 취득 가능하며, '클라우드 기초 소양'으로 인정받습니다.

  [어소시에이트 단계 — 실무 역량 검증]
  → AZ-104: Microsoft AZURE Administrator
    시스템 관리자, 인프라 운영 직군의 필수 자격증
  → AZ-204: Developing Solutions for Microsoft AZURE
    AZURE 기반 애플리케이션 개발 역량 검증. 백엔드·풀스택 개발자에게 추천
  → AZ-305: Designing AZURE Infrastructure Solutions
    아키텍처 설계 역량 검증. Solutions Architect 직군 핵심

  [전문가 단계]
  → AZ-400: AZURE DevOps Engineer Expert
    CI/CD, 자동화, 모니터링 역량. DevOps 직군 최고 자격증
  → SC-300: Identity and Access Administrator
    보안·IAM 전문가 취업에 필수


━━ AZURE를 선택해야 하는 3가지 이유 ━━

  1. 대기업·금융·공공 취업 시 강점: AZURE를 선택한 조직의 특성상 AZURE 자격증이 직접적인 우대 조건
  2. Microsoft 생태계 연동: M365, Teams, Power Platform 등 Microsoft 제품을 이미 사용 중인 조직에서의 채용 기회 다수
  3. 자격증 유지 용이: Microsoft는 매년 자격증 갱신 비용을 무료로 제공하는 정책 운영 중 (온라인 평가만으로 갱신 가능)

CloudMaster에서 AZ-900부터 차근차근 준비하고, 목표 직군에 맞는 자격증으로 나아가세요.$KO$,
  $EN$Microsoft AZURE is the world's second-largest cloud platform with approximately 22% market share. Its deep integration with Microsoft 365, Teams, and Active Directory makes it the preferred choice for large enterprises, financial institutions, and government agencies — creating stable, high demand for AZURE-certified professionals.


━━ AZURE Certification Market Overview ━━

  • Enterprise and public sector strength: Due to strong Microsoft ecosystem integration, 61% of Korean banks, insurance companies, and government agencies have adopted AZURE as of 2025 (Gartner, 2025)
  • Stable demand: Over 95% of Fortune 500 companies use AZURE (Microsoft, 2025)
  • Salary data: AZURE-certified professionals in Korea earn approximately 22% more than non-certified cloud developers
  • DevOps and security demand: Enterprise demand is especially high for AZ-400 (DevOps) and SC-900 (Security) track certifications


━━ AZURE Certification Roadmap ━━

  [Fundamentals — including non-technical roles]
  → AZ-900: Microsoft AZURE Fundamentals
  The entry-level cert covering broad AZURE service concepts. Achievable without a technical background; recognized as foundational cloud literacy.

  [Associate — validating hands-on skills]
  → AZ-104: Microsoft AZURE Administrator
    Essential for system administrators and infrastructure operations roles
  → AZ-204: Developing Solutions for Microsoft AZURE
    Validates AZURE-based application development; recommended for backend and full-stack developers
  → AZ-305: Designing AZURE Infrastructure Solutions
    Validates architectural design skills; core cert for Solutions Architect roles

  [Expert level]
  → AZ-400: AZURE DevOps Engineer Expert
    CI/CD, automation, monitoring skills — the top DevOps certification on AZURE
  → SC-300: Identity and Access Administrator
    Essential for security and IAM specialist roles


━━ 3 Reasons to Choose AZURE ━━

  1. Enterprise/finance/government career advantage: Organizations that choose AZURE make AZURE certification a direct preferred qualification
  2. Microsoft ecosystem integration: Many hiring opportunities at organizations already using M365, Teams, and Power Platform
  3. Easy renewal: Microsoft offers free annual certification renewal through an online assessment only — no re-exam fee

Start with AZ-900 on CloudMaster and progress toward the certification that fits your target role.$EN$,
  false,
  true
),

-- ─────────────────────────────────────────────────────────────────────────────
-- [5] tip: 클라우드 자격증 연봉 비교
-- ─────────────────────────────────────────────────────────────────────────────
(
  'tip'::text,
  '2026 클라우드 자격증별 연봉 비교 — AWS vs GCP vs AZURE',
  '2026 Cloud Cert Salary Comparison — AWS vs GCP vs AZURE',
  $KO$클라우드 자격증을 취득하면 연봉이 실제로 얼마나 오를까요? 국내외 채용 데이터와 연봉 조사를 바탕으로 AWS·GCP·AZURE 자격증 보유자의 평균 연봉 현황을 정리했습니다.


━━ 국내 클라우드 자격증별 평균 연봉 (2025~2026 기준) ━━

  [AWS Solutions Architect – Associate (SAA-C03)]
  경력 1~3년: 약 4,800만 ~ 6,500만 원
  경력 3~7년: 약 6,500만 ~ 9,000만 원
  경력 7년 이상: 약 9,000만 ~ 1억 2,000만 원

  [AWS AI Practitioner (AIF-C01)]
  경력 1~3년: 약 4,500만 ~ 6,000만 원
  경력 3~7년: 약 6,000만 ~ 8,500만 원
  (AI 특화 직군은 시장 프리미엄 추가)

  [GCP Professional Cloud Architect]
  경력 1~3년: 약 5,000만 ~ 7,000만 원
  경력 3~7년: 약 7,000만 ~ 1억 원
  (희소성 프리미엄으로 AWS 동급 대비 약 5~10% 높음)

  [GCP Professional ML Engineer]
  경력 1~3년: 약 5,500만 ~ 7,500만 원
  경력 3~7년: 약 7,500만 ~ 1억 1,000만 원
  (AI 수요 폭증으로 가장 가파른 상승세)

  [AZURE Solutions Architect Expert (AZ-305)]
  경력 1~3년: 약 4,800만 ~ 6,500만 원
  경력 3~7년: 약 6,500만 ~ 9,000만 원
  (대기업·금융권 취업 시 추가 프리미엄 가능)

  [AZURE DevOps Engineer Expert (AZ-400)]
  경력 1~3년: 약 5,000만 ~ 6,800만 원
  경력 3~7년: 약 6,800만 ~ 9,500만 원


━━ 글로벌 평균 연봉 (USD 기준, 미국 시장) ━━

  AWS Solutions Architect – Associate: $130,000 ~ $160,000
  GCP Professional Cloud Architect:    $135,000 ~ $170,000
  AZURE Solutions Architect Expert:    $128,000 ~ $158,000
  GCP Professional ML Engineer:        $145,000 ~ $185,000
  AWS AI Practitioner:                 $120,000 ~ $150,000

  * 출처: Glassdoor, LinkedIn Salary, Levels.fyi, 2025


━━ 연봉을 올리는 가장 효율적인 자격증 조합 ━━

  🥇 AI/ML 커리어 목표:
    GCP Professional ML Engineer + AWS AI Practitioner
    → 국내외 AI 수요 폭발로 가장 높은 연봉 상승 효과

  🥈 아키텍처·설계 직군:
    AWS SAA + AZURE Solutions Architect Expert
    → 멀티클라우드 전문가로 포지셔닝, 프리미엄 연봉 협상 가능

  🥉 신입·커리어 전환자:
    AWS Cloud Practitioner → AWS SAA (순차 취득)
    → 가장 빠르게 클라우드 IT 직군으로 진입하는 경로


━━ 핵심 인사이트 ━━

  클라우드 자격증 1개 취득 만으로도 평균 연봉이 15~26% 상승하는 효과를 볼 수 있으며, 복수 자격증 취득 시 프리미엄이 더 커집니다. 특히 AI/ML 특화 자격증은 2025년 이후 가장 가파른 연봉 상승세를 보이고 있습니다.

CloudMaster에서 지금 바로 학습을 시작하고, 연봉 상승의 첫 발걸음을 내딛으세요.$KO$,
  $EN$How much does a cloud certification actually boost your salary? Here's a data-driven breakdown of average compensation for AWS, GCP and AZURE certification holders, based on domestic and global salary surveys.


━━ Korea Average Salaries by Cloud Certification (2025–2026) ━━

  [AWS Solutions Architect – Associate (SAA-C03)]
  1–3 years exp: ₩48M ~ ₩65M (~$36K ~ $49K)
  3–7 years exp: ₩65M ~ ₩90M (~$49K ~ $68K)
  7+ years exp:  ₩90M ~ ₩120M (~$68K ~ $91K)

  [AWS AI Practitioner (AIF-C01)]
  1–3 years exp: ₩45M ~ ₩60M
  3–7 years exp: ₩60M ~ ₩85M
  (AI-specialized roles command additional market premium)

  [GCP Professional Cloud Architect]
  1–3 years exp: ₩50M ~ ₩70M
  3–7 years exp: ₩70M ~ ₩100M
  (Scarcity premium: ~5–10% higher than equivalent AWS roles)

  [GCP Professional ML Engineer]
  1–3 years exp: ₩55M ~ ₩75M
  3–7 years exp: ₩75M ~ ₩110M
  (Steepest salary growth trajectory, driven by surging AI demand)

  [AZURE Solutions Architect Expert (AZ-305)]
  1–3 years exp: ₩48M ~ ₩65M
  3–7 years exp: ₩65M ~ ₩90M
  (Additional premium possible at large enterprises and financial firms)

  [AZURE DevOps Engineer Expert (AZ-400)]
  1–3 years exp: ₩50M ~ ₩68M
  3–7 years exp: ₩68M ~ ₩95M


━━ Global Average Salaries (USD, US Market) ━━

  AWS Solutions Architect – Associate: $130,000 ~ $160,000
  GCP Professional Cloud Architect:    $135,000 ~ $170,000
  AZURE Solutions Architect Expert:    $128,000 ~ $158,000
  GCP Professional ML Engineer:        $145,000 ~ $185,000
  AWS AI Practitioner:                 $120,000 ~ $150,000

  * Sources: Glassdoor, LinkedIn Salary, Levels.fyi, 2025


━━ Most Efficient Certification Combinations for Salary Growth ━━

  🥇 AI/ML career goal:
    GCP Professional ML Engineer + AWS AI Practitioner
    → Highest salary uplift, driven by exploding AI/ML demand

  🥈 Architecture and design roles:
    AWS SAA + AZURE Solutions Architect Expert
    → Position yourself as a multi-cloud specialist for premium salary negotiation

  🥉 Career changers and new graduates:
    AWS Cloud Practitioner → AWS SAA (sequential)
    → The fastest path into cloud IT roles


━━ Key Insight ━━

  Even a single cloud certification can boost average salary by 15–26%. The premium grows further with multiple certifications. AI/ML-specialized certifications have shown the steepest salary trajectory since 2025.

Start learning on CloudMaster today and take your first step toward a higher salary.$EN$,
  false,
  true
),

-- ─────────────────────────────────────────────────────────────────────────────
-- [6] update: 시험 출제 범위 변경 공지
-- ─────────────────────────────────────────────────────────────────────────────
(
  'update'::text,
  '2025~2026 AWS·GCP·AZURE 시험 출제 범위 주요 변경사항 총정리',
  '2025–2026 Key Exam Scope Changes: AWS, GCP & AZURE',
  $KO$클라우드 자격증 시험은 빠르게 진화하는 클라우드 기술을 반영해 출제 범위가 자주 업데이트됩니다. 2025~2026년에 발표된 주요 변경사항을 정리했습니다. 학습 전 반드시 확인하세요.


━━ AWS 주요 변경사항 ━━

  [CLF-C02: Cloud Practitioner]
  ✓ 생성형 AI(Generative AI) 개념 및 Amazon Bedrock, Q Developer 관련 문항 비중 증가
  ✓ 클라우드 경제성·비용 최적화 문항 강화
  ✓ 보안 공유 책임 모델 심화 출제

  [SAA-C03: Solutions Architect – Associate]
  ✓ 서버리스 아키텍처 (Lambda, API Gateway, EventBridge) 심화
  ✓ Well-Architected Framework 6개 기둥 전반 균등 출제
  ✓ 마이그레이션 시나리오 (AWS MGN, DMS) 증가
  ✓ AI/ML 서비스(SageMaker, Rekognition, Textract) 활용 문항 신규 추가

  [AIF-C01: AI Practitioner — 2024년 신설]
  ✓ 생성형 AI 모델 원리, 프롬프트 엔지니어링
  ✓ Amazon Bedrock, PartyRock, SageMaker JumpStart
  ✓ AI 윤리, 편향, 책임 있는 AI 원칙
  ✓ RAG(검색 증강 생성), Agent 개념


━━ Google Cloud 주요 변경사항 ━━

  [Cloud Digital Leader — 개편]
  ✓ AI/ML 서비스 (Vertex AI, Gemini) 비중 대폭 증가
  ✓ 지속 가능성·탄소 발자국 관련 문항 추가

  [Professional Cloud Architect]
  ✓ Anthos, GKE Enterprise 관련 출제 강화
  ✓ Multi-cloud 및 하이브리드 아키텍처 시나리오 증가
  ✓ AlloyDB, Spanner 관련 데이터베이스 선택 문항 추가

  [Professional ML Engineer — 2025 개편]
  ✓ Vertex AI 생태계 전반 (Pipelines, Model Registry, Feature Store) 심화
  ✓ LLM 파인튜닝, RLHF, RAG 관련 문항 신규 추가
  ✓ MLOps 성숙도 모델 심화


━━ Microsoft AZURE 주요 변경사항 ━━

  [AZ-900: AZURE Fundamentals]
  ✓ AZURE OpenAI Service, Copilot Studio 개념 추가
  ✓ 책임 있는 AI 원칙 (Responsible AI) 문항 추가

  [AZ-104: AZURE Administrator]
  ✓ AZURE Arc, AZURE Stack 관련 하이브리드 시나리오 증가
  ✓ Microsoft Entra ID (구 AZURE AD) 기반 문항으로 전면 전환

  [AZ-204: AZURE Developer]
  ✓ AZURE Container Apps, AZURE Functions Flex Consumption 관련 신규 출제
  ✓ AZURE OpenAI API 활용 패턴 문항 추가

  [AZ-305: AZURE Solutions Architect]
  ✓ AI workload 배포·보안 아키텍처 문항 추가
  ✓ AZURE Landing Zones 모범 사례 심화


━━ 학습 전 체크리스트 ━━

  □ 공식 시험 가이드(Exam Guide) 최신 버전 확인
  □ AWS Skill Builder / Google Cloud Skills Boost / Microsoft Learn 공식 자료 최신 업데이트 확인
  □ 커뮤니티(카카오톡 오픈채팅, 레딧)에서 최근 2~3개월 시험 후기 참고
  □ CloudMaster 문제 풀이로 AI·보안 관련 신규 출제 영역 집중 연습

최신 출제 경향을 CloudMaster 게시판에서 계속 업데이트할 예정입니다. 알림을 활성화해두세요!$KO$,
  $EN$Cloud certification exams are updated regularly to reflect the rapidly evolving cloud landscape. Here's a comprehensive summary of the major exam scope changes announced for 2025–2026. Check this before you start studying.


━━ AWS Key Changes ━━

  [CLF-C02: Cloud Practitioner]
  ✓ Increased weight on Generative AI concepts, Amazon Bedrock, and Q Developer
  ✓ Stronger focus on cloud economics and cost optimization
  ✓ Deeper coverage of the Shared Responsibility security model

  [SAA-C03: Solutions Architect – Associate]
  ✓ Deeper serverless architecture coverage (Lambda, API Gateway, EventBridge)
  ✓ Even distribution across all 6 pillars of the Well-Architected Framework
  ✓ More migration scenarios (AWS MGN, DMS)
  ✓ New questions on AI/ML service integration (SageMaker, Rekognition, Textract)

  [AIF-C01: AI Practitioner — New in 2024]
  ✓ Generative AI model principles, prompt engineering
  ✓ Amazon Bedrock, PartyRock, SageMaker JumpStart
  ✓ AI ethics, bias, Responsible AI principles
  ✓ RAG (Retrieval-Augmented Generation), AI Agents


━━ Google Cloud Key Changes ━━

  [Cloud Digital Leader — Revised]
  ✓ Significantly increased weight on AI/ML services (Vertex AI, Gemini)
  ✓ New questions on sustainability and carbon footprint

  [Professional Cloud Architect]
  ✓ Stronger coverage of Anthos and GKE Enterprise
  ✓ More multi-cloud and hybrid architecture scenarios
  ✓ New database selection questions on AlloyDB and Spanner

  [Professional ML Engineer — 2025 Revision]
  ✓ Deeper Vertex AI ecosystem (Pipelines, Model Registry, Feature Store)
  ✓ New questions on LLM fine-tuning, RLHF, and RAG
  ✓ Deeper MLOps maturity model coverage


━━ Microsoft AZURE Key Changes ━━

  [AZ-900: AZURE Fundamentals]
  ✓ New AZURE OpenAI Service and Copilot Studio concepts added
  ✓ New Responsible AI principles questions

  [AZ-104: AZURE Administrator]
  ✓ More hybrid scenarios involving AZURE Arc and AZURE Stack
  ✓ Full migration to Microsoft Entra ID (formerly AZURE AD) terminology

  [AZ-204: AZURE Developer]
  ✓ New questions on AZURE Container Apps and AZURE Functions Flex Consumption
  ✓ New AZURE OpenAI API usage pattern questions

  [AZ-305: AZURE Solutions Architect]
  ✓ New AI workload deployment and security architecture questions
  ✓ Deeper AZURE Landing Zones best practices coverage


━━ Pre-Study Checklist ━━

  □ Verify the latest version of the official Exam Guide
  □ Check the latest updates on AWS Skill Builder / Google Cloud Skills Boost / Microsoft Learn
  □ Reference recent exam reviews (past 2–3 months) from community channels
  □ Use CloudMaster practice questions to focus on new AI and security coverage areas

We'll continue to update this board with the latest exam trends. Stay tuned!$EN$,
  false,
  true
)

) AS v(category, title, title_en, content, content_en, is_pinned, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM announcements a WHERE a.title = v.title
);

-- ── Phase 2: 커버 이미지 + 출처 링크 업데이트 ──────────────────────────────────
-- Unsplash 이미지 URL 및 ref_links(JSON) 추가
-- 이미 위의 INSERT가 실행된 후 이 UPDATE를 실행하세요.

-- [1] 환영 공지
UPDATE announcements SET
  cover_image_url = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80&auto=format&fit=crop'
WHERE title = 'CloudMaster에 오신 것을 환영합니다 🎉'
  AND cover_image_url IS NULL;

-- [2] AWS 자격증 취업 현황
UPDATE announcements SET
  cover_image_url = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80&auto=format&fit=crop',
  ref_links = '[{"name":"Global Knowledge 2025 IT Skills & Salary Report","url":"https://www.globalknowledge.com/us-en/resources/resource-library/articles/it-skills-and-salary-report/"},{"name":"LinkedIn Jobs Insights 2025","url":"https://economicgraph.linkedin.com/research/linkedin-jobs-on-the-rise"}]'
WHERE title = 'AWS 자격증이 취업에 미치는 실질적 영향 (2026년 현황)'
  AND cover_image_url IS NULL;

-- [3] GCP 자격증 취업 현황
UPDATE announcements SET
  cover_image_url = 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1200&q=80&auto=format&fit=crop',
  ref_links = '[{"name":"IDC Cloud Spending Forecast 2025","url":"https://www.idc.com/getdoc.jsp?containerId=prUS52371224"}]'
WHERE title = 'Google Cloud 자격증, 지금이 취득 적기인 이유 (2026)'
  AND cover_image_url IS NULL;

-- [4] AZURE 자격증 취업 현황
UPDATE announcements SET
  cover_image_url = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80&auto=format&fit=crop',
  ref_links = '[{"name":"Gartner Cloud Market Share Q4 2025","url":"https://www.gartner.com/en/newsroom/press-releases/2025-06-cloud-market-share"},{"name":"Microsoft AZURE Customer Stories","url":"https://customers.microsoft.com/en-us/home"}]'
WHERE title = 'Microsoft AZURE 자격증이 대기업·공공기관에서 주목받는 이유'
  AND cover_image_url IS NULL;

-- [5] 연봉 비교 — 커버 이미지 + ref_links + {{chart:salary}} 마커 삽입
UPDATE announcements SET
  cover_image_url = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80&auto=format&fit=crop',
  ref_links = '[{"name":"Glassdoor Cloud Engineer Salaries","url":"https://www.glassdoor.com/Salaries/cloud-engineer-salary-SRCH_KO0,14.htm"},{"name":"LinkedIn Salary Insights","url":"https://www.linkedin.com/salary/"},{"name":"Levels.fyi Cloud Roles","url":"https://www.levels.fyi/t/software-engineer/focus/cloud"}]',
  content = replace(
    content,
    '━━ 글로벌 평균 연봉 (USD 기준, 미국 시장) ━━',
    E'{{chart:salary}}\n\n━━ 글로벌 평균 연봉 (USD 기준, 미국 시장) ━━'
  ),
  content_en = replace(
    content_en,
    '━━ Global Average Salaries (USD, US Market) ━━',
    E'{{chart:salary}}\n\n━━ Global Average Salaries (USD, US Market) ━━'
  )
WHERE title = '2026 클라우드 자격증별 연봉 비교 — AWS vs GCP vs AZURE'
  AND cover_image_url IS NULL;

-- [6] 시험 출제 범위 변경
UPDATE announcements SET
  cover_image_url = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80&auto=format&fit=crop',
  ref_links = '[{"name":"AWS Certified Solutions Architect Exam Guide","url":"https://d1.awsstatic.com/training-and-certification/docs-sa-assoc/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf"},{"name":"Google Cloud Certification Exams","url":"https://cloud.google.com/learn/certification"},{"name":"Microsoft Learn Certifications","url":"https://learn.microsoft.com/en-us/credentials/browse/"}]'
WHERE title = '2025~2026 AWS·GCP·AZURE 시험 출제 범위 주요 변경사항 총정리'
  AND cover_image_url IS NULL;
