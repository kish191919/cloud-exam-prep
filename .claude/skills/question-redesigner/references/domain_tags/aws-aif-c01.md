# AIF-C01 도메인 태그 목록

AWS Certified AI Practitioner (AIF-C01) 문제에 사용하는 도메인 태그입니다.
각 문제에 태그를 **정확히 1개** 부여합니다.

공식 시험 가이드 기준: 5개 도메인, 11개 Task Statement → 11개 세분화 태그.

---

## 태그 목록

| 태그 | 영문 태그 | 포르투갈어 태그 | 스페인어 태그 | 일본어 태그 | 설명 | 키워드 예시 |
|------|----------|----------------|--------------|------------|------|------------|
| `AI·ML 개념과 알고리즘` | `AI and ML Concepts and Algorithms` | `Conceitos e Algoritmos de IA e ML` | `Conceptos y Algoritmos de IA y ML` | `AIとMLの概念とアルゴリズム` | AI/ML/딥러닝 핵심 개념, 학습 유형, 신경망 구조, 데이터 타입, 추론 방식 (D1 Task 1.1) | 지도학습, 비지도학습, 강화학습, 신경망, 딥러닝, 합성곱 신경망(CNN), 순환 신경망(RNN), 자연어 처리(NLP), 컴퓨터 비전, 배치 추론, 실시간 추론, Transformer, 레이블 데이터, 비정형 데이터, 시계열 데이터, 임베딩 개념 |
| `AI 실용 사례와 서비스 선택` | `AI Use Cases and Service Selection` | `Casos de Uso de IA e Seleção de Serviços` | `Casos de Uso de IA y Selección de Servicios` | `AIのユースケースとサービス選択` | 비즈니스 문제에 적합한 ML 기법·AWS 서비스 선택, AI가 의사결정·자동화·확장성에 주는 가치 (D1 Task 1.2) | 회귀(regression), 분류(classification), 클러스터링, 추천 시스템, 이상 탐지, 예측(forecasting), 감성 분석, 이미지 분류, 개체명 인식(NER), 음성 인식, 문서 이해, 서비스 선택 기준, Amazon Rekognition, Amazon Comprehend, Amazon Transcribe, Amazon Textract, Amazon Translate, Amazon Lex, Amazon Polly, Amazon Kendra, Amazon Personalize, Amazon Forecast |
| `ML 개발 수명 주기` | `ML Development Lifecycle` | `Ciclo de Vida do Desenvolvimento de ML` | `Ciclo de Vida del Desarrollo de ML` | `ML開発ライフサイクル` | 데이터 수집→EDA→전처리→피처 엔지니어링→훈련→튜닝→평가→배포→모니터링, MLOps, 성능·비즈니스 지표 (D1 Task 1.3) | 데이터 수집, EDA(탐색적 데이터 분석), 데이터 전처리, 피처 엔지니어링, 차원 축소, 과적합(overfitting), 정규화, 교차 검증, 하이퍼파라미터 튜닝, 모델 배포, 모델 모니터링, MLOps, 데이터 증강, 정밀도(precision), 재현율(recall), F1 점수, AUC, Amazon SageMaker Pipelines, SageMaker Experiments, SageMaker Model Monitor |
| `생성형 AI 개념과 구조` | `Generative AI Concepts and Architecture` | `Conceitos e Arquitetura de IA Generativa` | `Conceptos y Arquitectura de IA Generativa` | `生成AIの概念とアーキテクチャ` | GenAI·LLM·FM 핵심 개념, 토큰화·임베딩·벡터·청킹, Transformer 구조, 멀티모달·확산 모델, FM 수명 주기 (D2 Task 2.1) | 대규모 언어 모델(LLM), 파운데이션 모델(FM), 토큰, 토큰화, 컨텍스트 윈도우, 임베딩, 벡터, 벡터 데이터베이스, 청킹(chunking), Transformer, 어텐션 메커니즘, 확산 모델(Diffusion Model), 멀티모달, 이미지 생성, 코드 생성, 요약, AI 어시스턴트, Amazon Titan Embeddings, Amazon OpenSearch Serverless(벡터 스토어) |
| `생성형 AI 역량과 한계` | `Generative AI Capabilities and Limitations` | `Capacidades e Limitações da IA Generativa` | `Capacidades y Limitaciones de la IA Generativa` | `生成AIの能力と限界` | 할루시네이션·비결정성·해석 가능성 등 GenAI 제약, 모델 선택 기준, 비용·지연·품질 트레이드오프 (D2 Task 2.2) | 할루시네이션(hallucination), 편향(bias), 비결정성(nondeterminism), 컨텍스트 윈도우 한계, 해석 가능성 문제, 모델 크기 vs 비용 트레이드오프, RAG를 통한 환각 완화, 지식 컷오프, 모델 선택 기준(정확도/속도/비용/모달리티), 적응성(adaptability), 그라운딩(grounding) |
| `AWS GenAI 인프라와 서비스` | `AWS GenAI Infrastructure and Services` | `Infraestrutura e Serviços de GenAI da AWS` | `Infraestructura y Servicios de GenAI de AWS` | `AWSのGenAIインフラとサービス` | Amazon Bedrock·SageMaker JumpStart·Amazon Q·Bedrock Data Automation·PartyRock 선택·활용, 인프라 비용 최적화 (D2 Task 2.3) | Amazon Bedrock, Bedrock 모델 호출 API, Amazon SageMaker JumpStart, Amazon Q Business, Amazon Q Developer, Amazon Bedrock Data Automation, PartyRock, Bedrock Model Catalog, 추론 비용, 온디맨드 vs 프로비저닝 처리량(Provisioned Throughput), 토큰 기반 요금, 리전 가용성, 멀티리전 Inference Profile |
| `FM 애플리케이션 설계와 RAG` | `FM Application Design and RAG` | `Design de Aplicações FM e RAG` | `Diseño de Aplicaciones FM y RAG` | `FMアプリケーション設計とRAG` | FM 기반 앱 아키텍처 설계, RAG+Bedrock Knowledge Bases, 벡터 DB 선택, Bedrock Agents·Agentic AI 설계 (D3 Task 3.1) | Amazon Bedrock Knowledge Bases, RAG(검색 증강 생성), 벡터 데이터베이스 선택(OpenSearch/Aurora PostgreSQL/Neptune/RDS), Amazon Bedrock Agents, 멀티스텝 태스크 자동화, 에이전트 오케스트레이션, 도구 사용(tool use), Agentic AI 아키텍처, 컨텍스트 그라운딩, FM 모델 선택 기준(비용/모달리티/지연/다국어/크기), 프롬프트 캐싱, 인퍼런스 파라미터(temperature) |
| `프롬프트 엔지니어링과 보안` | `Prompt Engineering and Security` | `Engenharia de Prompt e Segurança` | `Ingeniería de Prompts y Seguridad` | `プロンプトエンジニアリングとセキュリティ` | 프롬프트 기법(Zero/Few-shot·Chain-of-thought), Bedrock Guardrails, 프롬프트 인젝션·하이재킹·탈옥 방어 (D3 Task 3.2) | Zero-shot 프롬프트, Few-shot 프롬프트, Chain-of-thought(CoT), 시스템 프롬프트, 역할 부여(role prompting), 프롬프트 템플릿, 음성 프롬프트(negative prompts), Amazon Bedrock Guardrails, 콘텐츠 필터링, 주제 거부, 민감 정보 마스킹(PII), 워드 필터, 프롬프트 인젝션(injection), 프롬프트 하이재킹(hijacking), 탈옥(jailbreak), 프롬프트 라우팅 |
| `FM 훈련·파인튜닝·평가` | `FM Training, Fine-tuning, and Evaluation` | `Treinamento, Fine-tuning e Avaliação de FM` | `Entrenamiento, Fine-tuning y Evaluación de FM` | `FMのトレーニング・ファインチューニング・評価` | Instruction tuning·도메인 적응·RLHF·파인튜닝 데이터 준비, ROUGE·BLEU·BERTScore·Bedrock Model Evaluation (D3 Task 3.3+3.4) | Instruction tuning, 도메인 적응(domain adaptation), 지속적 사전 학습(continuous pre-training), RLHF(인간 피드백 강화학습), LoRA, PEFT(파라미터 효율적 파인튜닝), 파인튜닝 데이터 큐레이션, 데이터 대표성, 데이터 레이블링, ROUGE, BLEU, BERTScore, Amazon Bedrock Model Evaluation, 인간 평가 vs 자동 평가, 벤치마크 데이터셋, AWS Trainium, AWS Inferentia, SageMaker Training Jobs |
| `책임 있는 AI와 공정성` | `Responsible AI and Fairness` | `IA Responsável e Equidade` | `IA Responsable y Equidad` | `責任あるAIと公平性` | 편향 감지·완화, 공정성 지표, 포용성·안전성, SageMaker Clarify, Augmented AI, Bedrock Guardrails(콘텐츠 안전) (D4 Task 4.1) | 편향(bias), 공정성(fairness), 포용성(inclusivity), 안전성(safety), 강건성(robustness), 샘플링 편향, 레이블링 편향, 인구 집단별 영향, Amazon SageMaker Clarify, Amazon Augmented AI(A2I), 인간 검토 루프(human-in-the-loop), Amazon Bedrock Guardrails(콘텐츠 필터·편향 완화), SageMaker Model Monitor(공정성), 법적 위험, 지식재산권 침해, 데이터셋 다양성·균형 |
| `AI 투명성·설명 가능성·거버넌스` | `AI Transparency, Explainability, and Governance` | `Transparência, Explicabilidade e Governança de IA` | `Transparencia, Explicabilidad y Gobernanza de IA` | `AIの透明性・説明可能性・ガバナンス` | 설명 가능 AI 설계, Model Cards, 거버넌스 프레임워크, 규정 준수(Config·Audit Manager·CloudTrail), AI 시스템 보안, 데이터 주권 (D4 Task 4.2 + D5 전체) | SageMaker Model Cards, 설명 가능성(explainability), 해석 가능성(interpretability), 투명성(transparency), AWS Config, AWS Audit Manager, AWS Artifact, AWS CloudTrail, Amazon Inspector, AWS Trusted Advisor, Amazon Macie, IAM(역할 기반 접근), VPC PrivateLink(AI 서비스 네트워크 격리), 데이터 계보(data lineage), 데이터 라이프사이클 관리, 규정 준수(GDPR·HIPAA), 모델 거버넌스, 데이터 주권, 암호화(전송 중·저장 중), KMS, 공유 책임 모델, 환경 지속 가능성 |

---

## 태그 선택 기준

1. 문제의 **핵심 주제**를 기준으로 선택 (보기 내용이 아닌 질문이 무엇을 묻는지)
2. ML 알고리즘 원리·학습 유형·신경망 구조·추론 방식 개념 → `AI·ML 개념과 알고리즘`
3. "어떤 AWS 서비스/ML 기법을 선택해야 하는가?" 형태의 비즈니스 적용 문제 → `AI 실용 사례와 서비스 선택`
4. 데이터 전처리·피처 엔지니어링·모델 훈련 파이프라인·MLOps → `ML 개발 수명 주기`
5. 토큰·임베딩·벡터·LLM/FM 구조·확산 모델·멀티모달 개념 → `생성형 AI 개념과 구조`
6. 할루시네이션·모델 선택 트레이드오프·비결정성·GenAI 능력/제약 → `생성형 AI 역량과 한계`
7. Bedrock·SageMaker JumpStart·Amazon Q·PartyRock 선택·비교·비용 → `AWS GenAI 인프라와 서비스`
8. RAG 아키텍처·Bedrock Knowledge Bases·Bedrock Agents 설계 → `FM 애플리케이션 설계와 RAG`
9. 프롬프트 기법(Zero/Few-shot·CoT)·Guardrails·프롬프트 공격 방어 → `프롬프트 엔지니어링과 보안`
10. 파인튜닝·RLHF·LoRA·PEFT·모델 평가 지표(ROUGE·BLEU) → `FM 훈련·파인튜닝·평가`
11. 편향 감지·SageMaker Clarify·A2I·공정성 지표·데이터 대표성 → `책임 있는 AI와 공정성`
12. Model Cards·설명 가능성·규정 준수 프레임워크·감사 로그·IAM·암호화·데이터 거버넌스 → `AI 투명성·설명 가능성·거버넌스`

**경계 모호 케이스:**

13. Bedrock Guardrails:
    - **프롬프트 공격 방어(인젝션·탈옥·하이재킹)** 목적 → `프롬프트 엔지니어링과 보안`
    - **콘텐츠 안전 필터·편향 완화·독성 콘텐츠 차단** 목적 → `책임 있는 AI와 공정성`
14. RAG:
    - **환각 완화·지식 최신성 유지 개념** 목적 → `생성형 AI 역량과 한계`
    - **Bedrock Knowledge Bases 아키텍처 설계·벡터 DB 선택** 목적 → `FM 애플리케이션 설계와 RAG`
15. 프롬프트 인젝션:
    - **보안 위협·데이터 침해 방어** 맥락 → `AI 투명성·설명 가능성·거버넌스`
    - **프롬프트 기법·Guardrails 설정** 맥락 → `프롬프트 엔지니어링과 보안`
16. SageMaker Clarify:
    - **편향 탐지·공정성 지표** 목적 → `책임 있는 AI와 공정성`
    - **모델 설명 가능성·투명성 보고** 목적 → `AI 투명성·설명 가능성·거버넌스`
