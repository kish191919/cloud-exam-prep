-- ============================================================
-- AWS Certified AI Practitioner (AIF-C01) 세트 1
-- 도메인: AI 솔루션의 보안, 규정 준수 및 거버넌스 - 예상 기출문제 7개 (문제 44-50)
-- Supabase SQL Editor에서 실행하세요
-- ============================================================


-- ── 문제 44: AWS 공동 책임 모델과 AI 보안 ─────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, ref_links)
VALUES (
  'awsaifc01-q144',
  'aws-aif-c01',
  '한 스타트업이 Amazon Bedrock과 Amazon SageMaker를 사용하여 AI 솔루션을 구축하고 있습니다. 보안팀이 "AI 시스템에서 AWS와 우리 회사가 각각 어떤 보안 책임을 지는가?"라는 질문을 제기했습니다.

다음 중 AWS 공동 책임 모델(Shared Responsibility Model)이 AI 솔루션에 적용되는 방식을 가장 올바르게 설명한 것은?',
  'b',
  'AWS 공동 책임 모델은 AI 솔루션에도 동일하게 적용됩니다.

AWS의 책임 (클라우드 보안, Security OF the Cloud):
• 데이터센터 물리적 보안 (건물, 서버, 전원, 냉각)
• 글로벌 인프라 네트워크 보안
• 하이퍼바이저 및 가상화 레이어 보안
• Amazon Bedrock 기반 모델(Foundation Model) 인프라 보안
• AWS 서비스 자체의 패치 및 보안 업데이트

고객의 책임 (클라우드 내 보안, Security IN the Cloud):
• IAM 역할, 정책, 권한 설정 (최소 권한 원칙)
• 훈련 데이터 암호화 및 접근 제어
• AI 모델 출력 안전성 검증
• 프롬프트 인젝션 방어 구현
• Amazon Bedrock Guardrails 구성
• SageMaker 엔드포인트 네트워크 구성
• 애플리케이션 레이어 보안

핵심 원칙: AWS가 인프라를 보호하고, 고객은 그 위에서 실행하는 AI 워크로드의 보안을 책임집니다.',
  2,
  'AWS 공동 책임 모델 (AI 관점):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AWS 책임 (Security OF the Cloud):
• 물리적 인프라 보안
• 네트워크, 스토리지, 컴퓨팅 하드웨어
• 관리형 서비스 운영 (Bedrock, SageMaker 인프라)
• AWS 글로벌 인프라 패치 및 관리
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
고객 책임 (Security IN the Cloud):
• IAM: 역할(Role), 정책(Policy), 권한(Permission)
• 데이터 암호화 (저장 시: KMS, 전송 중: TLS)
• 네트워크 구성 (VPC, Security Group, NaCL)
• AI 특화 보안:
  - 프롬프트 인젝션 방지
  - 모델 출력 검증
  - Bedrock Guardrails 설정
  - 훈련 데이터 접근 제어
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Bedrock 특화 공동 책임:
• AWS: FM 인프라, API 보안, 기본 모델 무결성
• 고객: API 키 관리, 프롬프트 설계, 출력 검증',
  '[{"name": "AWS 공동 책임 모델", "url": "https://aws.amazon.com/compliance/shared-responsibility-model/"}, {"name": "Amazon Bedrock 보안", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/security.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q144', 'a', 'AWS가 IAM 구성과 데이터 암호화 포함 모든 보안을 담당하므로 고객은 별도의 보안 설정이 불필요하다', 'AWS는 인프라 보안만 담당합니다. IAM, 데이터 암호화, AI 모델 보안 구성은 고객의 책임입니다.', 1),
  ('awsaifc01-q144', 'b', 'AWS는 클라우드 인프라(물리적 보안, 네트워크, 하이퍼바이저) 보안을 담당하고, 고객은 IAM 역할·정책, 훈련 데이터 암호화, 프롬프트 인젝션 방어, 모델 출력 검증, Bedrock Guardrails 구성을 책임진다', '공동 책임 모델의 정확한 적용입니다. AWS가 인프라를, 고객이 AI 워크로드 보안을 책임집니다.', 2),
  ('awsaifc01-q144', 'c', '고객이 데이터센터 물리적 보안을 포함한 모든 보안 책임을 진다', '물리적 인프라 보안은 AWS의 책임입니다. 고객은 클라우드 내 워크로드 보안만 담당합니다.', 3),
  ('awsaifc01-q144', 'd', '생성형 AI 서비스에는 공동 책임 모델이 적용되지 않고 완전히 새로운 보안 모델이 필요하다', '공동 책임 모델은 Amazon Bedrock, SageMaker 포함 모든 AWS 서비스에 적용됩니다. AI 서비스라고 예외는 없습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q144', 'AI 솔루션의 보안, 규정 준수 및 거버넌스');


-- ── 문제 45: Amazon Macie + AWS PrivateLink + 암호화 (AI 데이터 보안) ──
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, ref_links)
VALUES (
  'awsaifc01-q145',
  'aws-aif-c01',
  '한 의료 기업이 환자 데이터로 질병 예측 AI 모델을 훈련하려 합니다. 보안팀이 다음 세 가지 보안 요구사항을 제시했습니다.

[보안 요구사항]
• 요구 1: S3에 저장된 훈련 데이터에 환자 이름, 주민번호, 진단 코드 등 민감 정보가 포함되어 있는지 자동으로 탐지해야 한다
• 요구 2: SageMaker 훈련 작업이 S3 데이터에 접근할 때 트래픽이 공용 인터넷을 경유하지 않아야 한다
• 요구 3: 저장 중인 데이터(at-rest)와 전송 중인 데이터(in-transit) 모두 암호화되어야 한다

다음 중 각 요구사항에 적합한 AWS 서비스를 올바르게 매칭한 것은?',
  'c',
  '각 요구사항에 대한 서비스 매핑:

요구 1 (PII/PHI 자동 탐지) → Amazon Macie:
Macie는 머신러닝을 사용하여 S3 버킷의 민감 데이터(이름, 주민번호, 신용카드, PHI 등)를 자동으로 탐지하고 분류합니다. HIPAA 규정 준수에 필수적인 PHI(Protected Health Information) 탐지가 가능합니다.

요구 2 (인터넷 우회 없는 프라이빗 연결) → AWS PrivateLink / VPC 엔드포인트:
AWS PrivateLink를 통해 SageMaker가 S3에 접근할 때 트래픽이 AWS 내부 네트워크만 사용합니다. 공용 인터넷을 통하지 않으므로 데이터 유출 위험이 줄어듭니다.

요구 3 (저장·전송 중 암호화) → AWS KMS + TLS:
AWS KMS(Key Management Service)로 S3 데이터 저장 암호화를 관리하고, TLS/SSL로 데이터 전송 중 암호화를 보장합니다. S3의 SSE-KMS 옵션으로 고객 관리 키를 사용할 수 있습니다.',
  3,
  'AI 데이터 보안 핵심 도구:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Macie:
• ML 기반 S3 민감 데이터 자동 탐지
• PII: 이름, SSN, 신용카드, 이메일 탐지
• PHI: 환자 ID, 진단 코드, 의료 기록
• 규정 준수: HIPAA, GDPR, PCI-DSS 지원
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AWS PrivateLink / VPC 엔드포인트:
• AWS 서비스 간 프라이빗 연결
• 트래픽이 공용 인터넷 미경유
• SageMaker ↔ S3, SageMaker ↔ Bedrock 연결
• 데이터 유출 경로 최소화
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
암호화 (Encryption):
• 저장 시 (At-rest): AWS KMS로 S3 SSE-KMS
• 전송 중 (In-transit): TLS 1.2/1.3
• Amazon SageMaker: 노트북, 훈련 볼륨 자동 암호화
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
추가 보안 도구:
• Amazon GuardDuty: 위협 탐지
• AWS Security Hub: 보안 상태 통합 대시보드
• Amazon Inspector: EC2/컨테이너 취약성 스캔',
  '[{"name": "Amazon Macie", "url": "https://aws.amazon.com/macie/"}, {"name": "AWS PrivateLink", "url": "https://aws.amazon.com/privatelink/"}, {"name": "SageMaker 데이터 보안", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/security.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q145', 'a', '요구1-Amazon GuardDuty, 요구2-AWS WAF, 요구3-Amazon CloudFront', 'GuardDuty는 위협 탐지 서비스이지 PII 탐지가 아니며, WAF는 웹 방화벽, CloudFront는 CDN입니다. 세 요구사항 모두 잘못 매핑되었습니다.', 1),
  ('awsaifc01-q145', 'b', '요구1-AWS Config, 요구2-Amazon VPC Peering, 요구3-S3 퍼블릭 접근 차단', 'AWS Config는 구성 모니터링이지 PII 탐지가 아니며, VPC Peering은 VPC 간 연결이고, 퍼블릭 접근 차단은 암호화가 아닙니다.', 2),
  ('awsaifc01-q145', 'c', '요구1-Amazon Macie(S3 PII/PHI 자동 탐지), 요구2-AWS PrivateLink/VPC 엔드포인트(인터넷 미경유 프라이빗 연결), 요구3-AWS KMS + TLS(저장 및 전송 중 암호화)', '세 요구사항에 정확히 매핑됩니다: Macie→PII 탐지, PrivateLink→프라이빗 연결, KMS+TLS→암호화.', 3),
  ('awsaifc01-q145', 'd', '의료 데이터는 클라우드에서 처리할 수 없으므로 온프레미스에서만 AI 훈련을 수행해야 한다', 'AWS는 HIPAA BAA(Business Associate Agreement)를 지원하며, 적절한 보안 구성으로 의료 데이터를 클라우드에서 안전하게 처리할 수 있습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q145', 'AI 솔루션의 보안, 규정 준수 및 거버넌스');


-- ── 문제 46: 데이터 계보·카탈로그화 + SageMaker Model Cards ──
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, ref_links)
VALUES (
  'awsaifc01-q146',
  'aws-aif-c01',
  '한 은행이 Amazon SageMaker로 대출 부정 탐지 AI 모델을 구축하고 금융감독원 감사를 준비 중입니다. 감사관이 다음 사항의 증명을 요구하고 있습니다.

[감사 요구사항]
① 훈련 데이터는 어디서 수집되었으며, 어떤 경로로 처리되었는가?
② 데이터가 수집 후 변조되지 않았음을 어떻게 증명하는가?
③ 어떤 데이터 버전으로 어떤 모델을 훈련했는가?
④ 모델의 훈련 데이터, 성능 지표, 편향 평가, 사용 제한을 종합적으로 문서화한 자료가 있는가?

다음 중 이 감사 요구사항을 충족하는 데이터 계보(Data Lineage) 및 문서화 접근 방식은?',
  'b',
  '금융 규제 AI 감사를 위한 데이터 계보 및 문서화:

① 데이터 출처 및 경로 → AWS Glue Data Catalog:
Glue Data Catalog는 데이터 소스(RDS, S3, DynamoDB 등), 테이블 스키마, 변환 작업(ETL)을 중앙 메타데이터 저장소에 등록합니다. 데이터가 어디서 왔고 어떻게 변환됐는지 추적 가능합니다.

② 데이터 변조 방지 증명 → AWS CloudTrail + S3 객체 잠금:
CloudTrail은 모든 S3 API 호출(업로드, 수정, 삭제)을 기록합니다. S3 Object Lock(WORM)으로 데이터를 변경 불가능하게 보호합니다.

③ 데이터 버전-모델 연결 → Amazon SageMaker Experiments + SageMaker Feature Store:
SageMaker Experiments는 각 훈련 실행에서 사용된 데이터 버전, 하이퍼파라미터, 메트릭을 자동 추적합니다.

④ 종합 모델 문서화 → Amazon SageMaker Model Cards:
Model Cards는 훈련 데이터, 성능 지표, 편향 평가, 의도된 사용 사례, 사용 제한을 한 문서에 표준화하여 제공합니다.',
  3,
  '데이터 계보 (Data Lineage) 개념:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 계보 (Data Lineage):
• 데이터의 출처, 이동 경로, 변환 이력 추적
• 규제 감사, 오류 추적, 신뢰성 확보에 필수
• 구성: 원본 소스 → 수집 → 변환 → 훈련 → 모델
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AWS Glue Data Catalog:
• 중앙 메타데이터 저장소
• 테이블 스키마, 파티션, ETL 작업 이력 기록
• Amazon Athena, SageMaker와 통합
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon SageMaker Model Cards:
• 모델 목적 및 의도된 사용 사례
• 훈련 데이터 출처 및 특성
• 평가 결과 및 성능 지표
• 편향 평가 결과
• 알려진 한계 및 사용 제한
• 라이선스 및 IP 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
소스 인용 (Source Citation):
• AI 출력이 어떤 데이터/문서를 근거로 했는지 명시
• RAG 시스템: 검색된 문서 출처 자동 인용
• 규제 AI: 훈련 데이터 출처 증명 필수',
  '[{"name": "AWS Glue Data Catalog", "url": "https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html"}, {"name": "Amazon SageMaker Model Cards", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/model-cards.html"}, {"name": "SageMaker Experiments", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/experiments.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q146', 'a', '훈련 데이터를 S3에 저장하면 자동으로 모든 데이터 계보와 변환 이력이 추적된다', 'S3 저장만으로는 데이터 계보가 자동으로 기록되지 않습니다. Glue Data Catalog, CloudTrail, SageMaker Experiments 등 별도 도구가 필요합니다.', 1),
  ('awsaifc01-q146', 'b', 'AWS Glue Data Catalog로 데이터 출처·변환 이력 카탈로그화, CloudTrail로 데이터 접근·수정 감사 추적, SageMaker Experiments로 데이터 버전-모델 연결, SageMaker Model Cards로 종합 모델 문서화를 수행한다', '4가지 감사 요구사항을 적절한 AWS 도구로 정확히 충족합니다: 계보 추적, 변조 방지, 버전 연결, 종합 문서화.', 2),
  ('awsaifc01-q146', 'c', '데이터 계보 추적은 규제 기관이 직접 AWS에 요청해야 받을 수 있다', '데이터 계보는 고객이 자체적으로 구성하고 관리해야 합니다. AWS가 자동으로 제공하지 않습니다.', 3),
  ('awsaifc01-q146', 'd', '각 데이터 파일에 텍스트 파일로 출처를 기록하는 수동 방식으로 충분하다', '수동 텍스트 기록은 확장성, 일관성, 자동화가 없어 규제 감사 요구사항을 충족하기 어렵습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q146', 'AI 솔루션의 보안, 규정 준수 및 거버넌스');


-- ── 문제 47: 보안 데이터 엔지니어링 모범 사례 ─────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, ref_links)
VALUES (
  'awsaifc01-q147',
  'aws-aif-c01',
  '한 이커머스 기업이 고객 구매 데이터로 개인화 추천 AI를 구축하고 있습니다. 보안 아키텍트가 다음 네 가지 보안 데이터 엔지니어링 요구사항을 제시했습니다.

[보안 요구사항]
• 요구 A: 훈련 데이터에서 고객 이름, 이메일, 결제 정보 등 PII를 제거하거나 보호해야 한다
• 요구 B: 데이터 과학팀만 훈련 데이터에 접근할 수 있고, 마케팅팀은 접근 불가해야 한다
• 요구 C: 훈련 데이터가 수집 후 무단으로 변경되지 않았음을 검증해야 한다
• 요구 D: 훈련 데이터의 완성도, 정확성, 일관성을 측정하여 저품질 데이터를 제거해야 한다

다음 중 각 요구사항에 가장 적합한 보안 데이터 엔지니어링 기법을 올바르게 매칭한 것은?',
  'a',
  '보안 데이터 엔지니어링 기법 매핑:

요구 A (PII 보호) → 프라이버시 강화 기술 (Privacy-Enhancing Technologies, PETs):
• 익명화(Anonymization): 식별 정보를 복구 불가능하게 제거
• 가명화(Pseudonymization): 실제 ID를 토큰으로 대체 (역변환 가능)
• 차등 프라이버시(Differential Privacy): 통계적 노이즈 추가
• 합성 데이터(Synthetic Data): 실제 데이터 패턴을 가진 가상 데이터 생성
• Amazon Macie + Lambda로 PII 자동 탐지 및 마스킹 자동화

요구 B (접근 제어) → IAM 역할 기반 접근 제어 + AWS Lake Formation:
IAM 역할로 데이터 과학팀에만 S3 훈련 데이터 접근 권한 부여. AWS Lake Formation으로 데이터 레이크 레벨에서 세밀한 접근 제어.

요구 C (데이터 무결성) → 체크섬/해싱 + S3 Object Lock:
데이터 수집 시 SHA-256 체크섬을 생성하고 정기적으로 검증합니다. S3 Object Lock(WORM)으로 훈련 데이터를 변경 불가능하게 보호합니다.

요구 D (데이터 품질 평가) → AWS Glue DataBrew + SageMaker Data Wrangler:
자동 데이터 프로파일링으로 결측값, 중복, 이상값을 탐지하고 저품질 데이터를 제거합니다.',
  3,
  '보안 데이터 엔지니어링 핵심 원칙:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
프라이버시 강화 기술 (PETs):
• 익명화: 복구 불가능한 PII 제거
• 가명화: 토큰으로 ID 대체 (역변환 가능)
• 합성 데이터: 실제 패턴 기반 가상 데이터
• 차등 프라이버시: 노이즈 추가로 개인 추론 방지
• k-익명성: k개 레코드가 동일한 속성 보유
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 접근 제어:
• IAM: 역할, 정책, 최소 권한 원칙
• AWS Lake Formation: 테이블/열 수준 접근 제어
• S3 버킷 정책: 서비스/사용자별 접근 제한
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 무결성 (Data Integrity):
• 체크섬 (Checksum): 파일 해시 생성·검증
• S3 Object Lock: WORM 방식 변경 방지
• 버전 관리: 모든 변경 이력 보존
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 품질 평가:
• AWS Glue DataBrew: 데이터 프로파일링
• SageMaker Data Wrangler: EDA 및 변환
• 지표: 완성도, 정확성, 일관성, 최신성',
  '[{"name": "SageMaker 데이터 준비", "url": "https://aws.amazon.com/sagemaker/data-wrangler/"}, {"name": "AWS Lake Formation 접근 제어", "url": "https://aws.amazon.com/lake-formation/"}, {"name": "AWS 프라이버시 강화 기술", "url": "https://aws.amazon.com/machine-learning/responsible-ai/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q147', 'a', '요구A-프라이버시 강화 기술(익명화·가명화), 요구B-IAM 역할 기반 최소 권한 접근 제어, 요구C-체크섬/해싱·S3 Object Lock으로 무결성 검증, 요구D-AWS Glue DataBrew로 데이터 품질 평가', '4가지 요구사항에 정확히 매핑됩니다: PETs→PII 보호, IAM→접근 제어, 체크섬/WORM→무결성, DataBrew→품질 평가.', 1),
  ('awsaifc01-q147', 'b', '요구A-S3 버킷 암호화, 요구B-VPN 연결, 요구C-데이터 백업, 요구D-수동 데이터 검토', 'S3 암호화는 PII 제거가 아니고, VPN은 접근 제어가 아니며, 백업은 무결성 검증이 아닙니다. 모두 적절하지 않습니다.', 2),
  ('awsaifc01-q147', 'c', '데이터 보안은 AI 모델 성능에 영향을 주므로 훈련 완료 후 배포 단계에서만 고려하면 된다', '데이터 보안은 수집 단계부터 적용해야 합니다. 배포 후 적용은 이미 훈련된 모델의 데이터 취약성을 해결할 수 없습니다.', 3),
  ('awsaifc01-q147', 'd', 'PII 포함 원본 데이터로 훈련해야 AI 성능이 최대화되므로 보안 기법 적용은 성능을 저하시킨다', '가명화, 합성 데이터 등 PETs를 적용해도 모델 성능에 미치는 영향은 최소화할 수 있습니다. 법적·윤리적 의무를 성능 저하 핑계로 포기할 수 없습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q147', 'AI 솔루션의 보안, 규정 준수 및 거버넌스');


-- ── 문제 48: AWS 거버넌스·규정 준수 서비스 (Config, CloudTrail, Audit Manager, Inspector, Artifact) ──
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, ref_links)
VALUES (
  'awsaifc01-q148',
  'aws-aif-c01',
  '한 글로벌 핀테크 기업이 AWS에서 운영하는 AI 시스템에 대해 금융 규제 기관의 감사를 준비하고 있습니다. 컴플라이언스팀이 다음 다섯 가지 증거를 제시해야 합니다.

[필요한 증거]
• 증거 1: AI 인프라(EC2, SageMaker, S3)의 구성이 기업 보안 정책을 준수하고 있으며, 무단 변경이 발생하면 즉시 알림을 받는다
• 증거 2: 누가 언제 어떤 AI 모델에 접근하고 어떤 API를 호출했는지에 대한 완전한 감사 추적 기록이 있다
• 증거 3: SOC 2, ISO 27001, PCI-DSS 규정에 대한 준수 증거를 자동으로 수집하고 보고서를 생성한다
• 증거 4: AI 워크로드가 실행되는 EC2 인스턴스와 컨테이너에 알려진 보안 취약성이 없음을 증명한다
• 증거 5: AWS의 SOC 2, ISO 27001 인증서와 HIPAA BAA 계약 사본을 직접 다운로드할 수 있다

다음 중 각 증거를 수집하는 데 가장 적합한 AWS 서비스를 올바르게 매칭한 것은?',
  'c',
  '각 증거에 대한 AWS 거버넌스 서비스 매핑:

증거 1 (구성 준수 모니터링) → AWS Config:
Config는 AWS 리소스의 구성 변경을 지속 기록하고, Config Rules로 원하는 구성 상태와 비교합니다. 비준수 발생 시 SNS로 자동 알림을 보냅니다.

증거 2 (API 감사 추적) → AWS CloudTrail:
CloudTrail은 AWS 계정의 모든 API 호출(콘솔, SDK, CLI)을 S3에 로그로 저장합니다. 누가, 언제, 어디서, 무엇을 했는지 90일 이상 보존 가능합니다.

증거 3 (자동 컴플라이언스 보고서) → AWS Audit Manager:
Audit Manager는 SOC 2, ISO 27001, PCI-DSS, HIPAA 등 규정 프레임워크에 대해 증거를 자동 수집하고 감사 보고서를 생성합니다.

증거 4 (취약성 스캔) → Amazon Inspector:
Inspector는 EC2 인스턴스, 컨테이너, Lambda 함수의 소프트웨어 취약성과 네트워크 노출을 자동으로 스캔합니다.

증거 5 (AWS 인증서 다운로드) → AWS Artifact:
Artifact는 AWS의 보안 및 규정 준수 보고서(SOC, ISO, PCI, HIPAA)와 계약서를 온디맨드로 다운로드할 수 있는 셀프서비스 포털입니다.',
  2,
  'AWS 거버넌스 및 규정 준수 서비스:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AWS Config:
• AWS 리소스 구성 변경 지속 기록
• Config Rules: 원하는 구성 상태 정의
• 비준수 자동 감지 및 SNS 알림
• 시간별 구성 변경 이력 조회
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AWS CloudTrail:
• 모든 AWS API 호출 로그 기록
• 콘솔, SDK, CLI, IAM 활동 추적
• S3에 장기 보존, Athena로 분석
• CloudWatch 통합으로 실시간 경보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AWS Audit Manager:
• SOC 2, ISO 27001, PCI-DSS 등 증거 자동 수집
• 감사 보고서 자동 생성
• 지속적 컴플라이언스 모니터링
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Inspector:
• EC2, ECR 컨테이너, Lambda 취약성 스캔
• CVE(공통 취약성 노출) 자동 탐지
• 네트워크 접근성 분석
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AWS Artifact:
• AWS 보안/규정 준수 보고서 셀프서비스 다운로드
• SOC 1/2/3, ISO 27001, PCI DSS, HIPAA BAA
• NDA 계약 후 민감 보고서 접근
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AWS Trusted Advisor:
• 비용 최적화, 성능, 보안, 내결함성 권고
• 보안 그룹, IAM, MFA, S3 권한 검토',
  '[{"name": "AWS Config", "url": "https://aws.amazon.com/config/"}, {"name": "AWS CloudTrail", "url": "https://aws.amazon.com/cloudtrail/"}, {"name": "AWS Audit Manager", "url": "https://aws.amazon.com/audit-manager/"}, {"name": "Amazon Inspector", "url": "https://aws.amazon.com/inspector/"}, {"name": "AWS Artifact", "url": "https://aws.amazon.com/artifact/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q148', 'a', '증거1-CloudTrail, 증거2-Config, 증거3-Inspector, 증거4-Artifact, 증거5-Audit Manager', 'Config는 구성 준수 모니터링이고, CloudTrail은 API 감사 추적입니다. 증거 1과 2가 바뀌었고, 3, 4, 5도 모두 잘못 매핑되었습니다.', 1),
  ('awsaifc01-q148', 'b', '증거1-Amazon GuardDuty, 증거2-AWS Security Hub, 증거3-Amazon Macie, 증거4-AWS WAF, 증거5-AWS Shield', '이 서비스들은 위협 탐지, 통합 보안, PII 탐지, 웹 방화벽, DDoS 방어 서비스입니다. 거버넌스 요구사항과 맞지 않습니다.', 2),
  ('awsaifc01-q148', 'c', '증거1-AWS Config(구성 준수 모니터링), 증거2-AWS CloudTrail(API 감사 추적), 증거3-AWS Audit Manager(자동 컴플라이언스 보고서), 증거4-Amazon Inspector(취약성 스캔), 증거5-AWS Artifact(AWS 인증서 다운로드)', '5가지 증거가 각 서비스에 정확히 매핑됩니다: Config→구성 준수, CloudTrail→감사 추적, Audit Manager→보고서, Inspector→취약성, Artifact→인증서.', 3),
  ('awsaifc01-q148', 'd', '규정 준수 감사는 AWS가 자동으로 처리하므로 고객이 별도의 거버넌스 서비스를 구성할 필요가 없다', '거버넌스 서비스 구성 및 증거 수집은 고객의 책임입니다. AWS는 도구를 제공하지만 고객이 직접 구성하고 관리해야 합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q148', 'AI 솔루션의 보안, 규정 준수 및 거버넌스');


-- ── 문제 49: 데이터 거버넌스 전략 (레지던시, 수명 주기, 보존, 로깅) ──
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, ref_links)
VALUES (
  'awsaifc01-q149',
  'aws-aif-c01',
  '한 다국적 기업이 유럽(EU)과 한국 고객 데이터로 AI 모델을 훈련하려 합니다. 법무팀이 다음 데이터 거버넌스 요구사항을 제시했습니다.

[데이터 거버넌스 요구사항]
• 요구 1: EU 고객 데이터는 반드시 EU 내 AWS 리전(예: eu-central-1)에만 저장되어야 한다 (GDPR Article 44)
• 요구 2: 한국 고객 데이터는 국내 법령에 따라 국내 리전(ap-northeast-2)에 보관되어야 한다
• 요구 3: AI 훈련에 사용된 개인 데이터는 목적 달성 후 3년 이내에 삭제되어야 한다
• 요구 4: 모든 데이터 접근 기록은 7년간 보존되어야 한다 (금융 감사 요구사항)
• 요구 5: 비정상적인 데이터 접근 패턴(대량 다운로드, 심야 접근)을 실시간 탐지해야 한다

다음 중 이 데이터 거버넌스 전략을 AWS에서 구현하는 가장 적절한 방법은?',
  'b',
  '종합 데이터 거버넌스 전략 구현:

요구 1,2 (데이터 레지던시) → S3 버킷 리전 지정 + SCP(서비스 제어 정책):
• EU 데이터: eu-central-1 리전 S3 버킷 전용
• 한국 데이터: ap-northeast-2 리전 S3 버킷 전용
• AWS Organizations SCP로 데이터를 지정 리전 외 복사 금지
• S3 Object Replication 비활성화로 교차 리전 복제 방지

요구 3 (데이터 수명 주기) → S3 Lifecycle Policy:
S3 수명 주기 규칙으로 3년 후 자동 삭제(Expiration) 또는 Glacier로 이동 후 삭제를 구성합니다.

요구 4 (로그 보존) → AWS CloudTrail + S3 Object Lock:
CloudTrail 로그를 S3에 전송하고, S3 Object Lock(Compliance Mode)으로 7년간 삭제 불가하게 보호합니다.

요구 5 (비정상 접근 탐지) → Amazon GuardDuty + Amazon Macie:
GuardDuty는 CloudTrail 이벤트를 분석하여 비정상적인 IAM 활동, S3 대량 다운로드를 탐지합니다. Macie는 S3의 민감 데이터 접근 패턴을 모니터링합니다.',
  3,
  '데이터 거버넌스 전략 핵심 요소:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 레지던시 (Data Residency):
• 데이터가 물리적으로 저장되는 리전 제어
• AWS 리전별 S3 버킷 분리
• SCP로 교차 리전 데이터 이동 방지
• 관련 규정: GDPR, 개인정보보호법, KISA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 수명 주기 (Data Lifecycle):
• 생성 → 활성 사용 → 아카이빙 → 삭제
• S3 Lifecycle Policy: 자동 이전/삭제
• Glacier: 장기 저비용 아카이빙
• 데이터 최소화 원칙: 필요 기간만 보존
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 로깅 및 보존 (Logging & Retention):
• AWS CloudTrail: 모든 API 접근 기록
• S3 Object Lock: 로그 삭제 방지 (WORM)
• Compliance Mode: 관리자도 삭제 불가
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 관찰성 (Data Observability):
• Amazon GuardDuty: 위협 및 비정상 행동 탐지
• Amazon Macie: S3 민감 데이터 모니터링
• AWS Security Hub: 통합 보안 상태 뷰
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCP (Service Control Policy):
• AWS Organizations 레벨에서 모든 계정에 제약
• 특정 리전만 허용, 특정 서비스 차단 가능',
  '[{"name": "S3 수명 주기 정책", "url": "https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html"}, {"name": "Amazon GuardDuty", "url": "https://aws.amazon.com/guardduty/"}, {"name": "AWS Organizations SCP", "url": "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q149', 'a', '모든 데이터를 단일 글로벌 S3 버킷에 저장하고 IAM 정책으로 국가별 접근을 제어하면 데이터 레지던시 요구사항을 충족할 수 있다', 'IAM 접근 제어는 데이터의 물리적 저장 위치를 제어하지 않습니다. 데이터 레지던시는 데이터가 실제로 저장된 리전을 의미하므로 리전별 분리가 필수입니다.', 1),
  ('awsaifc01-q149', 'b', 'EU/한국 리전별 S3 버킷 분리 + SCP로 교차 리전 복제 방지, S3 Lifecycle Policy로 3년 후 자동 삭제, CloudTrail 로그를 S3 Object Lock으로 7년 보존, Amazon GuardDuty로 비정상 접근 실시간 탐지를 조합한 종합 데이터 거버넌스 전략을 수립한다', '5가지 요구사항을 적절한 AWS 서비스로 종합적으로 충족합니다: 레지던시, 수명주기, 로그 보존, 비정상 탐지가 모두 포함됩니다.', 2),
  ('awsaifc01-q149', 'c', '데이터 레지던시 요구사항은 법적 요구사항이므로 기술팀이 아닌 법무팀만 처리하면 된다', '데이터 레지던시는 기술적으로 구현해야 합니다. 법무팀이 요구사항을 정의하지만, 실제 S3 리전 구성, SCP 설정 등은 기술팀이 수행합니다.', 3),
  ('awsaifc01-q149', 'd', 'AWS가 자동으로 GDPR 준수를 보장하므로 고객이 별도 데이터 레지던시 구성을 할 필요가 없다', 'AWS는 데이터 레지던시 도구를 제공하지만, 실제 구성(어떤 리전에 데이터를 저장할지, SCP 설정 등)은 고객의 책임입니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q149', 'AI 솔루션의 보안, 규정 준수 및 거버넌스');


-- ── 문제 50: 생성형 AI Security Scoping Matrix + 거버넌스 프레임워크 ──
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, ref_links)
VALUES (
  'awsaifc01-q150',
  'aws-aif-c01',
  '한 대기업의 CISO(최고정보보안책임자)가 전사적 GenAI 도입 계획을 검토하고 있습니다. 여러 부서에서 다양한 GenAI 프로젝트를 동시에 진행하려 하는데, 다음과 같은 다양한 사용 사례가 있습니다.

[GenAI 사용 사례]
• 사례 A: 마케팅팀 - ChatGPT/Claude 같은 공개 SaaS AI로 광고 문구 초안 작성
• 사례 B: HR팀 - AWS Bedrock으로 내부 인사 정책 문서를 기반으로 한 직원 Q&A 챗봇 구축
• 사례 C: 법무팀 - 기밀 계약서 분석을 위해 내부 데이터에 자체 FM을 파인튜닝하여 온프레미스 배포
• 사례 D: 고객서비스팀 - AWS Bedrock에서 고객 민원 응대 AI 에이전트, 외부 API와 연동

CISO는 "모든 GenAI 사용 사례에 일관된 보안·거버넌스 기준을 적용하면서도 사례별 위험도 차이를 반영한 프레임워크가 필요하다"고 말합니다.

다음 중 이 상황에 가장 적합한 거버넌스 접근 방식은?',
  'b',
  '생성형 AI Security Scoping Matrix와 종합 거버넌스 프레임워크가 필요합니다.

GenAI Security Scoping Matrix 적용:
배포 모델(SaaS/PaaS/IaaS/자체 호스팅)과 데이터 민감도를 기준으로 각 사용 사례의 보안 범위를 결정합니다.

사례별 분류:
• 사례 A (공개 SaaS + 공개 콘텐츠): 낮은 위험, 데이터 민감도 낮음, 공개 AI 사용 정책만 필요
• 사례 B (PaaS + 내부 데이터): 중간 위험, IAM, Bedrock 설정, Guardrails 적용
• 사례 C (자체 호스팅 + 기밀 데이터): 높은 위험, 완전한 보안 스택, 암호화, 접근 제어, 온프레미스 격리
• 사례 D (PaaS + 고객 데이터 + 외부 API): 높은 위험, Bedrock Guardrails, API 보안, 고객 데이터 보호

거버넌스 프레임워크 구성 요소:
1) AI 사용 사례 등록부(Registry): 모든 GenAI 프로젝트 중앙 등록
2) 정기 검토 주기(Review Cycles): 분기별 위험 재평가
3) 투명성 표준(Transparency Standards): AI 사용 사실 공개, 소스 인용
4) 팀 교육 요구사항(Training): 개발자, 비즈니스 사용자, 임원 교육
5) 정책 및 절차: GenAI 사용 허용/금지 기준 문서화',
  3,
  '생성형 AI Security Scoping Matrix:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scoping Matrix 두 축:
1) 배포 모델: SaaS → PaaS → IaaS → 자체 호스팅
   (보안 책임 증가 →)
2) 데이터 민감도: 공개 → 내부 → 기밀 → 극비
   (보안 요구사항 증가 →)

위험 분류에 따른 통제 수준:
• 낮은 위험 (SaaS + 공개 데이터):
  - 사용 정책 수립, 직원 교육
• 중간 위험 (PaaS + 내부 데이터):
  - IAM, 암호화, Guardrails, 감사 로깅
• 높은 위험 (자체 호스팅 + 기밀):
  - 완전한 보안 스택, 격리, 침투 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
거버넌스 프레임워크 구성 요소:
• AI 사용 사례 등록부 (AI Use Case Registry)
• 위험 기반 정책 (Risk-Based Policies)
• 정기 검토 주기 (분기/반기/연간)
• 투명성 표준 (AI 사용 공개, 소스 인용)
• 팀 교육 (개발자, 사용자, 임원)
• AI 윤리 위원회 (AI Ethics Committee)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
관련 AWS 서비스:
• AWS Config + CloudTrail: 거버넌스 감사 추적
• Bedrock Guardrails: 콘텐츠 안전 정책
• IAM + SCPs: 접근 권한 거버넌스
• AWS Security Hub: 통합 보안 뷰',
  '[{"name": "AWS GenAI 보안 가이드", "url": "https://aws.amazon.com/security/generative-ai/"}, {"name": "생성형 AI Security Scoping Matrix", "url": "https://aws.amazon.com/blogs/security/generative-ai-security-scoping-matrix/"}, {"name": "AWS AI/ML 거버넌스", "url": "https://aws.amazon.com/machine-learning/responsible-ai/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q150', 'a', '모든 GenAI 사용 사례에 동일한 최고 수준의 보안을 적용한다. 위험도 분류는 오히려 낮은 기준을 허용할 수 있어 위험하다', '동일한 최고 수준 보안을 모든 사례에 적용하면 저위험 사례에서 혁신이 저해됩니다. 위험도에 비례한 보안이 효율적이고 실용적입니다.', 1),
  ('awsaifc01-q150', 'b', '생성형 AI Security Scoping Matrix로 배포 모델(SaaS/PaaS/자체 호스팅)과 데이터 민감도에 따라 사용 사례를 위험도별로 분류하고, AI 사용 사례 등록부·정기 검토 주기·투명성 표준·팀 교육을 포함한 종합 거버넌스 프레임워크를 수립한다', 'Scoping Matrix로 위험도를 분류하고, 종합 거버넌스 프레임워크로 일관된 기준을 적용하는 것이 다양한 GenAI 사용 사례를 관리하는 최선의 접근 방식입니다.', 2),
  ('awsaifc01-q150', 'c', 'GenAI 보안은 각 팀이 독립적으로 결정하면 된다. 중앙 거버넌스 프레임워크는 혁신을 저해한다', '중앙 거버넌스 없이 각 팀이 독립적으로 결정하면 일관성이 없어 보안 공백이 생깁니다. 거버넌스는 혁신을 막는 것이 아니라 안전한 혁신을 가능하게 합니다.', 3),
  ('awsaifc01-q150', 'd', 'AWS가 GenAI 거버넌스를 자동으로 관리하므로 기업은 별도 프레임워크를 수립할 필요가 없다', 'AWS는 거버넌스 도구(Config, CloudTrail, Audit Manager 등)를 제공하지만, 거버넌스 정책, 검토 주기, 팀 교육 등 프레임워크 자체는 기업이 수립해야 합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q150', 'AI 솔루션의 보안, 규정 준수 및 거버넌스');


-- ── 세트 1에 보안·거버넌스 문제 7개 추가 (sort_order 44-50) ──
INSERT INTO exam_set_questions (set_id, question_id, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q144', 44),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q145', 45),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q146', 46),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q147', 47),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q148', 48),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q149', 49),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q150', 50);
