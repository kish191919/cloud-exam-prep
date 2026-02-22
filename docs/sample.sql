-- ============================================================
-- 참조용 샘플 SQL — generate_sql.py 출력 형식 기준
--✅  보기 스타일 기준: 짧고 명확한 서비스명 또는 간결한 명사구
-- ✅  text_en, explanation_en, key_points_en: 영문 번역 (없으면 NULL)
-- ============================================================

-- ── 좋은 예시 1: 단일 서비스 선택 (보기 = 서비스명만) ─────────────────
INSERT INTO questions (id, exam_id, text, text_en, correct_option_id, explanation, explanation_en, key_points, key_points_en, ref_links)
VALUES (
  'awsaifc01-q166',
  'aws-aif-c01',
  '한 글로벌 물류 기업이 창고에서 수령하는 대량의 종이 송장과 거래 명세서를 디지털화하려 합니다. 이 문서들에는 인쇄된 텍스트뿐 아니라 손으로 기재한 수량·날짜·서명이 포함되어 있으며, 기업은 이 정보를 자동으로 추출하여 ERP 시스템에 입력하고자 합니다.

이 요구사항에 가장 적합한 ML 기반 AWS 서비스는 무엇인가?',
  'A global logistics company wants to digitize large volumes of paper invoices and transaction statements received at their warehouses. These documents contain not only printed text but also handwritten quantities, dates, and signatures. The company wants to automatically extract this information and input it into their ERP system.

Which ML-based AWS service best meets this requirement?',
  'b',
  'Amazon Textract는 스캔된 문서, PDF, 이미지에서 인쇄 텍스트·표·양식·서명 등을 자동으로 추출하는 완전 관리형 ML 서비스입니다.

• Amazon Transcribe: 음성(오디오/동영상)을 텍스트로 변환하는 STT 서비스로, 문서 이미지에는 적합하지 않습니다.
• Amazon Textract: 문서 이미지와 PDF에서 텍스트·표·양식 데이터를 추출하는 서비스로, 손글씨 인식도 지원합니다.
• Amazon Comprehend: 텍스트에서 언어·감정·개체·토픽을 분석하는 NLP 서비스로, 문서 이미지에서 직접 추출하지는 않습니다.
• Amazon Rekognition: 이미지·동영상에서 객체·얼굴·장면을 감지하는 서비스로, 문서 텍스트 추출에는 적합하지 않습니다.',
  'Amazon Textract is a fully managed ML service that automatically extracts printed text, tables, forms, and signatures from scanned documents, PDFs, and images.

• Amazon Transcribe: An STT service that converts audio/video to text; not suitable for document images.
• Amazon Textract: Extracts text, tables, and form data from document images and PDFs, including handwriting recognition.
• Amazon Comprehend: An NLP service that analyzes language, sentiment, entities, and topics from text; does not extract directly from document images.
• Amazon Rekognition: Detects objects, faces, and scenes in images/videos; not suitable for document text extraction.',
  'Amazon Textract 핵심 기능
• 스캔된 문서·PDF·이미지에서 텍스트, 표, 양식 데이터를 자동 추출
• 손글씨(Handwriting) 인식 지원
• 구조화된 데이터(key-value 쌍, 테이블)도 함께 추출 가능
• OCR을 넘어 문서 구조를 이해하는 ML 기반 서비스',
  'Amazon Textract Key Features
• Automatically extracts text, tables, and form data from scanned documents, PDFs, and images
• Supports handwriting recognition
• Extracts structured data (key-value pairs, tables) as well
• ML-based service that understands document structure beyond simple OCR',
  '[{"name": "Amazon Textract 개발자 가이드", "url": "https://docs.aws.amazon.com/textract/latest/dg/what-is.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, text_en, explanation, explanation_en, sort_order) VALUES
  ('awsaifc01-q166', 'a', 'Amazon Transcribe', 'Amazon Transcribe', '음성을 텍스트로 변환하는 STT 서비스입니다. 문서 이미지나 PDF에서 텍스트를 추출하는 용도로는 사용할 수 없습니다.', 'An STT service that converts speech to text. It cannot be used to extract text from document images or PDFs.', 1),
  ('awsaifc01-q166', 'b', 'Amazon Textract', 'Amazon Textract', '인쇄 텍스트·표·양식뿐 아니라 손글씨까지 문서에서 자동 추출하는 ML 서비스로, 이 요구사항에 가장 적합합니다.', 'An ML service that automatically extracts printed text, tables, forms, and even handwriting from documents — the best fit for this requirement.', 2),
  ('awsaifc01-q166', 'c', 'Amazon Comprehend', 'Amazon Comprehend', '텍스트 분석(감정·개체·토픽) NLP 서비스입니다. 이미 추출된 텍스트를 분석하는 데 사용하며, 문서 이미지에서 직접 추출하지는 않습니다.', 'An NLP service for analyzing text (sentiment, entities, topics). Used to analyze already-extracted text; does not extract directly from document images.', 3),
  ('awsaifc01-q166', 'd', 'Amazon Rekognition', 'Amazon Rekognition', '이미지·동영상에서 객체·얼굴·장면을 인식하는 서비스입니다. 문서 내 텍스트 데이터 추출에는 Textract가 적합합니다.', 'A service that recognizes objects, faces, and scenes in images/videos. Textract is the right choice for extracting text data from documents.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q166', '파운데이션 모델의 적용');

INSERT INTO exam_set_questions (set_id, question_id, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q166', 66);


-- ── 좋은 예시 2: 서비스 조합 선택 (보기 = "서비스A + 서비스B" 형식) ─────
INSERT INTO questions (id, exam_id, text, text_en, correct_option_id, explanation, explanation_en, key_points, key_points_en, ref_links)
VALUES (
  'awsaifc01-q167',
  'aws-aif-c01',
  '한 글로벌 보험사가 콜센터 서비스 품질 개선 시스템을 구축하려 합니다. 고객과의 전화 통화 음성을 자동으로 텍스트로 변환하고, 변환된 텍스트에서 고객의 감정(긍정/부정/중립)을 분석하여 즉각적인 처리가 필요한 불만 고객을 실시간으로 식별합니다.

이 요구사항에 가장 적합한 AWS 서비스 조합은?',
  'A global insurance company wants to build a system to improve call center service quality. It automatically converts customer phone call audio to text, then analyzes the sentiment (positive/negative/neutral) of the converted text to identify dissatisfied customers requiring immediate attention in real time.

Which combination of AWS services best meets this requirement?',
  'b',
  'Amazon Transcribe는 음성을 텍스트로 변환하고, Amazon Comprehend는 텍스트의 감정(Sentiment)을 분석합니다. 두 서비스를 조합하면 음성 → 텍스트 → 감정 분석 파이프라인을 구축할 수 있습니다.

• Amazon Polly + Amazon Rekognition: Polly는 텍스트를 음성으로 합성하는 TTS 서비스이고, Rekognition은 이미지 인식 서비스입니다. 음성을 텍스트로 변환하거나 감정을 분석하는 기능이 없습니다.
• Amazon Transcribe + Amazon Comprehend: Transcribe(STT)로 음성을 텍스트로 변환하고, Comprehend(NLP)로 감정을 분석합니다.
• Amazon Lex + Amazon Translate: Lex는 챗봇 대화 서비스이고, Translate는 언어 번역 서비스입니다. 감정 분석 기능이 없습니다.
• Amazon Textract + Amazon Kendra: Textract는 문서 텍스트 추출, Kendra는 지능형 검색 서비스입니다. 음성 처리나 감정 분석에는 사용하지 않습니다.',
  'Amazon Transcribe converts speech to text, and Amazon Comprehend analyzes the sentiment of that text. Combining these two services enables a speech → text → sentiment analysis pipeline.

• Amazon Polly + Amazon Rekognition: Polly is a TTS service (text to speech) and Rekognition is an image recognition service. Neither can convert speech to text or perform sentiment analysis.
• Amazon Transcribe + Amazon Comprehend: Transcribe (STT) converts speech to text, and Comprehend (NLP) analyzes sentiment.
• Amazon Lex + Amazon Translate: Lex is a conversational chatbot service and Translate is a language translation service. Neither provides sentiment analysis.
• Amazon Textract + Amazon Kendra: Textract extracts text from documents and Kendra is an intelligent search service. Not used for speech processing or sentiment analysis.',
  'Amazon Transcribe + Comprehend 파이프라인
• Amazon Transcribe: 음성(오디오) → 텍스트 변환 (STT, Speech-to-Text)
• Amazon Comprehend: 텍스트 감정 분석 (긍정/부정/중립/혼합)
• 조합 활용: 콜센터 분석, 실시간 감정 모니터링, VOC 자동화',
  'Amazon Transcribe + Comprehend Pipeline
• Amazon Transcribe: Speech (audio) → Text conversion (STT, Speech-to-Text)
• Amazon Comprehend: Text sentiment analysis (Positive/Negative/Neutral/Mixed)
• Use cases: Call center analytics, real-time sentiment monitoring, VOC automation',
  '[{"name": "Amazon Transcribe 개발자 가이드", "url": "https://docs.aws.amazon.com/transcribe/latest/dg/what-is.html"}, {"name": "Amazon Comprehend 개발자 가이드", "url": "https://docs.aws.amazon.com/comprehend/latest/dg/what-is.html"}]'
);

INSERT INTO question_options (question_id, option_id, text, text_en, explanation, explanation_en, sort_order) VALUES
  ('awsaifc01-q167', 'a', 'Amazon Polly + Amazon Rekognition', 'Amazon Polly + Amazon Rekognition', 'Polly는 TTS(텍스트→음성) 서비스이고 Rekognition은 이미지 인식 서비스로, 이 요구사항의 어떤 단계도 처리하지 못합니다.', 'Polly is a TTS (text-to-speech) service and Rekognition is an image recognition service; neither can handle any stage of this requirement.', 1),
  ('awsaifc01-q167', 'b', 'Amazon Transcribe + Amazon Comprehend', 'Amazon Transcribe + Amazon Comprehend', 'Transcribe로 음성을 텍스트로 변환하고, Comprehend로 감정을 분석합니다. 이 요구사항에 정확히 맞는 조합입니다.', 'Transcribe converts speech to text and Comprehend analyzes sentiment. This is the exact combination that matches the requirement.', 2),
  ('awsaifc01-q167', 'c', 'Amazon Lex + Amazon Translate', 'Amazon Lex + Amazon Translate', 'Lex는 대화형 챗봇 서비스이고 Translate는 언어 번역 서비스입니다. 감정 분석 기능이 없습니다.', 'Lex is a conversational chatbot service and Translate is a language translation service. Neither provides sentiment analysis.', 3),
  ('awsaifc01-q167', 'd', 'Amazon Textract + Amazon Kendra', 'Amazon Textract + Amazon Kendra', 'Textract는 문서 이미지 텍스트 추출, Kendra는 지능형 문서 검색 서비스입니다. 음성 처리와 감정 분석에는 적합하지 않습니다.', 'Textract extracts text from document images and Kendra is an intelligent document search service. Not suitable for speech processing or sentiment analysis.', 4);

INSERT INTO question_tags (question_id, tag) VALUES ('awsaifc01-q167', '파운데이션 모델의 적용');

INSERT INTO exam_set_questions (set_id, question_id, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'awsaifc01-q167', 67);
