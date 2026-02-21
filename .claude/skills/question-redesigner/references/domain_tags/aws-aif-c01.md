# AIF-C01 도메인 태그 목록

AWS Certified AI Practitioner (AIF-C01) 문제에 사용하는 도메인 태그입니다.
각 문제에 태그를 **정확히 1개** 부여합니다.

---

## 태그 목록

| 태그 | 설명 | 키워드 예시 |
|------|------|------------|
| `AI 및 ML의 기초` | AI/ML/딥러닝 개념, 학습 유형, ML 기법 선택 | 지도학습, 비지도학습, 강화학습, 신경망, 훈련/검증/테스트 분할, 과적합, 알고리즘 선택, 데이터 전처리, 피처 엔지니어링, 클러스터링, 회귀, 분류 |
| `GenAI의 기초` | 생성형 AI 개념, LLM, FM, 프롬프트 엔지니어링 | 대규모 언어 모델(LLM), 파운데이션 모델(FM), 토큰, 컨텍스트 윈도우, 프롬프트 엔지니어링, Few-shot, Zero-shot, RAG, 파인튜닝, 임베딩, 벡터 데이터베이스 |
| `파운데이션 모델의 적용` | AWS AI 서비스, SageMaker, Bedrock 등 실제 적용 | Amazon Bedrock, Amazon SageMaker, Amazon Rekognition, Amazon Comprehend, Amazon Textract, Amazon Translate, Amazon Polly, Amazon Transcribe, Amazon Lex, AWS AI 서비스 선택 |
| `책임 있는 AI에 대한 가이드라인` | 공정성, 편향, 투명성, 설명 가능성 | 모델 편향(bias), 공정성(fairness), 설명 가능성(explainability), 투명성(transparency), 개인정보 보호, 인간 감독(human-in-the-loop), 책임 있는 AI, AWS AI 서비스 카드 |
| `AI 솔루션의 보안, 규정 준수 및 거버넌스` | 데이터 보안, 규정 준수, 거버넌스 프레임워크 | IAM, 데이터 암호화, VPC, PrivateLink, AWS Artifact, AWS Config, 모델 거버넌스, 규정 준수(compliance), 감사(audit), 데이터 주권, GDPR |

---

## 태그 선택 기준

1. 문제의 **핵심 주제**를 기준으로 선택 (보기 내용이 아닌 질문이 무엇을 묻는지)
2. AWS 서비스를 직접 선택·비교하는 문제 → `파운데이션 모델의 적용`
3. ML 알고리즘이나 학습 방식에 대한 문제 → `AI 및 ML의 기초`
4. LLM/GenAI 개념 및 프롬프트 엔지니어링 → `GenAI의 기초`
5. 편향·공정성·설명 가능성 → `책임 있는 AI에 대한 가이드라인`
6. 보안·IAM·규정 준수 → `AI 솔루션의 보안, 규정 준수 및 거버넌스`
7. 경계가 모호한 경우: AWS 서비스가 주인공이면 `파운데이션 모델의 적용`, 개념이 주인공이면 `AI 및 ML의 기초` 또는 `GenAI의 기초`
