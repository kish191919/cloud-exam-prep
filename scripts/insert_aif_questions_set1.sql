-- ============================================================
-- AWS Certified AI Practitioner (AIF-C01) 세트 1
-- 도메인: AI 및 ML의 기초 - 예상 기출문제 10개
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- ── 문제 1: AI / ML / 딥러닝 계층 관계 ─────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q101',
  'aws-aif-c01',
  '한 기업의 데이터 사이언티스트가 신입 직원들에게 AI 기술 스택을 교육하고 있습니다. "우리 회사의 고객 추천 시스템은 다층 신경망을 사용하여 구매 패턴을 학습하며, 이는 더 넓은 AI 분야의 하위 집합에 속합니다."라고 설명했습니다.

다음 중 AI, 머신러닝(ML), 딥러닝의 관계를 올바르게 설명한 것은 무엇입니까?',
  'b',
  'AI는 가장 광범위한 개념으로 인간의 지능을 모방하는 모든 기술을 포함합니다. ML은 AI의 하위 집합으로 명시적 프로그래밍 없이 데이터로부터 학습하는 알고리즘을 다룹니다. 딥러닝은 ML의 하위 집합으로 여러 층의 인공 신경망을 사용하여 복잡한 패턴을 학습합니다. 따라서 AI ⊃ ML ⊃ 딥러닝의 계층 구조이며, 생성형 AI(GenAI)는 딥러닝의 하위 집합입니다.',
  1,
  'AI > ML > 딥러닝 > GenAI 계층 구조 암기
• AI (인공지능): 가장 광범위, 인간 지능 모방
• ML (머신러닝): AI의 하위 집합, 데이터로부터 학습
• 딥러닝: ML의 하위 집합, 다층 신경망 사용
• GenAI: 딥러닝의 하위 집합, 새로운 콘텐츠 생성',
  '{}',
  '[{"name": "AWS AI/ML 개념 가이드", "url": "https://aws.amazon.com/machine-learning/what-is-ai/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q101', 'a', '딥러닝 ⊃ 머신러닝 ⊃ AI (딥러닝이 가장 광범위한 개념)', '딥러닝은 가장 좁은 개념입니다. 특정 유형의 ML 기법입니다.', 1),
  ('awsaifc01-q101', 'b', 'AI ⊃ 머신러닝 ⊃ 딥러닝 (AI가 가장 광범위한 개념)', 'AI가 가장 넓은 개념이며, ML은 AI의 하위 집합, 딥러닝은 ML의 하위 집합입니다.', 2),
  ('awsaifc01-q101', 'c', '머신러닝 ⊃ AI ⊃ 딥러닝 (머신러닝이 가장 광범위한 개념)', 'ML은 AI보다 광범위한 개념이 아닙니다. ML은 AI의 하위 집합입니다.', 3),
  ('awsaifc01-q101', 'd', 'AI, 머신러닝, 딥러닝은 모두 동일한 개념의 다른 표현이다', '세 개념은 명확히 다른 범위와 의미를 가집니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q101', 'AI 및 ML의 기초');


-- ── 문제 2: 지도/비지도/강화 학습 유형 매칭 ─────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q102',
  'aws-aif-c01',
  '한 금융 회사에서 세 가지 ML 프로젝트를 동시에 진행하고 있습니다.

• 프로젝트 1: 과거 사기 거래(정상/사기 레이블 포함)를 학습하여 새로운 사기 거래를 감지
• 프로젝트 2: 레이블 없는 수백만 건의 고객 구매 데이터를 분석하여 유사한 행동 패턴을 가진 고객 그룹을 자동으로 발견
• 프로젝트 3: AI 트레이딩 에이전트가 시장 시뮬레이션 환경에서 수익을 최대화하도록 반복적인 시행착오를 통해 학습

각 프로젝트에 가장 적합한 ML 학습 유형을 올바르게 매칭한 것은?',
  'c',
  '프로젝트 1(사기 감지)은 레이블된 데이터(정상/사기)로 훈련하는 지도 학습(분류)입니다. 프로젝트 2(고객 그룹화)는 레이블 없이 유사한 패턴을 찾는 비지도 학습(클러스터링)입니다. 프로젝트 3(트레이딩 AI)은 보상 신호를 통해 최적의 행동을 학습하는 강화 학습입니다.',
  2,
  '3가지 ML 학습 유형 핵심 구분:
• 지도 학습 (Supervised): 레이블된 입력-출력 쌍 데이터 사용 → 분류, 회귀
• 비지도 학습 (Unsupervised): 레이블 없는 데이터에서 패턴 발견 → 클러스터링, 차원축소
• 강화 학습 (Reinforcement): 에이전트가 환경과 상호작용, 보상/페널티로 학습 → 게임AI, 로봇, 자율주행',
  '{}',
  '[{"name": "Amazon SageMaker 학습 유형", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/algorithms-choose.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q102', 'a', '1-비지도학습, 2-지도학습, 3-강화학습', '프로젝트 1은 레이블 데이터가 있으므로 지도 학습입니다.', 1),
  ('awsaifc01-q102', 'b', '1-강화학습, 2-지도학습, 3-비지도학습', '레이블 데이터를 사용하는 사기 감지는 지도 학습, 보상으로 학습하는 트레이딩은 강화 학습입니다.', 2),
  ('awsaifc01-q102', 'c', '1-지도학습, 2-비지도학습, 3-강화학습', '레이블된 사기 데이터→지도학습, 레이블 없는 그룹화→비지도학습, 보상 기반 학습→강화학습입니다.', 3),
  ('awsaifc01-q102', 'd', '1-지도학습, 2-강화학습, 3-비지도학습', '트레이딩 에이전트는 보상 최대화를 위한 강화 학습이고, 그룹화는 비지도 학습입니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q102', 'AI 및 ML의 기초');


-- ── 문제 3: 회귀/분류/클러스터링 기법 선택 ─────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q103',
  'aws-aif-c01',
  '한 이커머스 기업의 데이터 팀이 세 가지 비즈니스 문제를 해결하려고 합니다.

• 문제 A: 과거 판매 데이터를 기반으로 내년도 분기별 정확한 매출액(연속된 숫자) 예측
• 문제 B: 수신된 이메일이 스팸(spam)인지 정상(ham)인지 구분
• 문제 C: 레이블이 없는 10만 명의 고객을 구매 패턴에 따라 유사한 그룹으로 자동 분류

각 문제에 가장 적합한 ML 기법을 올바르게 선택한 것은?',
  'c',
  '문제 A(매출 예측)는 연속적인 수치를 예측하는 회귀(Regression)가 적합합니다. 문제 B(스팸/정상 구분)는 미리 정의된 카테고리로 분류하는 분류(Classification)가 적합합니다. 문제 C(고객 그룹화)는 레이블 없이 유사한 데이터를 그룹화하는 클러스터링(Clustering)이 적합합니다.',
  2,
  'ML 기법 선택 기준:
• 회귀 (Regression): 연속형 숫자 예측 → 가격, 온도, 매출액, 나이
• 분류 (Classification): 이산형 범주 예측 → 스팸/정상, 양성/음성, 고양이/개
• 클러스터링 (Clustering): 레이블 없이 유사 그룹 발견 → 고객 세분화, 문서 그룹화
핵심 구분: 출력이 숫자면 회귀, 카테고리면 분류, 레이블 없으면 클러스터링',
  '{}',
  '[{"name": "ML 알고리즘 선택 가이드", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/algorithms-choose.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q103', 'a', 'A-분류, B-회귀, C-클러스터링', '매출액은 연속형 숫자이므로 회귀, 스팸/정상은 범주이므로 분류가 적합합니다.', 1),
  ('awsaifc01-q103', 'b', 'A-클러스터링, B-분류, C-회귀', '매출 예측은 수치를 예측하는 회귀이며, 레이블 없는 그룹화는 클러스터링입니다.', 2),
  ('awsaifc01-q103', 'c', 'A-회귀, B-분류, C-클러스터링', '연속형 수치 예측→회귀, 범주 분류→분류, 레이블 없는 그룹화→클러스터링입니다.', 3),
  ('awsaifc01-q103', 'd', 'A-회귀, B-클러스터링, C-분류', '스팸/정상은 미리 정의된 두 가지 범주이므로 분류이며, 레이블 없는 그룹화는 클러스터링입니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q103', 'AI 및 ML의 기초');


-- ── 문제 4: AWS AI 서비스 선택 (Transcribe + Comprehend) ────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q104',
  'aws-aif-c01',
  '한 보험 회사가 고객 서비스 품질 개선을 위해 다음 시스템을 구축하려고 합니다. 고객과의 전화 통화 음성을 자동으로 텍스트로 변환하고, 변환된 텍스트에서 고객의 감정(긍정/부정/중립)을 분석하여 즉각적인 처리가 필요한 불만 고객을 실시간으로 식별합니다.

이 요구사항에 가장 적합한 AWS 서비스 조합은?',
  'b',
  'Amazon Transcribe는 자동 음성 인식(ASR) 서비스로 음성을 텍스트로 변환합니다. Amazon Comprehend는 자연어 처리(NLP) 서비스로 텍스트에서 감성 분석, 개체 인식, 핵심어 추출 등을 수행합니다. 이 두 서비스의 조합이 "음성→텍스트→감성 분석" 파이프라인에 가장 적합합니다. Polly는 텍스트→음성, Rekognition은 이미지/영상 분석, Lex는 챗봇, Textract는 문서 OCR 서비스입니다.',
  2,
  'AWS AI 서비스 핵심 기능 암기:
• Amazon Transcribe: 음성 → 텍스트 (ASR, Speech-to-Text)
• Amazon Comprehend: 텍스트 NLP 분석 (감성분석, 개체명인식, 핵심어추출, 언어감지)
• Amazon Polly: 텍스트 → 음성 (TTS, Text-to-Speech)
• Amazon Rekognition: 이미지/영상 분석 (얼굴인식, 객체탐지, 텍스트감지)
• Amazon Lex: 대화형 챗봇 구축 (음성/텍스트 기반)
• Amazon Textract: 문서/이미지에서 텍스트 및 데이터 추출 (OCR+)',
  '{}',
  '[{"name": "Amazon Transcribe 공식 문서", "url": "https://aws.amazon.com/transcribe/"}, {"name": "Amazon Comprehend 공식 문서", "url": "https://aws.amazon.com/comprehend/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q104', 'a', 'Amazon Polly + Amazon Rekognition', 'Polly는 텍스트→음성(TTS), Rekognition은 이미지 분석 서비스입니다. 음성→텍스트 변환이나 감성 분석에 적합하지 않습니다.', 1),
  ('awsaifc01-q104', 'b', 'Amazon Transcribe + Amazon Comprehend', 'Transcribe로 음성→텍스트 변환, Comprehend로 감성 분석을 수행합니다.', 2),
  ('awsaifc01-q104', 'c', 'Amazon Lex + Amazon Translate', 'Lex는 대화형 챗봇 구축 서비스이며, Translate는 언어 번역 서비스입니다. 음성 변환이나 감성 분석에 적합하지 않습니다.', 3),
  ('awsaifc01-q104', 'd', 'Amazon Textract + Amazon Kendra', 'Textract는 문서 OCR, Kendra는 엔터프라이즈 검색 서비스입니다. 음성 통화 분석에 적합하지 않습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q104', 'AI 및 ML의 기초');


-- ── 문제 5: ML이 부적합한 경우 ──────────────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q105',
  'aws-aif-c01',
  '다음 중 ML/AI 솔루션보다 기존의 규칙 기반(rule-based) 프로그래밍이 더 적합한 경우는 무엇입니까?',
  'c',
  '세금 계산은 세법에 따라 명확하게 정의된 규칙이 존재하며, 법적으로 100% 정확한 결정론적 결과가 필요합니다. ML은 통계적 패턴을 학습하여 확률적 예측을 하기 때문에 오류 가능성이 있습니다. ML은 명확한 규칙이 없고 패턴이 복잡하거나, 대규모 데이터에서 자동화가 필요한 경우에 적합합니다. 감성 분석, 의료 이미지 진단, 개인화 추천은 모두 명확한 규칙으로 정의하기 어려운 복잡한 패턴 인식이 필요합니다.',
  2,
  'ML이 적합한 경우 vs 부적합한 경우:
■ ML 적합: 패턴이 복잡해 규칙화 어려움, 대규모 데이터, 개인화 필요, 예측/추천
■ ML 부적합:
  - 명확한 규칙이 존재하는 경우 (세금 계산, 법률 조항 적용)
  - 100% 정확도/결정론적 결과 필요
  - 설명 책임이 필요한 법적 결정
  - 훈련 데이터 부족
  - ML 구축 비용 > 기대 가치',
  '{}',
  '[{"name": "AWS ML 사용 사례 가이드", "url": "https://aws.amazon.com/machine-learning/use-cases/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q105', 'a', '수백만 건의 고객 리뷰에서 제품에 대한 긍정/부정 감성을 자동으로 분석', '감성 분석은 텍스트의 복잡한 뉘앙스를 이해해야 하며, 규칙으로 정의하기 어렵습니다. ML(Amazon Comprehend)이 적합합니다.', 1),
  ('awsaifc01-q105', 'b', '의료 이미지(X-ray)에서 초기 암 병변 의심 부위를 탐지하여 의사의 진단을 지원', '의료 이미지 분석은 복잡한 시각적 패턴 인식이 필요하며 ML(Amazon Rekognition, SageMaker)이 적합합니다.', 2),
  ('awsaifc01-q105', 'c', '국가 세법에 따라 개인 및 법인의 정확한 세금 납부액 계산', '세금 계산은 명확한 법적 규칙이 있고 100% 정확한 결과가 필요합니다. ML보다 규칙 기반 프로그래밍이 적합합니다.', 3),
  ('awsaifc01-q105', 'd', '수천 명의 사용자 시청 기록을 기반으로 개인화된 콘텐츠 추천 제공', '개인화 추천은 복잡한 사용자 패턴을 학습해야 하며 ML(Amazon Personalize)이 적합합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q105', 'AI 및 ML의 기초');


-- ── 문제 6: 배치 vs 실시간 추론 ─────────────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q106',
  'aws-aif-c01',
  '다음 두 가지 시나리오에 가장 적합한 Amazon SageMaker AI 추론 방식을 올바르게 선택한 것은?

• 시나리오 A: 온라인 쇼핑몰에서 사용자가 상품 페이지를 방문하는 즉시 개인화된 추천 상품을 표시 (응답 시간 100ms 이하 요구)
• 시나리오 B: 매일 새벽 2시에 당일 누적된 100만 건의 신용카드 거래 데이터를 일괄 분석하여 이상 거래 보고서 생성',
  'b',
  '시나리오 A는 100ms 이하의 낮은 지연 시간이 필요한 실시간 요청이므로 SageMaker 실시간 추론(Real-time Inference) 엔드포인트가 적합합니다. 시나리오 B는 즉각적인 응답이 필요 없고 대량의 데이터를 정해진 시간에 일괄 처리하는 배치 작업이므로 SageMaker 배치 변환(Batch Transform)이 적합합니다. 배치 변환은 지속적인 엔드포인트 없이 대량 데이터를 비용 효율적으로 처리합니다.',
  2,
  'SageMaker AI 추론 유형 4가지:
• 실시간 추론 (Real-time): 낮은 지연(ms), 지속적 엔드포인트, 즉각 응답 필요
• 배치 변환 (Batch Transform): 대량 데이터 일괄 처리, 지속 엔드포인트 불필요, 비용 효율적
• 비동기 추론 (Async): 대용량 페이로드(최대 1GB), 처리시간 ~15분, 즉각 응답 불필요
• 서버리스 추론 (Serverless): 간헐적 트래픽, 콜드 스타트 허용, 사용량 기반 과금',
  '{}',
  '[{"name": "SageMaker 추론 옵션 비교", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q106', 'a', 'A-배치 변환, B-실시간 추론', '실시간 추천에는 낮은 지연이 필요하므로 실시간 추론이, 야간 일괄 처리에는 배치 변환이 적합합니다.', 1),
  ('awsaifc01-q106', 'b', 'A-실시간 추론, B-배치 변환', '즉각적인 추천에 실시간 추론, 대량 일괄 분석에 배치 변환이 적합합니다.', 2),
  ('awsaifc01-q106', 'c', 'A-비동기 추론, B-실시간 추론', '비동기 추론은 즉각 응답이 불필요한 대용량 처리에 적합하며, 실시간 추천에는 맞지 않습니다.', 3),
  ('awsaifc01-q106', 'd', 'A-서버리스 추론, B-비동기 추론', '100ms 응답이 필요한 추천에는 서버리스(콜드 스타트 위험)나 비동기가 부적합합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q106', 'AI 및 ML의 기초');


-- ── 문제 7: ML 파이프라인 단계 순서 ─────────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q107',
  'aws-aif-c01',
  '한 데이터 사이언티스트가 고객 이탈(churn) 예측 모델을 개발하고 있습니다. 다음 ML 파이프라인의 각 단계를 올바른 순서로 나열한 것은?

① 모델 훈련
② 원시 데이터 수집
③ 하이퍼파라미터 튜닝
④ 특성 추출 및 엔지니어링
⑤ 탐색적 데이터 분석(EDA)
⑥ 모델 성능 평가
⑦ 프로덕션 환경 배포',
  'a',
  'ML 파이프라인의 표준 순서는 다음과 같습니다: ②데이터 수집 → ⑤EDA(데이터 이해) → ④특성 추출/엔지니어링(데이터 변환) → ①모델 훈련 → ③하이퍼파라미터 튜닝(최적화) → ⑥평가(성능 검증) → ⑦배포(프로덕션 적용)입니다. EDA를 통해 데이터를 이해한 후 특성을 선택/변환하고, 모델 훈련 후 최적화, 평가, 배포 순서로 진행합니다.',
  2,
  'ML 파이프라인 7단계 순서 (반드시 암기):
1. 데이터 수집 (Data Collection)
2. 탐색적 데이터 분석 EDA (Exploratory Data Analysis)
3. 데이터 전처리/특성 엔지니어링 (Feature Engineering)
4. 모델 훈련 (Model Training)
5. 하이퍼파라미터 튜닝 (Hyperparameter Tuning)
6. 모델 평가 (Model Evaluation)
7. 배포 (Deployment) → 모니터링 (Monitoring)
AWS 서비스: SageMaker Data Wrangler → SageMaker → SageMaker Model Monitor',
  '{}',
  '[{"name": "SageMaker ML 파이프라인", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/how-it-works-training.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q107', 'a', '② → ⑤ → ④ → ① → ③ → ⑥ → ⑦', '데이터 수집 → EDA → 특성 추출 → 모델 훈련 → 하이퍼파라미터 튜닝 → 평가 → 배포 순서입니다.', 1),
  ('awsaifc01-q107', 'b', '② → ④ → ⑤ → ③ → ① → ⑥ → ⑦', 'EDA는 특성 추출 이전에 수행하여 데이터를 먼저 이해해야 합니다.', 2),
  ('awsaifc01-q107', 'c', '② → ① → ⑤ → ④ → ③ → ⑥ → ⑦', '모델 훈련 전에 EDA와 특성 추출이 먼저 이루어져야 합니다.', 3),
  ('awsaifc01-q107', 'd', '⑤ → ② → ④ → ① → ③ → ⑦ → ⑥', '데이터 수집 없이 EDA를 먼저 할 수 없으며, 평가 전 배포는 잘못된 순서입니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q107', 'AI 및 ML의 기초');


-- ── 문제 8: SageMaker 서비스 기능 매칭 ──────────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q108',
  'aws-aif-c01',
  '한 기업의 MLOps 팀이 Amazon SageMaker AI를 사용하여 엔터프라이즈 ML 플랫폼을 구축하고 있습니다. 다음 세 가지 요구사항에 가장 적합한 SageMaker 기능을 올바르게 매칭한 것은?

• 요구사항 1: 여러 팀이 공통으로 사용하는 ML 특성(features)을 중앙에서 저장, 관리, 재사용
• 요구사항 2: 프로덕션 배포된 모델의 예측 품질 저하 및 데이터 드리프트를 자동으로 감지
• 요구사항 3: 코드 없이 시각적 인터페이스로 데이터 정제, 변환, 시각화 수행',
  'b',
  'SageMaker Feature Store는 ML 특성을 중앙 저장소에서 관리하고 온라인(실시간)과 오프라인(배치) 스토어를 제공합니다. SageMaker Model Monitor는 배포된 모델의 데이터 품질, 모델 품질, 편향, 특성 중요도를 지속적으로 모니터링합니다. SageMaker Data Wrangler는 300개 이상의 내장 데이터 변환 기능을 갖춘 시각적 데이터 준비 도구입니다.',
  2,
  'SageMaker AI 핵심 구성 요소:
• Feature Store: 특성 중앙 저장소, 재사용, 온라인+오프라인 스토어
• Model Monitor: 프로덕션 모델 감시, 데이터 드리프트/모델 품질/편향 감지
• Data Wrangler: 노코드 데이터 준비, 300+ 변환 기능, EDA 시각화
• SageMaker Pipelines: ML 워크플로우 자동화 (MLOps CI/CD)
• SageMaker Experiments: 실험 추적 및 비교',
  '{}',
  '[{"name": "SageMaker 구성 요소 가이드", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q108', 'a', '1-Model Monitor, 2-Feature Store, 3-Data Wrangler', 'Feature Store가 특성 관리를, Model Monitor가 모니터링을 담당합니다. 순서가 바뀌었습니다.', 1),
  ('awsaifc01-q108', 'b', '1-Feature Store, 2-Model Monitor, 3-Data Wrangler', 'Feature Store(특성 관리), Model Monitor(프로덕션 감시), Data Wrangler(데이터 준비)가 정확히 매칭됩니다.', 2),
  ('awsaifc01-q108', 'c', '1-Data Wrangler, 2-Feature Store, 3-Model Monitor', 'Data Wrangler는 특성 저장소가 아닌 데이터 변환 도구입니다.', 3),
  ('awsaifc01-q108', 'd', '1-Feature Store, 2-Data Wrangler, 3-Model Monitor', 'Model Monitor가 모니터링, Data Wrangler가 데이터 준비 역할입니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q108', 'AI 및 ML의 기초');


-- ── 문제 9: 모델 평가 지표 선택 (재현율 vs 정밀도) ──────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q109',
  'aws-aif-c01',
  '한 헬스케어 회사가 Amazon SageMaker AI로 폐암 조기 진단 모델을 개발했습니다. 테스트 결과, 실제 암 환자 100명 중 90명을 올바르게 감지했지만, 암이 없는 환자 중 일부를 잘못 양성으로 분류했습니다.

이 의료 진단 모델에서 "실제 암 환자를 놓치는 것(false negative)"을 최소화하는 것이 최우선 목표일 때, 모델 성능 개선을 위해 가장 집중해야 할 평가 지표는?',
  'c',
  '재현율(Recall/Sensitivity) = TP / (TP + FN)으로, 실제 양성 중 모델이 올바르게 양성으로 예측한 비율입니다. 암 진단처럼 false negative(실제 환자를 정상으로 오진)의 결과가 치명적인 경우 재현율 최대화가 최우선입니다. 정밀도는 false positive(정상인을 환자로 오진) 최소화에 집중합니다. 정확도는 불균형 데이터에서 실제 성능을 오해하게 할 수 있습니다.',
  3,
  '모델 평가 지표 핵심:
• 정확도 (Accuracy): (TP+TN)/전체 - 균형 데이터에 적합, 불균형 데이터에서는 오해 가능
• 정밀도 (Precision): TP/(TP+FP) - FP 최소화 목표, "양성 판정의 신뢰도"
• 재현율 (Recall/Sensitivity): TP/(TP+FN) - FN 최소화 목표, "실제 양성 탐지율"
• F1 Score: 정밀도와 재현율의 조화평균 (균형 필요 시)
• AUC-ROC: 전반적 모델 분류 성능 (임계값 독립적)
암기팁: FN이 치명적 → Recall 중시 / FP가 치명적 → Precision 중시',
  '{}',
  '[{"name": "ML 모델 평가 지표", "url": "https://docs.aws.amazon.com/machine-learning/latest/dg/binary-model-insights.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q109', 'a', '정확도 (Accuracy)', '정확도는 전체 예측 중 맞은 비율로, 암 환자가 전체의 소수일 경우 (불균형 데이터) 실제 성능을 오해하게 합니다.', 1),
  ('awsaifc01-q109', 'b', '정밀도 (Precision)', '정밀도는 양성 예측 중 실제 양성 비율(FP 최소화)에 집중하며, 암 환자를 놓치는 FN 문제를 해결하지 못합니다.', 2),
  ('awsaifc01-q109', 'c', '재현율 (Recall)', '재현율 = TP/(TP+FN)으로, 실제 암 환자를 놓치는 FN을 최소화하는 데 가장 적합한 지표입니다.', 3),
  ('awsaifc01-q109', 'd', '특이도 (Specificity)', '특이도는 실제 음성 중 올바르게 음성으로 예측한 비율(TN/TN+FP)로, FN 최소화에 직접 관련이 없습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q109', 'AI 및 ML의 기초');


-- ── 문제 10: 데이터 드리프트와 MLOps (Model Monitor) ────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q110',
  'aws-aif-c01',
  '한 전자상거래 기업이 Amazon SageMaker AI로 구축한 상품 수요 예측 모델을 8개월간 운영했습니다. 초기에는 예측 정확도가 92%였으나 현재 74%로 떨어졌습니다. 데이터 팀이 분석한 결과, 소비자 구매 패턴이 대폭 변화하여 현재 실제 데이터의 통계적 분포가 모델 훈련 시 사용한 데이터와 크게 달라진 것을 발견했습니다.

이 현상을 설명하는 올바른 용어와, SageMaker AI에서 이를 자동으로 감지할 수 있는 기능의 조합은?',
  'b',
  '이 현상은 데이터 드리프트(Data Drift)입니다. 시간이 지남에 따라 프로덕션 환경의 실제 데이터 분포가 모델 훈련 시 사용한 데이터 분포와 달라지는 것을 말합니다. SageMaker Model Monitor는 프로덕션 엔드포인트에서 수집되는 데이터를 기준 통계치(baseline)와 자동으로 비교하여 데이터 드리프트, 모델 품질 저하, 편향 등을 감지하고 Amazon CloudWatch를 통해 경보를 발생시킵니다.',
  3,
  'MLOps 핵심 개념:
• 데이터 드리프트 (Data Drift): 실제 입력 데이터의 통계적 분포 변화
• 개념 드리프트 (Concept Drift): 입력-출력 관계 자체가 변화
• 모델 품질 저하 → 정기적 모니터링 및 재훈련 필요
• SageMaker Model Monitor 4가지 감시 유형:
  1. 데이터 품질 (Data Quality)
  2. 모델 품질 (Model Quality)
  3. 편향 드리프트 (Bias Drift)
  4. 특성 중요도 (Feature Attribution)
• MLOps 원칙: 실험 추적, 자동화, 지속적 모니터링, 모델 재훈련',
  '{}',
  '[{"name": "SageMaker Model Monitor", "url": "https://docs.aws.amazon.com/sagemaker/latest/dg/model-monitor.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q110', 'a', '과적합 (Overfitting) - SageMaker Debugger', '과적합은 훈련 데이터에 너무 맞춰져 새로운 데이터에서 성능이 낮은 현상으로, 데이터 분포 변화로 인한 문제가 아닙니다.', 1),
  ('awsaifc01-q110', 'b', '데이터 드리프트 (Data Drift) - SageMaker Model Monitor', '시간에 따른 데이터 분포 변화(데이터 드리프트)를 Model Monitor가 자동으로 감지합니다.', 2),
  ('awsaifc01-q110', 'c', '언더피팅 (Underfitting) - SageMaker Experiments', '언더피팅은 모델이 훈련 데이터조차 제대로 학습하지 못한 경우이며, 운영 중 발생하는 성능 저하와는 다릅니다.', 3),
  ('awsaifc01-q110', 'd', '클래스 불균형 (Class Imbalance) - SageMaker Data Wrangler', '클래스 불균형은 훈련 데이터 문제이며, 운영 중 데이터 분포 변화로 인한 성능 저하와는 다릅니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q110', 'AI 및 ML의 기초');


-- ── 세트 1에 10개 문제 모두 추가 ────────────────────────────
INSERT INTO exam_set_questions (set_id, question_id, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q101', 1),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q102', 2),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q103', 3),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q104', 4),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q105', 5),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q106', 6),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q107', 7),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q108', 8),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q109', 9),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q110', 10);
