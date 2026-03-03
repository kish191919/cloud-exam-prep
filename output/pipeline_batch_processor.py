#!/usr/bin/env python3
"""
Pipeline batch processor for AWS DEA-C01 questions
Handles: ID assignment → Korean redesign → English translation → Supabase insertion
"""

import json
import sys
from datetime import datetime
from pathlib import Path

# Original input data
QUESTIONS_INPUT = [
    {
        "number": 101,
        "question": "A company needs to synchronize data between an on-premises SQL Server and Amazon RDS continuously with low latency. Which AWS service should be used?",
        "options": {},
        "answer": ""
    },
    {
        "number": 102,
        "question": "A data engineer is using AWS Step Functions to orchestrate a pipeline. One step calls an external API that occasionally times out. What should be configured to handle this?",
        "options": {},
        "answer": ""
    },
    {
        "number": 103,
        "question": "A company wants to implement a medallion architecture (Bronze, Silver, Gold) on Amazon S3. Which AWS service is BEST suited to manage the transformations between layers?",
        "options": {},
        "answer": ""
    },
    {
        "number": 104,
        "question": "An organization needs to track all API calls made to AWS services in their data pipeline for auditing purposes. Which AWS service provides this?",
        "options": {},
        "answer": ""
    },
    {
        "number": 105,
        "question": "A data engineer needs to optimize the storage layout of data in Amazon S3 for frequent range queries on a timestamp column. Which technique should be applied?",
        "options": {},
        "answer": ""
    }
]

CORRECT_ANSWER_CONCEPTS = {
    "101": "AWS Database Migration Service(AWS DMS) — 온프레미스 SQL Server와 Amazon RDS 간 지속적 복제(CDC) 동기화",
    "102": "AWS Step Functions Retry 및 Catch 구성 — 타임아웃 발생 시 재시도 횟수·간격 설정 및 오류 처리 분기",
    "103": "AWS Glue ETL — S3 기반 메달리온 아키텍처의 Bronze→Silver→Gold 레이어 간 변환 작업 관리",
    "104": "AWS CloudTrail — AWS 서비스에 대한 모든 API 호출을 기록하고 감사 로그를 S3에 저장",
    "105": "Amazon S3 Hive 스타일 파티셔닝(타임스탬프 기준) — 연/월/일 파티션으로 데이터를 저장하여 범위 쿼리 시 스캔 범위 최소화"
}

# Korean redesigned problems (based on original concepts)
REDESIGNED_PROBLEMS = [
    {
        "id": "awsdeac01-q507",
        "exam_id": "aws-dea-c01",
        "text": "한 제약 회사는 글로벌 연구소들의 임상 시험 데이터를 중앙 데이터베이스(Amazon RDS)로 실시간 동기화해야 하며, 온프레미스 레거시 데이터베이스 서버와의 지속적인 복제가 필수입니다. 단방향이 아닌 양방향 변경 데이터 캡처(CDC)를 통한 저지연 동기화가 요구됩니다.\n\n이 요구사항을 충족하기 위해 어떤 AWS 서비스를 사용해야 합니까?",
        "options": {
            "a": "Amazon AppFlow를 사용한 API 기반 동기화",
            "b": "AWS Database Migration Service(AWS DMS)의 지속적 복제 기능",
            "c": "Amazon Kinesis Data Firehose를 통한 스트리밍 수집",
            "d": "AWS Glue ETL을 사용한 배치 동기화"
        },
        "answer": "b",
        "explanation": "AWS DMS는 온프레미스 데이터베이스와 AWS 관리형 데이터베이스 간의 지속적 복제를 위해 설계되었습니다. CDC(Change Data Capture)를 통해 저지연 양방향 동기화를 제공하며, 운영 중단을 최소화합니다.",
        "explanation_en": "AWS DMS is designed for continuous replication between on-premises and AWS managed databases. It provides low-latency bidirectional synchronization through CDC (Change Data Capture), minimizing operational downtime.",
        "key_points": "AWS DMS를 사용한 실시간 데이터 동기화\n• 온프레미스와 클라우드 데이터베이스 간 지속적 복제(CDC)\n• 저지연 양방향 동기화로 데이터 일관성 보장\n• 이기종 데이터베이스 간 마이그레이션 및 동기화 지원",
        "key_points_en": "Real-time data synchronization using AWS DMS\n• Continuous replication between on-premises and cloud databases (CDC)\n• Low-latency bidirectional synchronization ensures data consistency\n• Support for heterogeneous database migration and synchronization",
        "ref_links": "[{\"name\": \"AWS DMS Documentation\", \"url\": \"https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html\"}, {\"name\": \"DMS Change Data Capture\", \"url\": \"https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Introduction.html\"}]",
        "tag": "데이터 수집 및 변환",
        "tag_en": "Data Ingestion and Transformation"
    },
    {
        "id": "awsdeac01-q508",
        "exam_id": "aws-dea-c01",
        "text": "한 금융 회사의 데이터 엔지니어가 AWS Step Functions를 사용하여 복잡한 데이터 파이프라인을 오케스트레이션하고 있습니다. 파이프라인의 한 단계에서 외부 결제 API를 호출하는데, 이 API가 네트워크 지연으로 인해 일시적으로 타임아웃되는 경우가 발생합니다. 안정성을 높이기 위해 파이프라인이 자동으로 재시도해야 합니다.\n\n이 요구사항을 해결하기 위해 무엇을 설정해야 합니까?",
        "options": {
            "a": "AWS Step Functions에서 Task 타임아웃을 무제한으로 설정",
            "b": "Step Functions Retry 정책 설정 및 지수 백오프(exponential backoff) 구성",
            "c": "외부 API를 Amazon RDS에 캐시",
            "d": "AWS Lambda 함수에 메모리를 증가시켜 처리 속도 향상"
        },
        "answer": "b",
        "explanation": "Step Functions의 Retry 정책을 사용하면 실패한 Task를 자동으로 재시도할 수 있습니다. 지수 백오프를 구성하면 재시도 간격이 점차 증가하여 일시적 오류를 효과적으로 처리합니다.",
        "explanation_en": "Using Step Functions' Retry policy enables automatic retry of failed tasks. Exponential backoff increases retry intervals progressively, effectively handling transient errors.",
        "key_points": "AWS Step Functions 재시도 및 오류 처리\n• Retry 정책으로 일시적 오류 자동 복구\n• 지수 백오프로 API 부하 조절\n• Catch 정책으로 최종 실패 시 대체 경로 설정",
        "key_points_en": "AWS Step Functions retry and error handling\n• Automatic recovery of transient errors with Retry policy\n• Exponential backoff regulates API load\n• Alternative workflow with Catch policy for final failures",
        "ref_links": "[{\"name\": \"Step Functions Task Retries\", \"url\": \"https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html\"}, {\"name\": \"Error Handling in Step Functions\", \"url\": \"https://docs.aws.amazon.com/step-functions/latest/dg/handling-error-conditions.html\"}]",
        "tag": "데이터 수집 및 변환",
        "tag_en": "Data Ingestion and Transformation"
    },
    {
        "id": "awsdeac01-q509",
        "exam_id": "aws-dea-c01",
        "text": "한 소매 회사는 Amazon S3에서 메달리온 아키텍처(Bronze-Silver-Gold)를 구현하려고 합니다. Bronze 계층에는 원본 데이터가 저장되고, Silver 계층에는 데이터 품질 확인 및 정규화가 이루어지며, Gold 계층에는 최종 분석용 데이터가 저장됩니다. 각 계층 간 변환 작업을 효율적으로 관리해야 합니다.\n\nS3 기반 메달리온 아키텍처 간 데이터 변환을 관리하기에 가장 적합한 AWS 서비스는 무엇입니까?",
        "options": {
            "a": "Amazon Athena를 사용한 SQL 기반 변환",
            "b": "AWS Glue ETL을 사용한 자동화된 데이터 변환",
            "c": "Amazon Redshift를 사용한 데이터 웨어하우스 기반 변환",
            "d": "AWS Lambda 함수를 사용한 커스텀 변환 스크립트"
        },
        "answer": "b",
        "explanation": "AWS Glue ETL은 메달리온 아키텍처의 각 계층 간 변환을 자동으로 처리하기 위해 설계되었습니다. 스키마 탐지, 자동 코드 생성, 데이터 카탈로그 통합 등으로 운영 오버헤드를 최소화합니다.",
        "explanation_en": "AWS Glue ETL is designed to automatically handle transformations between medallion architecture layers. It minimizes operational overhead through schema detection, auto-generated code, and Data Catalog integration.",
        "key_points": "AWS Glue를 사용한 메달리온 아키텍처 구현\n• Bronze→Silver→Gold 계층 간 자동 변환 파이프라인\n• Glue Data Catalog로 스키마 메타데이터 관리\n• Glue Crawlers로 자동 스키마 탐지 및 카탈로그 업데이트",
        "key_points_en": "Medallion architecture implementation using AWS Glue\n• Automated transformation pipeline between Bronze→Silver→Gold layers\n• Schema metadata management via Glue Data Catalog\n• Automatic schema detection and catalog updates with Glue Crawlers",
        "ref_links": "[{\"name\": \"AWS Glue ETL\", \"url\": \"https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html\"}, {\"name\": \"Glue Data Catalog\", \"url\": \"https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html\"}]",
        "tag": "데이터 수집 및 변환",
        "tag_en": "Data Ingestion and Transformation"
    },
    {
        "id": "awsdeac01-q510",
        "exam_id": "aws-dea-c01",
        "text": "한 의료 보험 회사는 규정 준수 요구사항으로 인해 모든 데이터 파이프라인에서의 AWS API 호출을 추적하고 감사 로그를 유지해야 합니다. 실시간 모니터링이 필요하며, 모든 변경 사항(데이터 접근, 리소스 수정, IAM 권한 변경 등)이 기록되어야 합니다.\n\nAWS 서비스에 대한 모든 API 호출을 기록하고 감사 추적을 제공하는 서비스는 무엇입니까?",
        "options": {
            "a": "Amazon CloudWatch Logs를 사용한 애플리케이션 로그 수집",
            "b": "AWS CloudTrail을 사용한 API 호출 감사 및 추적",
            "c": "AWS Config를 사용한 리소스 구성 변경 추적",
            "d": "Amazon GuardDuty를 사용한 위협 탐지"
        },
        "answer": "b",
        "explanation": "AWS CloudTrail은 AWS 계정의 모든 API 호출을 기록하며, S3에 감사 로그를 저장합니다. 규정 준수 감시, 보안 분석, 운영 문제 해결에 필수적입니다.",
        "explanation_en": "AWS CloudTrail records all API calls to AWS services and stores audit logs in S3. It is essential for compliance monitoring, security analysis, and operational troubleshooting.",
        "key_points": "AWS CloudTrail을 사용한 감사 추적\n• 모든 AWS API 호출 기록 및 S3 저장\n• 누가, 언제, 어디서 어떤 작업을 했는지 추적\n• 규정 준수(HIPAA, GDPR 등) 감사 요구사항 충족",
        "key_points_en": "Audit trails using AWS CloudTrail\n• Record all AWS API calls and store in S3\n• Track who, when, where, and what actions were performed\n• Meet compliance audit requirements (HIPAA, GDPR, etc.)",
        "ref_links": "[{\"name\": \"AWS CloudTrail Documentation\", \"url\": \"https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html\"}, {\"name\": \"CloudTrail Event Reference\", \"url\": \"https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html\"}]",
        "tag": "데이터 보안 및 거버넌스",
        "tag_en": "Data Security and Governance"
    },
    {
        "id": "awsdeac01-q511",
        "exam_id": "aws-dea-c01",
        "text": "한 전자상거래 회사는 고객 주문 데이터(100GB)를 Amazon S3에 저장하고, 매일 특정 날짜 범위의 주문을 조회하는 분석을 수행합니다. 현재 모든 파일을 스캔하여 성능이 저하되고 있으며, 쿼리 성능을 개선해야 합니다.\n\nAmazon S3의 데이터 저장 레이아웃을 최적화하여 타임스탬프 기반 범위 쿼리의 성능을 가장 효과적으로 개선하는 방법은 무엇입니까?",
        "options": {
            "a": "모든 데이터를 하나의 S3 객체에 저장하고 압축 비율 증가",
            "b": "Hive 스타일 파티셔닝(연/월/일 기준)을 사용한 디렉터리 구조",
            "c": "S3 IntelliTiering을 활성화하여 자동 계층화",
            "d": "S3 Select를 사용한 SQL 기반 객체 필터링"
        },
        "answer": "b",
        "explanation": "Hive 스타일 파티셔닝으로 데이터를 연/월/일 디렉터리로 구조화하면, 범위 쿼리 시 필요한 파티션만 스캔하게 되어 I/O 비용과 쿼리 시간을 획기적으로 줄일 수 있습니다.",
        "explanation_en": "Hive-style partitioning organized by year/month/day enables range queries to scan only necessary partitions, dramatically reducing I/O costs and query time.",
        "key_points": "Amazon S3 파티셔닝을 통한 쿼리 최적화\n• Hive 스타일 파티셔닝(s3://bucket/year=2024/month=03/day=15/...)\n• 범위 쿼리 시 필요한 파티션만 스캔하여 I/O 최소화\n• Amazon Athena와 AWS Glue의 파티션 프루닝 자동 활용",
        "key_points_en": "Query optimization through Amazon S3 partitioning\n• Hive-style partitioning (s3://bucket/year=2024/month=03/day=15/...)\n• Minimize I/O by scanning only necessary partitions for range queries\n• Automatic partition pruning with Amazon Athena and AWS Glue",
        "ref_links": "[{\"name\": \"S3 Partitioning Best Practices\", \"url\": \"https://docs.aws.amazon.com/athena/latest/ug/partitioning-data.html\"}, {\"name\": \"Hive Partitioning\", \"url\": \"https://docs.aws.amazon.com/athena/latest/ug/tables-databases-columns-names.html\"}]",
        "tag": "데이터 저장소 관리",
        "tag_en": "Data Store Management"
    }
]

def save_redesigned_questions():
    """Save redesigned questions to output file for insertion"""
    output_path = Path("/Users/sunghwanki/Desktop/Github_Project/cloud-exam-prep/output/pipeline_redesign_temp_batch2.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open('w', encoding='utf-8') as f:
        json.dump(REDESIGNED_PROBLEMS, f, ensure_ascii=False, indent=2)

    return output_path

def main():
    """Main execution"""
    print("=" * 80)
    print("AWS DEA-C01 Pipeline Batch Processor")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 80)

    print("\n[STEP 1] ID Assignment")
    print("─" * 80)
    for i, q in enumerate(QUESTIONS_INPUT, 1):
        qid = f"awsdeac01-q{506+i:03d}"
        print(f"  Q{q['number']} → {qid}")

    print("\n[STEP 2-5.5] Korean Redesign & English Translation")
    print("─" * 80)
    for i, q in enumerate(REDESIGNED_PROBLEMS, 1):
        print(f"  [{i}] {q['id']}: ✅ Korean redesigned + English translated")

    print("\n[STEP 6] Preparing for Supabase Insertion")
    print("─" * 80)
    output_file = save_redesigned_questions()
    print(f"  Output file: {output_file}")
    print(f"  Total questions: {len(REDESIGNED_PROBLEMS)}")

    print("\nReady for Supabase insertion:")
    print(f"  Command: python3 .claude/skills/sql-generator/scripts/insert_supabase.py \\")
    print(f"    --input-file output/pipeline_redesign_temp_batch2.json \\")
    print(f"    --set-id 8d73363a-ecd2-4f4a-8775-607aaff70433 \\")
    print(f"    --sort-order-start 41")

    print("\n" + "=" * 80)
    print("Pipeline batch processing complete")
    print("=" * 80)

if __name__ == "__main__":
    main()
