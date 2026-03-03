# AWS DEA-C01 Pipeline Batch 2 - Detailed Content

## Question 507: AWS DMS for Real-time Data Synchronization

**ID:** awsdeac01-q507  
**Exam:** AWS Certified Data Engineer - Associate (aws-dea-c01)  
**Domain:** 데이터 수집 및 변환 (Data Ingestion and Transformation)  
**Sort Order:** 41  

### Korean Version (한국어)

**문제:**
한 제약 회사는 글로벌 연구소들의 임상 시험 데이터를 중앙 데이터베이스(Amazon RDS)로 실시간 동기화해야 하며, 온프레미스 레거시 데이터베이스 서버와의 지속적인 복제가 필수입니다. 단방향이 아닌 양방향 변경 데이터 캡처(CDC)를 통한 저지연 동기화가 요구됩니다.

이 요구사항을 충족하기 위해 어떤 AWS 서비스를 사용해야 합니까?

**선택지:**
- (a) Amazon AppFlow를 사용한 API 기반 동기화
- (b) AWS Database Migration Service(AWS DMS)의 지속적 복제 기능 ✅ **정답**
- (c) Amazon Kinesis Data Firehose를 통한 스트리밍 수집
- (d) AWS Glue ETL을 사용한 배치 동기화

**해설:**
AWS DMS는 온프레미스 데이터베이스와 AWS 관리형 데이터베이스 간의 지속적 복제를 위해 설계되었습니다. CDC(Change Data Capture)를 통해 저지연 양방향 동기화를 제공하며, 운영 중단을 최소화합니다.

### English Version (영문)

**Question:**
A pharmaceutical company must synchronize clinical trial data from global laboratories to a central database (Amazon RDS) in real-time, requiring continuous replication from on-premises legacy database servers. Bidirectional synchronization with low latency through Change Data Capture (CDC) is essential.

Which AWS service should be used to meet these requirements?

**Options:**
- (a) API-based synchronization using Amazon AppFlow
- (b) Continuous replication feature of AWS Database Migration Service (AWS DMS) ✅ **Correct**
- (c) Streaming ingestion through Amazon Kinesis Data Firehose
- (d) Batch synchronization using AWS Glue ETL

**Explanation:**
AWS DMS is designed for continuous replication between on-premises and AWS managed databases. It provides low-latency bidirectional synchronization through CDC (Change Data Capture), minimizing operational downtime.

**Key Points:**
- AWS DMS를 사용한 실시간 데이터 동기화
- 온프레미스와 클라우드 데이터베이스 간 지속적 복제(CDC)
- 저지연 양방향 동기화로 데이터 일관성 보장
- 이기종 데이터베이스 간 마이그레이션 및 동기화 지원

**Reference Links:**
- [AWS DMS Documentation](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [DMS Change Data Capture](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Introduction.html)

---

## Question 508: AWS Step Functions Retry & Error Handling

**ID:** awsdeac01-q508  
**Domain:** 데이터 수집 및 변환 (Data Ingestion and Transformation)  
**Sort Order:** 42  

### Korean Version (한국어)

**문제:**
한 금융 회사의 데이터 엔지니어가 AWS Step Functions를 사용하여 복잡한 데이터 파이프라인을 오케스트레이션하고 있습니다. 파이프라인의 한 단계에서 외부 결제 API를 호출하는데, 이 API가 네트워크 지연으로 인해 일시적으로 타임아웃되는 경우가 발생합니다. 안정성을 높이기 위해 파이프라인이 자동으로 재시도해야 합니다.

이 요구사항을 해결하기 위해 무엇을 설정해야 합니까?

**선택지:**
- (a) AWS Step Functions에서 Task 타임아웃을 무제한으로 설정
- (b) Step Functions Retry 정책 설정 및 지수 백오프(exponential backoff) 구성 ✅ **정답**
- (c) 외부 API를 Amazon RDS에 캐시
- (d) AWS Lambda 함수에 메모리를 증가시켜 처리 속도 향상

**해설:**
Step Functions의 Retry 정책을 사용하면 실패한 Task를 자동으로 재시도할 수 있습니다. 지수 백오프를 구성하면 재시도 간격이 점차 증가하여 일시적 오류를 효과적으로 처리합니다.

### English Version (영문)

**Question:**
A data engineer at a financial company is using AWS Step Functions to orchestrate a complex data pipeline. One step calls an external payment API that occasionally times out due to network latency. The pipeline must automatically retry to improve reliability.

What should be configured to address this requirement?

**Options:**
- (a) Set Task timeout to unlimited in AWS Step Functions
- (b) Configure Step Functions Retry policy with exponential backoff ✅ **Correct**
- (c) Cache the external API in Amazon RDS
- (d) Increase Lambda function memory to improve processing speed

**Explanation:**
Using Step Functions' Retry policy enables automatic retry of failed tasks. Exponential backoff increases retry intervals progressively, effectively handling transient errors.

**Key Points:**
- AWS Step Functions 재시도 및 오류 처리
- Retry 정책으로 일시적 오류 자동 복구
- 지수 백오프로 API 부하 조절
- Catch 정책으로 최종 실패 시 대체 경로 설정

**Reference Links:**
- [Step Functions Task Retries](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html)
- [Error Handling in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/handling-error-conditions.html)

---

## Question 509: AWS Glue ETL for Medallion Architecture

**ID:** awsdeac01-q509  
**Domain:** 데이터 수집 및 변환 (Data Ingestion and Transformation)  
**Sort Order:** 43  

### Korean Version (한국어)

**문제:**
한 소매 회사는 Amazon S3에서 메달리온 아키텍처(Bronze-Silver-Gold)를 구현하려고 합니다. Bronze 계층에는 원본 데이터가 저장되고, Silver 계층에는 데이터 품질 확인 및 정규화가 이루어지며, Gold 계층에는 최종 분석용 데이터가 저장됩니다. 각 계층 간 변환 작업을 효율적으로 관리해야 합니다.

S3 기반 메달리온 아키텍처 간 데이터 변환을 관리하기에 가장 적합한 AWS 서비스는 무엇입니까?

**선택지:**
- (a) Amazon Athena를 사용한 SQL 기반 변환
- (b) AWS Glue ETL을 사용한 자동화된 데이터 변환 ✅ **정답**
- (c) Amazon Redshift를 사용한 데이터 웨어하우스 기반 변환
- (d) AWS Lambda 함수를 사용한 커스텀 변환 스크립트

**해설:**
AWS Glue ETL은 메달리온 아키텍처의 각 계층 간 변환을 자동으로 처리하기 위해 설계되었습니다. 스키마 탐지, 자동 코드 생성, 데이터 카탈로그 통합 등으로 운영 오버헤드를 최소화합니다.

### English Version (영문)

**Question:**
A retail company wants to implement a medallion architecture (Bronze-Silver-Gold) on Amazon S3. Raw data is stored in the Bronze layer, data quality checks and normalization occur in the Silver layer, and final analytical data is stored in the Gold layer. Data transformations between each layer must be efficiently managed.

Which AWS service is BEST suited to manage data transformations between S3-based medallion architecture layers?

**Options:**
- (a) SQL-based transformation using Amazon Athena
- (b) Automated data transformation using AWS Glue ETL ✅ **Correct**
- (c) Data warehouse-based transformation using Amazon Redshift
- (d) Custom transformation scripts using AWS Lambda functions

**Explanation:**
AWS Glue ETL is designed to automatically handle transformations between medallion architecture layers. It minimizes operational overhead through schema detection, auto-generated code, and Data Catalog integration.

**Key Points:**
- AWS Glue를 사용한 메달리온 아키텍처 구현
- Bronze→Silver→Gold 계층 간 자동 변환 파이프라인
- Glue Data Catalog로 스키마 메타데이터 관리
- Glue Crawlers로 자동 스키마 탐지 및 카탈로그 업데이트

**Reference Links:**
- [AWS Glue ETL](https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html)
- [Glue Data Catalog](https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html)

---

## Question 510: AWS CloudTrail for Audit Logging

**ID:** awsdeac01-q510  
**Domain:** 데이터 보안 및 거버넌스 (Data Security and Governance)  
**Sort Order:** 44  

### Korean Version (한국어)

**문제:**
한 의료 보험 회사는 규정 준수 요구사항으로 인해 모든 데이터 파이프라인에서의 AWS API 호출을 추적하고 감사 로그를 유지해야 합니다. 실시간 모니터링이 필요하며, 모든 변경 사항(데이터 접근, 리소스 수정, IAM 권한 변경 등)이 기록되어야 합니다.

AWS 서비스에 대한 모든 API 호출을 기록하고 감사 추적을 제공하는 서비스는 무엇입니까?

**선택지:**
- (a) Amazon CloudWatch Logs를 사용한 애플리케이션 로그 수집
- (b) AWS CloudTrail을 사용한 API 호출 감사 및 추적 ✅ **정답**
- (c) AWS Config를 사용한 리소스 구성 변경 추적
- (d) Amazon GuardDuty를 사용한 위협 탐지

**해설:**
AWS CloudTrail은 AWS 계정의 모든 API 호출을 기록하며, S3에 감사 로그를 저장합니다. 규정 준수 감시, 보안 분석, 운영 문제 해결에 필수적입니다.

### English Version (영문)

**Question:**
A healthcare insurance company must track all AWS API calls in their data pipeline and maintain audit logs due to compliance requirements. Real-time monitoring is needed, and all changes (data access, resource modifications, IAM permission changes, etc.) must be recorded.

Which AWS service records all API calls to AWS services and provides audit trails?

**Options:**
- (a) Application log collection using Amazon CloudWatch Logs
- (b) API call auditing and tracking using AWS CloudTrail ✅ **Correct**
- (c) Resource configuration change tracking using AWS Config
- (d) Threat detection using Amazon GuardDuty

**Explanation:**
AWS CloudTrail records all API calls to AWS services and stores audit logs in S3. It is essential for compliance monitoring, security analysis, and operational troubleshooting.

**Key Points:**
- AWS CloudTrail을 사용한 감사 추적
- 모든 AWS API 호출 기록 및 S3 저장
- 누가, 언제, 어디서 어떤 작업을 했는지 추적
- 규정 준수(HIPAA, GDPR 등) 감사 요구사항 충족

**Reference Links:**
- [AWS CloudTrail Documentation](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)
- [CloudTrail Event Reference](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)

---

## Question 511: S3 Hive Partitioning for Query Optimization

**ID:** awsdeac01-q511  
**Domain:** 데이터 저장소 관리 (Data Store Management)  
**Sort Order:** 45  

### Korean Version (한국어)

**문제:**
한 전자상거래 회사는 고객 주문 데이터(100GB)를 Amazon S3에 저장하고, 매일 특정 날짜 범위의 주문을 조회하는 분석을 수행합니다. 현재 모든 파일을 스캔하여 성능이 저하되고 있으며, 쿼리 성능을 개선해야 합니다.

Amazon S3의 데이터 저장 레이아웃을 최적화하여 타임스탬프 기반 범위 쿼리의 성능을 가장 효과적으로 개선하는 방법은 무엇입니까?

**선택지:**
- (a) 모든 데이터를 하나의 S3 객체에 저장하고 압축 비율 증가
- (b) Hive 스타일 파티셔닝(연/월/일 기준)을 사용한 디렉터리 구조 ✅ **정답**
- (c) S3 IntelliTiering을 활성화하여 자동 계층화
- (d) S3 Select를 사용한 SQL 기반 객체 필터링

**해설:**
Hive 스타일 파티셔닝으로 데이터를 연/월/일 디렉터리로 구조화하면, 범위 쿼리 시 필요한 파티션만 스캔하게 되어 I/O 비용과 쿼리 시간을 획기적으로 줄일 수 있습니다.

### English Version (영문)

**Question:**
An e-commerce company stores customer order data (100GB) in Amazon S3 and performs daily analysis querying orders within specific date ranges. Currently, performance is degraded because all files are scanned, and query performance must be improved.

What is the MOST effective way to optimize Amazon S3 data storage layout to improve timestamp-based range query performance?

**Options:**
- (a) Store all data in a single S3 object with increased compression ratio
- (b) Directory structure using Hive-style partitioning (by year/month/day) ✅ **Correct**
- (c) Enable S3 IntelliTiering for automatic tiering
- (d) SQL-based object filtering using S3 Select

**Explanation:**
Hive-style partitioning organized by year/month/day enables range queries to scan only necessary partitions, dramatically reducing I/O costs and query time.

**Key Points:**
- Amazon S3 파티셔닝을 통한 쿼리 최적화
- Hive 스타일 파티셔닝(s3://bucket/year=2024/month=03/day=15/...)
- 범위 쿼리 시 필요한 파티션만 스캔하여 I/O 최소화
- Amazon Athena와 AWS Glue의 파티션 프루닝 자동 활용

**Reference Links:**
- [S3 Partitioning Best Practices](https://docs.aws.amazon.com/athena/latest/ug/partitioning-data.html)
- [Hive Partitioning](https://docs.aws.amazon.com/athena/latest/ug/tables-databases-columns-names.html)

---

## Summary Statistics

- **Total Questions:** 5
- **ID Range:** awsdeac01-q507 ~ awsdeac01-q511
- **Sort Order Range:** 41-45
- **Domain Distribution:**
  - Data Ingestion & Transformation: 3 (60%)
  - Data Store Management: 1 (20%)
  - Data Security & Governance: 1 (20%)
- **Bilingual Content:** ✅ Korean + English for all fields
- **Insertion Status:** ✅ 5/5 Successfully inserted to Supabase

