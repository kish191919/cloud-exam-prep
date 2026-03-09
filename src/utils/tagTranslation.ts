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

const TAG_JA: Record<string, string> = {
  // AWS AIF-C01
  'AI 및 ML의 기초': 'AIとMLの基礎',
  'GenAI의 기초': '生成AIの基礎',
  '파운데이션 모델의 적용': 'ファウンデーションモデルの活用',
  '책임 있는 AI에 대한 가이드라인': '責任あるAIのガイドライン',
  'AI 솔루션의 보안, 규정 준수 및 거버넌스':
    'AIソリューションのセキュリティ・コンプライアンス・ガバナンス',
  // AWS CLF-C02 & AZURE AZ-900 (shared)
  '클라우드 개념': 'クラウドの概念',
  // AWS CLF-C02
  '보안 및 규정 준수': 'セキュリティとコンプライアンス',
  '클라우드 기술 및 서비스': 'クラウドテクノロジーとサービス',
  '청구, 가격 책정 및 지원': '請求、料金、サポート',
  // AZURE AZ-900
  'AZURE 핵심 아키텍처': 'AZUREコアアーキテクチャ',
  '컴퓨팅 및 네트워킹': 'コンピューティングとネットワーキング',
  '스토리지 서비스': 'ストレージサービス',
  'ID, 접근 및 보안': 'ID、アクセス、セキュリティ',
  '비용 관리': 'コスト管理',
  '거버넌스 및 규정 준수': 'ガバナンスとコンプライアンス',
  '리소스 배포 및 관리': 'リソースの展開と管理',
  '모니터링 및 서비스 상태': '監視とサービス正常性',
  // AWS DEA-C01
  '데이터 수집 및 변환': 'データの取り込みと変換',
  '데이터 저장소 관리': 'データストア管理',
  '데이터 운영 및 지원': 'データオペレーションとサポート',
  '데이터 보안 및 거버넌스': 'データセキュリティとガバナンス',
  // AWS SAA-C03
  '보안 아키텍처 설계': 'セキュアなアーキテクチャの設計',
  '탄력적인 아키텍처 설계': '回復力のあるアーキテクチャの設計',
  '고성능 아키텍처 설계': '高パフォーマンスアーキテクチャの設計',
  '비용 최적화 아키텍처 설계': 'コスト最適化アーキテクチャの設計',
};

const TAG_ES: Record<string, string> = {
  // AWS AIF-C01
  'AI 및 ML의 기초': 'Fundamentos de IA y ML',
  'GenAI의 기초': 'Fundamentos de IA Generativa',
  '파운데이션 모델의 적용': 'Aplicaciones de Modelos Fundacionales',
  '책임 있는 AI에 대한 가이드라인': 'Directrices para IA Responsable',
  'AI 솔루션의 보안, 규정 준수 및 거버넌스':
    'Seguridad, Cumplimiento y Gobernanza para IA',
  // AWS CLF-C02 & AZURE AZ-900 (shared)
  '클라우드 개념': 'Conceptos de la Nube',
  // AWS CLF-C02
  '보안 및 규정 준수': 'Seguridad y Cumplimiento',
  '클라우드 기술 및 서비스': 'Tecnología y Servicios en la Nube',
  '청구, 가격 책정 및 지원': 'Facturación, Precios y Soporte',
  // AZURE AZ-900
  'AZURE 핵심 아키텍처': 'Arquitectura Central de AZURE',
  '컴퓨팅 및 네트워킹': 'Cómputo y Redes',
  '스토리지 서비스': 'Servicios de Almacenamiento',
  'ID, 접근 및 보안': 'Identidad, Acceso y Seguridad',
  '비용 관리': 'Gestión de Costos',
  '거버넌스 및 규정 준수': 'Gobernanza y Cumplimiento',
  '리소스 배포 및 관리': 'Implementación y Gestión de Recursos',
  '모니터링 및 서비스 상태': 'Monitoreo y Estado del Servicio',
  // AWS DEA-C01
  '데이터 수집 및 변환': 'Ingesta y Transformación de Datos',
  '데이터 저장소 관리': 'Gestión de Almacén de Datos',
  '데이터 운영 및 지원': 'Operaciones y Soporte de Datos',
  '데이터 보안 및 거버넌스': 'Seguridad y Gobernanza de Datos',
  // AWS SAA-C03
  '보안 아키텍처 설계': 'Diseño de Arquitecturas Seguras',
  '탄력적인 아키텍처 설계': 'Diseño de Arquitecturas Resilientes',
  '고성능 아키텍처 설계': 'Diseño de Arquitecturas de Alto Rendimiento',
  '비용 최적화 아키텍처 설계': 'Diseño de Arquitecturas Optimizadas en Costos',
};

const TAG_PT: Record<string, string> = {
  // AWS AIF-C01
  'AI 및 ML의 기초': 'Fundamentos de IA e ML',
  'GenAI의 기초': 'Fundamentos de IA Generativa',
  '파운데이션 모델의 적용': 'Aplicações de Modelos Fundamentais',
  '책임 있는 AI에 대한 가이드라인': 'Diretrizes para IA Responsável',
  'AI 솔루션의 보안, 규정 준수 및 거버넌스':
    'Segurança, Conformidade e Governança para IA',
  // AWS CLF-C02 & AZURE AZ-900 (shared)
  '클라우드 개념': 'Conceitos de Nuvem',
  // AWS CLF-C02
  '보안 및 규정 준수': 'Segurança e Conformidade',
  '클라우드 기술 및 서비스': 'Tecnologia e Serviços em Nuvem',
  '청구, 가격 책정 및 지원': 'Faturamento, Preços e Suporte',
  // AZURE AZ-900
  'AZURE 핵심 아키텍처': 'Arquitetura Central do AZURE',
  '컴퓨팅 및 네트워킹': 'Computação e Redes',
  '스토리지 서비스': 'Serviços de Armazenamento',
  'ID, 접근 및 보안': 'Identidade, Acesso e Segurança',
  '비용 관리': 'Gerenciamento de Custos',
  '거버넌스 및 규정 준수': 'Governança e Conformidade',
  '리소스 배포 및 관리': 'Implantação e Gerenciamento de Recursos',
  '모니터링 및 서비스 상태': 'Monitoramento e Integridade do Serviço',
  // AWS DEA-C01
  '데이터 수집 및 변환': 'Ingestão e Transformação de Dados',
  '데이터 저장소 관리': 'Gerenciamento de Armazenamento de Dados',
  '데이터 운영 및 지원': 'Operações e Suporte de Dados',
  '데이터 보안 및 거버넌스': 'Segurança e Governança de Dados',
  // AWS SAA-C03
  '보안 아키텍처 설계': 'Projetar Arquiteturas Seguras',
  '탄력적인 아키텍처 설계': 'Projetar Arquiteturas Resilientes',
  '고성능 아키텍처 설계': 'Projetar Arquiteturas de Alto Desempenho',
  '비용 최적화 아키텍처 설계': 'Projetar Arquiteturas Otimizadas em Custos',
};

export function translateTag(tag: string, lang: string): string {
  if (lang === 'ko') return tag;
  const map = lang === 'ja' ? TAG_JA : lang === 'es' ? TAG_ES : lang === 'pt' ? TAG_PT : TAG_EN;
  return map[tag] ?? TAG_EN[tag] ?? tag;
}
