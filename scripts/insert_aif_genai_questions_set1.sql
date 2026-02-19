-- ============================================================
-- AWS Certified AI Practitioner (AIF-C01) 세트 1
-- 도메인: GenAI의 기초 - 예상 기출문제 10개 (문제 11-20)
-- Supabase SQL Editor에서 실행하세요
-- ============================================================


-- ── 문제 11: 토큰, 컨텍스트 윈도우, LLM 기반 요금 ──────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q111',
  'aws-aif-c01',
  '한 AI 스타트업이 Amazon Bedrock의 Claude 모델로 기업용 문서 분석 서비스를 출시하려고 합니다. CTO가 월간 비용을 추정하기 위해 토큰 기반 요금 체계를 팀에게 설명하고 있습니다.

다음 중 LLM의 토큰(Token)과 컨텍스트 윈도우(Context Window)에 대한 설명으로 가장 올바른 것은?',
  'c',
  'LLM에서 토큰은 텍스트를 처리하는 기본 단위로, 단어 전체 또는 단어의 일부(형태소)가 될 수 있습니다. 영어 기준 1토큰 ≈ 4자 또는 약 3/4 단어이며, 한국어는 구조적 특성상 영어보다 더 많은 토큰을 사용합니다. Amazon Bedrock 요금은 처리된 입력 토큰과 출력 토큰의 합산으로 부과되며, 출력 토큰이 입력 토큰보다 일반적으로 더 비쌉니다. 컨텍스트 윈도우는 모델이 한 번에 처리할 수 있는 최대 토큰 수를 의미하며, 이를 초과하는 입력은 잘리거나 오류가 발생합니다.',
  1,
  'LLM 토큰과 요금 핵심 정리:
• 토큰 = LLM의 텍스트 처리 기본 단위 (단어 또는 형태소 단위)
• 영어: 1토큰 ≈ 4자(character) / 0.75 단어
• 한국어: 영어 대비 더 많은 토큰 소비 → 비용 주의
• Amazon Bedrock 요금 = (입력 토큰 + 출력 토큰) × 단가/1K토큰
• 출력 토큰 단가 > 입력 토큰 단가 (보통 2~3배)

컨텍스트 윈도우 (Context Window):
• 모델이 한 번의 추론에 처리 가능한 최대 토큰 수
• Claude 3 Sonnet: 200K 토큰 지원
• 길수록: 더 많은 정보 처리 가능 ↑ / 비용 ↑ / 속도 ↓

Bedrock 요금 모델:
• 온디맨드 (On-Demand): 사용한 토큰만큼 과금 (유연성 높음)
• 프로비저닝 처리량 (Provisioned Throughput): 처리량 예약, 대규모 안정적 처리',
  '{}',
  '[{"name": "Amazon Bedrock 요금", "url": "https://aws.amazon.com/bedrock/pricing/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q111', 'a', '토큰은 항상 하나의 완전한 단어와 동일하며, "Hello World"는 정확히 2개의 토큰이다', '토큰은 단어와 1:1 대응하지 않습니다. 단어 전체나 일부가 토큰이 될 수 있어 "Hello World"는 토크나이저에 따라 2~4개 토큰이 될 수 있습니다.', 1),
  ('awsaifc01-q111', 'b', '컨텍스트 윈도우는 모델이 응답을 생성하는 데 걸리는 최대 처리 시간(초)을 의미한다', '컨텍스트 윈도우는 시간이 아닌 최대 처리 가능한 토큰 수를 의미합니다.', 2),
  ('awsaifc01-q111', 'c', 'Amazon Bedrock 요금은 처리된 입력 토큰과 출력 토큰의 합산으로 부과되며, 출력 토큰이 입력 토큰보다 일반적으로 더 비싸다', '정확한 설명입니다. Bedrock은 토큰 기반 과금이며, 텍스트 생성에 해당하는 출력 토큰이 더 비쌉니다.', 3),
  ('awsaifc01-q111', 'd', '한국어와 영어는 동일한 토큰 수를 사용하므로 언어에 따른 비용 차이가 없다', '한국어는 형태소 구조 때문에 같은 내용의 영어보다 더 많은 토큰을 소비하여 비용이 높아질 수 있습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q111', 'GenAI의 기초');


-- ── 문제 12: 임베딩, 벡터 DB, RAG 아키텍처 (다이어그램 포함) ─
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q112',
  'aws-aif-c01',
  '한 글로벌 제조 기업이 1만 페이지 분량의 제품 매뉴얼과 기술 문서를 기반으로 고객 지원 챗봇을 구축하려 합니다. 챗봇이 문서에 없는 내용을 만들어내는 할루시네이션 없이, 실제 문서에 근거한 정확한 답변을 제공해야 합니다.

아래 아키텍처 흐름을 참고하여, 이 요구사항에 가장 적합한 GenAI 아키텍처를 선택하세요.

[문서 준비 단계]
  기술 문서
    → 청킹 (작은 조각으로 분할)
    → 임베딩 모델로 벡터 변환
    → 벡터 데이터베이스 저장

[질의응답 단계]
  사용자 질문
    → 임베딩 변환
    → 벡터 DB 유사도 검색
    → 관련 문서 청크 검색
    → LLM에 [질문 + 컨텍스트] 전달
    → 정확한 근거 기반 답변 생성',
  'b',
  '위 흐름도는 RAG(Retrieval-Augmented Generation, 검색 증강 생성) 아키텍처를 보여줍니다. RAG는 LLM의 훈련 데이터 한계를 극복하고, 특정 도메인 문서를 기반으로 정확하고 근거 있는 답변을 생성합니다.

핵심 구성 요소:
(1) 청킹: 긴 문서를 처리 가능한 작은 조각으로 분할
(2) 임베딩: 텍스트를 의미를 담은 수치 벡터로 변환 (의미적으로 유사한 텍스트 = 가까운 벡터)
(3) 벡터 DB: 코사인 유사도 등으로 빠른 유사도 검색 가능한 특수 데이터베이스
(4) 생성: 검색된 컨텍스트와 함께 LLM이 근거 있는 답변 생성

AWS에서는 Amazon Bedrock Knowledge Base가 이 전체 RAG 파이프라인을 완전관리형으로 제공합니다.',
  2,
  'RAG (Retrieval-Augmented Generation) 핵심 구성:
• 청킹 (Chunking): 문서를 처리 가능한 작은 조각으로 분할
  - 고정 크기 청킹 vs 의미 단위 청킹
• 임베딩 (Embedding): 텍스트 → 수치 벡터 변환
  - 의미적으로 유사한 텍스트 = 가까운 벡터값
  - AWS: Amazon Titan Embeddings 모델 사용
• 벡터 데이터베이스: 벡터 유사도 검색 특화 DB
  - AWS: Amazon OpenSearch Serverless, Amazon Aurora (pgvector)
  - 유사도 측정: 코사인 유사도, 유클리드 거리

RAG 장점:
• 할루시네이션 감소 (근거 있는 답변)
• 실시간 지식 업데이트 가능 (모델 재훈련 불필요)
• 소스 인용(Citation) 가능

AWS 서비스:
• Amazon Bedrock Knowledge Base: 완전관리형 RAG 구현
• 자동 청킹, 임베딩, 벡터 DB 관리 제공',
  '{}',
  '[{"name": "Amazon Bedrock Knowledge Base", "url": "https://aws.amazon.com/bedrock/knowledge-bases/"}, {"name": "RAG 아키텍처 가이드", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q112', 'a', '파인튜닝(Fine-tuning): LLM을 1만 페이지 문서로 추가 훈련하여 문서 내용을 모델 가중치에 직접 저장', '파인튜닝은 문서 내용을 정확하게 기억하기보다 스타일/패턴 학습에 적합합니다. 문서 업데이트 시 재훈련이 필요하고 환각 방지 효과가 낮습니다.', 1),
  ('awsaifc01-q112', 'b', 'RAG(검색 증강 생성): 문서를 청킹·임베딩하여 벡터 DB에 저장하고, 사용자 질문과 관련된 문서를 검색하여 LLM에 컨텍스트로 제공', '정확한 설명입니다. RAG는 외부 문서에서 관련 내용을 검색하여 LLM에 제공함으로써 정확하고 근거 있는 답변을 생성합니다.', 2),
  ('awsaifc01-q112', 'c', '프롬프트 엔지니어링: 시스템 프롬프트에 전체 1만 페이지 문서를 포함하여 매 요청 시 전달', '1만 페이지는 현재 어떤 모델의 컨텍스트 윈도우도 초과합니다. 모든 문서를 매번 전달하면 비용이 매우 높아집니다.', 3),
  ('awsaifc01-q112', 'd', '제로샷 프롬프팅: 사전 훈련된 LLM이 이미 모든 제품 문서 내용을 알고 있다고 가정하고 질문', '회사 내부 문서는 일반 LLM의 훈련 데이터에 포함되어 있지 않으므로, 외부 지식 주입 없이는 정확한 답변을 기대할 수 없습니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q112', 'GenAI의 기초');


-- ── 문제 13: 프롬프트 엔지니어링 기법 매칭 ─────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q113',
  'aws-aif-c01',
  '한 개발팀이 Amazon Bedrock에서 세 가지 다른 업무에 최적의 프롬프팅 기법을 적용하고 있습니다.

• 업무 A: 복잡한 수학 문제 ("전체 학생 수가 120명이고, 그 중 30%가 여학생, 여학생의 40%가 이과라면 이과 여학생은 몇 명인가?")를 단계별로 정확하게 풀게 합니다. 프롬프트에 "단계별로 생각해보세요"를 추가합니다.

• 업무 B: 고객 이메일을 "긴급/일반/스팸" 3가지로 분류하는 작업에서, 각 카테고리별 예시 이메일 3개씩을 먼저 보여준 후 새로운 이메일을 분류하게 합니다.

• 업무 C: 특별한 예시나 설명 없이 "다음 문장을 프랑스어로 번역하세요: I love cloud computing"이라고만 요청합니다.

각 업무에 적용된 프롬프트 엔지니어링 기법을 올바르게 매칭한 것은?',
  'b',
  '업무 A는 Chain-of-Thought(CoT) 프롬프팅입니다. "단계별로 생각해보세요"처럼 논리적 추론 과정을 단계별로 유도하여 복잡한 수학·논리 문제에서 정확도를 크게 향상시킵니다.

업무 B는 Few-shot 프롬프팅입니다. 여러 개의 예시(입력-출력 쌍)를 제공하여 모델이 원하는 출력 형식과 패턴을 학습하게 합니다. 9개의 예시(3카테고리 × 3개)를 제공하는 방식입니다.

업무 C는 Zero-shot 프롬프팅입니다. 예시 없이 지시만으로 수행하며, 번역처럼 단순명확한 작업에서는 예시 없이도 잘 수행됩니다.',
  2,
  '프롬프트 엔지니어링 핵심 기법 3가지:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Zero-shot 프롬프팅:
• 예시(Example) 없이 지시(Instruction)만으로 수행
• 적합: 번역, 간단한 요약, 명확한 작업
• 예: "다음 문장을 영어로 번역하세요: ..."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Few-shot 프롬프팅:
• 2~8개의 입출력 예시 제공 후 새로운 입력 처리
• 적합: 특정 형식 출력, 복잡한 분류, 스타일 매칭
• 예: [입력: 이메일A] [출력: 긴급] × 3쌍 후 새 이메일 분류
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chain-of-Thought (CoT):
• 단계별 추론 과정을 유도하는 프롬프팅
• "단계별로 생각해보세요 (Let''s think step by step)" 추가
• 적합: 수학 문제, 논리 추론, 복잡한 의사결정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
추가 기법:
• System Prompt: 모델의 역할/성격/규칙 정의
• Temperature: 0(결정론적) ~ 1(창의적) 조절',
  '{}',
  '[{"name": "Amazon Bedrock 프롬프트 엔지니어링 가이드", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-engineering-guidelines.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q113', 'a', 'A-Few-shot, B-Zero-shot, C-Chain-of-Thought', '수학 문제를 단계별로 푸는 것은 CoT, 예시를 보여주는 것은 Few-shot, 예시 없이 번역하는 것은 Zero-shot입니다. 순서가 바뀌었습니다.', 1),
  ('awsaifc01-q113', 'b', 'A-Chain-of-Thought, B-Few-shot, C-Zero-shot', '단계별 수학 풀이→CoT, 예시 제공 후 분류→Few-shot, 예시 없는 번역→Zero-shot으로 정확히 매칭됩니다.', 2),
  ('awsaifc01-q113', 'c', 'A-Zero-shot, B-Chain-of-Thought, C-Few-shot', 'Zero-shot은 예시 없는 직접 지시입니다. 복잡한 수학 추론에는 CoT, 예시 기반 분류에는 Few-shot이 적합합니다.', 3),
  ('awsaifc01-q113', 'd', 'A-Chain-of-Thought, B-Zero-shot, C-Few-shot', '이메일 분류에 예시 3개씩 제공하는 것은 Few-shot이며, 예시 없는 번역 요청은 Zero-shot입니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q113', 'GenAI의 기초');


-- ── 문제 14: 할루시네이션 원인과 RAG 해결책 ────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q114',
  'aws-aif-c01',
  '한 대형 법무법인이 Amazon Bedrock으로 법률 리서치 AI 어시스턴트를 도입했습니다. 그런데 변호사들이 AI가 생성한 판례 인용을 법원에 제출했다가, 실제로 존재하지 않는 사건 번호임을 발견했습니다. AI가 그럴듯하게 보이지만 실제로 존재하지 않는 법원 판례와 법 조항을 자신감 있게 생성한 것입니다.

이 문제를 설명하는 GenAI의 한계와, AWS에서 이를 최소화하기 위한 가장 적절한 해결책의 조합은?',
  'c',
  '이 현상은 GenAI의 "할루시네이션(Hallucination)"입니다. LLM은 훈련 데이터의 통계적 패턴을 학습하여 그럴듯해 보이는 텍스트를 생성하지만, 그 내용이 실제로 존재하는지 검증하지 않습니다. 이는 GenAI의 근본적인 한계 중 하나입니다.

가장 효과적인 해결책은 RAG(Retrieval-Augmented Generation)입니다. Amazon Bedrock Knowledge Base를 사용하여 공신력 있는 법률 데이터베이스를 벡터 DB에 저장하고, AI가 실제 문서를 검색하여 답변의 근거로 사용하게 합니다. 이를 통해 소스 인용이 가능해지고 검증 가능한 답변을 제공합니다.

추가로 Amazon Bedrock Guardrails의 그라운딩 기능을 통해 사실 검증도 강화할 수 있습니다.',
  2,
  'GenAI 할루시네이션 (Hallucination) 핵심:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
정의: 모델이 사실이 아닌 그럴듯한 내용을 자신감 있게 생성하는 현상

원인:
• 훈련 데이터의 통계적 패턴 학습 (사실 이해가 아님)
• 지식 컷오프 (Knowledge Cutoff) - 훈련 이후 발생한 사건 모름
• 모델이 알지 못하는 것을 "모른다"고 말하지 않는 경향

위험성: 의료, 법률, 금융 등 정확도가 중요한 분야에서 치명적
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
할루시네이션 최소화 방법:
1. RAG: 신뢰할 수 있는 외부 문서 기반 답변 생성 (가장 효과적)
2. Amazon Bedrock Guardrails: 그라운딩으로 부정확 정보 필터링
3. 낮은 Temperature: 더 결정론적인 답변 (창의성 ↓, 정확성 ↑)
4. Human in the Loop: 중요 결정 전 전문가 검토
5. 소스 인용(Citation) 요구: 근거 없는 주장 방지',
  '{}',
  '[{"name": "Amazon Bedrock Guardrails", "url": "https://aws.amazon.com/bedrock/guardrails/"}, {"name": "Amazon Bedrock Knowledge Base", "url": "https://aws.amazon.com/bedrock/knowledge-bases/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q114', 'a', '과적합(Overfitting) - 더 많은 법률 데이터로 모델을 추가 훈련', '과적합은 훈련 데이터에 너무 맞춰져 새로운 데이터 성능이 낮은 현상입니다. 존재하지 않는 판례를 생성하는 것은 할루시네이션입니다.', 1),
  ('awsaifc01-q114', 'b', '데이터 드리프트(Data Drift) - SageMaker Model Monitor로 입력 데이터 분포 감시', '데이터 드리프트는 프로덕션과 훈련 데이터의 분포 차이 문제입니다. 존재하지 않는 내용을 생성하는 문제와는 다릅니다.', 2),
  ('awsaifc01-q114', 'c', '할루시네이션(Hallucination) - Amazon Bedrock Knowledge Base를 활용한 RAG로 공신력 있는 법률 DB 기반 답변 생성', '정확한 설명입니다. 할루시네이션을 RAG로 최소화하고, 실제 법률 문서에서 검색된 내용만 답변 근거로 사용합니다.', 3),
  ('awsaifc01-q114', 'd', '비결정성(Non-determinism) - Temperature를 1.0으로 높여 더 다양한 답변 생성', 'Temperature를 높이면 더 창의적이고 다양한 답변이 나오지만, 할루시네이션이 오히려 증가합니다. 반대로 낮춰야 합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q114', 'GenAI의 기초');


-- ── 문제 15: 확산 모델, 멀티모달, 이미지 생성 AI ────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q115',
  'aws-aif-c01',
  '한 글로벌 이커머스 기업의 마케팅 팀이 수천 개의 제품 광고 이미지를 자동으로 생성하는 파이프라인을 구축하려 합니다. 제품 설명 텍스트를 입력하면 고품질의 마케팅용 제품 이미지를 자동으로 생성해야 합니다.

아래 GenAI 모델 유형 분류를 참고하세요:

[GenAI 모델 유형]
LLM (텍스트 생성 특화)
  → Claude, Llama, Amazon Titan Text
  → 출력: 텍스트, 코드, 요약

확산 모델 (이미지/영상 생성 특화)
  → Stable Diffusion, DALL-E, Amazon Titan Image
  → 입력: 텍스트 프롬프트 / 출력: 이미지

멀티모달 모델 (여러 형태 입출력)
  → Claude 3 Sonnet, Amazon Nova
  → 입력: 텍스트 + 이미지 모두 처리 가능

다음 중 "텍스트에서 이미지를 생성(Text-to-Image)"에 특화된 GenAI 모델 유형과, Amazon Bedrock에서 사용 가능한 관련 서비스를 올바르게 설명한 것은?',
  'd',
  '텍스트-이미지 생성에 특화된 모델은 확산 모델(Diffusion Model)입니다. 확산 모델은 노이즈에서 시작하여 텍스트 조건에 맞게 점진적으로 이미지를 "복원"하는 방식으로 작동합니다.

작동 원리:
1. 순방향(Forward): 원본 이미지에 점진적으로 노이즈 추가
2. 역방향(Reverse): 텍스트 프롬프트를 조건으로 노이즈에서 이미지 복원

Amazon Bedrock에서는 Stability AI의 Stable Diffusion과 Amazon Titan Image Generator G1 모델을 제공합니다.

LLM(Large Language Model)은 텍스트 생성에 특화되어 있으며, 멀티모달 모델은 텍스트와 이미지 등 여러 형태의 입력을 이해할 수 있지만 이미지 생성은 주로 확산 모델이 담당합니다.',
  2,
  'GenAI 모델 유형별 특징:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LLM (Large Language Model):
• 특화: 텍스트 생성, 대화, 요약, 번역, 코드 생성
• 예: Claude, Llama, Amazon Titan Text
• AWS Bedrock에서 가장 많은 LLM 제공
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
확산 모델 (Diffusion Model):
• 특화: 고품질 이미지/비디오 생성 (Text-to-Image)
• 원리: 노이즈 추가(Forward) → 텍스트 조건으로 노이즈 제거(Reverse)
• 예: Stable Diffusion, DALL-E 3, Midjourney
• AWS: Amazon Titan Image Generator G1, Stability AI on Bedrock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
멀티모달 모델 (Multimodal Model):
• 특화: 여러 형태(텍스트+이미지+오디오) 입출력 처리
• 예: Claude 3 (이미지 이해 가능), Amazon Nova
• 이미지를 이해하고 분석할 수 있지만, 이미지 생성은 확산 모델이 담당
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GAN (Generative Adversarial Network):
• 생성자(Generator) vs 판별자(Discriminator) 경쟁 학습
• 확산 모델 이전의 이미지 생성 주류 기술',
  '{}',
  '[{"name": "Amazon Titan Image Generator", "url": "https://aws.amazon.com/bedrock/titan/"}, {"name": "Stability AI on Amazon Bedrock", "url": "https://aws.amazon.com/bedrock/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q115', 'a', 'LLM(대규모 언어 모델)이 텍스트를 이미지로 직접 변환하며, Amazon Bedrock의 Claude 모델로 제품 이미지를 생성할 수 있다', 'LLM은 텍스트 생성에 특화되어 있으며 이미지를 직접 생성하지 않습니다. Claude는 이미지를 이해할 수는 있지만 생성하지는 않습니다.', 1),
  ('awsaifc01-q115', 'b', 'GAN(적대적 생성 신경망)만이 유일한 이미지 생성 AI 방법이며, Amazon SageMaker에서 커스텀 GAN을 직접 훈련해야 한다', 'GAN도 이미지 생성에 사용되지만 현재 주류는 확산 모델이며, Amazon Bedrock에서 즉시 사용 가능한 이미지 생성 모델을 제공합니다.', 2),
  ('awsaifc01-q115', 'c', '멀티모달 모델이 텍스트 설명을 받아 이미지를 생성하며, Amazon Bedrock의 Claude 3 Sonnet이 텍스트 설명으로 마케팅 이미지를 바로 생성할 수 있다', '멀티모달 모델은 이미지를 이해하는 데 뛰어나지만, 이미지 생성은 확산 모델이 담당합니다. Claude 3는 이미지 생성 기능이 없습니다.', 3),
  ('awsaifc01-q115', 'd', '확산 모델(Diffusion Model)이 텍스트-이미지 생성에 특화되어 있으며, Amazon Bedrock에서 Stability AI와 Amazon Titan Image Generator를 통해 사용할 수 있다', '정확한 설명입니다. 확산 모델은 현재 텍스트-이미지 생성의 주류이며 Amazon Bedrock에서 즉시 사용 가능합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q115', 'GenAI의 기초');


-- ── 문제 16: 파운데이션 모델 수명 주기 단계 순서 ────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q116',
  'aws-aif-c01',
  '한 바이오테크 회사가 의학 논문, 임상 시험 데이터, 의약품 정보를 기반으로 의료 전문 파운데이션 모델(FM)을 구축하려고 합니다. CTO가 FM 개발 전체 과정을 이사회에 설명하면서 다음 단계들을 나열했습니다.

① 의학 문헌 100억 토큰의 대규모 데이터로 기본 언어 이해 능력 학습
② 의료 Q&A 형식의 소규모 데이터셋으로 의료 응답 방식 특화 훈련
③ 의료 윤리, 환자 안전, 의학적 사실성에 맞게 의사 피드백으로 모델 정렬
④ 수집할 의학 데이터 소스, 품질 기준, 개인정보 보호 요건 결정
⑤ 의료 정보 시스템과 연동하여 의사와 환자가 사용할 수 있도록 공개
⑥ 의학 시험 벤치마크(MedQA, USMLE 등)로 모델 성능 측정
⑦ 실제 의사 피드백과 오류 사례를 수집하여 다음 버전 개선에 반영

올바른 FM 수명 주기 순서는?',
  'a',
  'FM 수명 주기의 올바른 순서는: ④데이터 선택 → ①사전 훈련 → ②미세 조정 → ③RLHF → ⑥평가 → ⑤배포 → ⑦피드백입니다.

먼저 어떤 데이터를 사용할지 품질 기준을 정하고(④), 대규모 데이터로 기본 언어 이해 능력을 학습시키는 사전 훈련(①)을 합니다. 이후 도메인 특화 미세 조정(②), 안전성·유용성을 위한 RLHF(인간 피드백 강화 학습)(③), 벤치마크 평가(⑥), 배포(⑤), 피드백 기반 반복 개선(⑦) 순서로 진행합니다.',
  2,
  'FM 수명 주기 7단계 (반드시 암기):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1단계: 데이터 선택 (Data Selection)
  - 데이터 소스, 품질 기준, 라이선스 검토
  - 개인정보·저작권 고려

2단계: 사전 훈련 (Pre-training)
  - 수백억~수조 토큰의 대규모 데이터 학습
  - 막대한 GPU 자원 필요 (수천만 달러 규모)
  - 기본 언어 이해/생성 능력 획득

3단계: 미세 조정 (Fine-tuning)
  - 소규모 특화 데이터로 도메인 능력 강화
  - 지시 따르기(Instruction Tuning) 포함

4단계: RLHF (인간 피드백 강화 학습)
  - 인간 평가자의 선호도로 모델 정렬
  - 안전성, 유용성, 무해성(Harmlessness) 개선

5단계: 평가 (Evaluation)
  - 벤치마크 테스트 (MMLU, HumanEval, MedQA 등)
  - Amazon Bedrock Model Evaluation 활용 가능

6단계: 배포 (Deployment)
  - API 공개, 인프라 확장성 구성

7단계: 피드백 (Feedback)
  - 사용자 피드백 수집 → 다음 버전 개선 (반복 사이클)',
  '{}',
  '[{"name": "Amazon Bedrock 파운데이션 모델", "url": "https://aws.amazon.com/bedrock/"}, {"name": "SageMaker JumpStart 모델 허브", "url": "https://aws.amazon.com/sagemaker/jumpstart/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q116', 'a', '④ → ① → ② → ③ → ⑥ → ⑤ → ⑦', '데이터 선택→사전 훈련→미세 조정→RLHF→평가→배포→피드백의 올바른 FM 수명 주기 순서입니다.', 1),
  ('awsaifc01-q116', 'b', '① → ④ → ② → ⑥ → ③ → ⑤ → ⑦', '데이터 선택 없이 사전 훈련을 먼저 할 수 없으며, 평가는 RLHF 이후에 이루어져야 합니다.', 2),
  ('awsaifc01-q116', 'c', '④ → ① → ⑥ → ② → ③ → ⑤ → ⑦', '평가(⑥)는 미세 조정과 RLHF 이후에 수행하여 최종 모델 성능을 측정합니다.', 3),
  ('awsaifc01-q116', 'd', '④ → ② → ① → ③ → ⑥ → ⑤ → ⑦', '사전 훈련은 미세 조정보다 먼저 이루어져야 합니다. 기본 언어 능력 없이 도메인 미세 조정은 불가능합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q116', 'GenAI의 기초');


-- ── 문제 17: Amazon Bedrock 핵심 기능 매칭 ─────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q117',
  'aws-aif-c01',
  '한 금융 서비스 기업이 Amazon Bedrock을 사용하여 고객 상담 AI 플랫폼을 구축하려고 합니다. 다음 세 가지 요구사항에 가장 적합한 Amazon Bedrock 기능을 올바르게 매칭한 것은?

• 요구사항 1: 5,000개의 내부 금융 상품 FAQ 문서를 기반으로 고객 질문에 정확한 답변 제공 (반드시 문서 출처 인용 필요)

• 요구사항 2: AI가 고객의 요청을 분석하여 자동으로 계좌 조회 API 호출 → 거래 내역 조회 → 맞춤형 보고서 생성 등 여러 단계 작업을 순차적으로 자율 실행

• 요구사항 3: AI가 금융 사기 관련 내용, 개인정보, 특정 투자 조언 등 금융 규제 위반 콘텐츠를 자동으로 필터링하고 PII(개인식별정보)를 마스킹',
  'b',
  '요구사항 1은 Amazon Bedrock Knowledge Base입니다. 내부 문서를 자동으로 청킹·임베딩하여 벡터 DB에 저장하고, 완전관리형 RAG를 제공합니다. 소스 인용(Citation) 기능으로 답변의 출처를 명시합니다.

요구사항 2는 Amazon Bedrock Agents입니다. 에이전트는 사용자 의도를 파악하고 Action Group을 통해 API나 Lambda 함수를 자율적으로 호출하여 복잡한 다단계 작업을 완수합니다.

요구사항 3은 Amazon Bedrock Guardrails입니다. 유해 콘텐츠 필터링, 특정 주제 차단, PII 감지 및 마스킹을 통해 금융 규제를 준수하는 책임 있는 AI를 구현합니다.',
  2,
  'Amazon Bedrock 핵심 구성 요소:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Knowledge Base (지식 베이스):
• 완전관리형 RAG 구현 (자동 청킹, 임베딩, 벡터 DB 관리)
• 소스 인용(Citation) 제공 → 답변 신뢰성 확보
• 연결 가능 DB: OpenSearch Serverless, Aurora, Pinecone 등
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agents (에이전트):
• 다단계 작업 자동화 (ReAct 프레임워크 기반)
• Action Group: API 호출, Lambda 함수 실행
• Knowledge Base와 연동 가능
• 자율적 의사결정 및 실행 (사람 개입 없이)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Guardrails (가드레일):
• 콘텐츠 필터링 (혐오, 폭력, 성인 콘텐츠 등 6가지 카테고리)
• 주제 거부 (특정 주제 대화 자동 차단)
• PII 감지 및 마스킹 (개인식별정보 보호)
• 그라운딩 검사 (할루시네이션 감지)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
기타:
• Model Evaluation: 모델 성능 자동/인간 평가
• Fine-tuning: 커스텀 FM 훈련
• PartyRock: 노코드 AI 앱 빌더 (프로토타입용)',
  '{}',
  '[{"name": "Amazon Bedrock Knowledge Base", "url": "https://aws.amazon.com/bedrock/knowledge-bases/"}, {"name": "Amazon Bedrock Agents", "url": "https://aws.amazon.com/bedrock/agents/"}, {"name": "Amazon Bedrock Guardrails", "url": "https://aws.amazon.com/bedrock/guardrails/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q117', 'a', '1-Agents, 2-Knowledge Base, 3-Guardrails', 'Knowledge Base가 문서 기반 RAG를, Agents가 다단계 작업 자동화를 담당합니다. 1번과 2번 순서가 바뀌었습니다.', 1),
  ('awsaifc01-q117', 'b', '1-Knowledge Base, 2-Agents, 3-Guardrails', 'Knowledge Base(문서 기반 RAG+인용), Agents(다단계 API 자동화), Guardrails(콘텐츠 필터링+PII)가 정확히 매칭됩니다.', 2),
  ('awsaifc01-q117', 'c', '1-Guardrails, 2-Knowledge Base, 3-Agents', 'Guardrails는 콘텐츠 필터링을, Knowledge Base는 문서 기반 RAG를, Agents는 다단계 자동화를 담당합니다.', 3),
  ('awsaifc01-q117', 'd', '1-Knowledge Base, 2-Guardrails, 3-Agents', 'Guardrails는 PII 마스킹과 콘텐츠 필터링을, Agents는 다단계 API 자동화를 담당합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q117', 'GenAI의 기초');


-- ── 문제 18: 미세 조정 vs RAG vs 프롬프트 엔지니어링 선택 ────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q118',
  'aws-aif-c01',
  '세 개의 기업이 각각 다른 GenAI 요구사항으로 Amazon Bedrock 도입을 검토하고 있습니다.

• 기업 A (법률 회사): 계약서 분석 시 항상 특정 법률 용어와 형식("갑", "을", 조항 번호 체계, 표준 계약 문구)으로 일관된 분석 보고서를 생성해야 합니다. 매일 수백 건의 계약서를 처리하며, 이 형식은 앞으로도 변하지 않습니다.

• 기업 B (뉴스 미디어): AI가 오늘 발생한 최신 뉴스 이벤트에 대한 독자 질문에 정확하게 답해야 합니다. 기사 데이터베이스는 매시간 업데이트됩니다.

• 기업 C (스타트업): 기존 LLM이 이메일을 잘 요약하는지 빠르게 테스트하고 싶습니다. 개발 예산이 제한적이고 시간도 촉박합니다.

각 기업에 가장 적합한 접근 방식을 올바르게 매칭한 것은?',
  'b',
  '기업 A는 미세 조정(Fine-tuning)이 가장 적합합니다. 특정 법률 형식, 용어, 문체를 모델이 일관되게 학습하게 하려면 미세 조정이 필요합니다. 매일 수백 건의 반복 작업이므로 초기 훈련 비용 대비 장기적 효율이 높습니다.

기업 B는 RAG가 가장 적합합니다. 매시간 업데이트되는 최신 뉴스는 모델 재훈련 없이 벡터 DB를 업데이트하여 즉시 반영할 수 있습니다. LLM의 지식 컷오프 한계를 극복합니다.

기업 C는 프롬프트 엔지니어링이 가장 적합합니다. 추가 비용 없이 프롬프트 수정만으로 빠르게 테스트할 수 있어 POC(개념 검증)에 최적입니다.',
  3,
  'GenAI 접근 방식 선택 기준:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
프롬프트 엔지니어링:
• 비용: 무료 (추가 훈련/인프라 없음)
• 속도: 즉시 적용 가능
• 한계: 컨텍스트 윈도우 제약, 일관성 낮을 수 있음
• 적합: POC 테스트, 단순 작업, 예산 없는 경우
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RAG (검색 증강 생성):
• 비용: 벡터 DB 구축/운영 비용 발생
• 속도: 데이터 업데이트 즉시 반영 가능 (재훈련 불필요)
• 장점: 최신 데이터, 소스 인용, 환각 감소
• 적합: 실시간 데이터 필요, 내부 문서 기반 Q&A
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
미세 조정 (Fine-tuning):
• 비용: 훈련 비용 + 데이터 준비 비용
• 장점: 특화 스타일/형식/용어 완벽 학습, 일관성 높음
• 한계: 훈련 시간 필요, 데이터 변경 시 재훈련
• 적합: 특화 도메인, 일관된 형식, 대규모 반복 작업',
  '{}',
  '[{"name": "Amazon Bedrock Fine-tuning", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html"}, {"name": "RAG vs Fine-tuning 비교 가이드", "url": "https://aws.amazon.com/blogs/machine-learning/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q118', 'a', 'A-RAG, B-미세 조정, C-프롬프트 엔지니어링', '특정 법률 형식을 일관되게 적용하려면 미세 조정이, 매시간 업데이트되는 최신 뉴스에는 RAG가 적합합니다.', 1),
  ('awsaifc01-q118', 'b', 'A-미세 조정, B-RAG, C-프롬프트 엔지니어링', '특화 형식 일관 학습→미세 조정, 매시간 최신 데이터 반영→RAG, 빠른 무비용 테스트→프롬프트 엔지니어링이 최적입니다.', 2),
  ('awsaifc01-q118', 'c', 'A-미세 조정, B-프롬프트 엔지니어링, C-RAG', '매시간 업데이트되는 뉴스 데이터는 프롬프트에 모두 넣을 수 없으며, RAG로 벡터 DB를 지속 업데이트해야 합니다.', 3),
  ('awsaifc01-q118', 'd', 'A-프롬프트 엔지니어링, B-RAG, C-미세 조정', '매일 수백 건의 법률 분석에 일관된 형식이 필요하면 미세 조정이 더 효율적이며, 스타트업 테스트에는 미세 조정보다 프롬프트 엔지니어링이 적합합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q118', 'GenAI의 기초');


-- ── 문제 19: Amazon Q 서비스 (Business / Developer / Bedrock) ─
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q119',
  'aws-aif-c01',
  '한 대기업에서 세 가지 역할의 팀원들이 각자에게 맞는 AWS AI 도구가 필요합니다.

• 인사팀 직원 (비개발자): 사내 HR 정책 문서, 휴가 규정, 복리후생 안내서를 바탕으로 직원들의 질문에 즉시 답변하는 AI 어시스턴트가 필요합니다. 회사 내부 문서에만 접근하며 직책별 권한 제어가 필요합니다.

• 소프트웨어 개발자: 코드를 작성하는 중에 IDE에서 자동으로 코드 완성, 버그 수정 제안, 보안 취약점 스캔, 단위 테스트 자동 생성이 필요합니다.

• AI 엔지니어: 회사 특화 GenAI 애플리케이션을 직접 빌드하고, 다양한 FM 모델 API를 비교 테스트하며, 커스텀 모델 훈련과 RAG 파이프라인을 구현하고 싶습니다.

각 역할에 가장 적합한 AWS 서비스를 올바르게 매칭한 것은?',
  'c',
  'Amazon Q Business는 기업 내부 데이터(문서, 위키, HR 시스템 등)와 연결하여 직원들의 질문에 답하는 기업용 AI 어시스턴트입니다. IAM Identity Center와 연동하여 직책별 권한 기반 접근 제어가 가능합니다.

Amazon Q Developer(구 Amazon CodeWhisperer)는 개발자를 위한 AI 코딩 어시스턴트로, IDE 내에서 실시간 코드 완성, 보안 취약점 스캔, 단위 테스트 자동 생성 기능을 제공합니다.

Amazon Bedrock은 다양한 FM 모델에 단일 API로 접근하고, Knowledge Base, Agents, Fine-tuning 등을 통해 커스텀 GenAI 애플리케이션을 구축하는 개발 플랫폼입니다.',
  2,
  'AWS GenAI 서비스 포트폴리오:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Q Business:
• 기업 내부 문서/시스템 기반 AI 어시스턴트 (직원용)
• 50+ 기업 시스템 연결 (SharePoint, Salesforce, S3 등)
• IAM Identity Center 기반 권한 제어 (직책별 문서 접근)
• 대상: 일반 직원 (비개발자)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Q Developer:
• 개발자용 AI 코딩 어시스턴트 (IDE 통합)
• 코드 완성, 버그 수정, 보안 취약점 스캔, 테스트 생성
• 지원 IDE: VS Code, JetBrains, AWS Console, CLI
• Amazon CodeWhisperer의 후속 서비스
• 대상: 소프트웨어 개발자
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon Bedrock:
• FM 모델 API 플랫폼 (Claude, Titan, Llama, Mistral 등)
• Knowledge Base (RAG), Agents, Guardrails, Fine-tuning
• 커스텀 GenAI 앱 개발 플랫폼
• 대상: AI/ML 엔지니어, 개발자
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amazon SageMaker JumpStart:
• 사전 훈련된 모델 허브 + One-click 배포
• 도메인 특화 모델 탐색 및 실험
• 대상: 데이터 사이언티스트, ML 엔지니어',
  '{}',
  '[{"name": "Amazon Q Business", "url": "https://aws.amazon.com/q/business/"}, {"name": "Amazon Q Developer", "url": "https://aws.amazon.com/q/developer/"}, {"name": "Amazon Bedrock", "url": "https://aws.amazon.com/bedrock/"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q119', 'a', '인사팀-Amazon Bedrock, 개발자-Amazon Q Business, AI 엔지니어-Amazon Q Developer', 'Amazon Q Business는 비개발자 직원용 내부 문서 AI이며, Q Developer는 개발자 코딩 도구입니다. 모두 바뀌었습니다.', 1),
  ('awsaifc01-q119', 'b', '인사팀-Amazon Q Developer, 개발자-Amazon Bedrock, AI 엔지니어-Amazon Q Business', 'Q Developer는 코딩 어시스턴트(개발자용)이며, Q Business는 기업 내부 문서 기반 직원용 AI입니다.', 2),
  ('awsaifc01-q119', 'c', '인사팀-Amazon Q Business, 개발자-Amazon Q Developer, AI 엔지니어-Amazon Bedrock', 'Q Business(내부 문서 직원 AI), Q Developer(IDE 코딩 어시스턴트), Bedrock(커스텀 GenAI 앱 플랫폼)이 각각 최적입니다.', 3),
  ('awsaifc01-q119', 'd', '인사팀-Amazon Q Business, 개발자-Amazon SageMaker JumpStart, AI 엔지니어-Amazon Bedrock', 'SageMaker JumpStart는 ML 모델 훈련/배포에 특화됩니다. 개발자 IDE 코딩 어시스턴트는 Amazon Q Developer가 더 적합합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q119', 'GenAI의 기초');


-- ── 문제 20: GenAI 비용 트레이드오프 최적화 ─────────────────
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty, key_points, key_point_images, ref_links)
VALUES (
  'awsaifc01-q120',
  'aws-aif-c01',
  '한 글로벌 이커머스 기업이 Amazon Bedrock으로 고객 서비스 AI를 운영하고 있습니다. 트래픽 패턴을 분석한 결과 다음과 같습니다.

[트래픽 패턴 분석]
• 블랙 프라이데이/주말 세일 시즌
  - 분당 10,000 API 요청 (예측 가능)
  - 높은 처리량 필수, 응답 지연 절대 불가
  - 기간: 연간 30일 (미리 예측 가능)

• 평일 일반 시간
  - 분당 200~500 API 요청 (변동적)
  - 표준 응답 속도 허용

• 새벽 2시~6시
  - 분당 10~50 API 요청 (매우 낮음)
  - 간헐적 트래픽

각 상황에 가장 적합한 Amazon Bedrock 요금 및 배포 전략은?',
  'd',
  '최적의 전략은 하이브리드 방식입니다.

블랙 프라이데이처럼 예측 가능하고 일관되게 높은 처리량이 필요한 시즌에는 프로비저닝 처리량(Provisioned Throughput)이 적합합니다. 특정 Model Unit(처리량)을 예약하면 높은 부하에서도 안정적인 응답을 보장하고, 대규모 시 온디맨드보다 단가를 낮출 수 있습니다.

평일이나 새벽처럼 트래픽이 변동적이거나 낮은 경우 온디맨드(On-Demand)가 적합합니다. 사용한 토큰만큼만 과금하므로 불필요한 예약 비용을 절감합니다.

비용 최적화를 위해 복잡한 요청에는 대형 모델, 단순 요청에는 소형 모델을 선택하는 것도 효과적입니다.',
  3,
  'Amazon Bedrock 요금 모델 비교:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
온디맨드 (On-Demand):
• 방식: 사용한 토큰만큼 과금
• 장점: 유연성, 초기 비용 없음, 예측 불가 트래픽 적합
• 단점: 높은 트래픽 시 단가 높음, 처리량 제한(쿼터) 있음
• 적합: 변동적 트래픽, POC, 소규모, 새벽 간헐적 트래픽
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
프로비저닝 처리량 (Provisioned Throughput):
• 방식: 특정 처리량(Model Unit) 예약 후 시간당 과금
• 장점: 안정적 처리량 보장, 대규모 시 온디맨드보다 단가 낮음
• 단점: 미사용 시에도 비용 발생, 1개월/6개월 약정
• 적합: 예측 가능한 대규모 트래픽, 프로덕션 고부하 시즌
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
추가 비용 최적화 전략:
• 모델 크기 선택: 단순 작업 → 소형 모델 (저렴)
• 프롬프트 캐싱: 반복 시스템 프롬프트 비용 절감
• 배치 처리: 비실시간 작업은 배치 변환으로 비용 절감
• 리전 선택: 리전별 요금 차이 고려',
  '{}',
  '[{"name": "Amazon Bedrock 요금", "url": "https://aws.amazon.com/bedrock/pricing/"}, {"name": "프로비저닝 처리량 가이드", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/prov-throughput.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, explanation, sort_order) VALUES
  ('awsaifc01-q120', 'a', '모든 상황에 온디맨드 사용 - 사용한 만큼만 과금하므로 항상 가장 비용 효율적이다', '예측 가능한 대규모 트래픽(블랙 프라이데이)에서는 프로비저닝 처리량이 온디맨드보다 단가가 낮을 수 있으며, 처리량 쿼터 한계로 응답 지연이 발생할 수 있습니다.', 1),
  ('awsaifc01-q120', 'b', '모든 상황에 프로비저닝 처리량 사용 - 안정적인 처리량을 보장하여 항상 유리하다', '프로비저닝 처리량은 트래픽이 없는 새벽 시간에도 시간당 비용이 발생합니다. 간헐적이고 낮은 트래픽에는 온디맨드가 더 경제적입니다.', 2),
  ('awsaifc01-q120', 'c', '세일 시즌: 온디맨드, 평일: 프로비저닝 처리량, 새벽: 모델 비활성화', 'Bedrock에서 모델을 개별적으로 비활성화할 수 없으며, 예측 가능한 대규모 세일 시즌에 프로비저닝 처리량이 더 안정적이고 비용 효율적입니다.', 3),
  ('awsaifc01-q120', 'd', '세일 시즌(예측 가능한 고처리량): 프로비저닝 처리량으로 안정성 확보 및 단가 절감, 평일·새벽(변동/저처리량): 온디맨드로 유연한 사용량 기반 과금', '예측 가능한 대규모 트래픽→프로비저닝 처리량, 변동적·낮은 트래픽→온디맨드의 하이브리드 전략이 비용과 성능을 모두 최적화합니다.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q120', 'GenAI의 기초');


-- ── 세트 1에 GenAI 기초 문제 10개 추가 (sort_order 11-20) ────
INSERT INTO exam_set_questions (set_id, question_id, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q111', 11),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q112', 12),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q113', 13),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q114', 14),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q115', 15),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q116', 16),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q117', 17),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q118', 18),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q119', 19),
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q120', 20);
