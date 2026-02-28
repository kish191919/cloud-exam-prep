export type CareerPath = 'all' | 'cloud-architect' | 'devops' | 'data-ml' | 'security' | 'developer';
export type CertLevel = 'foundational' | 'fundamentals' | 'associate' | 'professional' | 'expert' | 'specialty';

export interface Certification {
  id: string;
  name: string;
  code: string;
  level: CertLevel;
  careerPaths: CareerPath[];
  description: string;     // 한국어 설명
  descriptionEn: string;   // 영어 설명
  examId?: string; // Supabase exams.id — 있으면 /exams 링크, 없으면 준비중
}

export interface LevelMeta {
  colorClass: string;
  bgClass: string;
  borderClass: string;
  // label, description → i18n pages.json certifications.levels.*
}

export interface ProviderConfig {
  id: 'AWS' | 'GCP' | 'Azure';
  name: string;
  tagline: string;      // 한국어
  taglineEn: string;    // 영어
  color: string;
  levels: CertLevel[];
  certifications: Certification[];
}

export const LEVEL_META: Record<CertLevel, LevelMeta> = {
  foundational: {
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/30',
  },
  fundamentals: {
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/30',
  },
  associate: {
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
  },
  professional: {
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
  },
  expert: {
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
  },
  specialty: {
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
  },
};

// emoji only — labels are in i18n pages.json certifications.careers.*
export const CAREER_META: Record<CareerPath, { emoji: string }> = {
  all: { emoji: '🌐' },
  'cloud-architect': { emoji: '☁️' },
  devops: { emoji: '⚙️' },
  'data-ml': { emoji: '🤖' },
  security: { emoji: '🔒' },
  developer: { emoji: '💻' },
};

// ────────────────────────────────────────────────────────────────────────────
// AWS
// ────────────────────────────────────────────────────────────────────────────
const awsCertifications: Certification[] = [
  // Foundational
  {
    id: 'aws-clf-c02',
    name: 'Cloud Practitioner',
    code: 'CLF-C02',
    level: 'foundational',
    careerPaths: ['all'],
    description: 'AWS 클라우드의 핵심 개념, 서비스, 요금제를 전반적으로 다루는 입문 자격증. 모든 커리어의 출발점.',
    descriptionEn: 'Entry-level certification covering core AWS cloud concepts, services, and pricing. The ideal starting point for any cloud career.',
    examId: 'aws-clf-c02',
  },
  {
    id: 'aws-aif-c01',
    name: 'AI Practitioner',
    code: 'AIF-C01',
    level: 'foundational',
    careerPaths: ['data-ml'],
    description: 'AWS AI/ML 서비스와 생성형 AI 개념을 다루는 AI 전문 입문 자격증. 기술 배경 없이도 도전 가능.',
    descriptionEn: 'Foundational AI certification covering AWS AI/ML services and generative AI concepts. No technical background required.',
    examId: 'aws-aif-c01',
  },
  // Associate
  {
    id: 'aws-saa-c03',
    name: 'Solutions Architect Associate',
    code: 'SAA-C03',
    level: 'associate',
    careerPaths: ['cloud-architect'],
    description: 'AWS에서 확장 가능하고 가용성 높은 아키텍처를 설계하는 역량을 검증. 가장 인기 있는 AWS 자격증.',
    descriptionEn: 'Validates skills in designing scalable, highly available architectures on AWS. The most popular AWS certification.',
  },
  {
    id: 'aws-dva-c02',
    name: 'Developer Associate',
    code: 'DVA-C02',
    level: 'associate',
    careerPaths: ['developer'],
    description: 'AWS 기반 애플리케이션 개발, 배포, 디버깅 역량을 검증. CI/CD와 서버리스 아키텍처 포함.',
    descriptionEn: 'Validates proficiency in developing, deploying, and debugging AWS-based applications. Covers CI/CD and serverless architectures.',
    examId: 'aws-dea-c01',
  },
  {
    id: 'aws-soa-c02',
    name: 'SysOps Administrator Associate',
    code: 'SOA-C02',
    level: 'associate',
    careerPaths: ['devops'],
    description: 'AWS 인프라 운영, 모니터링, 자동화 역량을 검증. 시스템 관리자와 DevOps 엔지니어에게 적합.',
    descriptionEn: 'Validates skills in AWS infrastructure operations, monitoring, and automation. Ideal for sysadmins and DevOps engineers.',
  },
  // Professional
  {
    id: 'aws-sap-c02',
    name: 'Solutions Architect Professional',
    code: 'SAP-C02',
    level: 'professional',
    careerPaths: ['cloud-architect'],
    description: '복잡한 엔터프라이즈 아키텍처 설계 및 마이그레이션 전략 수립 역량을 검증하는 고급 자격증.',
    descriptionEn: 'Advanced certification validating skills in designing complex enterprise architectures and migration strategies on AWS.',
  },
  {
    id: 'aws-dop-c02',
    name: 'DevOps Engineer Professional',
    code: 'DOP-C02',
    level: 'professional',
    careerPaths: ['devops'],
    description: '지속적 배포, 자동화, 보안 거버넌스 등 고도화된 DevOps 역량을 검증.',
    descriptionEn: 'Validates advanced DevOps skills including continuous delivery, automation, and security governance on AWS.',
  },
  // Specialty
  {
    id: 'aws-mls-c01',
    name: 'Machine Learning Specialty',
    code: 'MLS-C01',
    level: 'specialty',
    careerPaths: ['data-ml'],
    description: 'AWS에서 ML 솔루션 설계·구현·운영 역량을 심화 검증. SageMaker 중심.',
    descriptionEn: 'In-depth validation of skills in designing, implementing, and operating ML solutions on AWS. Focuses on SageMaker.',
  },
  {
    id: 'aws-scs-c02',
    name: 'Security Specialty',
    code: 'SCS-C02',
    level: 'specialty',
    careerPaths: ['security'],
    description: 'AWS 환경에서의 보안 아키텍처, 데이터 보호, 규정 준수 역량을 검증하는 전문 보안 자격증.',
    descriptionEn: 'Specialist security certification validating AWS security architecture, data protection, and compliance expertise.',
  },
  {
    id: 'aws-ans-c01',
    name: 'Advanced Networking Specialty',
    code: 'ANS-C01',
    level: 'specialty',
    careerPaths: ['devops', 'cloud-architect'],
    description: 'AWS 하이브리드 네트워크 아키텍처 설계·구현 역량 검증. VPC, Direct Connect, Transit Gateway 등.',
    descriptionEn: 'Validates advanced AWS hybrid networking architecture design and implementation. Covers VPC, Direct Connect, and Transit Gateway.',
  },
  {
    id: 'aws-dbs-c01',
    name: 'Database Specialty',
    code: 'DBS-C01',
    level: 'specialty',
    careerPaths: ['data-ml', 'developer'],
    description: 'AWS 데이터베이스 서비스 선택·마이그레이션·운영 전문 역량 검증. RDS, DynamoDB, Aurora 포함.',
    descriptionEn: 'Validates expertise in selecting, migrating, and operating AWS database services. Covers RDS, DynamoDB, and Aurora.',
  },
  {
    id: 'aws-das-c01',
    name: 'Data Analytics Specialty',
    code: 'DAS-C01',
    level: 'specialty',
    careerPaths: ['data-ml'],
    description: 'AWS 데이터 파이프라인 설계, 수집, 분석, 시각화 역량을 검증하는 데이터 전문 자격증.',
    descriptionEn: 'Specialist data certification validating AWS data pipeline design, ingestion, analysis, and visualization skills.',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// GCP
// ────────────────────────────────────────────────────────────────────────────
const gcpCertifications: Certification[] = [
  // Associate
  {
    id: 'gcp-ace',
    name: 'Associate Cloud Engineer',
    code: 'ACE',
    level: 'associate',
    careerPaths: ['devops', 'cloud-architect'],
    description: 'GCP 인프라 배포·모니터링·관리 역량을 검증하는 GCP 첫 번째 자격증. GCP 입문에 최적.',
    descriptionEn: "GCP's first certification validating infrastructure deployment, monitoring, and management skills. Best entry point for GCP.",
  },
  // Professional
  {
    id: 'gcp-pca',
    name: 'Professional Cloud Architect',
    code: 'PCA',
    level: 'professional',
    careerPaths: ['cloud-architect'],
    description: 'GCP 기반 엔터프라이즈 아키텍처 설계·관리 역량을 검증. GCP 최고 인기 자격증 중 하나.',
    descriptionEn: 'Validates enterprise architecture design and management on GCP. One of the most sought-after GCP certifications.',
  },
  {
    id: 'gcp-pde',
    name: 'Professional Data Engineer',
    code: 'PDE',
    level: 'professional',
    careerPaths: ['data-ml'],
    description: '데이터 처리 시스템 설계·구축·운영 역량 검증. BigQuery, Dataflow, Pub/Sub 등 포함.',
    descriptionEn: 'Validates skills in designing, building, and operating data processing systems. Covers BigQuery, Dataflow, and Pub/Sub.',
  },
  {
    id: 'gcp-pmle',
    name: 'Professional ML Engineer',
    code: 'PMLE',
    level: 'professional',
    careerPaths: ['data-ml'],
    description: 'Vertex AI 기반 ML 솔루션 설계·구축·배포 역량 검증. MLOps 파이프라인 포함.',
    descriptionEn: 'Validates skills in designing, building, and deploying ML solutions with Vertex AI. Includes MLOps pipelines.',
  },
  {
    id: 'gcp-pcde',
    name: 'Professional Cloud DevOps Engineer',
    code: 'PCDE',
    level: 'professional',
    careerPaths: ['devops'],
    description: 'GCP에서 CI/CD 파이프라인 구축, SRE 실천, 서비스 안정성 관리 역량 검증.',
    descriptionEn: 'Validates skills in building CI/CD pipelines, practicing SRE, and managing service reliability on GCP.',
  },
  {
    id: 'gcp-pcd',
    name: 'Professional Cloud Developer',
    code: 'PCD',
    level: 'professional',
    careerPaths: ['developer'],
    description: 'GCP 기반 확장 가능한 애플리케이션 개발·배포 역량 검증. Cloud Run, GKE, Firebase 포함.',
    descriptionEn: 'Validates skills in developing and deploying scalable applications on GCP. Covers Cloud Run, GKE, and Firebase.',
  },
  {
    id: 'gcp-pcse',
    name: 'Professional Cloud Security Engineer',
    code: 'PCSE',
    level: 'professional',
    careerPaths: ['security'],
    description: 'GCP 보안 솔루션 설계·구현 역량 검증. IAM, VPC Service Controls, 규정 준수 포함.',
    descriptionEn: 'Validates skills in designing and implementing GCP security solutions. Covers IAM, VPC Service Controls, and compliance.',
  },
  {
    id: 'gcp-pcne',
    name: 'Professional Cloud Network Engineer',
    code: 'PCNE',
    level: 'professional',
    careerPaths: ['devops', 'cloud-architect'],
    description: 'GCP 네트워크 아키텍처 설계·구현 역량 검증. VPC, Cloud Interconnect, Load Balancing 포함.',
    descriptionEn: 'Validates skills in designing and implementing GCP network architectures. Covers VPC, Cloud Interconnect, and Load Balancing.',
  },
  {
    id: 'gcp-pcdbe',
    name: 'Professional Cloud Database Engineer',
    code: 'PCDBE',
    level: 'professional',
    careerPaths: ['data-ml', 'developer'],
    description: 'GCP 데이터베이스 솔루션 설계·마이그레이션·관리 역량 검증. Cloud SQL, Spanner, Firestore 포함.',
    descriptionEn: 'Validates skills in designing, migrating, and managing GCP database solutions. Covers Cloud SQL, Spanner, and Firestore.',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Azure
// ────────────────────────────────────────────────────────────────────────────
const azureCertifications: Certification[] = [
  // Fundamentals
  {
    id: 'az-900',
    name: 'Azure Fundamentals',
    code: 'AZ-900',
    level: 'fundamentals',
    careerPaths: ['all'],
    description: 'Azure 클라우드 기초 개념, 서비스, 요금제를 다루는 입문 자격증. 기술 배경 없이도 응시 가능.',
    descriptionEn: 'Entry-level certification covering Azure cloud basics, services, and pricing. No technical background required.',
  },
  {
    id: 'ai-900',
    name: 'Azure AI Fundamentals',
    code: 'AI-900',
    level: 'fundamentals',
    careerPaths: ['data-ml'],
    description: 'Azure AI 서비스와 머신러닝 개념을 다루는 AI 입문 자격증. AI-102 취득 전 권장.',
    descriptionEn: 'AI entry-level certification covering Azure AI services and machine learning concepts. Recommended before AI-102.',
  },
  {
    id: 'dp-900',
    name: 'Azure Data Fundamentals',
    code: 'DP-900',
    level: 'fundamentals',
    careerPaths: ['data-ml'],
    description: '관계형·비관계형 데이터, 분석 워크로드 개념을 다루는 데이터 입문 자격증.',
    descriptionEn: 'Data entry-level certification covering relational/non-relational data concepts and analytical workloads on Azure.',
  },
  {
    id: 'sc-900',
    name: 'Security, Compliance, and Identity Fundamentals',
    code: 'SC-900',
    level: 'fundamentals',
    careerPaths: ['security'],
    description: 'Microsoft 보안, 규정 준수, ID 솔루션의 기본 개념을 다루는 보안 입문 자격증.',
    descriptionEn: 'Security entry-level certification covering fundamentals of Microsoft security, compliance, and identity solutions.',
  },
  // Associate
  {
    id: 'az-104',
    name: 'Azure Administrator',
    code: 'AZ-104',
    level: 'associate',
    careerPaths: ['devops'],
    description: 'Azure 구독, 가상 네트워크, 스토리지, VM 관리 역량을 검증. Azure 운영의 핵심 자격증.',
    descriptionEn: 'Validates skills in managing Azure subscriptions, virtual networks, storage, and VMs. A core Azure operations certification.',
  },
  {
    id: 'az-204',
    name: 'Azure Developer',
    code: 'AZ-204',
    level: 'associate',
    careerPaths: ['developer'],
    description: 'Azure 클라우드 솔루션 개발·구현 역량 검증. App Service, Functions, Storage 등 포함.',
    descriptionEn: 'Validates skills in developing and implementing Azure cloud solutions. Covers App Service, Functions, and Storage.',
  },
  {
    id: 'ai-102',
    name: 'Azure AI Engineer Associate',
    code: 'AI-102',
    level: 'associate',
    careerPaths: ['data-ml'],
    description: 'Azure AI 서비스를 활용한 AI 솔루션 설계·구현 역량 검증. Azure OpenAI 포함.',
    descriptionEn: 'Validates skills in designing and implementing AI solutions using Azure AI services, including Azure OpenAI.',
  },
  // Expert
  {
    id: 'az-305',
    name: 'Azure Solutions Architect Expert',
    code: 'AZ-305',
    level: 'expert',
    careerPaths: ['cloud-architect'],
    description: 'Azure 기반 엔터프라이즈 솔루션 설계 역량을 검증하는 최고급 아키텍처 자격증.',
    descriptionEn: "Azure's top-tier architecture certification validating skills in designing enterprise solutions on Azure.",
  },
  {
    id: 'az-400',
    name: 'Azure DevOps Engineer Expert',
    code: 'AZ-400',
    level: 'expert',
    careerPaths: ['devops'],
    description: 'DevOps 전략 설계·구현 역량 검증. CI/CD, IaC, 모니터링 등 DevOps 전 영역 커버.',
    descriptionEn: 'Validates DevOps strategy design and implementation skills. Covers CI/CD, IaC, monitoring, and the full DevOps lifecycle.',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Provider Configs
// ────────────────────────────────────────────────────────────────────────────
export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'AWS',
    name: 'Amazon Web Services',
    tagline: '세계 최대 클라우드 플랫폼 · 200개 이상의 서비스',
    taglineEn: "World's largest cloud platform · 200+ services",
    color: '#FF9900',
    levels: ['foundational', 'associate', 'professional', 'specialty'],
    certifications: awsCertifications,
  },
  {
    id: 'GCP',
    name: 'Google Cloud Platform',
    tagline: '데이터·AI에 강한 구글의 클라우드 플랫폼',
    taglineEn: "Google's cloud platform, strong in data & AI",
    color: '#4285F4',
    levels: ['associate', 'professional'],
    certifications: gcpCertifications,
  },
  {
    id: 'Azure',
    name: 'Microsoft Azure',
    tagline: '엔터프라이즈 친화적 마이크로소프트 클라우드',
    taglineEn: 'Enterprise-friendly Microsoft cloud platform',
    color: '#0078D4',
    levels: ['fundamentals', 'associate', 'expert'],
    certifications: azureCertifications,
  },
];
