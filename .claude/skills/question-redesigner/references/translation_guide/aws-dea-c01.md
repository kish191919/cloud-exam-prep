# AWS DEA-C01 영문 번역 가이드

이 파일은 한국어로 재설계된 DEA-C01 문제를 AWS 자격증 시험 공식 문체의 영문으로 번역할 때 사용한다.
**일반 번역이 아닌 실제 AWS 시험 스타일을 그대로 재현하는 것이 목표다.**

---

## 1. 시나리오 문장 패턴

### 도입부 (첫 문장)
```
A company is [동사-ing]...
A data engineering team needs to...
An organization is building a data pipeline to...
A startup wants to process [data type] from [source]...
A financial services company must ingest...
A healthcare provider is developing a data lake...
A retail company is migrating its [data system] to AWS...
```

### 조건/제약 문장
```
The solution must minimize operational overhead.
The company wants to avoid managing infrastructure.
The pipeline must be fault-tolerant and scalable.
The solution must be cost-effective.
The team needs to reprocess data if failures occur.
Data must be available within [N] seconds/minutes.
The company has strict data residency requirements.
The solution must support schema evolution without full rewrites.
```

### 질문 문장 (항상 마지막, 빈 줄로 분리)
```
Which AWS service BEST meets these requirements?
Which solution MOST cost-effectively meets these requirements?
Which approach requires the LEAST operational overhead?
Which combination of AWS services meets these requirements?
What should the data engineer do to meet these requirements?
Which AWS service should the team use to accomplish this?
Which solution will meet these requirements with the LEAST development effort?
```

---

## 2. 보기(옵션) 문체 규칙

- AWS 서비스명 단독: `Amazon Kinesis Data Streams`
- 서비스 조합: `AWS Glue + Amazon S3`
- 서비스 + 기능: `Amazon S3 with S3 Lifecycle policies`
- 간결한 명사구: `Use AWS Glue crawlers to...` / `Configure an S3 event notification...`
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
Amazon Kinesis Data Streams
• Fully managed real-time data streaming service
• Supports multiple consumers reading the same stream simultaneously (fan-out)
• Data is retained for up to 365 days, enabling replay and reprocessing
• Ideal for high-throughput, low-latency streaming ingestion
```

---

## 5. DEA-C01 핵심 용어 대역표

### 데이터 수집 및 변환
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 데이터 파이프라인 | data pipeline |
| 스트리밍 수집 | streaming ingestion |
| 배치 수집 | batch ingestion |
| 실시간 처리 | real-time processing |
| 배치 처리 | batch processing |
| 변환 및 처리 | transformation and processing |
| 오케스트레이션 | orchestration |
| 재처리 가능성 | replayability |
| 상태 저장 트랜잭션 | stateful transaction |
| 상태 비저장 트랜잭션 | stateless transaction |
| 팬아웃 | fan-out |
| 팬인 | fan-in |
| 속도 제한 | rate limiting / throttling |
| 이벤트 트리거 | event trigger |
| 일정 기반 처리 | schedule-based processing |
| 서버리스 워크플로우 | serverless workflow |
| 분산 컴퓨팅 | distributed computing |

### 데이터 저장소 관리
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 데이터 레이크 | data lake |
| 데이터 웨어하우스 | data warehouse |
| 열 기반 형식 | columnar format |
| 파티셔닝 | partitioning |
| 압축 | compression |
| 데이터 카탈로그 | data catalog |
| 데이터 계보 | data lineage |
| 데이터 수명 주기 | data lifecycle |
| 스키마 진화 | schema evolution |
| 스키마 변환 | schema conversion |
| 오픈 테이블 형식 | open table format |
| 벡터 인덱스 | vector index |
| 데이터 만료 | data expiration |
| 스토리지 티어 | storage tier |
| 버전 관리 | versioning |

### 데이터 운영 및 지원
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 운영 오버헤드 최소화 | minimize operational overhead |
| 데이터 품질 | data quality |
| 데이터 일관성 | data consistency |
| 임시 쿼리 | ad-hoc query |
| 데이터 집계 | data aggregation |
| 이동 평균 | rolling average |
| 데이터 시각화 | data visualization |
| 로그 분석 | log analysis |
| 파이프라인 모니터링 | pipeline monitoring |
| 감사 추적 | audit trail |
| 알림 | notification / alert |
| 성능 튜닝 | performance tuning |
| 데이터 샘플링 | data sampling |
| 데이터 스큐 | data skew |

### 데이터 보안 및 거버넌스
| 한국어 | 영문 공식 표현 |
|--------|--------------|
| 최소 권한 원칙 | principle of least privilege |
| 역할 기반 접근 제어 | role-based access control (RBAC) |
| 속성 기반 접근 제어 | attribute-based access control (ABAC) |
| 태그 기반 접근 제어 | tag-based access control |
| 암호화 | encryption |
| 전송 중 암호화 | encryption in transit |
| 저장 시 암호화 | encryption at rest |
| 데이터 마스킹 | data masking |
| 익명화 | anonymization |
| 개인식별정보 | personally identifiable information (PII) |
| 자격 증명 순환 | credential rotation |
| 데이터 거버넌스 | data governance |
| 데이터 주권 | data sovereignty |
| 규정 준수 | compliance |
| 감사 로그 | audit log |
| 세분화된 접근 제어 | fine-grained access control |
| 교차 계정 암호화 | cross-account encryption |

---

## 6. DEA-C01에 등장하는 주요 AWS 서비스 (번역 없이 그대로 사용)

```
Amazon Kinesis Data Streams         AWS Glue
Amazon Kinesis Data Firehose        AWS Glue Data Catalog
Amazon Kinesis Data Analytics       AWS Glue DataBrew
Amazon Managed Streaming for Apache Kafka (Amazon MSK)
AWS Database Migration Service (AWS DMS)
Amazon AppFlow                      Amazon EMR
Amazon EventBridge                  AWS Step Functions
Amazon MWAA                         AWS Lambda
Amazon S3                           Amazon Redshift
Amazon DynamoDB                     Amazon Aurora
Amazon RDS                          Amazon MemoryDB for Redis
AWS Lake Formation                  Amazon Athena
Amazon QuickSight                   Amazon OpenSearch Service
Amazon CloudWatch                   AWS CloudTrail
AWS CloudTrail Lake                 Amazon Macie
AWS Key Management Service (AWS KMS)
AWS Secrets Manager                 AWS Systems Manager Parameter Store
AWS Identity and Access Management (IAM)
AWS Config                          Amazon VPC
AWS PrivateLink                     Amazon S3 Access Points
AWS Transfer Family                 AWS Schema Conversion Tool (AWS SCT)
Amazon SageMaker                    Amazon SageMaker Data Wrangler
Amazon SageMaker Unified Studio     AWS CloudFormation
AWS CDK                             AWS SAM
Amazon SNS                          Amazon SQS
Apache Iceberg                      Apache Parquet
Apache Avro                         Apache ORC
```
