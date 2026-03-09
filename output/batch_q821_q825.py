#!/usr/bin/env python3
import subprocess, json

questions = [
  {
    "id": "awsaifc01-q821",
    "exam_id": "aws-aif-c01",
    "text": "한 의료 AI 스타트업이 Amazon SageMaker로 희귀 질환 진단 보조 모델을 개발하고 있습니다. 규제 기관은 이 모델이 어떤 훈련 데이터로 학습되었는지, 데이터 전처리 이력, 각 데이터셋과 모델 버전 간의 관계, 그리고 모델의 성능 지표·편향 분석·사용 제한 사항이 체계적으로 기록되어 있어야 한다고 요구했습니다. 이 요구사항을 충족하기 위해 사용해야 할 SageMaker 기능의 조합으로 가장 적합한 것은 무엇입니까?",
    "text_en": "A medical AI startup is developing a rare disease diagnosis assistance model using Amazon SageMaker. A regulatory agency requires that the model systematically documents which training data was used, the data preprocessing history, the relationship between each dataset and model version, and the model's performance metrics, bias analysis, and usage limitations. Which combination of SageMaker features BEST meets these documentation requirements?",
    "explanation": "SageMaker ML Lineage Tracking은 훈련 데이터의 출처, 처리 파이프라인, 모델 버전 간의 관계를 자동으로 추적하는 데이터 계보(Data Lineage) 도구입니다. SageMaker Model Cards는 모델의 목적, 성능 지표, 편향 분석, 사용 제한 사항 등을 표준화된 형식으로 문서화합니다. 이 두 기능의 조합이 규제 감사 요구사항을 가장 완벽하게 충족합니다. SageMaker Experiments는 실험 추적에 초점이 맞춰져 있어 데이터 계보나 공식 문서화 기능이 부족하며, SageMaker Clarify는 편향 탐지에 특화되어 있지만 전체적인 데이터 계보 추적은 지원하지 않습니다.",
    "explanation_en": "SageMaker ML Lineage Tracking is a data lineage tool that automatically tracks the origin of training data, processing pipelines, and relationships between model versions. SageMaker Model Cards standardize documentation of model purpose, performance metrics, bias analysis, and usage limitations in a structured format. The combination of these two features most completely satisfies regulatory audit requirements. SageMaker Experiments focuses on experiment tracking and lacks comprehensive data lineage and formal documentation capabilities, while SageMaker Clarify specializes in bias detection but does not support full data lineage tracking.",
    "key_points": "SageMaker ML Lineage Tracking: 데이터 계보 자동 추적 (훈련 데이터 출처, 전처리 이력, 모델 버전 관계) / SageMaker Model Cards: 모델 공식 문서화 (성능 지표, 편향 분석, 사용 제한)",
    "key_points_en": "SageMaker ML Lineage Tracking: Automatic data lineage tracking (training data origin, preprocessing history, model version relationships) / SageMaker Model Cards: Official model documentation (performance metrics, bias analysis, usage limitations)",
    "difficulty": "medium",
    "answer": "B",
    "domain_tag": "AI 투명성·설명 가능성·거버넌스",
    "domain_tag_en": "AI Transparency, Explainability, and Governance",
    "ref_links": "[{\"name\": \"Amazon SageMaker ML Lineage Tracking\", \"url\": \"https://docs.aws.amazon.com/sagemaker/latest/dg/lineage-tracking.html\"}, {\"name\": \"Amazon SageMaker Model Cards\", \"url\": \"https://docs.aws.amazon.com/sagemaker/latest/dg/model-cards.html\"}]",
    "options": [
      {
        "option_id": "a",
        "text": "SageMaker Experiments + SageMaker Clarify",
        "text_en": "SageMaker Experiments + SageMaker Clarify",
        "is_correct": False,
        "explanation": "SageMaker Experiments는 실험 파라미터 추적에 특화되어 있고, SageMaker Clarify는 편향 탐지 도구입니다. 두 서비스의 조합은 전체적인 데이터 계보 추적과 표준화된 모델 문서화 기능을 제공하지 않습니다.",
        "explanation_en": "SageMaker Experiments specializes in tracking experiment parameters, and SageMaker Clarify is a bias detection tool. The combination of these two services does not provide comprehensive data lineage tracking or standardized model documentation capabilities."
      },
      {
        "option_id": "b",
        "text": "SageMaker ML Lineage Tracking + SageMaker Model Cards",
        "text_en": "SageMaker ML Lineage Tracking + SageMaker Model Cards",
        "is_correct": True,
        "explanation": "SageMaker ML Lineage Tracking은 데이터 계보를 자동으로 추적하여 훈련 데이터 출처, 전처리 이력, 데이터와 모델 버전 간의 관계를 기록합니다. SageMaker Model Cards는 모델의 성능 지표, 편향 분석, 사용 제한을 표준화된 형식으로 문서화하여 규제 감사 요구사항을 완벽하게 충족합니다.",
        "explanation_en": "SageMaker ML Lineage Tracking automatically tracks data lineage, recording training data origins, preprocessing history, and relationships between data and model versions. SageMaker Model Cards document model performance metrics, bias analysis, and usage limitations in a standardized format, completely satisfying regulatory audit requirements."
      },
      {
        "option_id": "c",
        "text": "SageMaker Pipelines + SageMaker Feature Store",
        "text_en": "SageMaker Pipelines + SageMaker Feature Store",
        "is_correct": False,
        "explanation": "SageMaker Pipelines는 ML 워크플로 자동화 도구이고, SageMaker Feature Store는 피처 저장 및 재사용을 위한 서비스입니다. 두 서비스는 데이터 계보 추적이나 공식 모델 문서화 기능을 제공하지 않습니다.",
        "explanation_en": "SageMaker Pipelines is an ML workflow automation tool, and SageMaker Feature Store is a service for storing and reusing features. Neither service provides data lineage tracking or official model documentation capabilities."
      },
      {
        "option_id": "d",
        "text": "SageMaker Debugger + SageMaker Model Monitor",
        "text_en": "SageMaker Debugger + SageMaker Model Monitor",
        "is_correct": False,
        "explanation": "SageMaker Debugger는 훈련 중 모델 디버깅에 특화되어 있고, SageMaker Model Monitor는 배포된 모델의 드리프트를 모니터링합니다. 두 서비스는 과거 데이터 계보 추적이나 규제 감사를 위한 공식 문서화 기능을 제공하지 않습니다.",
        "explanation_en": "SageMaker Debugger specializes in model debugging during training, and SageMaker Model Monitor monitors drift in deployed models. Neither service provides historical data lineage tracking or formal documentation capabilities required for regulatory audits."
      }
    ]
  },
  {
    "id": "awsaifc01-q822",
    "exam_id": "aws-aif-c01",
    "text": "한 자율주행 자동차 기업이 AWS 위에서 실시간 센서 데이터 분석 시스템을 구축하고 있습니다. 시스템 엔지니어는 전 세계 여러 도시에 서비스를 배포하면서 단일 장애 지점을 방지하기 위해 AWS 인프라의 지리적 계층 구조를 정확히 파악해야 합니다. AWS 글로벌 인프라의 계층 구조를 가장 올바르게 설명한 것은 무엇입니까?",
    "text_en": "An autonomous vehicle company is building a real-time sensor data analysis system on AWS. A systems engineer needs to accurately understand the geographic hierarchy of AWS infrastructure to deploy services across multiple cities worldwide while preventing single points of failure. Which statement BEST describes the hierarchical structure of the AWS global infrastructure?",
    "explanation": "AWS 글로벌 인프라는 리전(Region) > 가용 영역(Availability Zone, AZ) > 데이터 센터(Data Center)의 3계층 구조로 구성됩니다. 리전은 지리적으로 분리된 독립 지역이며(예: us-east-1), 각 리전은 물리적으로 분리되어 있지만 낮은 지연 시간의 네트워크로 연결된 2개 이상의 AZ를 포함합니다. 각 AZ는 독립적인 전원, 냉각, 네트워킹을 갖춘 하나 이상의 데이터 센터로 구성됩니다. AZ 간 분산 배포를 통해 단일 장애 지점을 제거할 수 있습니다.",
    "explanation_en": "AWS global infrastructure is organized in a 3-tier hierarchy: Region > Availability Zone (AZ) > Data Center. A Region is a geographically isolated independent area (e.g., us-east-1), and each Region contains two or more AZs that are physically separated but connected by low-latency networks. Each AZ consists of one or more data centers with independent power, cooling, and networking. Distributing deployments across AZs eliminates single points of failure.",
    "key_points": "AWS 인프라 계층: 리전 > 가용 영역(AZ) > 데이터 센터 / 각 리전은 최소 2개 이상의 AZ 포함 / AZ는 독립 전원·냉각·네트워킹 보유 / AZ 분산으로 단일 장애 지점 제거",
    "key_points_en": "AWS infrastructure hierarchy: Region > Availability Zone (AZ) > Data Center / Each Region contains at least 2 AZs / AZs have independent power, cooling, and networking / Distributing across AZs eliminates single points of failure",
    "difficulty": "easy",
    "answer": "A",
    "domain_tag": "AWS GenAI 인프라와 서비스",
    "domain_tag_en": "AWS GenAI Infrastructure and Services",
    "ref_links": "[{\"name\": \"AWS Global Infrastructure\", \"url\": \"https://aws.amazon.com/about-aws/global-infrastructure/\"}, {\"name\": \"AWS Regions and Availability Zones\", \"url\": \"https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html\"}]",
    "options": [
      {
        "option_id": "a",
        "text": "리전은 여러 개의 가용 영역(AZ)을 포함하며, 각 AZ는 독립 전원과 네트워킹을 갖춘 하나 이상의 데이터 센터로 구성된다",
        "text_en": "A Region contains multiple Availability Zones (AZs), and each AZ consists of one or more data centers with independent power and networking",
        "is_correct": True,
        "explanation": "AWS 글로벌 인프라는 리전 > AZ > 데이터 센터의 계층 구조로 구성됩니다. 각 리전은 최소 2개의 AZ를 포함하고, 각 AZ는 독립적인 전원·냉각·네트워킹을 갖춘 하나 이상의 데이터 센터로 구성되어 고가용성과 내결함성을 제공합니다.",
        "explanation_en": "AWS global infrastructure is organized in a Region > AZ > Data Center hierarchy. Each Region contains a minimum of 2 AZs, and each AZ consists of one or more data centers with independent power, cooling, and networking, providing high availability and fault tolerance."
      },
      {
        "option_id": "b",
        "text": "가용 영역(AZ)은 여러 개의 리전을 포함하며, 각 리전은 단일 데이터 센터로 구성된다",
        "text_en": "An Availability Zone (AZ) contains multiple Regions, and each Region consists of a single data center",
        "is_correct": False,
        "explanation": "이는 AWS 인프라 계층의 순서가 반대입니다. 리전이 AZ를 포함하는 상위 개념이며, AZ가 리전을 포함하는 구조가 아닙니다. 또한 각 AZ는 하나 이상의 데이터 센터로 구성됩니다.",
        "explanation_en": "This reverses the order of the AWS infrastructure hierarchy. Regions are the higher-level concept that contains AZs, not the other way around. Additionally, each AZ consists of one or more data centers."
      },
      {
        "option_id": "c",
        "text": "리전과 가용 영역(AZ)은 동일한 개념이며, 데이터 센터는 독립적으로 운영된다",
        "text_en": "Regions and Availability Zones (AZs) are the same concept, and data centers operate independently",
        "is_correct": False,
        "explanation": "리전과 AZ는 서로 다른 계층 개념입니다. 리전은 지리적으로 분리된 큰 지역이고, AZ는 그 리전 안에 있는 독립적인 물리 인프라 집합입니다. 데이터 센터는 AZ를 구성하는 최소 단위입니다.",
        "explanation_en": "Regions and AZs are different hierarchical concepts. A Region is a large geographically separate area, and AZs are independent physical infrastructure groups within that Region. Data centers are the smallest unit that make up an AZ."
      },
      {
        "option_id": "d",
        "text": "각 데이터 센터는 독립적인 리전이며, 가용 영역(AZ)은 데이터 센터들의 논리적 그룹이다",
        "text_en": "Each data center is an independent Region, and Availability Zones (AZs) are logical groups of data centers",
        "is_correct": False,
        "explanation": "데이터 센터는 리전이 아닙니다. AWS에서 리전은 지리적으로 분리된 독립 지역(예: 서울, 버지니아)을 의미하며, AZ는 리전 내의 물리적으로 분리된 인프라 그룹, 데이터 센터는 AZ를 구성하는 물리적 시설입니다.",
        "explanation_en": "Data centers are not Regions. In AWS, a Region refers to a geographically separate independent area (e.g., Seoul, Virginia), an AZ is a physically separated infrastructure group within a Region, and a data center is the physical facility that makes up an AZ."
      }
    ]
  },
  {
    "id": "awsaifc01-q823",
    "exam_id": "aws-aif-c01",
    "text": "한 보험 회사가 AWS에서 운영하는 AI 기반 보험료 산정 시스템에 대해 보험감독원으로부터 규제 감사를 받게 되었습니다. 감사팀은 두 가지 증거를 요구했습니다. 첫째, 현재 인프라 구성이 사내 보안 정책을 준수하고 있으며 향후 변경이 발생할 경우 즉시 알림을 받을 수 있다는 지속적인 준수 증거. 둘째, 지난 12개월간 특정 AI 모델 엔드포인트와 API에 누가, 언제, 어떤 작업을 수행했는지에 대한 완전한 감사 로그. 이 두 요구사항을 함께 충족하는 AWS 서비스 조합은 무엇입니까?",
    "text_en": "An insurance company is facing a regulatory audit from an insurance supervisory authority for its AI-based premium calculation system running on AWS. The audit team requires two types of evidence. First, continuous compliance evidence that the current infrastructure configuration adheres to internal security policies and that notifications will be received immediately if future changes occur. Second, complete audit logs showing who did what, when, on specific AI model endpoints and APIs over the past 12 months. Which combination of AWS services BEST meets both of these requirements?",
    "explanation": "AWS Config는 AWS 리소스 구성을 지속적으로 모니터링하고 기록하여 보안 정책 준수 여부를 평가하며, 구성 변경 시 알림을 보낼 수 있습니다. AWS CloudTrail은 AWS 계정 내의 모든 API 호출과 사용자 활동을 로그로 기록하여 누가, 언제, 어떤 작업을 수행했는지에 대한 완전한 감사 추적을 제공합니다. 두 서비스의 조합이 인프라 준수 증거와 API 접근 감사 로그 요구사항을 모두 충족합니다.",
    "explanation_en": "AWS Config continuously monitors and records AWS resource configurations to evaluate compliance with security policies and can send notifications when configurations change. AWS CloudTrail records all API calls and user activity within an AWS account as logs, providing a complete audit trail of who did what and when. The combination of these two services satisfies both the infrastructure compliance evidence and API access audit log requirements.",
    "key_points": "AWS Config: 리소스 구성 지속 모니터링 + 정책 준수 평가 + 변경 알림 / AWS CloudTrail: 모든 API 호출 및 사용자 활동 로그 기록 / 두 서비스 조합으로 규제 감사의 두 가지 요구사항 충족",
    "key_points_en": "AWS Config: Continuous resource configuration monitoring + policy compliance evaluation + change notifications / AWS CloudTrail: Logging all API calls and user activity / Combination of both services satisfies both regulatory audit requirements",
    "difficulty": "medium",
    "answer": "D",
    "domain_tag": "AI 투명성·설명 가능성·거버넌스",
    "domain_tag_en": "AI Transparency, Explainability, and Governance",
    "ref_links": "[{\"name\": \"AWS Config\", \"url\": \"https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html\"}, {\"name\": \"AWS CloudTrail\", \"url\": \"https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html\"}]",
    "options": [
      {
        "option_id": "a",
        "text": "Amazon GuardDuty + AWS Security Hub",
        "text_en": "Amazon GuardDuty + AWS Security Hub",
        "is_correct": False,
        "explanation": "Amazon GuardDuty는 위협 탐지 서비스이고, AWS Security Hub는 보안 발견 사항을 통합하는 서비스입니다. 두 서비스는 보안 위협 탐지와 통합 대시보드를 제공하지만, 인프라 구성 준수 여부의 지속적인 평가나 API 접근의 상세 감사 로그를 직접 제공하지는 않습니다.",
        "explanation_en": "Amazon GuardDuty is a threat detection service, and AWS Security Hub is a service that consolidates security findings. While these services provide security threat detection and a unified dashboard, they do not directly provide continuous evaluation of infrastructure configuration compliance or detailed audit logs of API access."
      },
      {
        "option_id": "b",
        "text": "Amazon Inspector + AWS Trusted Advisor",
        "text_en": "Amazon Inspector + AWS Trusted Advisor",
        "is_correct": False,
        "explanation": "Amazon Inspector는 EC2 인스턴스와 컨테이너의 취약점 스캔 서비스이고, AWS Trusted Advisor는 비용·성능·보안 최적화 권고 서비스입니다. 두 서비스는 지속적인 구성 준수 추적이나 API 감사 로그 기능을 제공하지 않습니다.",
        "explanation_en": "Amazon Inspector is a vulnerability scanning service for EC2 instances and containers, and AWS Trusted Advisor provides cost, performance, and security optimization recommendations. Neither service provides continuous configuration compliance tracking or API audit logging capabilities."
      },
      {
        "option_id": "c",
        "text": "AWS IAM Access Analyzer + Amazon CloudWatch",
        "text_en": "AWS IAM Access Analyzer + Amazon CloudWatch",
        "is_correct": False,
        "explanation": "AWS IAM Access Analyzer는 리소스 접근 정책 분석에 특화되어 있고, Amazon CloudWatch는 메트릭과 로그 모니터링 도구입니다. 두 서비스의 조합은 보안 정책 준수의 지속적인 평가나 모든 API 호출에 대한 완전한 감사 추적을 제공하지 않습니다.",
        "explanation_en": "AWS IAM Access Analyzer specializes in analyzing resource access policies, and Amazon CloudWatch is a metrics and log monitoring tool. The combination of these services does not provide continuous evaluation of security policy compliance or a complete audit trail for all API calls."
      },
      {
        "option_id": "d",
        "text": "AWS Config + AWS CloudTrail",
        "text_en": "AWS Config + AWS CloudTrail",
        "is_correct": True,
        "explanation": "AWS Config는 리소스 구성을 지속적으로 기록하고 보안 정책 준수 여부를 자동으로 평가하며 변경 시 알림을 제공합니다. AWS CloudTrail은 모든 API 호출과 사용자 활동을 상세히 기록하여 누가, 언제, 무엇을 했는지의 완전한 감사 로그를 제공합니다. 두 서비스의 조합이 규제 감사의 두 가지 요구사항을 모두 충족합니다.",
        "explanation_en": "AWS Config continuously records resource configurations, automatically evaluates compliance with security policies, and provides notifications on changes. AWS CloudTrail records all API calls and user activity in detail, providing complete audit logs of who did what and when. The combination of these two services satisfies both regulatory audit requirements."
      }
    ]
  },
  {
    "id": "awsaifc01-q824",
    "exam_id": "aws-aif-c01",
    "text": "한 온라인 교육 플랫폼이 학습자 개인화 콘텐츠 추천, 에세이 자동 피드백, 강사 지원 챗봇 기능을 위해 Amazon Bedrock 도입을 검토하고 있습니다. CTO는 파운데이션 모델을 직접 구축·관리하는 것보다 Bedrock을 사용하는 방식의 특징을 이해하고 싶어 합니다. Amazon Bedrock에 대한 설명으로 가장 올바른 것은 무엇입니까?",
    "text_en": "An online education platform is considering adopting Amazon Bedrock for learner personalized content recommendations, automated essay feedback, and instructor support chatbot features. The CTO wants to understand the characteristics of using Bedrock compared to directly building and managing foundation models. Which statement BEST describes Amazon Bedrock?",
    "explanation": "Amazon Bedrock은 서버리스 방식으로 다양한 파운데이션 모델에 API를 통해 접근할 수 있는 완전 관리형 서비스입니다. 기본 요금은 입력·출력 토큰 수에 기반하며(온디맨드), 높은 처리량이 필요한 경우 프로비저닝 처리량 옵션을 선택할 수 있습니다. 특정 도메인에 특화된 모델이 필요한 경우 파인튜닝을 통해 기존 모델을 커스터마이징하여 운영할 수 있으며, 인프라 관리 없이 모델 기능을 활용할 수 있습니다.",
    "explanation_en": "Amazon Bedrock is a fully managed service that provides API access to various foundation models in a serverless manner. The base pricing is based on the number of input and output tokens (on-demand), and a provisioned throughput option can be selected for high-throughput requirements. When a domain-specific model is needed, existing models can be customized through fine-tuning and operated without managing infrastructure.",
    "key_points": "Amazon Bedrock: 완전 관리형 서버리스 파운데이션 모델 API 서비스 / 온디맨드(토큰 기반) vs 프로비저닝 처리량 요금 옵션 / 파인튜닝으로 도메인 특화 모델 커스터마이징 가능 / 인프라 관리 불필요",
    "key_points_en": "Amazon Bedrock: Fully managed serverless foundation model API service / On-demand (token-based) vs provisioned throughput pricing options / Fine-tuning available for domain-specific model customization / No infrastructure management required",
    "difficulty": "easy",
    "answer": "C",
    "domain_tag": "AWS GenAI 인프라와 서비스",
    "domain_tag_en": "AWS GenAI Infrastructure and Services",
    "ref_links": "[{\"name\": \"Amazon Bedrock Overview\", \"url\": \"https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html\"}, {\"name\": \"Amazon Bedrock Pricing\", \"url\": \"https://aws.amazon.com/bedrock/pricing/\"}]",
    "options": [
      {
        "option_id": "a",
        "text": "Amazon Bedrock은 단일 파운데이션 모델만 제공하며, 모든 사용 사례에 동일한 모델이 적용된다",
        "text_en": "Amazon Bedrock provides only a single foundation model, and the same model is applied to all use cases",
        "is_correct": False,
        "explanation": "Amazon Bedrock은 단일 모델이 아니라 Anthropic Claude, Amazon Titan, AI21 Labs, Cohere, Meta Llama 등 다양한 공급업체의 여러 파운데이션 모델을 제공합니다. 사용 사례에 맞는 모델을 선택하여 활용할 수 있습니다.",
        "explanation_en": "Amazon Bedrock does not provide a single model, but offers multiple foundation models from various providers including Anthropic Claude, Amazon Titan, AI21 Labs, Cohere, and Meta Llama. Users can choose the model that fits their use case."
      },
      {
        "option_id": "b",
        "text": "Amazon Bedrock을 사용하려면 GPU 클러스터를 직접 프로비저닝하고 모델 가중치를 수동으로 관리해야 한다",
        "text_en": "To use Amazon Bedrock, you must directly provision GPU clusters and manually manage model weights",
        "is_correct": False,
        "explanation": "Amazon Bedrock은 완전 관리형 서버리스 서비스로, GPU 클러스터 프로비저닝이나 모델 가중치 직접 관리가 필요 없습니다. 사용자는 API를 통해 파운데이션 모델에 접근하기만 하면 되며, 모든 인프라는 AWS가 관리합니다.",
        "explanation_en": "Amazon Bedrock is a fully managed serverless service that does not require provisioning GPU clusters or manually managing model weights. Users only need to access foundation models through an API, and all infrastructure is managed by AWS."
      },
      {
        "option_id": "c",
        "text": "Amazon Bedrock은 서버리스 방식으로 다양한 파운데이션 모델에 API 접근을 제공하며, 온디맨드(토큰 기반) 또는 프로비저닝 처리량 요금 옵션을 선택할 수 있다",
        "text_en": "Amazon Bedrock provides API access to various foundation models in a serverless manner, with the option to choose between on-demand (token-based) or provisioned throughput pricing",
        "is_correct": True,
        "explanation": "Amazon Bedrock은 인프라 관리 없이 API를 통해 다양한 파운데이션 모델을 활용할 수 있는 완전 관리형 서비스입니다. 기본적으로 사용한 토큰 수 기반의 온디맨드 요금을 적용하며, 고처리량 애플리케이션을 위한 프로비저닝 처리량 옵션도 제공합니다.",
        "explanation_en": "Amazon Bedrock is a fully managed service that allows using various foundation models through an API without infrastructure management. It applies on-demand pricing based on tokens used by default, and also provides a provisioned throughput option for high-throughput applications."
      },
      {
        "option_id": "d",
        "text": "Amazon Bedrock은 파인튜닝을 지원하지 않으며, 기본 제공 모델만 그대로 사용해야 한다",
        "text_en": "Amazon Bedrock does not support fine-tuning, and only base provided models can be used as-is",
        "is_correct": False,
        "explanation": "Amazon Bedrock은 파인튜닝(Fine-tuning)을 지원합니다. 사용자는 자체 데이터로 지원되는 파운데이션 모델을 파인튜닝하여 특정 도메인이나 사용 사례에 최적화된 커스텀 모델을 만들고 운영할 수 있습니다.",
        "explanation_en": "Amazon Bedrock supports fine-tuning. Users can fine-tune supported foundation models with their own data to create and operate custom models optimized for specific domains or use cases."
      }
    ]
  },
  {
    "id": "awsaifc01-q825",
    "exam_id": "aws-aif-c01",
    "text": "한 스마트 물류 기업이 창고 내 재고 수량(수치 데이터)과 물품 이미지 및 작업자 관찰 노트(비정형 데이터)를 결합하여 재고 부족 예측 및 파손 탐지 모델을 개발하고 있습니다. 데이터 과학팀이 두 데이터 유형에 대해 서로 다른 feature engineering 접근 방식을 논의 중입니다. 정형 데이터와 비정형 데이터의 feature engineering 방식 차이를 가장 정확히 설명한 것은 무엇입니까?",
    "text_en": "A smart logistics company is developing inventory shortage prediction and damage detection models by combining warehouse inventory counts (numerical data) with product images and worker observation notes (unstructured data). The data science team is discussing different feature engineering approaches for the two data types. Which statement MOST accurately describes the difference in feature engineering approaches between structured and unstructured data?",
    "explanation": "정형 데이터(수치, 범주형)에 대한 feature engineering은 결측값 처리, 정규화/표준화, 원-핫 인코딩, 파생 변수 생성 등의 통계적·수학적 변환을 주로 사용합니다. 반면 비정형 데이터에 대한 feature engineering은 이미지의 경우 합성곱 신경망(CNN) 또는 사전 훈련된 모델을 통한 특징 추출, 텍스트의 경우 토큰화·임베딩·TF-IDF 등의 NLP 기법을 사용합니다. 두 유형은 적용하는 기법의 종류와 복잡도가 근본적으로 다릅니다.",
    "explanation_en": "Feature engineering for structured data (numerical, categorical) primarily uses statistical and mathematical transformations such as missing value handling, normalization/standardization, one-hot encoding, and derived variable creation. In contrast, feature engineering for unstructured data uses convolutional neural networks (CNNs) or pre-trained model feature extraction for images, and NLP techniques such as tokenization, embedding, and TF-IDF for text. The two types differ fundamentally in the types and complexity of techniques applied.",
    "key_points": "정형 데이터 feature engineering: 정규화, 원-핫 인코딩, 결측값 처리, 파생 변수 / 비정형 데이터 feature engineering: 이미지->CNN/사전훈련 모델 특징 추출, 텍스트->토큰화·임베딩 / 두 유형은 적용 기법이 근본적으로 다름",
    "key_points_en": "Structured data feature engineering: normalization, one-hot encoding, missing value handling, derived variables / Unstructured data feature engineering: images->CNN/pre-trained model feature extraction, text->tokenization/embedding / The two types differ fundamentally in applied techniques",
    "difficulty": "medium",
    "answer": "B",
    "domain_tag": "ML 개발 수명 주기",
    "domain_tag_en": "ML Development Lifecycle",
    "ref_links": "[{\"name\": \"Feature Engineering for Machine Learning\", \"url\": \"https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store-getting-started.html\"}, {\"name\": \"Amazon SageMaker Data Wrangler\", \"url\": \"https://docs.aws.amazon.com/sagemaker/latest/dg/data-wrangler.html\"}]",
    "options": [
      {
        "option_id": "a",
        "text": "정형 데이터와 비정형 데이터 모두 동일한 정규화 및 원-핫 인코딩 기법을 적용한다",
        "text_en": "Both structured and unstructured data apply the same normalization and one-hot encoding techniques",
        "is_correct": False,
        "explanation": "정규화와 원-핫 인코딩은 수치형·범주형 정형 데이터에 적합한 기법입니다. 이미지나 텍스트와 같은 비정형 데이터에는 이러한 기법을 직접 적용할 수 없으며, 각 데이터 유형에 맞는 별도의 feature engineering 접근 방식이 필요합니다.",
        "explanation_en": "Normalization and one-hot encoding are techniques suited for numerical and categorical structured data. These techniques cannot be directly applied to unstructured data such as images or text, and separate feature engineering approaches suited to each data type are required."
      },
      {
        "option_id": "b",
        "text": "정형 데이터는 정규화·인코딩 등 통계적 변환을 사용하고, 비정형 데이터는 CNN 특징 추출이나 텍스트 임베딩 같은 딥러닝 기반 기법을 사용한다",
        "text_en": "Structured data uses statistical transformations such as normalization and encoding, while unstructured data uses deep learning-based techniques such as CNN feature extraction or text embedding",
        "is_correct": True,
        "explanation": "정형 데이터에 대한 feature engineering은 정규화, 표준화, 원-핫 인코딩, 결측값 처리, 파생 변수 생성 등 통계적·수학적 변환을 사용합니다. 비정형 데이터(이미지, 텍스트)에 대해서는 CNN을 통한 특징 맵 추출, 사전 훈련 모델을 통한 임베딩, 토큰화, TF-IDF 등 딥러닝 및 NLP 기반 기법을 사용합니다.",
        "explanation_en": "Feature engineering for structured data uses statistical and mathematical transformations such as normalization, standardization, one-hot encoding, missing value handling, and derived variable creation. For unstructured data (images, text), deep learning and NLP-based techniques such as feature map extraction through CNNs, embedding through pre-trained models, tokenization, and TF-IDF are used."
      },
      {
        "option_id": "c",
        "text": "비정형 데이터는 feature engineering이 필요 없으며, 딥러닝 모델이 원시 데이터를 자동으로 처리한다",
        "text_en": "Unstructured data does not require feature engineering, and deep learning models automatically process raw data",
        "is_correct": False,
        "explanation": "딥러닝 모델은 자동으로 일부 특징을 학습할 수 있지만, 비정형 데이터에도 전처리와 feature engineering이 필요합니다. 이미지 리사이즈, 정규화, 데이터 증강(augmentation), 텍스트 토큰화, 스톱워드 제거 등의 전처리 과정이 모델 성능에 중요한 영향을 미칩니다.",
        "explanation_en": "Although deep learning models can automatically learn some features, preprocessing and feature engineering are still required for unstructured data. Preprocessing steps such as image resizing, normalization, data augmentation, text tokenization, and stop word removal have an important impact on model performance."
      },
      {
        "option_id": "d",
        "text": "정형 데이터는 파인튜닝이 필요하고, 비정형 데이터는 원-핫 인코딩만으로 충분하다",
        "text_en": "Structured data requires fine-tuning, and one-hot encoding alone is sufficient for unstructured data",
        "is_correct": False,
        "explanation": "파인튜닝은 사전 훈련된 모델을 특정 작업에 맞게 추가 학습시키는 전이 학습 기법으로, 정형 데이터의 feature engineering과 관계가 없습니다. 또한 원-핫 인코딩은 범주형 정형 데이터에 사용되는 기법으로 비정형 데이터에는 적합하지 않습니다.",
        "explanation_en": "Fine-tuning is a transfer learning technique that additionally trains a pre-trained model for a specific task and is unrelated to feature engineering for structured data. Additionally, one-hot encoding is a technique used for categorical structured data and is not suitable for unstructured data."
      }
    ]
  }
]

questions_json_str = json.dumps(questions, ensure_ascii=False)
result = subprocess.run(
    ['python3', '.claude/skills/sql-generator/scripts/insert_supabase.py',
     '--questions-json', questions_json_str,
     '--set-id', 'a486fd0d-e621-4596-8f20-10785ddce802',
     '--sort-order-start', '71'],
    capture_output=True, text=True,
    cwd='/Users/sunghwanki/Desktop/Github_Project/cloud-exam-prep'
)
print(result.stdout)
if result.returncode != 0:
    print("STDERR:", result.stderr)
