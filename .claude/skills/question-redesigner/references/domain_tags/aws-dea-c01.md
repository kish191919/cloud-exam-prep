# DEA-C01 도메인 태그 목록

AWS Certified Data Engineer - Associate (DEA-C01) 문제에 사용하는 도메인 태그입니다.
각 문제에 태그를 **정확히 1개** 부여합니다.

---

## 태그 목록

| 태그 | 영문 태그 | 설명 | 키워드 예시 |
|------|----------|------|------------|
| `데이터 수집 및 변환` | `Data Ingestion and Transformation` | 스트리밍/배치 수집, ETL 변환, 파이프라인 오케스트레이션, 프로그래밍 개념 | Kinesis Data Streams, Kinesis Data Firehose, MSK, DMS, Glue ETL, EMR, Lambda 변환, AppFlow, Step Functions, MWAA, EventBridge, CSV→Parquet, 배치, 스트리밍, 재처리, fan-in/fan-out, 속도 제한 |
| `데이터 저장소 관리` | `Data Store Management` | 저장소 선택, 데이터 카탈로그, 수명 주기, 스키마 설계 및 진화 | S3 Lifecycle, Redshift, DynamoDB TTL, Glue Data Catalog, Lake Formation, Aurora, MemoryDB, Transfer Family, Apache Iceberg, 파티셔닝, 압축, 벡터 인덱스, HNSW, IVF, 스키마 변환, SCT, 데이터 계보 |
| `데이터 운영 및 지원` | `Data Operations and Support` | 파이프라인 자동화, 데이터 분석/쿼리, 모니터링, 데이터 품질 | Athena, QuickSight, CloudWatch, CloudTrail, DataBrew, SageMaker Data Wrangler, OpenSearch, EMR 로그, 데이터 품질 규칙, 데이터 일관성, 샘플링, 데이터 스큐 |
| `데이터 보안 및 거버넌스` | `Data Security and Governance` | 인증·인가, 암호화, 감사 로그, 데이터 프라이버시 및 거버넌스 | IAM, Lake Formation 권한, KMS, Secrets Manager, Systems Manager Parameter Store, Macie, PrivateLink, VPC Security Groups, S3 Access Points, CloudTrail Lake, 최소 권한, PII, 데이터 주권, AWS Config, 데이터 마스킹 |

---

## 태그 선택 기준

1. 문제의 **핵심 주제**를 기준으로 선택 (보기 내용이 아닌 질문이 무엇을 묻는지)
2. Kinesis·MSK·DMS·Glue ETL·AppFlow·Step Functions·MWAA 등 수집/변환/오케스트레이션 → `데이터 수집 및 변환`
3. S3·Redshift·DynamoDB·Glue Catalog·Lake Formation·Iceberg 등 저장/카탈로그/스키마 → `데이터 저장소 관리`
4. Athena 쿼리·CloudWatch 모니터링·DataBrew 품질·로그 분석·파이프라인 자동화 → `데이터 운영 및 지원`
5. IAM·KMS·Lake Formation 권한·Macie·Secrets Manager·CloudTrail Lake·암호화 → `데이터 보안 및 거버넌스`
6. 경계가 모호한 경우:
   - 데이터가 **'어디에 저장되는가'** 가 핵심이면 → `데이터 저장소 관리`
   - 데이터가 **'어떻게 이동·변환되는가'** 가 핵심이면 → `데이터 수집 및 변환`
   - Lake Formation이 **'접근 제어·거버넌스'** 목적이면 → `데이터 보안 및 거버넌스`
   - Lake Formation이 **'데이터 레이크 구성·카탈로그'** 목적이면 → `데이터 저장소 관리`
