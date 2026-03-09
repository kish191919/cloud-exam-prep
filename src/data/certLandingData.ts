export interface Domain {
  name: string;    // Korean
  nameEn: string;  // English
  percent: number;
  topics: string[];
  topicsEn?: string[];  // English
}

export interface CertLandingMeta {
  examId: string;
  provider: 'AWS' | 'AZURE' | 'GCP';
  code: string;
  fullName: string;
  fullNameEn: string;
  level: string;
  levelEn: string;
  durationMin: number;
  examQuestions: number;
  passingScore: number;
  renewalYears: number;  // 0 = no renewal required
  officialUrl: string;
  domains: Domain[];
  dbCountApprox: number;  // approximate practice question count in our DB
  metaDescription: string;
  metaDescriptionEn: string;
}

export const CERT_LANDING_DATA: Record<string, CertLandingMeta> = {
  'aws-aif-c01': {
    examId: 'aws-aif-c01',
    provider: 'AWS',
    code: 'AIF-C01',
    fullName: 'AWS Certified AI Practitioner',
    fullNameEn: 'AWS Certified AI Practitioner',
    level: '기초',
    levelEn: 'Foundational',
    durationMin: 90,
    examQuestions: 65,
    passingScore: 700,
    renewalYears: 3,
    officialUrl: 'https://aws.amazon.com/certification/certified-ai-practitioner/',
    dbCountApprox: 730,
    metaDescription: 'AWS Certified AI Practitioner(AIF-C01) 한국어 모의고사 730개 이상. 도메인별 출제 비율, 합격 전략 확인 후 무료로 연습하세요.',
    metaDescriptionEn: 'AWS Certified AI Practitioner (AIF-C01) Korean practice exam with 730+ questions. Check domain breakdown and start practicing for free.',
    domains: [
      {
        name: 'AI 및 ML 기초',
        nameEn: 'Fundamentals of AI and ML',
        percent: 20,
        topics: ['머신러닝 개념', 'AI 서비스 개요', 'ML 파이프라인', 'Amazon SageMaker'],
        topicsEn: ['ML Concepts', 'AI Services Overview', 'ML Pipeline', 'Amazon SageMaker'],
      },
      {
        name: '생성형 AI 기초',
        nameEn: 'Fundamentals of Generative AI',
        percent: 24,
        topics: ['파운데이션 모델', 'Amazon Bedrock', '프롬프트 엔지니어링', 'LLM 기초'],
        topicsEn: ['Foundation Models', 'Amazon Bedrock', 'Prompt Engineering', 'LLM Basics'],
      },
      {
        name: '파운데이션 모델 활용',
        nameEn: 'Applications of Foundation Models',
        percent: 28,
        topics: ['RAG', 'Amazon Bedrock 에이전트', '파인튜닝', '멀티모달'],
        topicsEn: ['RAG', 'Amazon Bedrock Agents', 'Fine-tuning', 'Multimodal'],
      },
      {
        name: '책임 있는 AI 가이드라인',
        nameEn: 'Guidelines for Responsible AI',
        percent: 14,
        topics: ['편향성·공정성', '투명성', '거버넌스', 'AWS AI 서비스 카드'],
        topicsEn: ['Bias & Fairness', 'Transparency', 'Governance', 'AWS AI Service Cards'],
      },
      {
        name: 'AI 보안·규정 준수·거버넌스',
        nameEn: 'Security, Compliance, and Governance for AI',
        percent: 14,
        topics: ['IAM', 'Amazon Macie', 'AWS 규정 준수', 'VPC 보안'],
        topicsEn: ['IAM', 'Amazon Macie', 'AWS Compliance', 'VPC Security'],
      },
    ],
  },
  'aws-clf-c02': {
    examId: 'aws-clf-c02',
    provider: 'AWS',
    code: 'CLF-C02',
    fullName: 'AWS Certified Cloud Practitioner',
    fullNameEn: 'AWS Certified Cloud Practitioner',
    level: '기초',
    levelEn: 'Foundational',
    durationMin: 90,
    examQuestions: 65,
    passingScore: 700,
    renewalYears: 3,
    officialUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
    dbCountApprox: 600,
    metaDescription: 'AWS Certified Cloud Practitioner(CLF-C02) 한국어 모의고사 600개 이상. 도메인별 출제 비율, 합격 전략 확인 후 무료로 연습하세요.',
    metaDescriptionEn: 'AWS Certified Cloud Practitioner (CLF-C02) Korean practice exam with 600+ questions. Check domain breakdown and start practicing for free.',
    domains: [
      {
        name: '클라우드 개념',
        nameEn: 'Cloud Concepts',
        percent: 24,
        topics: ['클라우드 컴퓨팅 이점', '클라우드 배포 모델', 'AWS 클라우드 가치 제안', '설계 원칙'],
        topicsEn: ['Benefits of Cloud', 'Cloud Deployment Models', 'AWS Value Proposition', 'Design Principles'],
      },
      {
        name: '보안 및 규정 준수',
        nameEn: 'Security and Compliance',
        percent: 30,
        topics: ['공동 책임 모델', 'AWS IAM', 'AWS Shield', 'AWS Artifact'],
        topicsEn: ['Shared Responsibility Model', 'AWS IAM', 'AWS Shield', 'AWS Artifact'],
      },
      {
        name: '클라우드 기술 및 서비스',
        nameEn: 'Cloud Technology and Services',
        percent: 34,
        topics: ['EC2', 'S3', 'RDS', 'Lambda', 'VPC', 'CloudFront'],
        topicsEn: ['EC2', 'S3', 'RDS', 'Lambda', 'VPC', 'CloudFront'],
      },
      {
        name: '청구·요금·지원',
        nameEn: 'Billing, Pricing, and Support',
        percent: 12,
        topics: ['AWS 요금 모델', 'Cost Explorer', 'AWS 지원 플랜', 'Trusted Advisor'],
        topicsEn: ['AWS Pricing Models', 'Cost Explorer', 'AWS Support Plans', 'Trusted Advisor'],
      },
    ],
  },
  'aws-dea-c01': {
    examId: 'aws-dea-c01',
    provider: 'AWS',
    code: 'DEA-C01',
    fullName: 'AWS Certified Data Engineer - Associate',
    fullNameEn: 'AWS Certified Data Engineer - Associate',
    level: '어소시에이트',
    levelEn: 'Associate',
    durationMin: 130,
    examQuestions: 65,
    passingScore: 720,
    renewalYears: 3,
    officialUrl: 'https://aws.amazon.com/certification/certified-data-engineer-associate/',
    dbCountApprox: 520,
    metaDescription: 'AWS Certified Data Engineer Associate(DEA-C01) 한국어 모의고사 520개 이상. 도메인별 출제 비율, 합격 전략 확인 후 무료로 연습하세요.',
    metaDescriptionEn: 'AWS Certified Data Engineer Associate (DEA-C01) Korean practice exam with 520+ questions. Check domain breakdown and start practicing for free.',
    domains: [
      {
        name: '데이터 수집 및 변환',
        nameEn: 'Data Ingestion and Transformation',
        percent: 34,
        topics: ['AWS Glue', 'Lambda', 'Kinesis', 'Amazon EMR', 'Step Functions'],
        topicsEn: ['AWS Glue', 'Lambda', 'Kinesis', 'Amazon EMR', 'Step Functions'],
      },
      {
        name: '스토리지 및 데이터 관리',
        nameEn: 'Storage and Data Management',
        percent: 26,
        topics: ['Amazon S3', 'Redshift', 'DynamoDB', 'Lake Formation', 'Apache Iceberg'],
        topicsEn: ['Amazon S3', 'Redshift', 'DynamoDB', 'Lake Formation', 'Apache Iceberg'],
      },
      {
        name: '데이터 운영 및 지원',
        nameEn: 'Data Operations and Support',
        percent: 22,
        topics: ['CloudWatch', 'CloudTrail', 'Athena', 'QuickSight', '자동화 파이프라인'],
        topicsEn: ['CloudWatch', 'CloudTrail', 'Athena', 'QuickSight', 'Automation Pipelines'],
      },
      {
        name: '데이터 보안 및 거버넌스',
        nameEn: 'Data Security and Governance',
        percent: 18,
        topics: ['IAM', 'KMS', 'Macie', 'Glue 데이터 카탈로그', 'RBAC'],
        topicsEn: ['IAM', 'KMS', 'Macie', 'Glue Data Catalog', 'RBAC'],
      },
    ],
  },
  'aws-saa-c03': {
    examId: 'aws-saa-c03',
    provider: 'AWS',
    code: 'SAA-C03',
    fullName: 'AWS Certified Solutions Architect - Associate',
    fullNameEn: 'AWS Certified Solutions Architect - Associate',
    level: '어소시에이트',
    levelEn: 'Associate',
    durationMin: 130,
    examQuestions: 65,
    passingScore: 720,
    renewalYears: 3,
    officialUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    dbCountApprox: 490,
    metaDescription: 'AWS Certified Solutions Architect Associate(SAA-C03) 한국어 모의고사 490개 이상. 도메인별 출제 비율, 합격 전략 확인 후 무료로 연습하세요.',
    metaDescriptionEn: 'AWS Certified Solutions Architect Associate (SAA-C03) Korean practice exam with 490+ questions. Check domain breakdown and start practicing for free.',
    domains: [
      {
        name: '보안 아키텍처 설계',
        nameEn: 'Design Secure Architectures',
        percent: 30,
        topics: ['IAM', 'S3 버킷 정책', 'VPC 보안 그룹', 'KMS', 'CloudTrail'],
        topicsEn: ['IAM', 'S3 Bucket Policies', 'VPC Security Groups', 'KMS', 'CloudTrail'],
      },
      {
        name: '탄력적 아키텍처 설계',
        nameEn: 'Design Resilient Architectures',
        percent: 26,
        topics: ['Auto Scaling', 'Elastic Load Balancing', 'Route 53', 'Multi-AZ', 'S3 복제'],
        topicsEn: ['Auto Scaling', 'Elastic Load Balancing', 'Route 53', 'Multi-AZ', 'S3 Replication'],
      },
      {
        name: '고성능 아키텍처 설계',
        nameEn: 'Design High-Performing Architectures',
        percent: 24,
        topics: ['CloudFront', 'ElastiCache', 'RDS 읽기 전용 복제본', 'DynamoDB DAX', 'SQS'],
        topicsEn: ['CloudFront', 'ElastiCache', 'RDS Read Replicas', 'DynamoDB DAX', 'SQS'],
      },
      {
        name: '비용 최적화 아키텍처 설계',
        nameEn: 'Design Cost-Optimized Architectures',
        percent: 20,
        topics: ['예약 인스턴스', 'Spot 인스턴스', 'S3 스토리지 클래스', 'Cost Explorer', '서버리스'],
        topicsEn: ['Reserved Instances', 'Spot Instances', 'S3 Storage Classes', 'Cost Explorer', 'Serverless'],
      },
    ],
  },
  'azure-az-900': {
    examId: 'azure-az-900',
    provider: 'AZURE',
    code: 'AZ-900',
    fullName: 'Microsoft AZURE Fundamentals',
    fullNameEn: 'Microsoft AZURE Fundamentals',
    level: '기초',
    levelEn: 'Fundamentals',
    durationMin: 60,
    examQuestions: 50,
    passingScore: 700,
    renewalYears: 0,
    officialUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
    dbCountApprox: 190,
    metaDescription: 'Microsoft AZURE Fundamentals(AZ-900) 한국어 모의고사 190개 이상. 도메인별 출제 비율, 합격 전략 확인 후 무료로 연습하세요.',
    metaDescriptionEn: 'Microsoft AZURE Fundamentals (AZ-900) Korean practice exam with 190+ questions. Check domain breakdown and start practicing for free.',
    domains: [
      {
        name: '클라우드 개념 설명',
        nameEn: 'Describe cloud concepts',
        percent: 28,
        topics: ['클라우드 서비스 이점', '클라우드 서비스 유형', '공유 책임 모델', 'IaaS/PaaS/SaaS'],
        topicsEn: ['Cloud Service Benefits', 'Cloud Service Types', 'Shared Responsibility Model', 'IaaS/PaaS/SaaS'],
      },
      {
        name: 'AZURE 아키텍처 및 서비스 설명',
        nameEn: 'Describe AZURE architecture and services',
        percent: 37,
        topics: ['AZURE 지역·가용성 영역', 'AZURE VM', 'AZURE Storage', 'AZURE 네트워킹', 'AZURE AI 서비스'],
        topicsEn: ['AZURE Regions & AZs', 'AZURE VM', 'AZURE Storage', 'AZURE Networking', 'AZURE AI Services'],
      },
      {
        name: 'AZURE 관리 및 거버넌스 설명',
        nameEn: 'Describe AZURE management and governance',
        percent: 35,
        topics: ['AZURE Cost Management', 'AZURE Policy', 'AZURE RBAC', 'AZURE Monitor', 'Microsoft Defender'],
        topicsEn: ['AZURE Cost Management', 'AZURE Policy', 'AZURE RBAC', 'AZURE Monitor', 'Microsoft Defender'],
      },
    ],
  },
};
