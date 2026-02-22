# AWS AIF-C01 영문 번역 가이드

이 파일은 한국어로 재설계된 AIF-C01 문제를 AWS 자격증 시험 공식 문체의 영문으로 번역할 때 사용한다.
**일반 번역이 아닌 실제 AWS 시험 스타일을 그대로 재현하는 것이 목표다.**

---

## 1. 시나리오 문장 패턴

### 도입부 (첫 문장)
```
A company is [동사-ing]...
An organization needs to...
A data engineering team wants to...
A startup is building a system to...
A financial services company must...
A healthcare provider is developing...
A machine learning team needs to...
```

### 조건/제약 문장
```
Each [request/record/file] contains up to [N] [units] of [data].
The system must process [N] requests per [time unit].
The solution must be [cost-effective / highly available / scalable].
The company wants to minimize [operational overhead / latency / cost].
Results are required within [N] [seconds/minutes].
The team has [limited ML expertise / no prior experience with...].
```

### 질문 문장 (항상 마지막, 빈 줄로 분리)
```
Which AWS service BEST meets these requirements?
Which solution MOST cost-effectively meets these requirements?
Which approach requires the LEAST operational overhead?
Which combination of AWS services meets these requirements?
What is the MOST appropriate [inference type / approach / solution]?
Which AWS service should the team use to meet these requirements?
```

---

## 2. 보기(옵션) 문체 규칙

- AWS 서비스명 단독: `Amazon SageMaker Batch Transform`
- 서비스 조합: `Amazon Transcribe + Amazon Comprehend`
- 간결한 명사구: `Real-time Inference` / `Asynchronous Inference`
- **절대 금지**: 서비스명 번역, 파이프(`|`) 구분, 3개 이상 서비스 나열

---

## 3. 해설(explanation) 문체 규칙

### 정답 해설 패턴
```
[Service] is designed to [기능]. It supports [특징] and [특징], making it ideal for [use case].
[Service] [동사phrase]. This [설명], which directly addresses the requirement for [요구사항].
```

### 오답 해설 패턴
```
[Service] is used for [다른 용도], not for [이 문제의 용도]. It does not [기능 설명].
Although [Service] [관련 기능], it [왜 부적합한지]. [Correct service] is the better choice for this scenario.
[Service] [기능], but [한계점 또는 이 시나리오에 맞지 않는 이유].
```

### 전체 해설 구조
```
[정답 서비스] [핵심 기능 설명]. [왜 이 시나리오에 가장 적합한지].

• [오답 A]: [오답 이유 — 간결하게]
• [오답 B]: [오답 이유 — 간결하게]
• [오답 C]: [오답 이유 — 간결하게]
```

---

## 4. key_points 번역 문체

```
[핵심 개념 제목 (영문)]
• [포인트 1 — 간결한 영문 bullet]
• [포인트 2]
• [포인트 3]
```

예시:
```
Amazon SageMaker Asynchronous Inference
• Designed for large payload requests (up to 1 GB) that require longer processing time
• Requests are queued and processed asynchronously — no need for immediate response
• Results are stored in Amazon S3 for retrieval after processing
• Ideal for workloads with 1–15 minute processing times (e.g., large medical images)
```

---

## 5. AIF-C01 핵심 용어 대역표

### SageMaker 추론 유형
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 실시간 추론 | Real-time Inference |
| 비동기 추론 | Asynchronous Inference |
| 배치 변환 | Batch Transform |
| 서버리스 추론 | Serverless Inference |
| 엔드포인트 | endpoint |
| 배포 | deploy / deployment |

### 생성형 AI / LLM 용어
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 파운데이션 모델 | Foundation Model (FM) |
| 대규모 언어 모델 | Large Language Model (LLM) |
| 파인튜닝 | fine-tuning |
| 검색 증강 생성 | Retrieval Augmented Generation (RAG) |
| 프롬프트 엔지니어링 | prompt engineering |
| 퓨샷 프롬프팅 | few-shot prompting |
| 제로샷 프롬프팅 | zero-shot prompting |
| 임베딩 | embedding |
| 벡터 데이터베이스 | vector database |
| 컨텍스트 윈도우 | context window |
| 토큰 | token |
| 할루시네이션 | hallucination |
| 추론(inference) | inference |
| 지식 기반 | knowledge base |

### ML 기초 용어
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 지도학습 | supervised learning |
| 비지도학습 | unsupervised learning |
| 강화학습 | reinforcement learning |
| 과적합 | overfitting |
| 과소적합 | underfitting |
| 훈련 데이터 | training data |
| 검증 데이터 | validation data |
| 테스트 데이터 | test data |
| 피처 엔지니어링 | feature engineering |
| 하이퍼파라미터 | hyperparameter |
| 정확도 | accuracy |
| 정밀도 | precision |
| 재현율 | recall |
| F1 점수 | F1 score |
| 혼동 행렬 | confusion matrix |
| 분류 | classification |
| 회귀 | regression |
| 클러스터링 | clustering |
| 이상 탐지 | anomaly detection |
| 자연어 처리 | Natural Language Processing (NLP) |
| 컴퓨터 비전 | computer vision |
| 전이 학습 | transfer learning |

### 책임 있는 AI
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 편향 | bias |
| 공정성 | fairness |
| 설명 가능성 | explainability |
| 투명성 | transparency |
| 책임 있는 AI | responsible AI |
| 인간 감독 | human oversight / human-in-the-loop |
| 데이터 주권 | data sovereignty |
| 개인정보 보호 | data privacy / privacy protection |

### 보안 / 거버넌스
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 규정 준수 | compliance |
| 감사 | audit |
| 모델 거버넌스 | model governance |
| 최소 권한 원칙 | principle of least privilege |
| 암호화 | encryption |
| 데이터 마스킹 | data masking |

---

## 6. AIF-C01에 등장하는 주요 AWS 서비스 (번역 없이 그대로 사용)

```
Amazon Bedrock               Amazon SageMaker
Amazon Bedrock Guardrails    Amazon SageMaker JumpStart
Amazon Bedrock Knowledge Bases  Amazon SageMaker Canvas
Amazon Rekognition           Amazon SageMaker Clarify
Amazon Comprehend            Amazon SageMaker Ground Truth
Amazon Textract              Amazon SageMaker Model Monitor
Amazon Transcribe            Amazon SageMaker Pipelines
Amazon Polly                 Amazon SageMaker Studio
Amazon Translate             Amazon SageMaker Feature Store
Amazon Lex                   AWS Glue
Amazon Kendra                Amazon S3
Amazon Personalize           AWS Lambda
Amazon Forecast              Amazon CloudWatch
AWS DeepRacer                AWS Config
Amazon Titan                 AWS Artifact
Anthropic Claude (on Bedrock) Amazon OpenSearch Service
```

---

## 7. 번역 시 절대 금지 사항

1. **AWS 서비스명 번역 금지** — `Amazon SageMaker`를 "아마존 세이지메이커"로 쓰지 않음
2. **직역체 금지** — "이 요구사항을 가장 잘 만족하는 것은?" → "Which solution BEST meets these requirements?"
3. **한국어 조사·어미 직역 금지** — "~을 위해" → "to", "~에 대한" → "for"
4. **모호한 표현 금지** — "can be used" 대신 "is designed to" 또는 "enables"
5. **관사 누락 금지** — "company" → "A company", "solution" → "the solution"

---

## 8. 번역 품질 자가검증 (STEP 5.5 완료 후)

```
[PASS] AWS 서비스명 원문 그대로 사용 (번역·축약 없음)
[PASS] 시나리오 도입부 "A company..." / "An organization..." 형식 사용
[PASS] 질문 문장에 "MOST" / "BEST" / "LEAST" 등 AWS 시험 강조 표현 사용
[PASS] 오답 해설에 "is used for [다른 용도], not for..." 패턴 사용
[PASS] key_points_en이 간결한 bullet 형식으로 번역됨
[PASS] 용어 대역표의 공식 영문 표현 우선 사용
```
