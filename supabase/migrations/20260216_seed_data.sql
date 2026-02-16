-- Insert exam configurations
INSERT INTO exams (id, title, code, certification, description, time_limit_minutes, passing_score, version) VALUES
('aws-aif-c01', 'AWS Certified AI Practitioner', 'AIF-C01', 'AWS', 'Validate your foundational knowledge of AI/ML concepts and AWS AI services including Amazon Bedrock, SageMaker, and responsible AI practices.', 90, 70, '2026.02'),
('aws-saa-c03', 'AWS Solutions Architect Associate', 'SAA-C03', 'AWS', 'Design and deploy scalable, highly available, and fault-tolerant systems on AWS.', 130, 72, '2026.02'),
('aws-dea-c01', 'AWS Data Engineer Associate', 'DEA-C01', 'AWS', 'Implement data pipelines and design data stores using AWS data services.', 130, 72, '2026.02');

-- Insert AWS AIF-C01 questions
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty) VALUES
('aif-q1', 'aws-aif-c01', 'Which AWS service provides access to foundation models from leading AI companies through a single API?', 'b', 'Amazon Bedrock is a fully managed service that provides access to foundation models (FMs) from leading AI companies like Anthropic, Meta, and Amazon through a single API. SageMaker is for building/training custom ML models.', 1),
('aif-q2', 'aws-aif-c01', 'A company wants to analyze customer reviews to determine sentiment. Which AWS service is MOST appropriate?', 'c', 'Amazon Comprehend is a natural language processing (NLP) service that uses machine learning to find insights and relationships in text, including sentiment analysis. Textract extracts text from documents, Polly converts text to speech, and Translate handles language translation.', 1),
('aif-q3', 'aws-aif-c01', 'Which of the following is NOT a principle of responsible AI?', 'c', 'Maximum data collection is NOT a principle of responsible AI. Responsible AI principles include fairness, transparency, privacy, security, and accountability. Data minimization (collecting only necessary data) is preferred over maximum collection.', 1),
('aif-q4', 'aws-aif-c01', 'Which AWS service provides an end-to-end machine learning development environment for building, training, and deploying models?', 'c', 'Amazon SageMaker provides a fully managed environment for the entire ML lifecycle — from data preparation and model building to training, tuning, and deployment at scale.', 2),
('aif-q5', 'aws-aif-c01', 'A company needs to detect objects and faces in images and videos. Which AWS service should they use?', 'a', 'Amazon Rekognition makes it easy to add image and video analysis to applications. It can identify objects, people, text, scenes, and activities, as well as detect inappropriate content and provide facial analysis.', 1),
('aif-q6', 'aws-aif-c01', 'What is a foundation model in the context of generative AI?', 'b', 'A foundation model is a large AI model pre-trained on a broad dataset that can be adapted (fine-tuned) to a wide range of downstream tasks. Examples include GPT, Claude, and Llama models.', 2),
('aif-q7', 'aws-aif-c01', 'Which AWS service enables developers to build conversational interfaces (chatbots) using voice and text?', 'c', 'Amazon Lex provides advanced deep learning functionalities of automatic speech recognition (ASR) and natural language understanding (NLU) to build conversational interfaces — the same technology that powers Amazon Alexa.', 1),
('aif-q8', 'aws-aif-c01', 'Which factor has the GREATEST impact on the performance of a machine learning model?', 'b', 'The quality and quantity of training data is the most critical factor affecting ML model performance. Poor data quality leads to poor model predictions regardless of the algorithm or infrastructure used.', 1),
('aif-q9', 'aws-aif-c01', 'Which AWS service can automatically extract text, handwriting, and data from scanned documents?', 'b', 'Amazon Textract automatically extracts text, handwriting, and data from scanned documents. It goes beyond simple OCR to identify, understand, and extract data from forms and tables.', 1),
('aif-q10', 'aws-aif-c01', 'An ML model consistently produces less accurate predictions for a specific demographic group. What is this issue called, and how should it be addressed?', 'b', 'This describes model bias, where predictions are systematically less accurate for certain groups. Amazon SageMaker Clarify helps detect bias in data and models, and provides explanations for model predictions.', 3);

-- Insert question options for aif-q1
INSERT INTO question_options (question_id, option_id, text, sort_order) VALUES
('aif-q1', 'a', 'Amazon SageMaker', 1),
('aif-q1', 'b', 'Amazon Bedrock', 2),
('aif-q1', 'c', 'Amazon Comprehend', 3),
('aif-q1', 'd', 'Amazon Rekognition', 4);

-- Insert question options for aif-q2
INSERT INTO question_options (question_id, option_id, text, sort_order) VALUES
('aif-q2', 'a', 'Amazon Textract', 1),
('aif-q2', 'b', 'Amazon Polly', 2),
('aif-q2', 'c', 'Amazon Comprehend', 3),
('aif-q2', 'd', 'Amazon Translate', 4);

-- Insert question options for aif-q3
INSERT INTO question_options (question_id, option_id, text, sort_order) VALUES
('aif-q3', 'a', 'Fairness and bias mitigation', 1),
('aif-q3', 'b', 'Transparency and explainability', 2),
('aif-q3', 'c', 'Maximum data collection', 3),
('aif-q3', 'd', 'Privacy and security', 4);

-- Insert question options for aif-q4
INSERT INTO question_options (question_id, option_id, text, sort_order) VALUES
('aif-q4', 'a', 'Amazon Bedrock', 1),
('aif-q4', 'b', 'AWS Lambda', 2),
('aif-q4', 'c', 'Amazon SageMaker', 3),
('aif-q4', 'd', 'Amazon Lex', 4);

-- Insert question options for aif-q5
INSERT INTO question_options (question_id, option_id, text, sort_order) VALUES
('aif-q5', 'a', 'Amazon Rekognition', 1),
('aif-q5', 'b', 'Amazon Comprehend', 2),
('aif-q5', 'c', 'Amazon Kendra', 3),
('aif-q5', 'd', 'Amazon Personalize', 4);

-- Insert question options for aif-q6
INSERT INTO question_options (question_id, option_id, text, sort_order) VALUES
('aif-q6', 'a', 'A model specifically trained for one narrow task', 1),
('aif-q6', 'b', 'A large model pre-trained on broad data that can be adapted to many tasks', 2),
('aif-q6', 'c', 'The first version of any machine learning model', 3),
('aif-q6', 'd', 'A model that only works with structured data', 4);

-- Insert question options for aif-q7
INSERT INTO question_options (question_id, option_id, text, sort_order) VALUES
('aif-q7', 'a', 'Amazon Polly', 1),
('aif-q7', 'b', 'Amazon Transcribe', 2),
('aif-q7', 'c', 'Amazon Lex', 3),
('aif-q7', 'd', 'Amazon Connect', 4);

-- Insert question options for aif-q8
INSERT INTO question_options (question_id, option_id, text, sort_order) VALUES
('aif-q8', 'a', 'The programming language used', 1),
('aif-q8', 'b', 'The quality and quantity of training data', 2),
('aif-q8', 'c', 'The color scheme of the dashboard', 3),
('aif-q8', 'd', 'The number of AWS Regions used', 4);

-- Insert question options for aif-q9
INSERT INTO question_options (question_id, option_id, text, sort_order) VALUES
('aif-q9', 'a', 'Amazon Comprehend', 1),
('aif-q9', 'b', 'Amazon Textract', 2),
('aif-q9', 'c', 'Amazon Translate', 3),
('aif-q9', 'd', 'Amazon Kendra', 4);

-- Insert question options for aif-q10
INSERT INTO question_options (question_id, option_id, text, sort_order) VALUES
('aif-q10', 'a', 'Overfitting — add more layers to the model', 1),
('aif-q10', 'b', 'Model bias — evaluate training data for representational imbalances and use bias detection tools like Amazon SageMaker Clarify', 2),
('aif-q10', 'c', 'Underfitting — increase the model complexity', 3),
('aif-q10', 'd', 'Latency issue — deploy in more AWS Regions', 4);

-- Insert question tags
INSERT INTO question_tags (question_id, tag) VALUES
('aif-q1', 'Foundation Models'),
('aif-q1', 'Bedrock'),
('aif-q2', 'NLP'),
('aif-q2', 'Comprehend'),
('aif-q3', 'Responsible AI'),
('aif-q3', 'Ethics'),
('aif-q4', 'SageMaker'),
('aif-q4', 'ML Lifecycle'),
('aif-q5', 'Computer Vision'),
('aif-q5', 'Rekognition'),
('aif-q6', 'Foundation Models'),
('aif-q6', 'Generative AI'),
('aif-q7', 'Conversational AI'),
('aif-q7', 'Lex'),
('aif-q8', 'ML Fundamentals'),
('aif-q8', 'Data Quality'),
('aif-q9', 'Document Processing'),
('aif-q9', 'Textract'),
('aif-q10', 'Responsible AI'),
('aif-q10', 'Bias Detection'),
('aif-q10', 'SageMaker');
