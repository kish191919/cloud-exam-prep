#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
from typing import List, Dict

# Q6: EC2 - Full OS Control
q6 = {
    "id": "awsclfc02-q625",
    "exam_id": "aws-clf-c02",
    "text": "한 중견 게임 개발사가 고성능 그래픽 처리가 필요한 게임 서버를 운영하려고 합니다. 운영 체제와 설치된 소프트웨어를 완전히 제어할 수 있어야 합니다.\n\n이 회사의 요구사항을 충족하는 AWS 서비스는 무엇입니까?",
    "text_en": "A mid-sized game development company wants to host game servers that require high-performance graphics processing. The company needs complete control over the operating system and installed software.\n\nWhich AWS service BEST meets these requirements?",
    "correct_option_id": "c",
    "explanation": "Amazon EC2는 사용자가 운영 체제와 설치된 소프트웨어를 완전히 제어할 수 있는 가상 머신을 제공합니다. AWS Lambda는 서버리스 서비스로 OS 제어 불가능하며, Amazon AppStream 2.0은 애플리케이션 스트리밍에 특화되어 있고, AWS Elastic Beanstalk는 자동 관리형 플랫폼으로 하위 인프라 제어가 제한됩니다.",
    "explanation_en": "Amazon EC2 provides virtual machines where users have complete control over the operating system and installed software, making it ideal for applications requiring low-level system configuration. AWS Lambda is a serverless service that does not allow OS control; Amazon AppStream 2.0 is optimized for application streaming rather than traditional game servers; AWS Elastic Beanstalk is a managed platform with limited infrastructure control.",
    "key_points": "Amazon EC2의 특징\n• 운영 체제 및 소프트웨어 완전 제어 가능\n• 다양한 인스턴스 타입 제공 (GPU, 고성능 CPU 등)\n• 높은 처리 성능과 네트워크 최적화 가능",
    "key_points_en": "Amazon EC2 Features\n• Complete control over operating system and software installation\n• Wide range of instance types available (GPU, high-performance CPU, etc.)\n• High processing power and network optimization capabilities",
    "ref_links": '[{"name": "Amazon EC2 Documentation", "url": "https://docs.aws.amazon.com/ec2/"}, {"name": "EC2 Instance Types", "url": "https://aws.amazon.com/ec2/instance-types/"}]',
    "options": [
        {
            "option_id": "a",
            "text": "AWS Lambda",
            "text_en": "AWS Lambda",
            "explanation": "AWS Lambda는 서버리스 서비스로 운영 체제 수준의 제어를 허용하지 않습니다. 또한 단시간(15분 이내) 작업에만 적합합니다.",
            "explanation_en": "AWS Lambda is a serverless service that does not allow operating system-level control and is designed only for short-duration tasks (under 15 minutes).",
            "sort_order": 1
        },
        {
            "option_id": "b",
            "text": "Amazon AppStream 2.0",
            "text_en": "Amazon AppStream 2.0",
            "explanation": "Amazon AppStream 2.0은 애플리케이션 스트리밍 서비스로, 기존 애플리케이션을 원격 사용자에게 제공하는 데 최적화되어 있으며 게임 서버 호스팅에는 부적합합니다.",
            "explanation_en": "Amazon AppStream 2.0 is an application streaming service optimized for delivering existing applications to remote users, not for hosting game servers requiring low-level system configuration.",
            "sort_order": 2
        },
        {
            "option_id": "c",
            "text": "Amazon EC2",
            "text_en": "Amazon EC2",
            "explanation": "Amazon EC2는 사용자가 운영 체제와 모든 소프트웨어를 직접 설치·관리할 수 있는 가상 머신을 제공하므로, 게임 서버의 운영체제 완전 제어 요구를 충족합니다.",
            "explanation_en": "Amazon EC2 provides virtual machines where users can directly install and manage the operating system and all software, fully meeting the requirement for complete OS control for game servers.",
            "sort_order": 3
        },
        {
            "option_id": "d",
            "text": "AWS Elastic Beanstalk",
            "text_en": "AWS Elastic Beanstalk",
            "explanation": "AWS Elastic Beanstalk은 자동 관리형 플랫폼으로 인프라 수준의 세부 제어가 제한되어 있어 OS와 소프트웨어 완전 제어 요구를 충족하기 어렵습니다.",
            "explanation_en": "AWS Elastic Beanstalk is a managed platform with limited infrastructure-level control, making it unsuitable for applications requiring complete OS and software configuration.",
            "sort_order": 4
        }
    ],
    "tag": "클라우드 기술 및 서비스",
    "tag_en": "Cloud Technology and Services"
}

# Q7: VPC - Isolated Networks
q7 = {
    "id": "awsclfc02-q626",
    "exam_id": "aws-clf-c02",
    "text": "한 금융 기관이 AWS 클라우드 내에 보안이 강화된 격리된 네트워크를 만들어야 합니다. 리소스로의 인바운드 및 아웃바운드 트래픽을 세밀하게 제어하고 싶습니다.\n\n이 요구사항을 가능하게 하는 AWS 서비스는 무엇입니까?",
    "text_en": "A financial institution needs to create an isolated network within AWS with enhanced security. The organization wants to have fine-grained control over inbound and outbound traffic to its resources.\n\nWhich AWS service enables this capability?",
    "correct_option_id": "b",
    "explanation": "Amazon VPC(Virtual Private Cloud)는 AWS 내에서 격리된 가상 네트워크를 생성하고 보안 그룹 및 네트워크 ACL을 통해 트래픽을 완벽하게 제어할 수 있습니다. AWS CloudFront는 콘텐츠 전송 네트워크이고, AWS WAF는 웹 애플리케이션 방화벽이며, AWS Shield는 DDoS 보호 서비스입니다.",
    "explanation_en": "Amazon VPC (Virtual Private Cloud) enables you to create an isolated virtual network within AWS and control traffic completely through Security Groups and Network ACLs. AWS CloudFront is a content delivery network; AWS WAF is a web application firewall; AWS Shield is a DDoS protection service.",
    "key_points": "Amazon VPC의 주요 기능\n• AWS 내에서 완전히 격리된 가상 네트워크 생성\n• 보안 그룹과 네트워크 ACL로 인·아웃바운드 트래픽 제어\n• 서브넷, 라우팅 테이블, 인터넷 게이트웨이 등을 통한 상세 네트워크 구성",
    "key_points_en": "Key Features of Amazon VPC\n• Create a completely isolated virtual network within AWS\n• Control inbound and outbound traffic through Security Groups and Network ACLs\n• Detailed network configuration via subnets, routing tables, and internet gateways",
    "ref_links": '[{"name": "Amazon VPC Documentation", "url": "https://docs.aws.amazon.com/vpc/"}, {"name": "VPC Security Groups", "url": "https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html"}]',
    "options": [
        {
            "option_id": "a",
            "text": "AWS CloudFront",
            "text_en": "AWS CloudFront",
            "explanation": "AWS CloudFront는 콘텐츠 전송 네트워크(CDN)로 전 세계에 콘텐츠를 빠르게 배포하는 데 사용되며, 네트워크 격리나 트래픽 제어 기능을 제공하지 않습니다.",
            "explanation_en": "AWS CloudFront is a content delivery network (CDN) used to distribute content globally and does not provide network isolation or traffic control capabilities.",
            "sort_order": 1
        },
        {
            "option_id": "b",
            "text": "Amazon VPC",
            "text_en": "Amazon VPC",
            "explanation": "Amazon VPC는 AWS 내에서 격리된 가상 네트워크를 만들 수 있으며, 보안 그룹과 네트워크 ACL을 사용하여 인·아웃바운드 트래픽을 완벽하게 제어할 수 있습니다.",
            "explanation_en": "Amazon VPC allows you to create an isolated virtual network within AWS and provides complete control over inbound and outbound traffic using Security Groups and Network ACLs.",
            "sort_order": 2
        },
        {
            "option_id": "c",
            "text": "AWS WAF",
            "text_en": "AWS WAF",
            "explanation": "AWS WAF(Web Application Firewall)는 웹 애플리케이션 공격으로부터 보호하는 서비스이며, 기본 네트워크 격리나 트래픽 제어 기능은 제공하지 않습니다.",
            "explanation_en": "AWS WAF (Web Application Firewall) is a service that protects web applications from attacks and does not provide basic network isolation or traffic control capabilities.",
            "sort_order": 3
        },
        {
            "option_id": "d",
            "text": "AWS Shield",
            "text_en": "AWS Shield",
            "explanation": "AWS Shield는 DDoS 공격으로부터 AWS 리소스를 보호하는 서비스이며, 일반적인 네트워크 격리나 트래픽 필터링 기능을 제공하지 않습니다.",
            "explanation_en": "AWS Shield is a service that protects AWS resources from DDoS attacks and does not provide general network isolation or traffic filtering capabilities.",
            "sort_order": 4
        }
    ],
    "tag": "클라우드 기술 및 서비스",
    "tag_en": "Cloud Technology and Services"
}

# Q8: DynamoDB - Low Latency Storage
q8 = {
    "id": "awsclfc02-q627",
    "exam_id": "aws-clf-c02",
    "text": "한 전자상거래 플랫폼이 사용자 세션 정보를 저장해야 합니다. 자주 접근하는 데이터는 매우 낮은 지연시간으로 검색되어야 하며, 트래픽 증가에 따라 저장소 용량이 자동으로 확장되어야 합니다.\n\n이 요구사항에 가장 적합한 AWS 서비스는 무엇입니까?",
    "text_en": "An e-commerce platform needs to store user session information. Frequently accessed data must be retrieved with very low latency, and the storage capacity should automatically scale as traffic increases.\n\nWhich AWS service provides this functionality?",
    "correct_option_id": "d",
    "explanation": "Amazon DynamoDB는 NoSQL 데이터베이스로 밀리초 수준의 저지연 응답과 자동 확장(Auto Scaling) 기능을 제공합니다. Amazon RDS는 관계형 데이터베이스로 자동 확장이 제한적이고, Amazon S3는 객체 스토리지로 낮은 지연시간에 부적합하며, Amazon ElastiCache는 캐시 계층이지 주 데이터 저장소는 아닙니다.",
    "explanation_en": "Amazon DynamoDB is a NoSQL database that provides millisecond-level low latency and Auto Scaling capabilities. Amazon RDS is a relational database with limited auto-scaling; Amazon S3 is object storage unsuitable for low-latency access; Amazon ElastiCache is a caching layer, not a primary data store.",
    "key_points": "Amazon DynamoDB의 특징\n• 밀리초 수준의 저지연 응답 속도\n• 트래픽 패턴에 자동으로 적응하는 자동 확장\n• 글로벌 테이블을 통한 다중 리전 복제 지원",
    "key_points_en": "Amazon DynamoDB Features\n• Millisecond-level low latency response times\n• Auto Scaling that automatically adapts to traffic patterns\n• Global Tables support for multi-region replication",
    "ref_links": '[{"name": "Amazon DynamoDB Documentation", "url": "https://docs.aws.amazon.com/dynamodb/"}, {"name": "DynamoDB Auto Scaling", "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/AutoScaling.html"}]',
    "options": [
        {
            "option_id": "a",
            "text": "Amazon RDS",
            "text_en": "Amazon RDS",
            "explanation": "Amazon RDS는 관계형 데이터베이스로 자동 확장 기능이 제한적이며, 저지연 NoSQL 요구사항보다는 복잡한 쿼리와 트랜잭션에 최적화되어 있습니다.",
            "explanation_en": "Amazon RDS is a relational database with limited auto-scaling capabilities and is optimized for complex queries and transactions rather than low-latency NoSQL requirements.",
            "sort_order": 1
        },
        {
            "option_id": "b",
            "text": "Amazon S3",
            "text_en": "Amazon S3",
            "explanation": "Amazon S3는 객체 스토리지 서비스로 매우 낮은 지연시간 요구사항에는 부적합하며, 주로 대용량 파일 저장에 사용됩니다.",
            "explanation_en": "Amazon S3 is an object storage service unsuitable for very low latency requirements and is primarily used for large file storage.",
            "sort_order": 2
        },
        {
            "option_id": "c",
            "text": "Amazon ElastiCache",
            "text_en": "Amazon ElastiCache",
            "explanation": "Amazon ElastiCache는 캐시 계층으로 주 데이터 저장소가 아니며, 일반적으로 RDS 또는 DynamoDB와 함께 사용되어 성능을 향상시키는 보조 서비스입니다.",
            "explanation_en": "Amazon ElastiCache is a caching layer, not a primary data store, and is typically used alongside RDS or DynamoDB as a supporting service to enhance performance.",
            "sort_order": 3
        },
        {
            "option_id": "d",
            "text": "Amazon DynamoDB",
            "text_en": "Amazon DynamoDB",
            "explanation": "Amazon DynamoDB는 NoSQL 데이터베이스로 밀리초 수준의 저지연 응답을 제공하며, 자동 확장 기능으로 트래픽 증가에 따라 용량이 자동으로 확장됩니다.",
            "explanation_en": "Amazon DynamoDB is a NoSQL database providing millisecond-level low latency and automatic scaling capabilities that expand capacity as traffic increases.",
            "sort_order": 4
        }
    ],
    "tag": "클라우드 기술 및 서비스",
    "tag_en": "Cloud Technology and Services"
}

# Q9: ELB - High Availability
q9 = {
    "id": "awsclfc02-q628",
    "exam_id": "aws-clf-c02",
    "text": "한 미디어 회사의 스트리밍 서비스가 급증하는 사용자 수를 감당해야 합니다. 고가용성을 보장하기 위해 여러 개의 컴퓨팅 리소스에 자동으로 트래픽을 분산시켜야 합니다.\n\n이를 실현할 수 있는 AWS 서비스는 무엇입니까?",
    "text_en": "A media company's streaming service must handle a rapidly growing user base. To ensure high availability, the company needs to automatically distribute traffic across multiple compute resources.\n\nWhich AWS service helps achieve this?",
    "correct_option_id": "a",
    "explanation": "Elastic Load Balancing(ELB)은 들어오는 트래픽을 여러 EC2 인스턴스나 다른 리소스에 자동으로 분산시켜 고가용성을 제공합니다. Amazon Auto Scaling은 부하에 따라 리소스 수를 조정하고, Amazon CloudFront는 콘텐츠 배포에, AWS Amplify는 웹 애플리케이션 호스팅에 사용됩니다.",
    "explanation_en": "Elastic Load Balancing (ELB) automatically distributes incoming traffic across multiple EC2 instances or other resources to provide high availability. Amazon Auto Scaling adjusts the number of resources based on load; Amazon CloudFront is for content delivery; AWS Amplify is for web application hosting.",
    "key_points": "Elastic Load Balancing의 기능\n• 여러 리소스 간 자동 트래픽 분산\n• 비정상 리소스 자동 감지 및 제외\n• 다양한 부하 분산 알고리즘 제공 (Application, Network, Classic Load Balancer)",
    "key_points_en": "Elastic Load Balancing Features\n• Automatic traffic distribution across multiple resources\n• Automatic detection and exclusion of unhealthy resources\n• Multiple load balancing algorithms available (Application, Network, Classic Load Balancer)",
    "ref_links": '[{"name": "Elastic Load Balancing Documentation", "url": "https://docs.aws.amazon.com/elasticloadbalancing/"}, {"name": "Load Balancer Types", "url": "https://aws.amazon.com/elasticloadbalancing/features/"}]',
    "options": [
        {
            "option_id": "a",
            "text": "Elastic Load Balancing",
            "text_en": "Elastic Load Balancing",
            "explanation": "Elastic Load Balancing은 들어오는 트래픽을 자동으로 여러 컴퓨팅 리소스에 분산시키고 비정상 리소스를 자동으로 감지하여 고가용성을 보장합니다.",
            "explanation_en": "Elastic Load Balancing automatically distributes incoming traffic across multiple compute resources and automatically detects unhealthy resources to ensure high availability.",
            "sort_order": 1
        },
        {
            "option_id": "b",
            "text": "Amazon Auto Scaling",
            "text_en": "Amazon Auto Scaling",
            "explanation": "Amazon Auto Scaling은 부하에 따라 리소스 수를 동적으로 조정하지만, 기존 리소스 간의 트래픽 분산 기능을 제공하지는 않습니다.",
            "explanation_en": "Amazon Auto Scaling dynamically adjusts the number of resources based on load but does not provide traffic distribution across existing resources.",
            "sort_order": 2
        },
        {
            "option_id": "c",
            "text": "Amazon CloudFront",
            "text_en": "Amazon CloudFront",
            "explanation": "Amazon CloudFront는 콘텐츠 전송 네트워크(CDN)로 전 세계 엣지 로케이션에 콘텐츠를 캐싱하는 데 사용되며, 직접적인 트래픽 분산 기능은 없습니다.",
            "explanation_en": "Amazon CloudFront is a content delivery network (CDN) used to cache content at edge locations worldwide and does not provide direct traffic distribution.",
            "sort_order": 3
        },
        {
            "option_id": "d",
            "text": "AWS Amplify",
            "text_en": "AWS Amplify",
            "explanation": "AWS Amplify는 웹 애플리케이션 및 모바일 앱 호스팅 서비스로 트래픽 분산 기능을 직접 제공하지 않습니다.",
            "explanation_en": "AWS Amplify is a hosting service for web and mobile applications and does not directly provide traffic distribution capabilities.",
            "sort_order": 4
        }
    ],
    "tag": "클라우드 기술 및 서비스",
    "tag_en": "Cloud Technology and Services"
}

# Q10: CloudWatch - Monitoring
q10 = {
    "id": "awsclfc02-q629",
    "exam_id": "aws-clf-c02",
    "text": "한 소프트웨어 개발 팀이 AWS에 배포한 애플리케이션의 성능을 지속적으로 모니터링해야 합니다. CPU 사용률, 네트워크 트래픽, 디스크 작동 등 다양한 지표를 추적하고 싶습니다.\n\nAWS 리소스를 모니터링하는 데 필수적인 서비스는 무엇입니까?",
    "text_en": "A software development team deployed an application on AWS and needs to continuously monitor its performance. The team wants to track various metrics such as CPU usage, network traffic, and disk operations.\n\nWhich AWS service provides this monitoring capability?",
    "correct_option_id": "b",
    "explanation": "Amazon CloudWatch는 AWS 리소스의 다양한 메트릭을 실시간으로 모니터링하고 로그를 수집하는 서비스입니다. AWS CloudTrail은 API 호출 감시에, AWS Config는 리소스 구성 추적에, AWS Systems Manager는 리소스 관리에 사용됩니다.",
    "explanation_en": "Amazon CloudWatch is the service for monitoring various metrics of AWS resources in real-time and collecting logs. AWS CloudTrail tracks API calls; AWS Config tracks resource configurations; AWS Systems Manager manages resources.",
    "key_points": "Amazon CloudWatch의 기능\n• CPU, 메모리, 디스크, 네트워크 등 리소스 메트릭 실시간 모니터링\n• 커스텀 메트릭 생성 및 대시보드 구성 가능\n• 임계값 기반 알람 설정으로 자동 알림",
    "key_points_en": "Amazon CloudWatch Features\n• Real-time monitoring of resource metrics (CPU, memory, disk, network, etc.)\n• Custom metrics creation and dashboard configuration\n• Threshold-based alarms for automatic notifications",
    "ref_links": '[{"name": "Amazon CloudWatch Documentation", "url": "https://docs.aws.amazon.com/cloudwatch/"}, {"name": "CloudWatch Metrics", "url": "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html"}]',
    "options": [
        {
            "option_id": "a",
            "text": "AWS CloudTrail",
            "text_en": "AWS CloudTrail",
            "explanation": "AWS CloudTrail은 AWS API 호출 및 계정 활동을 로깅하여 보안 감시와 규정 준수에 사용되며, 리소스 성능 메트릭 모니터링에는 적합하지 않습니다.",
            "explanation_en": "AWS CloudTrail logs AWS API calls and account activities for security monitoring and compliance purposes, not for resource performance metric monitoring.",
            "sort_order": 1
        },
        {
            "option_id": "b",
            "text": "Amazon CloudWatch",
            "text_en": "Amazon CloudWatch",
            "explanation": "Amazon CloudWatch는 CPU 사용률, 네트워크 트래픽, 디스크 작동 등 다양한 AWS 리소스 메트릭을 실시간으로 모니터링하고 로그를 수집하는 핵심 모니터링 서비스입니다.",
            "explanation_en": "Amazon CloudWatch is the core monitoring service that tracks various AWS resource metrics including CPU usage, network traffic, and disk operations in real-time and collects logs.",
            "sort_order": 2
        },
        {
            "option_id": "c",
            "text": "AWS Config",
            "text_en": "AWS Config",
            "explanation": "AWS Config는 AWS 리소스의 구성 변경을 추적하고 규정 준수를 확인하는 데 사용되며, 성능 메트릭 모니터링 기능을 제공하지 않습니다.",
            "explanation_en": "AWS Config tracks AWS resource configuration changes and checks compliance but does not provide performance metric monitoring capabilities.",
            "sort_order": 3
        },
        {
            "option_id": "d",
            "text": "AWS Systems Manager",
            "text_en": "AWS Systems Manager",
            "explanation": "AWS Systems Manager는 AWS 리소스 관리, 패치 적용, 자동화를 담당하는 서비스이며 성능 메트릭 모니터링이 주 기능이 아닙니다.",
            "explanation_en": "AWS Systems Manager is used for AWS resource management, patching, and automation, not primarily for performance metric monitoring.",
            "sort_order": 4
        }
    ],
    "tag": "클라우드 기술 및 서비스",
    "tag_en": "Cloud Technology and Services"
}

# Combine all questions
questions = [q6, q7, q8, q9, q10]

# Write to temp file for insertion
output_file = "/Users/sunghwanki/Desktop/Github_Project/cloud-exam-prep/output/pipeline_redesign_temp_batch1.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"✅ Redesigned questions saved to: {output_file}")
print(f"Total: {len(questions)} questions")
for q in questions:
    print(f"  - {q['id']}: {q['correct_option_id'].upper()}")
