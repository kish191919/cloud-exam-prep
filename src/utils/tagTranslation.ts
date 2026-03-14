const TAG_EN: Record<string, string> = {
  // AWS AIF-C01 (구버전 5태그 — backward compatibility)
  'AI 및 ML의 기초': 'Fundamentals of AI and ML',
  'GenAI의 기초': 'Fundamentals of GenAI',
  '파운데이션 모델의 적용': 'Applications of Foundation Models',
  '책임 있는 AI에 대한 가이드라인': 'Guidelines for Responsible AI',
  'AI 솔루션의 보안, 규정 준수 및 거버넌스':
    'Security, Compliance, and Governance for AI Solutions',
  // AWS AIF-C01 (신버전 11태그)
  'AI·ML 개념과 알고리즘': 'AI and ML Concepts and Algorithms',
  'AI 실용 사례와 서비스 선택': 'AI Use Cases and Service Selection',
  'ML 개발 수명 주기': 'ML Development Lifecycle',
  '생성형 AI 개념과 구조': 'Generative AI Concepts and Architecture',
  '생성형 AI 역량과 한계': 'Generative AI Capabilities and Limitations',
  'AWS GenAI 인프라와 서비스': 'AWS GenAI Infrastructure and Services',
  'FM 애플리케이션 설계와 RAG': 'FM Application Design and RAG',
  '프롬프트 엔지니어링과 보안': 'Prompt Engineering and Security',
  'FM 훈련·파인튜닝·평가': 'FM Training, Fine-tuning, and Evaluation',
  '책임 있는 AI와 공정성': 'Responsible AI and Fairness',
  'AI 투명성·설명 가능성·거버넌스': 'AI Transparency, Explainability, and Governance',
  // AWS CLF-C02 & AZURE AZ-900 (shared)
  '클라우드 개념': 'Cloud Concepts',
  // AWS CLF-C02 (구버전 4태그 — backward compatibility)
  '보안 및 규정 준수': 'Security and Compliance',
  '클라우드 기술 및 서비스': 'Cloud Technology and Services',
  '청구, 가격 책정 및 지원': 'Billing, Pricing, and Support',
  // AWS CLF-C02 (신버전 15태그)
  '클라우드 이점과 가치 제안': 'Cloud Benefits and Value Proposition',
  'Well-Architected 설계 원칙': 'Well-Architected Design Principles',
  '마이그레이션과 클라우드 도입': 'Migration and Cloud Adoption',
  '공동 책임 모델': 'Shared Responsibility Model',
  '보안 거버넌스와 규정 준수': 'Security Governance and Compliance',
  '접근 관리와 자격 증명': 'Access Management and Credentials',
  '보안 서비스와 위협 방어': 'Security Services and Threat Defense',
  '배포 방법과 글로벌 인프라': 'Deployment Methods and Global Infrastructure',
  '컴퓨팅 서비스': 'Compute Services',
  '데이터베이스 서비스': 'Database Services',
  '네트워킹 서비스': 'Networking Services',
  '스토리지 서비스': 'Storage Services',
  '애플리케이션 통합과 기타 서비스': 'Application Integration and Other Services',
  '요금 모델과 클라우드 경제성': 'Pricing Models and Cloud Economics',
  'AWS 지원과 리소스': 'AWS Support and Resources',
  // AZURE AZ-900
  'AZURE 핵심 아키텍처': 'AZURE Core Architecture',
  '컴퓨팅 및 네트워킹': 'Compute and Networking',
  // '스토리지 서비스' — CLF-C02와 동일, 위에서 이미 정의됨
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

const TAG_ES: Record<string, string> = {
  // AWS AIF-C01 (구버전 5태그 — backward compatibility)
  'AI 및 ML의 기초': 'Fundamentos de IA y ML',
  'GenAI의 기초': 'Fundamentos de IA Generativa',
  '파운데이션 모델의 적용': 'Aplicaciones de Modelos Fundacionales',
  '책임 있는 AI에 대한 가이드라인': 'Directrices para IA Responsable',
  'AI 솔루션의 보안, 규정 준수 및 거버넌스':
    'Seguridad, Cumplimiento y Gobernanza para IA',
  // AWS AIF-C01 (신버전 11태그)
  'AI·ML 개념과 알고리즘': 'Conceptos y Algoritmos de IA y ML',
  'AI 실용 사례와 서비스 선택': 'Casos de Uso de IA y Selección de Servicios',
  'ML 개발 수명 주기': 'Ciclo de Vida del Desarrollo de ML',
  '생성형 AI 개념과 구조': 'Conceptos y Arquitectura de IA Generativa',
  '생성형 AI 역량과 한계': 'Capacidades y Limitaciones de la IA Generativa',
  'AWS GenAI 인프라와 서비스': 'Infraestructura y Servicios de GenAI de AWS',
  'FM 애플리케이션 설계와 RAG': 'Diseño de Aplicaciones FM y RAG',
  '프롬프트 엔지니어링과 보안': 'Ingeniería de Prompts y Seguridad',
  'FM 훈련·파인튜닝·평가': 'Entrenamiento, Fine-tuning y Evaluación de FM',
  '책임 있는 AI와 공정성': 'IA Responsable y Equidad',
  'AI 투명성·설명 가능성·거버넌스': 'Transparencia, Explicabilidad y Gobernanza de IA',
  // AWS CLF-C02 & AZURE AZ-900 (shared)
  '클라우드 개념': 'Conceptos de la Nube',
  // AWS CLF-C02 (구버전 4태그 — backward compatibility)
  '보안 및 규정 준수': 'Seguridad y Cumplimiento',
  '클라우드 기술 및 서비스': 'Tecnología y Servicios en la Nube',
  '청구, 가격 책정 및 지원': 'Facturación, Precios y Soporte',
  // AWS CLF-C02 (신버전 15태그)
  '클라우드 이점과 가치 제안': 'Beneficios de la Nube y Propuesta de Valor',
  'Well-Architected 설계 원칙': 'Principios de Diseño Well-Architected',
  '마이그레이션과 클라우드 도입': 'Migración y Adopción de la Nube',
  '공동 책임 모델': 'Modelo de Responsabilidad Compartida',
  '보안 거버넌스와 규정 준수': 'Gobernanza de Seguridad y Cumplimiento',
  '접근 관리와 자격 증명': 'Gestión de Acceso y Credenciales',
  '보안 서비스와 위협 방어': 'Servicios de Seguridad y Defensa contra Amenazas',
  '배포 방법과 글로벌 인프라': 'Métodos de Despliegue e Infraestructura Global',
  '컴퓨팅 서비스': 'Servicios de Cómputo',
  '데이터베이스 서비스': 'Servicios de Base de Datos',
  '네트워킹 서비스': 'Servicios de Red',
  '스토리지 서비스': 'Servicios de Almacenamiento',
  '애플리케이션 통합과 기타 서비스': 'Integración de Aplicaciones y Otros Servicios',
  '요금 모델과 클라우드 경제성': 'Modelos de Precios y Economía de la Nube',
  'AWS 지원과 리소스': 'Soporte y Recursos de AWS',
  // AZURE AZ-900
  'AZURE 핵심 아키텍처': 'Arquitectura Central de AZURE',
  '컴퓨팅 및 네트워킹': 'Cómputo y Redes',
  // '스토리지 서비스' — CLF-C02와 동일, 위에서 이미 정의됨
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
  // AWS AIF-C01 (구버전 5태그 — backward compatibility)
  'AI 및 ML의 기초': 'Fundamentos de IA e ML',
  'GenAI의 기초': 'Fundamentos de IA Generativa',
  '파운데이션 모델의 적용': 'Aplicações de Modelos Fundamentais',
  '책임 있는 AI에 대한 가이드라인': 'Diretrizes para IA Responsável',
  'AI 솔루션의 보안, 규정 준수 및 거버넌스':
    'Segurança, Conformidade e Governança para IA',
  // AWS AIF-C01 (신버전 11태그)
  'AI·ML 개념과 알고리즘': 'Conceitos e Algoritmos de IA e ML',
  'AI 실용 사례와 서비스 선택': 'Casos de Uso de IA e Seleção de Serviços',
  'ML 개발 수명 주기': 'Ciclo de Vida do Desenvolvimento de ML',
  '생성형 AI 개념과 구조': 'Conceitos e Arquitetura de IA Generativa',
  '생성형 AI 역량과 한계': 'Capacidades e Limitações da IA Generativa',
  'AWS GenAI 인프라와 서비스': 'Infraestrutura e Serviços de GenAI da AWS',
  'FM 애플리케이션 설계와 RAG': 'Design de Aplicações FM e RAG',
  '프롬프트 엔지니어링과 보안': 'Engenharia de Prompt e Segurança',
  'FM 훈련·파인튜닝·평가': 'Treinamento, Fine-tuning e Avaliação de FM',
  '책임 있는 AI와 공정성': 'IA Responsável e Equidade',
  'AI 투명성·설명 가능성·거버넌스': 'Transparência, Explicabilidade e Governança de IA',
  // AWS CLF-C02 & AZURE AZ-900 (shared)
  '클라우드 개념': 'Conceitos de Nuvem',
  // AWS CLF-C02 (구버전 4태그 — backward compatibility)
  '보안 및 규정 준수': 'Segurança e Conformidade',
  '클라우드 기술 및 서비스': 'Tecnologia e Serviços em Nuvem',
  '청구, 가격 책정 및 지원': 'Faturamento, Preços e Suporte',
  // AWS CLF-C02 (신버전 15태그)
  '클라우드 이점과 가치 제안': 'Benefícios da Nuvem e Proposta de Valor',
  'Well-Architected 설계 원칙': 'Princípios de Design Well-Architected',
  '마이그레이션과 클라우드 도입': 'Migração e Adoção da Nuvem',
  '공동 책임 모델': 'Modelo de Responsabilidade Compartilhada',
  '보안 거버넌스와 규정 준수': 'Governança de Segurança e Conformidade',
  '접근 관리와 자격 증명': 'Gerenciamento de Acesso e Credenciais',
  '보안 서비스와 위협 방어': 'Serviços de Segurança e Defesa contra Ameaças',
  '배포 방법과 글로벌 인프라': 'Métodos de Implantação e Infraestrutura Global',
  '컴퓨팅 서비스': 'Serviços de Computação',
  '데이터베이스 서비스': 'Serviços de Banco de Dados',
  '네트워킹 서비스': 'Serviços de Rede',
  '스토리지 서비스': 'Serviços de Armazenamento',
  '애플리케이션 통합과 기타 서비스': 'Integração de Aplicações e Outros Serviços',
  '요금 모델과 클라우드 경제성': 'Modelos de Preços e Economia da Nuvem',
  'AWS 지원과 리소스': 'Suporte e Recursos AWS',
  // AZURE AZ-900
  'AZURE 핵심 아키텍처': 'Arquitetura Central do AZURE',
  '컴퓨팅 및 네트워킹': 'Computação e Redes',
  // '스토리지 서비스' — CLF-C02와 동일, 위에서 이미 정의됨
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
  const map = lang === 'es' ? TAG_ES : lang === 'pt' ? TAG_PT : TAG_EN;
  return map[tag] ?? TAG_EN[tag] ?? tag;
}
