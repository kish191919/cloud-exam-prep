const TAG_EN: Record<string, string> = {
  // AWS AIF-C01
  'AI 및 ML의 기초': 'Fundamentals of AI and ML',
  'GenAI의 기초': 'Fundamentals of GenAI',
  '파운데이션 모델의 적용': 'Applications of Foundation Models',
  '책임 있는 AI에 대한 가이드라인': 'Guidelines for Responsible AI',
  'AI 솔루션의 보안, 규정 준수 및 거버넌스':
    'Security, Compliance, and Governance for AI Solutions',
  // AWS CLF-C02 & AZURE AZ-900 (shared)
  '클라우드 개념': 'Cloud Concepts',
  // AWS CLF-C02
  '보안 및 규정 준수': 'Security and Compliance',
  '클라우드 기술 및 서비스': 'Cloud Technology and Services',
  '청구, 가격 책정 및 지원': 'Billing, Pricing, and Support',
  // AZURE AZ-900
  'AZURE 핵심 아키텍처': 'AZURE Core Architecture',
  '컴퓨팅 및 네트워킹': 'Compute and Networking',
  '스토리지 서비스': 'Storage Services',
  'ID, 접근 및 보안': 'Identity, Access, and Security',
  '비용 관리': 'Cost Management',
  '거버넌스 및 규정 준수': 'Governance and Compliance',
  '리소스 배포 및 관리': 'Resource Deployment and Management',
  '모니터링 및 서비스 상태': 'Monitoring and Service Health',
  // AWS DEA-C01
  '데이터 수집 및 변환': 'Data Ingestion and Transformation',
  '데이터 저장소 관리': 'Data Store Management',
  '데이터 운영 및 지원': 'Data Operations and Support',
  '데이터 보안 및 거버넌스': 'Data Security and Governance',
  // AWS SAA-C03
  '보안 아키텍처 설계': 'Design Secure Architectures',
  '탄력적인 아키텍처 설계': 'Design Resilient Architectures',
  '고성능 아키텍처 설계': 'Design High-Performing Architectures',
  '비용 최적화 아키텍처 설계': 'Design Cost-Optimized Architectures',
};

export function translateTag(tag: string, isEn: boolean): string {
  return isEn ? (TAG_EN[tag] ?? tag) : tag;
}
