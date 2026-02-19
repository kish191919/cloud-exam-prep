-- ============================================================
-- AWS Certified AI Practitioner (AIF-C01) 세트 1 추가 문제
-- 도메인: AI 및 ML의 기초 (q151-q155) / GenAI의 기초 (q156-q160) / 파운데이션 모델의 적용 (q161-q165)
-- sort_order: 51-65
-- Supabase SQL Editor에서 실행하세요
-- ============================================================


-- ── 문제 51: SageMaker ML 파이프라인 통합 서비스 생태계 ─────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q151',
  'aws-aif-c01',
  '한 스타트업이 Amazon SageMaker를 사용하여 ML 파이프라인 전체를 자동화하려 합니다. 요구사항은 다음과 같습니다.

[요구사항]
• 요구 1: 원시 데이터를 ML에 적합한 형태로 변환하고 시각적으로 탐색
• 요구 2: 훈련에 사용한 피처(Feature)를 버전 관리하고 온라인/오프라인 서빙으로 재사용
• 요구 3: 모델 훈련, 평가, 배포 단계를 자동화된 워크플로우로 연결
• 요구 4: 훈련된 모델의 버전과 승인 상태를 중앙에서 관리

다음 중 각 요구사항에 맞는 SageMaker 서비스 조합을 올바르게 연결한 것은?',
  'b',
  'Amazon SageMaker는 ML 라이프사이클 전 단계를 커버하는 통합 서비스 생태계를 제공합니다.

각 요구사항에 맞는 SageMaker 서비스:
• 요구 1 → SageMaker Data Wrangler
  - GUI 기반 데이터 전처리 및 피처 엔지니어링
  - 300개 이상의 내장 변환 함수 제공
  - 데이터 시각화 및 품질 분석 기능
  - 코드 없이 데이터 준비 가능

• 요구 2 → SageMaker Feature Store
  - 피처를 온라인 스토어(실시간 서빙)와 오프라인 스토어(배치 훈련)로 저장
  - 피처 그룹(Feature Group)으로 버전 관리
  - 여러 팀/모델에서 피처 재사용 가능
  - 피처 메타데이터 및 계보(Lineage) 추적

• 요구 3 → SageMaker Pipelines
  - ML 워크플로우 정의 및 자동화 (DAG 구조)
  - 데이터 처리 → 훈련 → 평가 → 조건부 승인 → 배포 자동화
  - CI/CD 파이프라인과 통합 가능
  - 파이프라인 실행 이력 및 재현성 보장

• 요구 4 → SageMaker Model Registry
  - 모델 버전 카탈로그 (버전 1.0, 1.1, 2.0 등)
  - 승인/거부 상태 관리 (Approved/Rejected/PendingManualApproval)
  - 스테이징 → 프로덕션 프로모션 워크플로우
  - 모델 메타데이터(훈련 지표, 데이터셋 정보) 저장',
  2,
  'SageMaker ML 서비스 생태계:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
데이터 준비 단계:
• SageMaker Data Wrangler: 시각적 데이터 전처리
• SageMaker Ground Truth: 데이터 레이블링
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
피처 관리:
• SageMaker Feature Store:
  - Online Store: 실시간 낮은 지연 서빙 (ms)
  - Offline Store: S3 기반 배치 훈련용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
훈련 및 자동화:
• SageMaker Training Jobs: 분산 훈련
• SageMaker Pipelines: ML 워크플로우 DAG
• SageMaker Experiments: 실험 추적/비교
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
모델 관리 및 배포:
• SageMaker Model Registry: 버전/승인 관리
• SageMaker Endpoints: 실시간 추론
• SageMaker Batch Transform: 배치 추론
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
모니터링:
• SageMaker Model Monitor: 데이터 드리프트 감지
• SageMaker Clarify: 편향성/설명가능성',
  '{}',
  '[{"name": "SageMaker Data Wrangler", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/data-wrangler.html"}, {"name": "SageMaker Feature Store", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store.html"}, {"name": "SageMaker Pipelines", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/pipelines.html"}, {"name": "SageMaker Model Registry", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/model-registry.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q151', 'a', '요구 1: SageMaker Studio | 요구 2: SageMaker Experiments | 요구 3: AWS Step Functions | 요구 4: S3 버킷', 'SageMaker Studio는 통합 IDE이고, Experiments는 실험 추적 도구입니다. 피처 버전 관리를 위한 Feature Store와 ML 파이프라인 자동화를 위한 Pipelines가 더 적합합니다.', 1),
  ('awsaifc01-q151', 'b', '요구 1: SageMaker Data Wrangler | 요구 2: SageMaker Feature Store | 요구 3: SageMaker Pipelines | 요구 4: SageMaker Model Registry', '각 요구사항에 정확히 맞는 SageMaker 서비스입니다. Data Wrangler(데이터 준비), Feature Store(피처 관리), Pipelines(워크플로우 자동화), Model Registry(모델 버전/승인 관리)는 ML 파이프라인의 핵심 구성요소입니다.', 2),
  ('awsaifc01-q151', 'c', '요구 1: Amazon Glue | 요구 2: SageMaker Feature Store | 요구 3: SageMaker Pipelines | 요구 4: DynamoDB', 'Amazon Glue는 데이터 통합 서비스로 SageMaker와 연동 가능하지만, 시각적 ML 데이터 탐색에는 Data Wrangler가 더 적합합니다. 모델 관리에는 DynamoDB 대신 Model Registry를 사용합니다.', 3),
  ('awsaifc01-q151', 'd', '요구 1: SageMaker Data Wrangler | 요구 2: S3 + DynamoDB | 요구 3: AWS Lambda | 요구 4: SageMaker Experiments', '피처 버전 관리와 온/오프라인 서빙을 위해서는 Feature Store가 필요합니다. ML 파이프라인 자동화는 Lambda보다 Pipelines이 적합하며, 모델 승인 관리에는 Model Registry를 사용합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q151', 'AI 및 ML의 기초');


-- ── 문제 52: 클러스터링 알고리즘 선택 (K-means vs DBSCAN vs 계층적) ────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q152',
  'aws-aif-c01',
  '전자상거래 회사의 데이터 과학자가 수백만 고객의 구매 행동 데이터를 분석하여 자연스러운 고객 세그먼트를 발견하려 합니다.

[분석 조건]
• 조건 1: 사전에 몇 개의 그룹으로 분류될지 알 수 없다
• 조건 2: 모든 고객이 어느 한 그룹에 반드시 속할 필요는 없다 (특이 구매 패턴 고객은 제외 가능)
• 조건 3: 구매 빈도, 평균 구매금액, 최근 구매일, 선호 카테고리 등 다차원 데이터 사용
• 조건 4: 특이한 구매 패턴을 가진 소수의 이상치 고객을 별도로 식별해야 한다

다음 중 이 분석에 가장 적합한 클러스터링 알고리즘은?',
  'c',
  'DBSCAN(Density-Based Spatial Clustering of Applications with Noise)이 이 시나리오에 가장 적합합니다.

DBSCAN의 특징과 이 시나리오와의 적합성:
• 사전에 군집 수 지정 불필요
  - 데이터의 밀도 패턴을 분석하여 자동으로 군집 수 결정
  - MinPts와 epsilon 두 매개변수만 필요

• 이상치(Noise) 자동 탐지
  - 어떤 군집에도 속하지 않는 포인트를 노이즈로 분류
  - 조건 2, 4 동시 충족

• 임의 형태의 군집 탐지 가능
  - 구형이 아닌 불규칙한 형태의 군집도 발견
  - 실제 고객 세그먼트는 구형이 아닐 수 있음

다른 알고리즘과의 비교:
• K-means: 사전에 K(군집 수) 지정 필요, 이상치에 민감, 구형 군집 가정 → 조건 1, 2 불충족
• 계층적 클러스터링: 모든 데이터 포인트가 어느 군집에 속해야 함, 대용량 데이터에 비효율 → 조건 2 불충족
• 가우시안 혼합 모델(GMM): 군집 수 사전 지정 필요, 확률적 소속 제공 → 조건 1 불충족',
  2,
  '클러스터링 알고리즘 비교표:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
K-means:
• 군집 수(K) 사전 지정: 필요
• 이상치 처리: 어려움 (이상치도 군집에 배정)
• 군집 형태: 구형(Spherical) 가정
• 대용량 데이터: 적합
• 파라미터: K만 지정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DBSCAN:
• 군집 수 사전 지정: 불필요
• 이상치 처리: 자동 탐지 (Noise 분류)
• 군집 형태: 임의 형태 가능
• 대용량 데이터: 중간
• 파라미터: epsilon, MinPts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
계층적 클러스터링:
• 군집 수 사전 지정: 불필요 (덴드로그램)
• 이상치 처리: 어려움
• 군집 형태: 임의 형태 가능
• 대용량 데이터: 비효율 (O(n²))
• 파라미터: linkage 방법
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DBSCAN 핵심 개념:
• Core Point: 반경 epsilon 내 MinPts 이상 이웃 보유
• Border Point: Core Point 이웃이지만 자체는 Core 아님
• Noise: 어떤 군집에도 속하지 않는 이상치',
  '{}',
  '[{"name": "Amazon SageMaker K-Means", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/k-means.html"}, {"name": "비지도 학습 클러스터링", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/unsupervised-learning.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q152', 'a', 'K-means 클러스터링 (K=5로 고정하여 5개의 고객 세그먼트 생성)', 'K-means는 K를 사전에 지정해야 합니다. 조건 1(군집 수 미지)을 충족하지 못하며, 이상치를 자동 탐지할 수 없어 조건 2, 4도 충족하지 못합니다.', 1),
  ('awsaifc01-q152', 'b', '계층적 클러스터링 (Ward linkage 방법 사용, 덴드로그램으로 군집 수 결정)', '계층적 클러스터링은 군집 수를 사전 지정하지 않아도 되지만, 모든 데이터 포인트가 어느 군집에 속해야 합니다. 이상치를 별도로 분리하는 기능이 없고 수백만 데이터에 비효율적입니다.', 2),
  ('awsaifc01-q152', 'c', 'DBSCAN (epsilon과 MinPts 파라미터 설정, 밀도 기반 군집 탐지)', 'DBSCAN은 군집 수를 사전 지정하지 않고, 이상치(Noise)를 자동으로 탐지하며, 임의 형태의 군집을 탐지할 수 있습니다. 4가지 조건을 모두 충족하는 최적의 선택입니다.', 3),
  ('awsaifc01-q152', 'd', '가우시안 혼합 모델(GMM) (각 고객을 여러 군집에 확률적으로 소속)', 'GMM도 군집 수를 사전 지정해야 하며, 이상치를 명시적으로 분리하지 않습니다. 조건 1을 충족하지 못합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q152', 'AI 및 ML의 기초');


-- ── 문제 53: 모델 배포 전략 (Canary / Blue-Green / Shadow) ───────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q153',
  'aws-aif-c01',
  '한 핀테크 회사가 새로 개발한 사기 탐지 모델(v2.0)을 운영 중인 기존 모델(v1.0)과 교체하려 합니다.

[배포 요구사항]
• 새 모델의 실제 트래픽 환경에서의 성능을 검증해야 한다
• 초기에는 소량의 트래픽만 새 모델로 라우팅하여 안전성을 확인한다
• 새 모델에서 문제가 발생하면 전체 트래픽을 즉시 기존 모델로 되돌릴 수 있어야 한다
• 점진적으로 트래픽 비율을 높여 최종적으로 완전 전환한다

다음 중 이 요구사항에 가장 적합한 SageMaker 엔드포인트 배포 전략은?',
  'b',
  'Canary 배포(SageMaker 프로덕션 변형)가 이 요구사항에 가장 적합합니다.

Canary 배포 방식:
• 초기: 트래픽의 5-10%만 새 모델(v2.0)로 라우팅, 나머지 90-95%는 기존 모델(v1.0)
• 모니터링: 새 모델의 정밀도, 재현율, 응답 시간 등 메트릭 확인
• 점진적 증가: 문제없으면 20% → 50% → 100%로 점진적 증가
• 즉시 롤백: 문제 발생 시 트래픽 비율을 0%로 즉시 조정

SageMaker 구현: ProductionVariants로 두 모델 버전을 동일 엔드포인트에서 관리하고 InitialVariantWeight로 트래픽 비율 제어

다른 전략과의 비교:
• Blue/Green 배포: 동일 용량의 두 환경을 모두 운영하다 한 번에 전환. 비용이 2배이며, 점진적 비율 조정이 아닌 일괄 전환이 기본
• Shadow 배포: 새 모델이 트래픽을 수신하지만 응답을 사용자에게 전달하지 않음. 실제 트래픽 영향 없이 검증 가능하지만, 실제 운영 성능 측정에 한계
• 즉시 전환(In-place): 롤백이 어렵고 문제 발생 시 전체 사용자에게 영향',
  2,
  'SageMaker 배포 전략 비교:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Canary 배포:
• 트래픽 분산: 소량(5-10%) → 점진 증가
• 롤백: 즉시 (트래픽 비율 0%로 조정)
• 비용: 낮음 (추가 인프라 불필요)
• 실제 트래픽 영향: 있음 (소량)
• 용도: 새 버전의 안전한 점진 롤아웃
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Blue/Green 배포:
• 트래픽 분산: 0% → 100% 일괄 전환
• 롤백: 빠름 (DNS/로드밸런서 전환)
• 비용: 높음 (2배 인프라)
• 실제 트래픽 영향: 전환 후 전체
• 용도: 완전한 환경 분리, 즉각 전환
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shadow 배포:
• 트래픽 분산: 미러링 (사용자 응답 미사용)
• 롤백: 해당 없음 (실제 서빙 X)
• 비용: 중간 (Shadow 인프라 추가)
• 실제 트래픽 영향: 없음
• 용도: 새 버전 성능 테스트 (오프라인)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SageMaker 구현 핵심:
ProductionVariants → InitialVariantWeight 설정',
  '{}',
  '[{"name": "SageMaker 배포 전략", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/deployment-guardrails.html"}, {"name": "SageMaker 프로덕션 변형", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/model-ab-testing.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q153', 'a', 'Shadow 배포 전략 (새 모델이 모든 트래픽을 수신하지만 응답은 실제 서비스에 사용하지 않고 로그만 기록)', 'Shadow 배포는 새 모델의 실제 트래픽 영향 없이 성능을 사전 검증하는 데 유용하지만, 실제 사용자에게 응답을 전달하지 않으므로 "실제 트래픽 환경에서의 성능 검증" 목적에는 한계가 있습니다.', 1),
  ('awsaifc01-q153', 'b', 'Canary 배포 전략 (초기 5-10% 트래픽을 새 모델로 라우팅, 성능 확인 후 점진적으로 비율 증가, 문제 발생 시 즉시 롤백)', 'Canary 배포는 소량 트래픽으로 실제 운영 환경에서 검증, 점진적 비율 증가, 즉시 롤백 가능이라는 모든 요구사항을 충족합니다. SageMaker의 ProductionVariants로 구현됩니다.', 2),
  ('awsaifc01-q153', 'c', 'Blue/Green 배포 전략 (새 모델 환경을 완전히 준비한 후 로드밸런서를 한 번에 전환)', 'Blue/Green은 점진적 비율 조정이 아닌 일괄 전환 방식입니다. 비용이 2배이며, 초기에 소량 트래픽만 라우팅하는 요구사항을 충족하지 못합니다.', 3),
  ('awsaifc01-q153', 'd', '즉시 In-place 교체 (기존 v1.0 모델을 즉시 v2.0으로 교체)', '즉시 교체는 점진적 검증이 불가능하고 문제 발생 시 롤백이 어렵습니다. 금융 사기 탐지처럼 중요한 시스템에서는 부적합합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q153', 'AI 및 ML의 기초');


-- ── 문제 54: Amazon Forecast vs SageMaker (시계열 예측) ────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q154',
  'aws-aif-c01',
  '한 전국 체인 마트의 데이터 분석팀이 500개 매장 × 5,000개 상품에 대한 주간 수요를 예측하여 재고를 최적화하려 합니다.

[예측 요구사항]
• 각 상품의 주간 판매량을 4주 앞까지 예측해야 한다
• 매년 반복되는 계절성 패턴(여름/겨울 시즌)을 반영해야 한다
• 공휴일, 프로모션 기간 등 외부 변수가 판매에 미치는 영향을 포함해야 한다
• ML 전문 엔지니어 없이 비즈니스 분석팀이 직접 예측 모델을 운영해야 한다

다음 중 이 시나리오에 가장 적합한 AWS 서비스는?',
  'b',
  'Amazon Forecast가 이 시나리오에 가장 적합합니다.

Amazon Forecast의 특징:
• 시계열 예측 전용 관리형 서비스
  - ML 지식 없이 CSV 데이터 업로드만으로 고품질 예측 생성
  - AutoML로 최적 알고리즘 자동 선택 (DeepAR+, CNN-QR 등)

• 관련 시계열(Related Time Series) 지원
  - 외부 변수(공휴일, 프로모션, 날씨 등)를 별도 데이터셋으로 제공
  - 이 외부 변수가 수요에 미치는 영향을 자동으로 학습

• 항목 메타데이터(Item Metadata) 지원
  - 상품 카테고리, 브랜드 등 정적 정보 활용
  - 500개 매장 × 5,000개 상품 = 250만 시계열을 동시 예측 가능

• 계절성 자동 인식
  - 일별, 주별, 월별, 연별 계절성 자동 탐지

비즈니스 분석팀이 직접 운영 가능 (ML 코딩 불필요):
다른 서비스와의 비교:
• SageMaker 직접 훈련: ML 엔지니어링 지식과 알고리즘 선택 필요
• Amazon Redshift ML: SQL 사용자용, 주로 분류/회귀 예측
• QuickSight: 시각화 도구, 시계열 예측 기능 제한적',
  2,
  'Amazon Forecast 핵심 개념:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3가지 데이터셋:
1) Target Time Series (필수):
   - 예측 대상 변수 (판매량, 수요)
   - item_id + timestamp + target_value
2) Related Time Series (선택):
   - 외부 영향 변수 (공휴일, 프로모션)
   - 미래 값을 알 수 있는 변수에 사용
3) Item Metadata (선택):
   - 정적 속성 (카테고리, 브랜드, 지역)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
지원 알고리즘 (AutoML로 자동 선택):
• DeepAR+: 딥러닝 기반, 다변량 시계열
• CNN-QR: 분위수 예측
• ETS: 지수 평활법
• NPTS: 비모수적 시계열
• Prophet: 계절성 + 휴일 효과
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
주요 활용 사례:
• 리테일: 수요/재고 예측
• 금융: 현금 흐름 예측
• 물류: 배송량 예측
• 인프라: 용량 계획',
  '{}',
  '[{"name": "Amazon Forecast 소개", "url": "https://aws.amazon.com/forecast/"}, {"name": "Amazon Forecast 데이터셋", "url": "https://docs.aws.amazon.com/forecast/latest/dg/howitworks-datasets-groups.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q154', 'a', 'Amazon SageMaker에서 ARIMA 모델을 직접 개발하고 훈련하여 각 상품별로 배포', 'SageMaker에서 ARIMA를 직접 구현하려면 ML 엔지니어링 전문 지식이 필요합니다. 250만 개의 시계열(500 매장 × 5,000 상품)을 개별 관리하기도 어렵습니다. ML 비전문가인 비즈니스 분석팀 운영 요건에 맞지 않습니다.', 1),
  ('awsaifc01-q154', 'b', 'Amazon Forecast (Target Time Series로 판매 이력, Related Time Series로 공휴일·프로모션 데이터, AutoML로 최적 알고리즘 자동 선택)', 'Amazon Forecast는 시계열 예측 전용 관리형 서비스로 ML 코딩 없이 사용 가능합니다. 관련 시계열로 공휴일/프로모션 반영, 계절성 자동 인식, 대규모 다변량 예측이 모두 가능합니다.', 2),
  ('awsaifc01-q154', 'c', 'Amazon QuickSight의 ML Insights 기능으로 대시보드에서 직접 수요 예측', 'QuickSight ML Insights는 간단한 이상 탐지와 트렌드 예측은 지원하지만, 공휴일·프로모션 같은 외부 변수를 관련 시계열로 통합하거나 250만 개 시계열을 전문적으로 예측하는 기능은 부족합니다.', 3),
  ('awsaifc01-q154', 'd', 'Amazon Rekognition으로 매장 선반 이미지를 분석하여 재고 수준을 실시간 파악', 'Rekognition은 이미지/영상 분석 서비스입니다. 시계열 기반 수요 예측과는 관련이 없습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q154', 'AI 및 ML의 기초');


-- ── 문제 55: 이상 탐지 서비스 선택 (Lookout for Equipment vs Fraud Detector) ─
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q155',
  'aws-aif-c01',
  '한 자동차 부품 제조업체가 공장의 CNC 머신 20대에 설치된 온도, 진동, 압력, 회전수 센서에서 수집된 데이터를 분석하여 기계 고장 전에 이상 징후를 감지하고 예방 정비를 실시하려 합니다.

[현황 및 제약사항]
• 과거 고장 데이터(레이블)가 거의 없어 지도 학습이 어렵다
• 정상 작동 시의 센서 데이터는 6개월치 보유
• ML 전문 팀이 없어 커스텀 모델 개발이 어렵다
• 기계마다 정상 동작 범위가 다를 수 있다

다음 중 이 시나리오에 가장 적합한 AWS 서비스는?',
  'b',
  'Amazon Lookout for Equipment가 이 시나리오에 가장 적합합니다.

Amazon Lookout for Equipment의 특징:
• 산업 장비 이상 탐지 전용 서비스
  - 온도, 진동, 압력, 회전수 등 다변량 센서 데이터 분석
  - 제조, 에너지, 광업 등 산업 환경에 최적화

• 비지도/반지도 학습 기반
  - 레이블된 고장 데이터 없이 정상 데이터만으로 모델 학습
  - 정상 패턴에서 벗어나는 이상 신호 자동 감지

• 장비별 개별 모델
  - 각 기계마다 정상 동작 패턴이 다른 것을 반영
  - 기계별 독립 모델 학습 지원

• 예방 정비(Predictive Maintenance) 특화
  - 실제 고장 몇 시간~며칠 전에 이상 신호 감지
  - 정비 일정 최적화로 불필요한 정비 감소

다른 서비스와의 비교:
• Amazon Fraud Detector: 금융 사기 탐지 전용
• Amazon Lookout for Metrics: 비즈니스 KPI 이상 탐지 (트래픽, 수익 등)
• Amazon Rekognition: 이미지/영상 분석 (시각적 결함 탐지에 사용)
• SageMaker Random Cut Forest: ML 알고리즘 기반 이상 탐지, 직접 구현 필요',
  2,
  'AWS 이상 탐지 서비스 포트폴리오:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Lookout for Equipment:
• 대상: 산업 장비 센서 데이터
• 데이터: 다변량 시계열 (온도, 진동, 압력)
• 방식: 비지도/반지도 학습
• 활용: 예방 정비, 고장 예측
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Lookout for Metrics:
• 대상: 비즈니스 KPI 지표
• 데이터: 매출, 트래픽, 전환율
• 방식: 자동 이상 감지
• 활용: 비즈니스 지표 모니터링
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Fraud Detector:
• 대상: 금융 거래, 계정 생성
• 데이터: 거래 이력, 사용자 행동
• 방식: 지도 학습 (레이블 데이터 필요)
• 활용: 온라인 사기, 결제 사기
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Rekognition:
• 대상: 이미지, 영상
• 데이터: 픽셀 데이터
• 방식: 딥러닝 (사전 훈련 모델)
• 활용: 제품 외관 결함 탐지',
  '{}',
  '[{"name": "Amazon Lookout for Equipment", "url": "https://aws.amazon.com/lookout-for-equipment/"}, {"name": "Amazon Lookout for Metrics", "url": "https://aws.amazon.com/lookout-for-metrics/"}, {"name": "Amazon Fraud Detector", "url": "https://aws.amazon.com/fraud-detector/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q155', 'a', 'Amazon Fraud Detector (금융 사기 탐지 모델을 센서 데이터에 적용)', 'Amazon Fraud Detector는 금융 거래 사기 탐지에 특화된 서비스로 신용카드 사기, 계정 탈취 등에 사용됩니다. 산업 장비 센서 데이터 이상 탐지에는 적합하지 않습니다.', 1),
  ('awsaifc01-q155', 'b', 'Amazon Lookout for Equipment (정상 가동 센서 데이터로 학습하여 기계별 이상 패턴 탐지)', 'Amazon Lookout for Equipment는 산업 장비 다변량 센서 데이터 이상 탐지에 특화되어 있습니다. 레이블 없이 정상 데이터만으로 학습하고 기계별 개별 모델을 지원하며 예방 정비에 최적화되어 있습니다.', 2),
  ('awsaifc01-q155', 'c', 'Amazon Lookout for Metrics (비즈니스 KPI 이상 탐지를 센서 데이터에 적용)', 'Amazon Lookout for Metrics는 매출, 트래픽 등 비즈니스 지표의 이상을 탐지하는 서비스입니다. 산업 장비 센서 데이터 분석에는 Lookout for Equipment가 더 적합합니다.', 3),
  ('awsaifc01-q155', 'd', 'Amazon SageMaker에서 Isolation Forest 알고리즘을 직접 구현하여 이상 탐지 모델 개발', 'SageMaker에서 직접 구현하면 ML 전문 지식이 필요합니다. ML 팀이 없다는 제약사항에 맞지 않습니다. 관리형 Lookout for Equipment를 사용하는 것이 더 효율적입니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q155', 'AI 및 ML의 기초');


-- ── 문제 56: 멀티모달 AI / Amazon Bedrock Nova 패밀리 ─────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q156',
  'aws-aif-c01',
  '한 이커머스 플랫폼의 AI 팀이 상품 카탈로그 관리 시스템을 개선하려 합니다. 판매자가 업로드하는 상품 이미지와 텍스트 설명을 동시에 분석하여 카테고리 자동 분류, 누락된 상품 속성 보완, 한국어·영어 다국어 상품 설명 생성이 필요합니다.

[기술 요구사항]
• 이미지와 텍스트를 함께 입력으로 받아 처리해야 한다 (멀티모달)
• 한국어, 영어, 일본어를 포함한 다국어 출력을 지원해야 한다
• Amazon Bedrock API를 통해 통합 관리되어야 한다
• 비용 효율적이면서 고성능이어야 한다

다음 중 이 요구사항에 가장 적합한 Amazon Bedrock 모델은?',
  'b',
  'Amazon Bedrock Nova Pro가 이 시나리오에 가장 적합합니다.

Amazon Bedrock Nova 패밀리 소개:
Amazon이 개발한 1세대 파운데이션 모델로 2024년 출시. 비용 대비 성능 최적화에 집중.

Nova 패밀리 구성:
• Amazon Nova Micro: 텍스트 전용, 가장 낮은 비용, 빠른 응답
• Amazon Nova Lite: 멀티모달 (이미지+텍스트), 저비용
• Amazon Nova Pro: 멀티모달 (이미지+텍스트+문서), 고성능, 복잡한 작업
• Amazon Nova Premier: 최고 성능, 복잡한 추론 및 에이전트 작업

이 시나리오에 Nova Pro가 적합한 이유:
• 멀티모달 입력: 이미지와 텍스트를 동시에 처리
• 다국어 지원: 200개 이상 언어 지원 (한국어, 영어, 일본어 포함)
• 복잡한 작업: 카테고리 분류, 속성 추출, 설명 생성 등 다단계 작업
• Bedrock API 통합: 단일 API로 관리

멀티모달 AI의 개념:
여러 종류의 입력 모달리티(텍스트, 이미지, 오디오, 영상)를 동시에 처리하는 AI 모델.
텍스트만 처리하는 모델(단일 모달)과 달리 시각적 정보와 텍스트 정보를 통합하여 더 풍부한 이해를 제공.',
  2,
  'Amazon Bedrock Nova 패밀리:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nova Micro:
• 입력: 텍스트만
• 비용: 매우 낮음
• 성능: 기본
• 용도: 간단한 텍스트 생성, Q&A
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nova Lite:
• 입력: 텍스트 + 이미지
• 비용: 낮음
• 성능: 중간
• 용도: 이미지 캡셔닝, 간단한 VQA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nova Pro:
• 입력: 텍스트 + 이미지 + 문서
• 비용: 중간
• 성능: 높음
• 용도: 복잡한 멀티모달 분석, 에이전트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
멀티모달 AI 핵심 개념:
• Modality: 데이터 종류 (텍스트, 이미지, 오디오)
• Cross-modal: 다른 모달리티 간 관계 학습
• VQA (Visual Q&A): 이미지를 보고 질문 답변
• Image Captioning: 이미지 → 텍스트 설명 생성
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
관련 Bedrock 멀티모달 모델:
• Claude 3 Sonnet/Haiku: Anthropic, 멀티모달
• Nova Pro/Lite: Amazon, 멀티모달
• Titan Image Generator: 이미지 생성 전용',
  '{}',
  '[{"name": "Amazon Nova 모델 소개", "url": "https://aws.amazon.com/bedrock/nova/"}, {"name": "Amazon Bedrock 멀티모달", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q156', 'a', 'Amazon Nova Micro (텍스트 전용 모델로 이미지 설명만 따로 처리)', 'Nova Micro는 텍스트 전용 모델입니다. 이미지를 직접 입력으로 받을 수 없어 이미지와 텍스트를 동시에 처리하는 멀티모달 요구사항을 충족하지 못합니다.', 1),
  ('awsaifc01-q156', 'b', 'Amazon Nova Pro (멀티모달 입력으로 이미지+텍스트 동시 처리, 다국어 지원, 복잡한 분류·생성 작업 가능)', 'Nova Pro는 멀티모달 입력(이미지+텍스트+문서), 200개 이상 언어 지원, 복잡한 다단계 작업 처리가 가능하여 모든 요구사항을 충족합니다.', 2),
  ('awsaifc01-q156', 'c', 'Amazon Rekognition (이미지에서 레이블과 텍스트를 추출한 후 Comprehend로 분석)', 'Rekognition + Comprehend 조합은 이미지 레이블 추출과 텍스트 분석이 가능하지만, 통합된 멀티모달 추론과 다국어 상품 설명 생성 기능이 없습니다. 두 서비스를 조합하면 복잡도가 높아집니다.', 3),
  ('awsaifc01-q156', 'd', 'Amazon Titan Text Express (텍스트 생성에 특화된 모델)', 'Titan Text Express는 텍스트 생성에 특화된 단일 모달 모델입니다. 이미지 입력을 지원하지 않아 멀티모달 요구사항을 충족하지 못합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q156', 'GenAI의 기초');


-- ── 문제 57: RLHF (인간 피드백 기반 강화학습) ────────────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q157',
  'aws-aif-c01',
  '한 고객 서비스 AI 스타트업이 대화형 챗봇의 응답 품질을 개선하려 합니다. 현재 챗봇은 SFT(지도 미세 조정)로 훈련되어 기술적으로 정확한 답변을 생성하지만, 고객이 선호하는 친근하고 공감적인 어조가 부족하여 낮은 만족도를 보이고 있습니다.

개발팀은 "고객이 실제로 더 좋아하는 응답 스타일"을 학습시키고 싶습니다.

다음 중 이 목표를 달성하기 위한 가장 적합한 기법과 그 단계를 올바르게 설명한 것은?',
  'b',
  'RLHF(Reinforcement Learning from Human Feedback, 인간 피드백 기반 강화학습)가 이 목표에 가장 적합합니다.

RLHF의 3단계 프로세스:

1단계: SFT (Supervised Fine-Tuning) - 이미 완료
• 레이블된 고품질 대화 데이터로 기본 모델 파인튜닝
• 현재 챗봇이 이 단계까지 완료된 상태

2단계: 보상 모델(Reward Model) 훈련
• 인간 평가자가 같은 질문에 대한 두 응답 중 더 선호하는 것을 선택
• 이 선호 데이터(Preference Data)로 보상 모델 훈련
• 보상 모델은 "어떤 응답이 더 좋은지" 점수를 예측하는 분류기

3단계: PPO(Proximal Policy Optimization)로 정책 업데이트
• 강화학습 알고리즘(PPO)을 사용하여 보상을 최대화하는 방향으로 LLM 파라미터 업데이트
• KL Divergence 패널티로 원래 모델에서 너무 벗어나지 않도록 제약
• 결과: 인간이 선호하는 응답 스타일로 정렬(Alignment)

RLHF의 핵심 장점:
사람의 미묘한 선호(어조, 친근함, 공감)를 레이블이 아닌 비교 선호로 학습 가능',
  3,
  'RLHF 3단계 프로세스:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1단계: SFT (Supervised Fine-Tuning)
• 입력: 레이블된 고품질 데이터
• 방법: 지도 학습
• 결과: 기본 응답 능력 확보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2단계: Reward Model (RM) 훈련
• 입력: 인간 비교 선호 데이터 (A vs B)
• 방법: 쌍별 비교(Pairwise Comparison)
• 결과: 응답 품질 점수 예측 모델
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3단계: PPO (RL Fine-Tuning)
• 입력: 보상 모델의 피드백
• 방법: PPO 강화학습 알고리즘
• 제약: KL Divergence (원본 모델 보존)
• 결과: 인간 선호 정렬된 모델
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RLHF 관련 개념:
• Constitutional AI (CAI): Anthropic의 방법
  - AI가 원칙을 기반으로 자체 피드백 생성
• RLAIF: AI 피드백 기반 강화학습
• DPO (Direct Preference Optimization):
  - RLHF 단순화 버전, RM 없이 직접 학습
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
실제 사례:
• ChatGPT: RLHF로 대화 품질 개선
• Claude: Constitutional AI + RLHF',
  '{}',
  '[{"name": "RLHF 개념 설명", "url": "https://aws.amazon.com/what-is/reinforcement-learning-from-human-feedback/"}, {"name": "Amazon Bedrock 파인튜닝", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q157', 'a', '추가 데이터 증강(Data Augmentation)으로 더 많은 훈련 데이터를 생성하여 SFT를 반복', '데이터 증강과 SFT 반복은 기술적 정확성은 향상시킬 수 있지만, 인간이 선호하는 어조와 스타일을 학습하는 데는 한계가 있습니다. 선호도(preference)는 정해진 레이블이 없어 비교 학습이 필요합니다.', 1),
  ('awsaifc01-q157', 'b', 'RLHF 적용: 인간 평가자가 응답 쌍(pair)을 비교하여 선호 데이터 수집 → 보상 모델(Reward Model) 훈련 → PPO 알고리즘으로 LLM 파인튜닝', 'RLHF는 인간의 미묘한 선호(친근함, 공감, 어조)를 비교 선호 데이터로 학습하는 데 최적화된 기법입니다. 보상 모델이 "좋은 응답"을 정의하고 PPO가 이를 최대화하는 방향으로 모델을 업데이트합니다.', 2),
  ('awsaifc01-q157', 'c', '하이퍼파라미터 튜닝(HPT)으로 학습률, 배치 크기, 에포크 수를 최적화', '하이퍼파라미터 튜닝은 모델 훈련 효율성을 개선하지만, 인간이 선호하는 응답 스타일을 학습하는 것과는 관련이 없습니다. 이미 정의된 손실 함수를 최적화할 뿐, 인간 선호를 반영하는 새로운 학습 신호를 추가하지 않습니다.', 3),
  ('awsaifc01-q157', 'd', 'Prompt Engineering으로 시스템 프롬프트에 "친근하고 공감적으로 답하세요"라는 지침 추가', '프롬프트 엔지니어링은 빠르고 쉬운 방법이지만, 모델 파라미터 자체를 변경하지 않습니다. 일관성이 부족하고 모델이 지침을 항상 따르지 않을 수 있으며, 복잡한 대화 상황에서 한계가 있습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q157', 'GenAI의 기초');


-- ── 문제 58: 다국어 임베딩 / 교차 언어 검색 ──────────────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q158',
  'aws-aif-c01',
  '한 글로벌 IT 기업이 사내 기술 지식 베이스 시스템을 구축하고 있습니다. 기술 문서는 한국어, 영어, 일본어로 작성되어 있으며, 전 세계 직원들이 자신의 언어로 질문하면 다른 언어로 작성된 문서에서도 관련 답변을 찾을 수 있어야 합니다.

[시나리오 예시]
한국 직원: "쿠버네티스 파드 자동 재시작 방법이 뭐야?" (한국어)
→ 영어로 작성된 "Kubernetes Pod Liveness Probe Configuration" 문서를 찾아야 함

다음 중 이 다국어 교차 언어 검색 시스템 구현에 가장 적합한 접근 방법은?',
  'b',
  '다국어 임베딩 모델(Multilingual Embedding Model)을 사용한 교차 언어 시맨틱 검색이 가장 적합합니다.

다국어 임베딩 모델의 원리:
• 동일한 의미를 가진 문장은 언어에 관계없이 임베딩 공간에서 가까운 위치에 매핑
• "쿠버네티스 파드 자동 재시작" (한국어)와 "Kubernetes Pod automatic restart" (영어)가 거의 동일한 벡터 표현
• 언어 장벽 없이 의미적 유사성으로 검색 가능

구현 아키텍처:
1) 색인화: 모든 문서(한국어/영어/일본어)를 다국어 임베딩 모델로 벡터화하여 벡터 DB 저장
2) 검색: 사용자 질문을 동일 모델로 벡터화
3) 유사도 검색: 코사인 유사도로 가장 관련성 높은 문서 검색
4) 언어 무관하게 결과 반환

AWS 구현:
• Amazon Bedrock Titan Multilingual Embeddings: 100개 이상 언어 지원
• Amazon OpenSearch Serverless: 벡터 검색 엔진
• Amazon Translate: 필요시 결과 번역 (선택사항)

다른 방법과의 비교:
• 언어별 별도 검색 시스템: 각 언어의 문서만 검색 가능, 교차 언어 불가
• 번역 후 단일 언어 검색: 번역 오류 누적, 비용 증가, 실시간 번역 지연
• BM25 키워드 검색: 언어별 형태소 분석기 필요, 의미적 검색 불가',
  3,
  '임베딩 및 교차 언어 검색 개념:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
임베딩(Embedding) 기본 개념:
• 텍스트를 고차원 벡터로 변환
• 의미적으로 유사한 텍스트 → 가까운 벡터
• 코사인 유사도로 유사성 측정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
단일 언어 임베딩:
• 동일 언어 내에서만 의미 유사성 표현
• "고양이" ≈ "cat" 벡터가 서로 다름
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
다국어 임베딩:
• 여러 언어를 동일한 임베딩 공간에 표현
• "고양이" ≈ "cat" ≈ "猫" (비슷한 벡터)
• 교차 언어(Cross-lingual) 검색 가능
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Bedrock 임베딩 모델:
• Titan Text Embeddings V2:
  - 256/512/1024 차원 선택
  - 영어 최적화
• Titan Multimodal Embeddings:
  - 이미지+텍스트 결합 임베딩
• Cohere Embed Multilingual:
  - 100개 이상 언어 지원
  - 교차 언어 검색에 최적
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
벡터 검색 서비스:
• Amazon OpenSearch Serverless (k-NN)
• Amazon Aurora + pgvector
• Amazon MemoryDB (벡터 검색 지원)',
  '{}',
  '[{"name": "Amazon Titan Embeddings", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html"}, {"name": "Amazon OpenSearch 벡터 검색", "url": "https://docs.aws.amazon.com/opensearch-service/latest/developerguide/knn.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q158', 'a', '언어별로 별도의 한국어/영어/일본어 검색 인덱스를 구축하고, 사용자 언어를 감지하여 해당 언어 인덱스만 검색', '언어별 별도 인덱스 방식은 교차 언어 검색이 불가능합니다. 한국어로 질문하면 한국어 문서만 검색되어 영어/일본어 문서를 찾을 수 없습니다.', 1),
  ('awsaifc01-q158', 'b', '다국어 임베딩 모델(Cohere Embed Multilingual 또는 Titan Multimodal)로 모든 문서를 언어 무관한 벡터로 변환 후 단일 벡터 DB에 저장, 질문도 동일 모델로 벡터화하여 교차 언어 시맨틱 검색', '다국어 임베딩 모델은 언어에 관계없이 동일한 의미를 가진 텍스트를 가까운 벡터로 표현합니다. 한 번의 검색으로 모든 언어 문서에서 의미적으로 관련 있는 내용을 찾을 수 있습니다.', 2),
  ('awsaifc01-q158', 'c', 'Amazon Translate로 모든 문서를 영어로 번역한 후 영어 단일 인덱스 구축, 질문도 영어로 번역 후 검색', '번역 과정에서 기술 용어의 뉘앙스가 변할 수 있고, 번역 비용과 지연이 발생합니다. 또한 번역 오류가 누적되어 검색 품질이 저하될 수 있습니다.', 3),
  ('awsaifc01-q158', 'd', 'BM25 키워드 검색에 각 언어별 형태소 분석기(Tokenizer)를 적용하여 다국어 검색 구현', 'BM25 키워드 검색은 정확한 키워드 일치에 기반합니다. "쿠버네티스 파드 자동 재시작"이라는 한국어 질문으로 영어 "Kubernetes Pod Liveness Probe"를 찾으려면 의미 기반 검색이 필요하며, 키워드 검색으로는 교차 언어 의미 매칭이 어렵습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q158', 'GenAI의 기초');


-- ── 문제 59: 하이브리드 검색 (Dense + Sparse + RRF) ──────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q159',
  'aws-aif-c01',
  '한 법률 기업이 수십만 건의 판례와 법령 데이터베이스를 기반으로 AI 법률 검색 시스템을 구축하고 있습니다.

[검색 시나리오]
• 시나리오 A: "제245조 3항"처럼 정확한 조문 번호나 사건 번호로 검색
• 시나리오 B: "임대인의 보증금 반환 의무가 세입자 퇴거 전에 발생하는 경우"처럼 법적 개념과 맥락으로 검색
• 두 유형의 검색이 모두 높은 정확도를 보여야 한다

현재 순수 벡터 검색만 사용하면 정확한 법조문 번호 매칭에서 성능이 떨어지고, 순수 키워드 검색만 사용하면 의미론적 유사 판례 탐색에서 성능이 떨어지는 문제가 있습니다.

다음 중 두 검색 유형 모두를 최적화하는 접근 방법은?',
  'c',
  '하이브리드 검색(Hybrid Search)이 이 시나리오에 가장 적합합니다.

하이브리드 검색의 구성:
1) Sparse 검색 (BM25/TF-IDF 키워드 검색)
   - 정확한 용어, 조문 번호, 고유명사 매칭에 강함
   - "제245조 3항"처럼 정확한 텍스트 일치 필요한 경우에 최적
   - 역색인(Inverted Index) 기반

2) Dense 검색 (벡터/시맨틱 검색)
   - 의미론적 유사성 기반 검색
   - "임대인의 보증금 반환 의무" 같은 법적 개념 검색에 강함
   - 임베딩 벡터의 코사인 유사도 기반

3) Reciprocal Rank Fusion (RRF)로 결과 결합
   - 두 검색 결과를 순위 기반으로 통합
   - 단순 점수 합산보다 안정적인 결합 방법
   - 각 결과의 순위를 기반으로 최종 점수 계산

이 방식의 장점:
• 정확한 법조문 번호 검색 (Sparse) + 개념 유사 판례 탐색 (Dense) 동시 최적화
• Amazon OpenSearch에서 하이브리드 검색 및 RRF를 기본 지원
• Amazon Bedrock Knowledge Bases에서도 하이브리드 검색 설정 가능',
  3,
  '하이브리드 검색 개념:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sparse 검색 (BM25):
• 방법: 키워드 일치 (역색인)
• 강점: 정확한 용어, 고유명사, 코드
• 약점: 동의어, 의미론적 유사성 미흡
• 예: "제245조 3항" → 정확히 해당 조문만
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dense 검색 (벡터):
• 방법: 임베딩 벡터 유사도
• 강점: 의미론적 유사성, 동의어
• 약점: 정확한 용어/번호 매칭 미흡
• 예: "보증금 반환" → 관련 판례 모두
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hybrid 검색 (Sparse + Dense):
• 두 방법의 장점을 결합
• RRF (Reciprocal Rank Fusion):
  Score = Σ 1/(k + rank_i)
  k = 상수 (보통 60)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Bedrock Knowledge Bases:
• 벡터 검색 (시맨틱)
• 하이브리드 검색 (시맨틱 + 전문 검색)
• Amazon OpenSearch Serverless 기반
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
사용 권장 상황:
• Dense만: 일반 Q&A, 문서 요약
• Sparse만: 코드, 정확한 키워드 검색
• Hybrid: 전문 도메인 (법률, 의료, 기술)',
  '{}',
  '[{"name": "Amazon Bedrock Knowledge Bases 하이브리드 검색", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-vector-store.html"}, {"name": "Amazon OpenSearch 하이브리드 검색", "url": "https://docs.aws.amazon.com/opensearch-service/latest/developerguide/hybrid-search.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q159', 'a', '벡터 임베딩 검색만 사용하고 임베딩 모델을 법률 도메인으로 파인튜닝', '벡터 검색만으로는 정확한 법조문 번호 매칭이 어렵습니다. 법률 도메인 파인튜닝이 도움이 되지만, Sparse 검색의 정확한 키워드 매칭 능력을 대체하기는 어렵습니다.', 1),
  ('awsaifc01-q159', 'b', 'BM25 키워드 검색만 사용하고 법률 용어 사전(Legal Thesaurus)으로 동의어를 확장', '키워드 검색은 정확한 법조문 번호 검색에 유리하지만, 의미론적 유사 판례 탐색에는 부족합니다. 동의어 사전이 도움이 되지만 Dense 검색의 풍부한 의미 표현을 대체하기 어렵습니다.', 2),
  ('awsaifc01-q159', 'c', '하이브리드 검색: BM25 키워드 검색(Sparse)과 벡터 시맨틱 검색(Dense)을 병렬로 실행하고 Reciprocal Rank Fusion(RRF)으로 결과를 결합', '하이브리드 검색은 Sparse의 정확한 키워드 매칭과 Dense의 의미론적 유사성 검색을 결합하여 두 시나리오 모두에서 최적의 성능을 제공합니다. Amazon Bedrock Knowledge Bases와 OpenSearch에서 기본 지원합니다.', 3),
  ('awsaifc01-q159', 'd', '그래프 데이터베이스(Neptune)에 판례 간 관계를 모델링하여 그래프 탐색으로 검색', '그래프 탐색은 판례 간 인용 관계나 법령 체계 탐색에 유용하지만, 텍스트 기반 키워드 검색과 의미론적 검색 모두를 대체하기는 어렵습니다. 추가적인 보완 기능으로는 적합하나 주요 검색 방법으로는 부족합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q159', 'GenAI의 기초');


-- ── 문제 60: GenAI 애플리케이션 유형 / 코드 생성 AI ─────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q160',
  'aws-aif-c01',
  '한 대기업의 소프트웨어 개발팀이 개발 생산성을 높이기 위해 AI 도구 도입을 검토하고 있습니다. 팀에서 필요한 기능은 다음과 같습니다.

[필요 기능]
• 개발자가 주석으로 의도를 작성하면 해당 코드를 자동으로 생성
• 기존 코드에서 버그를 탐지하고 수정 방법을 설명
• 테스트 케이스와 단위 테스트 코드를 자동으로 작성
• 코드 리뷰 피드백과 보안 취약점 탐지
• AWS Lambda, S3 등 AWS 서비스 코드 제안

다음 중 이 요구사항에 가장 적합한 AWS AI 서비스는?',
  'b',
  'Amazon Q Developer가 이 요구사항에 가장 적합합니다.

Amazon Q Developer의 주요 기능:
• 코드 완성 및 생성: 자연어 주석 → 코드 자동 생성
• 버그 탐지 및 수정 제안: 코드 분석 후 문제점 설명
• 테스트 코드 생성: 단위 테스트, 통합 테스트 자동 작성
• 코드 리뷰: 코드 품질, 보안, 성능 피드백
• 보안 스캐닝: OWASP 취약점, 시크릿 노출 탐지
• AWS 특화: AWS SDK, CLI, CloudFormation 코드 제안
• IDE 통합: VS Code, JetBrains, Eclipse 플러그인

GenAI 애플리케이션 유형 분류:
• 코드 생성(Code Generation): 코드 자동 작성, 버그 수정, 테스트 생성
• 질의응답(Question Answering): 문서 기반 Q&A
• 텍스트 요약(Summarization): 긴 문서를 짧게 요약
• 감성 분석(Sentiment Analysis): 텍스트의 감성/의도 분석
• 번역(Translation): 다국어 텍스트 변환
• 이미지 생성(Image Generation): 텍스트 → 이미지

이 시나리오의 기능들은 모두 "코드 생성 AI" 카테고리에 속합니다.',
  1,
  'GenAI 애플리케이션 유형:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
코드 생성 (Code Generation):
• 코드 자동 완성
• 버그 탐지 및 수정
• 테스트 코드 생성
• 코드 리뷰 및 보안 스캐닝
• AWS: Amazon Q Developer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
질의응답 (QA / RAG):
• 문서 기반 답변
• 사실 확인, 정보 검색
• AWS: Bedrock Knowledge Bases
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
텍스트 변환:
• 요약 (Summarization)
• 번역 (Translation)
• 스타일 변환 (Rewriting)
• AWS: Bedrock + Claude/Titan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이미지 생성:
• 텍스트 → 이미지
• 이미지 편집/스타일
• AWS: Titan Image Generator, Stable Diffusion
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Q Developer 특징:
• 개발자 특화 AI 어시스턴트
• 50개 이상 프로그래밍 언어 지원
• AWS 서비스 코드 제안 특화
• IDE 통합 (VS Code, JetBrains 등)
• 보안 스캐닝 내장',
  '{}',
  '[{"name": "Amazon Q Developer", "url": "https://aws.amazon.com/q/developer/"}, {"name": "Amazon Q 기능 소개", "url": "https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/what-is.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q160', 'a', 'Amazon CodeGuru Reviewer (코드 품질 및 보안 취약점 검토 전용)', 'Amazon CodeGuru Reviewer는 코드 리뷰와 보안 취약점 탐지 기능을 제공하지만, 새 코드 생성, 테스트 코드 자동 작성, 버그 수정 설명 등 포괄적인 AI 코딩 어시스턴트 기능은 제한적입니다.', 1),
  ('awsaifc01-q160', 'b', 'Amazon Q Developer (코드 생성, 버그 탐지/설명, 테스트 코드 작성, 코드 리뷰, 보안 스캐닝, AWS 서비스 코드 제안을 통합 제공하는 AI 개발자 어시스턴트)', 'Amazon Q Developer는 개발자를 위한 종합 GenAI 코딩 어시스턴트입니다. 모든 요구사항(코드 생성, 버그 탐지, 테스트 작성, 코드 리뷰, 보안 스캐닝, AWS 특화 제안)을 단일 서비스로 제공합니다.', 2),
  ('awsaifc01-q160', 'c', 'Amazon Comprehend (자연어 처리로 코드 주석을 분석하여 의도를 파악)', 'Amazon Comprehend는 텍스트의 감성, 개체, 언어 등을 분석하는 NLP 서비스입니다. 코드 생성, 테스트 작성, 버그 수정 등의 개발자 어시스턴트 기능을 제공하지 않습니다.', 3),
  ('awsaifc01-q160', 'd', 'Amazon SageMaker Studio IDE (ML 개발 환경에서 코드 작성 보조)', 'SageMaker Studio는 ML/데이터 과학 워크플로우를 위한 IDE이지만, 일반 소프트웨어 개발에서의 코드 완성, 버그 탐지, 테스트 생성 등 AI 코딩 어시스턴트 기능에 특화되어 있지 않습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q160', 'GenAI의 기초');


-- ── 문제 61: Bedrock Guardrails 기능 매핑 ────────────────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q161',
  'aws-aif-c01',
  '한 금융 서비스 회사가 Amazon Bedrock으로 고객 대면 AI 금융 어시스턴트를 구축하고 있습니다. 보안팀이 다음 4가지 안전 요구사항을 제시했습니다.

[보안 요구사항]
• 요구 A: AI가 경쟁사 금융 상품을 언급하거나 비교하면 안 된다
• 요구 B: 고객의 신용카드 번호, 주민등록번호, 계좌번호가 응답에 포함되면 자동으로 마스킹 처리해야 한다
• 요구 C: 금융 조언이 실제 회사 정책 문서에 근거하는지 검증해야 한다
• 요구 D: 혐오 발언, 불법 활동 조장 등 유해한 콘텐츠를 차단해야 한다

다음 중 각 요구사항에 맞는 Amazon Bedrock Guardrails의 기능을 올바르게 연결한 것은?',
  'b',
  'Amazon Bedrock Guardrails의 각 기능이 요구사항에 매핑됩니다.

Bedrock Guardrails 기능 구성:

요구 A → Denied Topics (주제 거부)
• 특정 주제에 대한 응답을 완전히 거부
• 자연어로 금지 주제 정의: "경쟁사 금융 상품 언급 및 비교"
• AI가 해당 주제로 대화를 유도하거나 답변하는 것 차단
• 예: "OO은행 금리가 더 낫지 않나요?"에 대해 거부 메시지 반환

요구 B → Sensitive Information Filters (민감 정보 필터)
• PII(개인식별정보) 자동 감지 및 처리
• 신용카드 번호, 주민등록번호, 계좌번호, 이메일, 전화번호 등
• 처리 방식: 마스킹(***), 익명화, 또는 차단
• 입력 및 출력 모두 적용 가능

요구 C → Grounding Check (근거 검증)
• AI 응답이 제공된 컨텍스트/문서에 근거하는지 검증
• 환각(Hallucination) 방지
• 근거 점수(Grounding Score) 임계값 설정 가능
• RAG 시스템과 함께 사용 시 효과적

요구 D → Content Filters (콘텐츠 필터)
• 6가지 유해 카테고리 필터링: 혐오, 모욕, 성적 콘텐츠, 폭력, 불법 활동, 무기
• 각 카테고리별 차단 강도 (None/Low/Medium/High) 조정
• 입력(프롬프트)과 출력(응답) 모두에 적용',
  2,
  'Amazon Bedrock Guardrails 기능 요약:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1) Content Filters (콘텐츠 필터):
• 목적: 유해 콘텐츠 차단
• 카테고리: 혐오, 모욕, 성적, 폭력, 불법, 무기
• 강도: None → Low → Medium → High
• 적용: 입력(프롬프트) + 출력(응답)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2) Denied Topics (주제 거부):
• 목적: 특정 주제 완전 차단
• 방법: 자연어로 금지 주제 정의
• 예: 투자 조언, 경쟁사 언급 등
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3) Word Filters (단어 필터):
• 목적: 특정 단어/구문 차단
• 방법: 금지어 목록 직접 정의
• 예: 욕설, 브랜드명, 내부 용어
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4) Sensitive Information Filters:
• 목적: PII 감지 및 마스킹
• 항목: 신용카드, SSN, 이메일, 전화
• 처리: 마스킹(***) 또는 차단
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5) Grounding Check (근거 검증):
• 목적: 환각(Hallucination) 방지
• 방법: 응답이 제공 컨텍스트에 근거?
• 점수 임계값 설정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6) Contextual Grounding (문맥 관련성):
• 목적: 응답이 질문과 관련있는지?
• Relevance Score 측정',
  '{}',
  '[{"name": "Amazon Bedrock Guardrails", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html"}, {"name": "Guardrails 기능 설명", "url": "https://aws.amazon.com/bedrock/guardrails/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q161', 'a', '요구 A: Word Filters | 요구 B: Content Filters | 요구 C: Denied Topics | 요구 D: Sensitive Information Filters', '기능 매핑이 잘못되었습니다. Word Filters는 단어/구문 차단, Content Filters는 유해 콘텐츠 차단, Denied Topics는 주제 거부, Sensitive Information Filters는 PII 마스킹입니다.', 1),
  ('awsaifc01-q161', 'b', '요구 A: Denied Topics | 요구 B: Sensitive Information Filters | 요구 C: Grounding Check | 요구 D: Content Filters', '각 요구사항에 정확히 맞는 Guardrails 기능입니다. Denied Topics(경쟁사 주제 차단), Sensitive Information Filters(PII 마스킹), Grounding Check(문서 근거 검증), Content Filters(유해 콘텐츠 차단)이 올바른 매핑입니다.', 2),
  ('awsaifc01-q161', 'c', '요구 A: Content Filters | 요구 B: Word Filters | 요구 C: Sensitive Information Filters | 요구 D: Denied Topics', '경쟁사 언급은 Content Filters(유해 콘텐츠)가 아닌 Denied Topics(금지 주제)로 처리합니다. PII 마스킹은 Word Filters가 아닌 Sensitive Information Filters를 사용합니다.', 3),
  ('awsaifc01-q161', 'd', '요구 A: Denied Topics | 요구 B: Word Filters | 요구 C: Content Filters | 요구 D: Grounding Check', '신용카드 번호 마스킹은 Word Filters(단어 차단)가 아닌 Sensitive Information Filters(PII 감지/마스킹)를 사용합니다. 근거 검증은 Content Filters가 아닌 Grounding Check를 사용합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q161', '파운데이션 모델의 적용');


-- ── 문제 62: Amazon Bedrock vs SageMaker JumpStart 선택 ─────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q162',
  'aws-aif-c01',
  '한 기업에서 두 팀이 각각 다른 방식으로 파운데이션 모델을 활용하려 합니다.

[팀 A - 마케팅 AI 팀]
• 요구사항: 고객 문의 응답 생성 챗봇 구축
• 특징: ML 엔지니어가 없는 비즈니스 팀, 코드 최소화
• 우선순위: API 즉시 사용, 인프라 관리 불필요, 빠른 프로토타입
• 원하는 모델: Claude Sonnet

[팀 B - 데이터 사이언스 팀]
• 요구사항: 사내 법률 문서에 특화된 파인튜닝 모델 배포
• 특징: ML 전문팀, 커스텀 훈련 인프라 세밀한 제어 필요
• 우선순위: GPU 인스턴스 유형 직접 선택, 분산 훈련, 자체 VPC 배포
• 원하는 모델: Llama 3 (오픈소스)

다음 중 각 팀에 가장 적합한 AWS 서비스 조합은?',
  'c',
  '팀 A에는 Amazon Bedrock, 팀 B에는 Amazon SageMaker JumpStart가 적합합니다.

Amazon Bedrock 특징 (팀 A에 적합):
• 완전 관리형 FM API 서비스
• 인프라 관리 불필요 (서버리스 방식)
• Claude, Titan, Llama, Stable Diffusion 등 다양한 FM API 즉시 사용
• 파인튜닝, Bedrock Agents, Knowledge Bases 통합 지원
• ML 지식 없이 API 호출만으로 사용 가능
• 비용: 토큰 기반 과금 (인프라 비용 없음)
• 지원 모델: Claude Sonnet은 Bedrock에서 직접 API로 제공

Amazon SageMaker JumpStart 특징 (팀 B에 적합):
• 사전 훈련된 오픈소스 모델 (Llama, Falcon, Mistral 등)을 SageMaker에 배포
• GPU 인스턴스 유형 직접 선택 (ml.g5.12xlarge 등)
• 분산 훈련 설정, 하이퍼파라미터 세밀한 제어
• 자체 VPC에 배포하여 완전한 네트워크 격리
• 모델 레지스트리와 SageMaker 파이프라인 통합
• 비용: EC2 인스턴스 시간 기반 과금

핵심 차이점:
• Bedrock: API 호출 방식, 인프라 숨김, 완전 관리형
• JumpStart: 인스턴스 기반, 인프라 제어 가능, 오픈소스 모델',
  3,
  'Amazon Bedrock vs SageMaker JumpStart:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Bedrock:
• 방식: 완전 관리형 FM API
• 인프라 제어: 불가 (AWS가 관리)
• 모델: Anthropic, Amazon, Meta, AI21
• 파인튜닝: 제한적 (Bedrock 파인튜닝)
• 비용: 토큰 기반
• 사용자: 비즈니스 팀, 앱 개발자
• 배포: 서버리스, 즉시 사용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SageMaker JumpStart:
• 방식: 오픈소스 모델 SageMaker 배포
• 인프라 제어: 가능 (GPU 유형, VPC 등)
• 모델: Llama, Falcon, Mistral (오픈소스)
• 파인튜닝: 완전한 커스텀 훈련 가능
• 비용: 인스턴스 시간 기반
• 사용자: ML 엔지니어, 데이터 과학팀
• 배포: SageMaker 엔드포인트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
선택 기준:
• 즉시 사용, 비전문가 → Bedrock
• 오픈소스, 인프라 제어 → JumpStart
• 독점 모델(Claude, Titan) → Bedrock
• 완전 커스텀 훈련 → JumpStart / SageMaker',
  '{}',
  '[{"name": "Amazon Bedrock 소개", "url": "https://aws.amazon.com/bedrock/"}, {"name": "SageMaker JumpStart", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/studio-jumpstart.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q162', 'a', '팀 A: SageMaker JumpStart (Claude 모델 배포) | 팀 B: Amazon Bedrock (Llama API 사용)', '반대로 적용했습니다. Claude는 Anthropic의 독점 모델로 SageMaker JumpStart에서 제공되지 않으며 Bedrock에서만 API로 사용 가능합니다. 인프라 제어가 필요한 팀 B에는 JumpStart가 적합합니다.', 1),
  ('awsaifc01-q162', 'b', '팀 A: Amazon Bedrock | 팀 B: Amazon Bedrock (두 팀 모두 Bedrock 사용)', '팀 B는 GPU 인스턴스 세밀한 제어, 분산 훈련, 자체 VPC 배포가 필요합니다. Bedrock은 인프라를 추상화하므로 이런 세밀한 제어가 불가능합니다. 팀 B에는 SageMaker JumpStart가 적합합니다.', 2),
  ('awsaifc01-q162', 'c', '팀 A: Amazon Bedrock (Claude API 즉시 사용, 인프라 불필요) | 팀 B: Amazon SageMaker JumpStart (Llama 3 배포, GPU 인스턴스·VPC 직접 제어)', '팀 A의 비즈니스 팀에게는 인프라 없이 API로 즉시 사용 가능한 Bedrock이, 팀 B의 ML 전문팀에게는 오픈소스 Llama 3를 세밀하게 제어하며 배포할 수 있는 SageMaker JumpStart가 최적입니다.', 3),
  ('awsaifc01-q162', 'd', '팀 A: Amazon SageMaker (직접 훈련) | 팀 B: SageMaker JumpStart (Llama 배포)', '팀 A는 ML 엔지니어가 없고 빠른 프로토타입이 목표입니다. SageMaker에서 직접 훈련하는 것은 과도하게 복잡합니다. 팀 A에는 Bedrock API가 적합합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q162', '파운데이션 모델의 적용');


-- ── 문제 63: Knowledge Base 청킹(Chunking) 전략 ─────────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q163',
  'aws-aif-c01',
  '한 보험 회사가 Amazon Bedrock Knowledge Bases를 사용하여 보험 약관 PDF 기반 RAG 시스템을 구축하려 합니다. 보험 약관 문서의 특성은 다음과 같습니다.

[문서 특성]
• 각 약관 조항은 조항 번호(예: 제3조)와 제목(예: "보험금 지급 기준")으로 시작
• 각 조항은 논리적으로 완결된 내용 단위이며 평균 300-800 단어
• 조항과 조항 사이는 명확히 구분됨
• 조항 중간에 청킹(분할)되면 불완전한 정보로 잘못된 답변이 생성될 수 있음

[현재 문제]
고정 크기 청킹(500 토큰)을 사용하면 조항 중간에 분할되어 "제3조의 면책 사항은 무엇인가요?"라는 질문에 불완전한 답변이 나오는 문제가 발생합니다.

다음 중 이 문제를 해결하기 위한 가장 적합한 청킹 전략은?',
  'b',
  '계층적 청킹(Hierarchical Chunking)이 이 시나리오에 가장 적합합니다.

청킹 전략 선택 이유:

계층적 청킹(Hierarchical Chunking)의 특징:
• 부모-자식(Parent-Child) 청크 구조
• 부모 청크: 큰 단위 (조항 전체, 섹션 전체)
• 자식 청크: 작은 단위 (조항 내 세부 항목)
• 검색 시: 자식 청크로 정밀 검색 → 부모 청크(전체 조항) 컨텍스트 반환
• 장점: 정밀한 검색 + 완전한 컨텍스트 제공

이 시나리오에 적합한 이유:
• 각 조항이 명확한 경계(조항 번호+제목)를 가짐
• 부모 청크 = 조항 전체 (논리적 완결 단위)
• 자식 청크 = 조항 내 세부 항목
• 검색 시 자식 청크로 관련성 높게 검색 후 부모 청크 전체 컨텍스트 제공
• 조항 중간에 분할되지 않음

다른 청킹 전략과의 비교:
• Fixed-size Chunking: 고정 토큰 수로 분할, 조항 중간에 분할될 수 있음
• Semantic Chunking: 의미적 유사성 기준으로 분할, 경계 탐지가 자동으로 이루어짐
• No Chunking: 전체 문서를 하나의 청크로, 검색 정밀도 저하
• Sentence-based: 문장 단위 분할, 조항 전체 컨텍스트 제공 어려움',
  3,
  'Bedrock Knowledge Bases 청킹 전략:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fixed-size Chunking:
• 방법: 고정 토큰 수 (예: 300, 500 토큰)
• 장점: 단순하고 일관된 청크 크기
• 단점: 문장/단락 중간에 분할 가능
• 적합: 일반 텍스트, 비구조화 문서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Semantic Chunking:
• 방법: 의미적 유사성 기준 분할
• 장점: 의미 단위로 자연스럽게 분할
• 단점: 처리 비용 증가
• 적합: 다양한 주제가 혼재하는 문서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hierarchical Chunking:
• 방법: 부모-자식 중첩 청크 구조
• 장점: 정밀 검색 + 완전한 컨텍스트
• 단점: 저장 공간 2배 (부모+자식)
• 적합: 구조화된 문서 (법률, 약관, 매뉴얼)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No Chunking (기본 청킹 없음):
• 방법: 문서 전체를 1개 청크
• 장점: 전체 컨텍스트 보존
• 단점: 검색 정밀도 낮음, 비용 증가
• 적합: 매우 짧은 문서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
청킹 파라미터:
• Chunk Size: 청크 최대 토큰 수
• Overlap: 인접 청크 겹치는 토큰 수
  (컨텍스트 연속성을 위해 10-20% 권장)',
  '{}',
  '[{"name": "Bedrock Knowledge Bases 청킹", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-setup-chunking.html"}, {"name": "RAG 청킹 전략", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/kb-chunking-parsing.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q163', 'a', '고정 크기 청킹에서 청크 크기를 500 → 1,000 토큰으로 늘려 조항이 분할될 가능성을 줄인다', '청크 크기를 늘리면 분할 가능성이 줄지만, 완전히 해결되지 않습니다. 800단어 조항이 여전히 분할될 수 있고, 크기를 늘리면 검색 정밀도가 낮아지며 컨텍스트 창 한계에 부딪힐 수 있습니다.', 1),
  ('awsaifc01-q163', 'b', '계층적 청킹(Hierarchical Chunking): 각 조항 전체를 부모 청크로, 조항 내 세부 항목을 자식 청크로 구성하여 검색 정밀도와 완전한 조항 컨텍스트를 동시에 확보', '계층적 청킹은 조항 경계를 존중하면서 정밀한 검색(자식 청크)과 완전한 컨텍스트(부모 청크) 모두를 제공합니다. 보험 약관처럼 명확한 구조를 가진 문서에 가장 적합합니다.', 2),
  ('awsaifc01-q163', 'c', '청킹을 완전히 제거하고 보험 약관 전체를 하나의 임베딩으로 처리', '전체 문서를 하나의 청크로 처리하면 검색 정밀도가 크게 낮아집니다. "제3조"를 찾는 쿼리에 전체 약관이 검색 후보가 되어 관련성 점수가 희석됩니다. 또한 임베딩 모델의 최대 토큰 제한에 걸릴 수 있습니다.', 3),
  ('awsaifc01-q163', 'd', '문장(Sentence) 기반 청킹으로 각 문장을 별도 청크로 분리하여 세밀한 검색 가능', '문장 단위 청킹은 너무 세밀하여 조항 전체의 맥락을 제공하기 어렵습니다. "제3조의 면책 사항"은 여러 문장으로 구성되어 있어 단일 문장 청크로는 완전한 답변이 불가능합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q163', '파운데이션 모델의 적용');


-- ── 문제 64: Bedrock Cross-Region Inference (교차 리전 추론) ──────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q164',
  'aws-aif-c01',
  '한 글로벌 SaaS 기업이 Amazon Bedrock으로 AI 기반 고객 지원 서비스를 운영 중입니다. 서비스는 주로 us-east-1 리전의 Claude 모델을 사용하는데, 미국 동부 시간 오전 9-11시에 고객 문의가 폭주하여 모델 처리 용량이 부족해지는 문제가 발생합니다.

[요구사항]
• 피크 시간에도 서비스 가용성을 유지해야 한다
• 수동 개입 없이 자동으로 트래픽을 조절해야 한다
• 동일한 Claude 모델 버전을 사용해야 한다
• 추가 인프라 없이 AWS 관리형 방식을 사용해야 한다

다음 중 이 요구사항을 충족하는 가장 적합한 Amazon Bedrock 기능은?',
  'b',
  'Amazon Bedrock Cross-Region Inference가 이 요구사항에 가장 적합합니다.

Cross-Region Inference의 개념:
• 특정 리전의 모델 용량이 부족할 때 다른 리전으로 자동 라우팅
• 단일 API 엔드포인트로 여러 리전의 모델 용량을 풀링(Pooling)
• 추가 코드 변경 없이 구성만으로 활성화 가능

작동 방식:
1) us-east-1에 Cross-Region Inference 프로파일 설정
2) Fallback 리전 지정 (예: us-west-2, eu-west-1)
3) 피크 시 us-east-1 용량 부족 → 자동으로 us-west-2의 동일 모델로 라우팅
4) 용량 복구 시 자동으로 us-east-1로 복귀

주요 특징:
• 동일 모델 버전 사용 (모델 일관성 보장)
• 완전 관리형 (추가 인프라 불필요)
• 자동 트래픽 라우팅 (수동 개입 불필요)
• 비용: 기존 온디맨드 요금 + 소량 추가 요금

주의사항:
• 데이터가 다른 리전으로 이동할 수 있어 데이터 레지던시 요구사항 확인 필요
• HIPAA, GDPR 등 규정 준수가 필요한 경우 리전 선택에 주의',
  2,
  'Amazon Bedrock Cross-Region Inference:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
목적:
• 리전별 모델 용량 부족 문제 해결
• 서비스 가용성 및 내구성 향상
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
동작 방식:
1) 기본 리전 (us-east-1) 용량 소진
2) 자동으로 보조 리전으로 라우팅
3) 보조 리전에서 동일 모델로 처리
4) 응답 반환 (투명한 방식)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
구성 요소:
• Inference Profile: 리전 목록 정의
• System-Defined Profile: AWS가 제공하는 기본 프로파일
• Cross-Region Profile: 커스텀 리전 조합
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
지원 모델:
• Claude 3/3.5 시리즈
• Amazon Nova 시리즈
• 기타 주요 FM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
주의사항:
• 데이터 레지던시: 다른 리전으로 데이터 이동
• 지연 시간: 다른 리전 사용 시 소폭 증가
• 비용: 표준 온디맨드 요금 + α
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bedrock 용량 관리 옵션:
• On-Demand: 기본, 용량 보장 없음
• Provisioned Throughput: 특정 용량 예약
• Cross-Region Inference: 다중 리전 자동 분산',
  '{}',
  '[{"name": "Bedrock Cross-Region Inference", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html"}, {"name": "Bedrock 추론 프로파일", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q164', 'a', 'Provisioned Throughput 구매로 us-east-1에서 더 많은 모델 처리 용량을 미리 예약', 'Provisioned Throughput은 특정 리전에서 일정 용량을 예약하는 방식으로 피크 시 안정적이지만, 예약 용량을 초과하면 여전히 한계가 있고 비피크 시간에는 예약된 용량이 낭비됩니다. 여러 리전에 자동으로 분산하는 기능은 없습니다.', 1),
  ('awsaifc01-q164', 'b', 'Amazon Bedrock Cross-Region Inference로 Inference Profile을 설정하여 us-east-1 용량 부족 시 us-west-2 등 다른 리전으로 자동 라우팅', 'Cross-Region Inference는 단일 API 엔드포인트로 여러 리전의 모델 용량을 자동으로 활용합니다. 수동 개입 없이 피크 시 다른 리전으로 자동 라우팅하여 가용성을 보장하며, 동일 모델 버전을 사용합니다.', 2),
  ('awsaifc01-q164', 'c', 'API Gateway와 Lambda를 사용하여 여러 리전의 Bedrock 엔드포인트로 수동 로드 밸런싱 구현', 'API Gateway + Lambda로 직접 구현하면 추가 인프라가 필요하고 운영 복잡성이 증가합니다. "추가 인프라 없이 AWS 관리형 방식"이라는 요구사항에 맞지 않습니다.', 3),
  ('awsaifc01-q164', 'd', 'Bedrock 모델 호출 코드에 재시도(Retry) 로직을 추가하여 용량 부족 오류 발생 시 다른 모델로 전환', '재시도 로직은 일시적 오류를 처리하는 데 유용하지만, 피크 시 지속적인 용량 부족을 해결하지 못합니다. 또한 "다른 모델로 전환"은 동일 모델 버전 유지 요구사항에 위배됩니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q164', '파운데이션 모델의 적용');


-- ── 문제 65: Amazon Bedrock Prompt Management ─────────────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q165',
  'aws-aif-c01',
  '한 대기업이 여러 사업부에서 총 50개의 AI 애플리케이션을 운영하고 있으며, 각 애플리케이션은 여러 개의 시스템 프롬프트를 사용합니다. 현재 프롬프트가 애플리케이션 코드에 하드코딩되어 있어 다음 문제가 발생합니다.

[현재 문제]
• 프롬프트를 수정하려면 코드 변경 → 테스트 → 배포 과정이 필요하여 시간이 오래 걸린다
• 어떤 프롬프트 버전이 현재 운영 중인지 파악하기 어렵다
• 팀 간 좋은 프롬프트를 공유하고 재사용하는 메커니즘이 없다
• 새로운 프롬프트 버전의 성능을 A/B 테스트로 검증하기 어렵다

다음 중 이 문제를 해결하기 위한 가장 적합한 Amazon Bedrock 기능은?',
  'b',
  'Amazon Bedrock Prompt Management가 이 문제를 해결하는 최적의 솔루션입니다.

Amazon Bedrock Prompt Management의 주요 기능:

1) 중앙 집중식 프롬프트 저장소
   - 모든 프롬프트를 Bedrock 콘솔에서 중앙 관리
   - 팀 간 공유 및 재사용 가능

2) 버전 관리
   - 프롬프트 버전 자동 관리 (v1, v2, v3...)
   - 어떤 버전이 어디에 사용 중인지 추적
   - 이전 버전으로 즉시 롤백 가능

3) 코드-프롬프트 분리
   - 애플리케이션 코드는 프롬프트 ARN만 참조
   - 코드 변경 없이 콘솔에서 프롬프트 즉시 업데이트
   - 코드 배포 없이 프롬프트 수정 가능

4) 변수 및 템플릿 지원
   - {{variable}} 형식으로 동적 변수 삽입
   - 재사용 가능한 프롬프트 템플릿 생성

5) 테스트 및 비교
   - 콘솔에서 직접 프롬프트 테스트
   - 여러 버전 성능 비교 (A/B 테스트 지원)

IAM 통합:
• 특정 팀만 프롬프트 수정 권한 부여
• 읽기 전용 접근으로 다른 팀이 프롬프트 재사용',
  2,
  'Amazon Bedrock Prompt Management:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
핵심 기능:
• 중앙 프롬프트 저장소
• 버전 관리 (자동 버전 번호 부여)
• 프롬프트 ARN으로 코드에서 참조
• 코드 배포 없이 프롬프트 업데이트
• 팀 간 공유 및 IAM 접근 제어
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
코드 연동 방식:
// 기존: 프롬프트 하드코딩
system_prompt = "당신은 친절한 AI입니다..."

// Prompt Management 사용:
response = bedrock.converse(
  promptIdentifier="arn:aws:bedrock:us-east-1:123:prompt/abc123",
  promptVersion="2"
)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
버전 관리 워크플로우:
1) 콘솔에서 프롬프트 수정
2) 새 버전 생성 (자동 버전 번호)
3) 테스트 환경에서 새 버전 검증
4) 프로덕션에서 버전 업데이트
5) 문제 시 이전 버전으로 롤백
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
관련 Bedrock 기능:
• Prompt Flows: 프롬프트 체인 시각적 구성
• Bedrock Agents: 복잡한 다단계 작업 자동화
• Knowledge Bases: RAG 기반 문서 검색
• Guardrails: 안전 필터 적용',
  '{}',
  '[{"name": "Amazon Bedrock Prompt Management", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html"}, {"name": "Bedrock 프롬프트 버전 관리", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management-version.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q165', 'a', 'AWS Systems Manager Parameter Store에 프롬프트를 저장하고 배포 시 코드에서 읽어오도록 구현', 'Parameter Store는 설정값/시크릿 저장에 유용하지만, 프롬프트 버전 관리, 팀 간 공유, A/B 테스트 등 프롬프트 라이프사이클 관리 기능이 없습니다. Bedrock과의 통합도 수동으로 구현해야 합니다.', 1),
  ('awsaifc01-q165', 'b', 'Amazon Bedrock Prompt Management로 프롬프트를 중앙 저장소에서 버전 관리하고, 애플리케이션은 프롬프트 ARN만 참조하여 코드 변경 없이 콘솔에서 프롬프트 업데이트 가능', 'Bedrock Prompt Management는 코드-프롬프트 분리, 버전 관리, 팀 간 공유, 코드 변경 없는 프롬프트 업데이트, A/B 테스트 지원 등 모든 문제를 해결하는 최적의 솔루션입니다.', 2),
  ('awsaifc01-q165', 'c', 'Amazon S3 버킷에 프롬프트 JSON 파일을 저장하고 애플리케이션 시작 시 로드', 'S3에 저장하면 코드와의 분리는 가능하지만, 버전 관리(자동 버전 번호, 롤백), Bedrock 통합 API, 팀 간 공유 UI, A/B 테스트 기능이 없습니다. 별도 운영 도구를 직접 구축해야 합니다.', 3),
  ('awsaifc01-q165', 'd', 'GitHub 저장소에서 프롬프트를 버전 관리하고 CI/CD 파이프라인으로 코드에 자동 주입', 'GitHub + CI/CD는 버전 관리는 되지만, 여전히 코드 배포가 필요합니다. "코드 변경 없이 프롬프트 수정" 요구사항을 충족하지 못하며, 비개발자가 프롬프트를 수정하기 어렵습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q165', '파운데이션 모델의 적용');


-- ── 세트 1에 추가 문제 15개 등록 (sort_order 51-65) ──
INSERT INTO exam_set_questions (set_id, question_id, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q151', 51),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q152', 52),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q153', 53),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q154', 54),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q155', 55),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q156', 56),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q157', 57),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q158', 58),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q159', 59),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q160', 60),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q161', 61),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q162', 62),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q163', 63),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q164', 64),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q165', 65);
