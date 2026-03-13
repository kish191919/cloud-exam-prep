#!/usr/bin/env python3
"""Insert batch q326-q330 to Supabase"""
import json, subprocess

questions = [
    {
        "id": "awsaifc01-q326",
        "exam_id": "aws-aif-c01",
        "text": "한 음악 스트리밍 서비스가 사용자 취향과 곡 정보를 분석하여 추천 시스템을 구축하려 한다. 시스템은 텍스트와 메타데이터를 컴퓨터가 비교할 수 있도록 수치 기반 벡터 형태로 변환하려 한다.\n\n이러한 표현 방식을 무엇이라고 하는가?",
        "text_en": "A music streaming service is building a recommendation system by analyzing user preferences and song metadata. The system needs to convert text and metadata into numerical vector representations so that computers can compare them.\n\nWhat is this representation method called?",
        "text_pt": "Um serviço de streaming de música está construindo um sistema de recomendação analisando preferências do usuário e metadados das músicas. O sistema precisa converter texto e metadados em representações vetoriais numéricas para que os computadores possam compará-los.\n\nComo se chama esse método de representação?",
        "text_es": "Un servicio de streaming de música está construyendo un sistema de recomendación analizando las preferencias de los usuarios y los metadatos de las canciones. El sistema necesita convertir texto y metadados en representaciones vectoriales numéricas para que las computadoras puedan compararlos.\n\n¿Cómo se llama este método de representación?",
        "correct_option_id": "c",
        "options": [
            {
                "option_id": "a",
                "text": "원-핫 인코딩",
                "text_en": "One-hot encoding",
                "text_pt": "Codificação one-hot",
                "text_es": "Codificación one-hot",
                "explanation": "원-핫 인코딩은 범주형 변수를 이진 벡터(0과 1)로 표현하는 방식으로, 유사도 비교에 적합하지 않으며 의미적 관계를 포착하지 못합니다.",
                "explanation_en": "One-hot encoding represents categorical variables as binary vectors (0s and 1s). It is not suitable for similarity comparison and cannot capture semantic relationships.",
                "explanation_pt": "A codificação one-hot representa variáveis categóricas como vetores binários (0s e 1s). Não é adequada para comparação de similaridade e não captura relações semânticas.",
                "explanation_es": "La codificación one-hot representa variables categóricas como vectores binarios (0s y 1s). No es adecuada para la comparación de similitud y no captura relaciones semánticas.",
                "sort_order": 1
            },
            {
                "option_id": "b",
                "text": "TF-IDF",
                "text_en": "TF-IDF",
                "text_pt": "TF-IDF",
                "text_es": "TF-IDF",
                "explanation": "TF-IDF는 문서 내 단어 빈도와 역문서 빈도를 기반으로 단어의 중요도를 수치화하는 방법입니다. 키워드 추출에 유용하지만, 단어의 의미적 유사성을 표현하는 임베딩과는 다릅니다.",
                "explanation_en": "TF-IDF quantifies the importance of words based on term frequency and inverse document frequency. It is useful for keyword extraction but differs from embeddings that represent semantic similarity.",
                "explanation_pt": "TF-IDF quantifica a importância das palavras com base na frequência do termo e na frequência inversa do documento. É útil para extração de palavras-chave, mas difere dos embeddings que representam similaridade semântica.",
                "explanation_es": "TF-IDF cuantifica la importancia de las palabras según la frecuencia del término y la frecuencia inversa del documento. Es útil para la extracción de palabras clave, pero difiere de los embeddings que representan similitud semántica.",
                "sort_order": 2
            },
            {
                "option_id": "c",
                "text": "임베딩",
                "text_en": "Embeddings",
                "text_pt": "Embeddings",
                "text_es": "Embeddings",
                "explanation": "임베딩(Embedding)은 텍스트, 이미지, 메타데이터 등 다양한 데이터를 의미적 관계를 보존하면서 수치 벡터로 변환하는 방법입니다. 유사한 의미를 가진 항목은 벡터 공간에서 가까운 위치에 표현되므로 추천 시스템에 매우 적합합니다.",
                "explanation_en": "Embeddings convert various data types such as text, images, and metadata into numerical vectors while preserving semantic relationships. Items with similar meanings are represented closer together in vector space, making them ideal for recommendation systems.",
                "explanation_pt": "Embeddings convertem vários tipos de dados, como texto, imagens e metadados, em vetores numéricos preservando as relações semânticas. Itens com significados semelhantes são representados mais próximos no espaço vetorial, tornando-os ideais para sistemas de recomendação.",
                "explanation_es": "Los embeddings convierten varios tipos de datos, como texto, imágenes y metadatos, en vectores numéricos preservando las relaciones semánticas. Los elementos con significados similares se representan más cercanos en el espacio vectorial, lo que los hace ideales para sistemas de recomendación.",
                "sort_order": 3
            },
            {
                "option_id": "d",
                "text": "정규화",
                "text_en": "Normalization",
                "text_pt": "Normalização",
                "text_es": "Normalización",
                "explanation": "정규화는 데이터의 범위를 조정하는 전처리 기법으로, 텍스트나 메타데이터를 의미 있는 벡터 표현으로 변환하는 임베딩과는 다른 개념입니다.",
                "explanation_en": "Normalization is a preprocessing technique that adjusts the range of data. It differs from embeddings, which transform text or metadata into meaningful vector representations.",
                "explanation_pt": "Normalização é uma técnica de pré-processamento que ajusta o intervalo dos dados. Difere dos embeddings, que transformam texto ou metadados em representações vetoriais significativas.",
                "explanation_es": "La normalización es una técnica de preprocesamiento que ajusta el rango de los datos. Se diferencia de los embeddings, que transforman texto o metadatos en representaciones vectoriales significativas.",
                "sort_order": 4
            }
        ],
        "tag": "AI·ML 개념과 알고리즘",
        "tag_en": "AI and ML Concepts and Algorithms",
        "tag_pt": "Conceitos e Algoritmos de IA e ML",
        "tag_es": "Conceptos y Algoritmos de IA y ML",
        "explanation": "임베딩(Embedding)은 텍스트, 이미지, 오디오, 메타데이터 등 비정형 데이터를 연속적인 수치 벡터 공간으로 변환하는 표현 학습 기법입니다. 핵심은 의미적으로 유사한 항목이 벡터 공간에서도 가까이 위치한다는 점으로, 코사인 유사도 등으로 유사성을 계산할 수 있습니다.\n\n원-핫 인코딩은 각 단어를 고차원 희소 벡터로 표현하여 의미 관계를 포착하지 못하고, TF-IDF는 문서 내 단어 빈도 기반의 키워드 중요도 측정 방법으로 추천 시스템의 의미 유사성 계산에 적합하지 않습니다. 정규화는 데이터 스케일 조정 기법으로 벡터 표현과는 별개의 개념입니다.\n\n음악 추천 시스템에서는 곡의 장르, 템포, 가사 등의 특성을 임베딩 벡터로 변환하고, 사용자 청취 이력도 임베딩으로 표현하여 코사인 유사도로 유사한 곡을 추천합니다. AWS에서는 Amazon Titan Embeddings, Amazon Bedrock의 다양한 임베딩 모델을 활용할 수 있습니다.",
        "explanation_en": "Embedding is a representation learning technique that transforms unstructured data such as text, images, audio, and metadata into continuous numerical vector spaces. The key characteristic is that semantically similar items are positioned closer together in the vector space, enabling similarity calculations using methods like cosine similarity.\n\nOne-hot encoding represents each word as a high-dimensional sparse vector that fails to capture semantic relationships. TF-IDF measures keyword importance based on term frequency within documents, which is not suitable for semantic similarity calculations in recommendation systems. Normalization is a data scaling technique separate from vector representation.\n\nIn music recommendation systems, characteristics such as genre, tempo, and lyrics are converted to embedding vectors, and user listening history is also represented as embeddings to recommend similar songs using cosine similarity. On AWS, Amazon Titan Embeddings and various embedding models in Amazon Bedrock can be utilized.",
        "explanation_pt": "Embedding é uma técnica de aprendizado de representação que transforma dados não estruturados como texto, imagens, áudio e metadados em espaços vetoriais numéricos contínuos. A característica principal é que itens semanticamente semelhantes ficam posicionados mais próximos no espaço vetorial, permitindo cálculos de similaridade usando métodos como similaridade de cosseno.\n\nA codificação one-hot representa cada palavra como um vetor esparso de alta dimensão que falha em capturar relações semânticas. TF-IDF mede a importância de palavras-chave com base na frequência dos termos nos documentos, o que não é adequado para cálculos de similaridade semântica em sistemas de recomendação. Normalização é uma técnica de escalonamento de dados separada da representação vetorial.\n\nEm sistemas de recomendação musical, características como gênero, tempo e letras são convertidas em vetores de embedding, e o histórico de escuta do usuário também é representado como embeddings para recomendar músicas similares usando similaridade de cosseno. Na AWS, Amazon Titan Embeddings e vários modelos de embedding no Amazon Bedrock podem ser utilizados.",
        "explanation_es": "Embedding es una técnica de aprendizaje de representación que transforma datos no estructurados como texto, imágenes, audio y metadatos en espacios vectoriales numéricos continuos. La característica clave es que los elementos semánticamente similares se posicionan más cerca en el espacio vectorial, lo que permite cálculos de similitud usando métodos como la similitud del coseno.\n\nLa codificación one-hot representa cada palabra como un vector disperso de alta dimensión que no captura relaciones semánticas. TF-IDF mide la importancia de las palabras clave basándose en la frecuencia de términos en los documentos, lo que no es adecuado para cálculos de similitud semántica en sistemas de recomendación. La normalización es una técnica de escalado de datos separada de la representación vectorial.\n\nEn los sistemas de recomendación musical, características como género, tempo y letras se convierten en vectores de embedding, y el historial de escucha del usuario también se representa como embeddings para recomendar canciones similares usando similitud de coseno. En AWS, se pueden utilizar Amazon Titan Embeddings y varios modelos de embedding en Amazon Bedrock.",
        "key_points": "임베딩의 핵심 특성\n• 임베딩은 데이터를 연속적인 수치 벡터 공간으로 변환하는 표현 학습 기법\n• 의미적으로 유사한 항목은 벡터 공간에서 가까운 위치에 매핑됨\n• 코사인 유사도, 유클리드 거리 등으로 항목 간 유사성 계산 가능\n• 추천 시스템, 검색, NLP 등 다양한 AI/ML 응용에 활용\n• AWS에서는 Amazon Titan Embeddings 등을 통해 임베딩 생성 지원",
        "key_points_en": "Key Characteristics of Embeddings\n• Embeddings are a representation learning technique that converts data into continuous numerical vector spaces\n• Semantically similar items are mapped to nearby positions in the vector space\n• Similarity between items can be calculated using cosine similarity or Euclidean distance\n• Used in various AI/ML applications including recommendation systems, search, and NLP\n• AWS supports embedding generation through Amazon Titan Embeddings and other services",
        "key_points_pt": "Características Principais dos Embeddings\n• Embeddings são uma técnica de aprendizado de representação que converte dados em espaços vetoriais numéricos contínuos\n• Itens semanticamente semelhantes são mapeados para posições próximas no espaço vetorial\n• A similaridade entre itens pode ser calculada usando similaridade de cosseno ou distância euclidiana\n• Usados em diversas aplicações de IA/ML, incluindo sistemas de recomendação, busca e NLP\n• A AWS suporta a geração de embeddings através do Amazon Titan Embeddings e outros serviços",
        "key_points_es": "Características Clave de los Embeddings\n• Los embeddings son una técnica de aprendizaje de representación que convierte datos en espacios vectoriales numéricos continuos\n• Los elementos semánticamente similares se mapean a posiciones cercanas en el espacio vectorial\n• La similitud entre elementos puede calcularse usando similitud del coseno o distancia euclidiana\n• Utilizados en diversas aplicaciones de IA/ML, incluidos sistemas de recomendación, búsqueda y NLP\n• AWS admite la generación de embeddings a través de Amazon Titan Embeddings y otros servicios",
        "ref_links": [
            {"name": "Amazon Titan Embeddings 소개", "name_en": "Amazon Titan Embeddings Overview", "name_pt": "Visão Geral do Amazon Titan Embeddings", "name_es": "Descripción General de Amazon Titan Embeddings", "url": "https://aws.amazon.com/bedrock/titan/"},
            {"name": "AWS의 임베딩 모델 개요", "name_en": "Embedding Models on AWS Overview", "name_pt": "Visão Geral de Modelos de Embedding na AWS", "name_es": "Descripción General de Modelos de Embedding en AWS", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/embeddings.html"}
        ]
    },
    {
        "id": "awsaifc01-q327",
        "exam_id": "aws-aif-c01",
        "text": "한 출판사가 긴 정책 문서를 분석하는 LLM 기반 시스템을 운영하고 있다. 일부 긴 문서가 제대로 처리되지 않는 문제가 발생하고 있다.\n\n이러한 문제가 발생하는 가장 일반적인 원인은 무엇인가?",
        "text_en": "A publishing company is operating an LLM-based system that analyzes lengthy policy documents. They are experiencing issues where some long documents are not being processed properly.\n\nWhat is the most common cause of this problem?",
        "text_pt": "Uma editora está operando um sistema baseado em LLM que analisa longos documentos de políticas. Eles estão enfrentando problemas em que alguns documentos longos não estão sendo processados corretamente.\n\nQual é a causa mais comum desse problema?",
        "text_es": "Una editorial está operando un sistema basado en LLM que analiza documentos de políticas extensos. Están experimentando problemas donde algunos documentos largos no se procesan correctamente.\n\n¿Cuál es la causa más común de este problema?",
        "correct_option_id": "b",
        "options": [
            {
                "option_id": "a",
                "text": "모델 파라미터 수 부족",
                "text_en": "Insufficient number of model parameters",
                "text_pt": "Número insuficiente de parâmetros do modelo",
                "text_es": "Número insuficiente de parámetros del modelo",
                "explanation": "모델 파라미터 수는 모델의 학습 능력에 영향을 미치지만, 긴 문서 처리 실패의 직접적 원인은 아닙니다. 파라미터가 많은 대형 모델도 컨텍스트 윈도우 한계를 초과하면 같은 문제가 발생합니다.",
                "explanation_en": "The number of model parameters affects the learning capacity of the model, but is not the direct cause of failures when processing long documents. Even large models with many parameters experience the same issue when they exceed their context window limit.",
                "explanation_pt": "O número de parâmetros do modelo afeta a capacidade de aprendizado, mas não é a causa direta de falhas no processamento de documentos longos. Mesmo modelos grandes com muitos parâmetros enfrentam o mesmo problema quando excedem o limite da janela de contexto.",
                "explanation_es": "El número de parámetros del modelo afecta la capacidad de aprendizaje, pero no es la causa directa de los fallos al procesar documentos largos. Incluso los modelos grandes con muchos parámetros experimentan el mismo problema cuando superan el límite de su ventana de contexto.",
                "sort_order": 1
            },
            {
                "option_id": "b",
                "text": "컨텍스트 윈도우 초과",
                "text_en": "Context window exceeded",
                "text_pt": "Janela de contexto excedida",
                "text_es": "Ventana de contexto excedida",
                "explanation": "컨텍스트 윈도우(Context Window)는 LLM이 한 번에 처리할 수 있는 최대 토큰 수입니다. 문서가 이 한계를 초과하면 모델이 전체 내용을 처리하지 못하거나, 앞부분 내용을 잊어버리는 현상이 발생합니다. 긴 문서 처리 실패의 가장 일반적인 원인입니다.",
                "explanation_en": "The context window is the maximum number of tokens an LLM can process at once. When a document exceeds this limit, the model cannot process the entire content or loses information from earlier parts. This is the most common cause of failures when processing long documents.",
                "explanation_pt": "A janela de contexto é o número máximo de tokens que um LLM pode processar de uma vez. Quando um documento excede esse limite, o modelo não consegue processar todo o conteúdo ou perde informações das partes anteriores. Esta é a causa mais comum de falhas no processamento de documentos longos.",
                "explanation_es": "La ventana de contexto es el número máximo de tokens que un LLM puede procesar a la vez. Cuando un documento supera este límite, el modelo no puede procesar todo el contenido o pierde información de las partes anteriores. Esta es la causa más común de fallos al procesar documentos largos.",
                "sort_order": 2
            },
            {
                "option_id": "c",
                "text": "GPU 메모리 부족",
                "text_en": "Insufficient GPU memory",
                "text_pt": "Memória GPU insuficiente",
                "text_es": "Memoria GPU insuficiente",
                "explanation": "GPU 메모리 부족은 모델 학습이나 추론 시 발생할 수 있지만, 관리형 LLM 서비스를 사용할 때는 인프라가 추상화되어 있어 사용자가 직접 GPU 메모리를 관리하지 않습니다. 긴 문서 처리 실패의 가장 일반적인 원인은 아닙니다.",
                "explanation_en": "Insufficient GPU memory can occur during model training or inference, but when using managed LLM services, the infrastructure is abstracted and users do not directly manage GPU memory. This is not the most common cause of failures when processing long documents.",
                "explanation_pt": "A memória GPU insuficiente pode ocorrer durante o treinamento ou inferência do modelo, mas ao usar serviços LLM gerenciados, a infraestrutura é abstraída e os usuários não gerenciam diretamente a memória GPU. Esta não é a causa mais comum de falhas no processamento de documentos longos.",
                "explanation_es": "La memoria GPU insuficiente puede ocurrir durante el entrenamiento o la inferencia del modelo, pero al usar servicios LLM administrados, la infraestructura está abstraída y los usuarios no gestionan directamente la memoria GPU. Esta no es la causa más común de fallos al procesar documentos largos.",
                "sort_order": 3
            },
            {
                "option_id": "d",
                "text": "응답 온도 설정 오류",
                "text_en": "Incorrect response temperature setting",
                "text_pt": "Configuração incorreta de temperatura de resposta",
                "text_es": "Configuración incorrecta de temperatura de respuesta",
                "explanation": "온도(Temperature)는 LLM 응답의 창의성과 무작위성을 조절하는 매개변수로, 문서 처리 가능 여부와는 관련이 없습니다. 온도 설정이 잘못되어도 긴 문서를 처리하지 못하는 문제는 발생하지 않습니다.",
                "explanation_en": "Temperature is a parameter that controls the creativity and randomness of LLM responses and is not related to whether documents can be processed. Incorrect temperature settings do not cause the inability to process long documents.",
                "explanation_pt": "Temperatura é um parâmetro que controla a criatividade e aleatoriedade das respostas do LLM e não está relacionado à capacidade de processar documentos. Configurações incorretas de temperatura não causam a incapacidade de processar documentos longos.",
                "explanation_es": "La temperatura es un parámetro que controla la creatividad y la aleatoriedad de las respuestas del LLM y no está relacionada con si los documentos pueden procesarse. Los ajustes incorrectos de temperatura no causan la incapacidad de procesar documentos largos.",
                "sort_order": 4
            }
        ],
        "tag": "생성형 AI 역량과 한계",
        "tag_en": "Generative AI Capabilities and Limitations",
        "tag_pt": "Capacidades e Limitações da IA Generativa",
        "tag_es": "Capacidades y Limitaciones de la IA Generativa",
        "explanation": "컨텍스트 윈도우(Context Window)는 LLM이 단일 요청에서 처리할 수 있는 최대 토큰 수를 의미합니다. 모델마다 고정된 컨텍스트 윈도우 크기가 있으며, 입력 문서가 이 한계를 초과하면 전체 문서를 처리하지 못하거나 앞부분 정보가 손실되는 컨텍스트 소멸 현상이 발생합니다.\n\n모델 파라미터 수나 GPU 메모리 부족은 인프라 수준의 문제이며, 관리형 서비스에서는 사용자가 직접 관리하지 않습니다. 온도 설정은 응답의 창의성·다양성을 조절하는 매개변수로 문서 처리 가능 여부와 무관합니다.\n\n긴 문서를 처리하기 위한 해결 방법으로는 문서를 청크(chunk)로 분할하여 처리하거나, RAG(Retrieval-Augmented Generation) 패턴을 사용하거나, 더 큰 컨텍스트 윈도우를 지원하는 모델을 선택하는 방법이 있습니다. Amazon Bedrock에서는 컨텍스트 윈도우가 큰 다양한 모델을 제공합니다.",
        "explanation_en": "The context window refers to the maximum number of tokens an LLM can process in a single request. Each model has a fixed context window size, and when an input document exceeds this limit, the entire document cannot be processed or context extinction occurs where information from earlier parts is lost.\n\nInsufficient model parameters or GPU memory are infrastructure-level issues that users do not directly manage in managed services. Temperature settings are parameters that control the creativity and diversity of responses and are unrelated to whether documents can be processed.\n\nSolutions for processing long documents include splitting documents into chunks for processing, using the RAG (Retrieval-Augmented Generation) pattern, or selecting models that support larger context windows. Amazon Bedrock provides various models with large context windows.",
        "explanation_pt": "A janela de contexto refere-se ao número máximo de tokens que um LLM pode processar em uma única solicitação. Cada modelo tem um tamanho fixo de janela de contexto, e quando um documento de entrada excede esse limite, o documento inteiro não pode ser processado ou ocorre a extinção de contexto, onde as informações das partes anteriores são perdidas.\n\nParâmetros insuficientes do modelo ou memória GPU são problemas de nível de infraestrutura que os usuários não gerenciam diretamente em serviços gerenciados. As configurações de temperatura são parâmetros que controlam a criatividade e diversidade das respostas e não estão relacionadas à capacidade de processar documentos.\n\nAs soluções para processar documentos longos incluem dividir documentos em partes (chunks) para processamento, usar o padrão RAG (Retrieval-Augmented Generation) ou selecionar modelos que suportem janelas de contexto maiores. O Amazon Bedrock oferece vários modelos com grandes janelas de contexto.",
        "explanation_es": "La ventana de contexto se refiere al número máximo de tokens que un LLM puede procesar en una sola solicitud. Cada modelo tiene un tamaño fijo de ventana de contexto, y cuando un documento de entrada supera este límite, el documento completo no puede procesarse o se produce la extinción de contexto, donde se pierde información de las partes anteriores.\n\nLos parámetros insuficientes del modelo o la memoria GPU son problemas a nivel de infraestructura que los usuarios no gestionan directamente en los servicios administrados. Las configuraciones de temperatura son parámetros que controlan la creatividad y diversidad de las respuestas y no están relacionadas con si los documentos pueden procesarse.\n\nLas soluciones para procesar documentos largos incluyen dividir documentos en fragmentos (chunks) para su procesamiento, usar el patrón RAG (Retrieval-Augmented Generation) o seleccionar modelos que admitan ventanas de contexto más grandes. Amazon Bedrock ofrece varios modelos con grandes ventanas de contexto.",
        "key_points": "컨텍스트 윈도우의 이해\n• 컨텍스트 윈도우는 LLM이 단일 요청에서 처리 가능한 최대 토큰 수\n• 문서가 컨텍스트 윈도우를 초과하면 처리 실패 또는 앞부분 정보 소실 발생\n• 해결책: 문서 청크 분할, RAG 패턴 적용, 큰 컨텍스트 모델 선택\n• 온도(Temperature)는 응답 다양성 조절 파라미터로 문서 처리와 무관\n• Amazon Bedrock은 다양한 컨텍스트 윈도우 크기의 모델 제공",
        "key_points_en": "Understanding Context Windows\n• The context window is the maximum number of tokens an LLM can process in a single request\n• When documents exceed the context window, processing fails or information from earlier parts is lost\n• Solutions: document chunking, applying RAG pattern, selecting models with larger context windows\n• Temperature is a response diversity parameter unrelated to document processing\n• Amazon Bedrock provides models with various context window sizes",
        "key_points_pt": "Entendendo Janelas de Contexto\n• A janela de contexto é o número máximo de tokens que um LLM pode processar em uma única solicitação\n• Quando documentos excedem a janela de contexto, o processamento falha ou informações das partes anteriores são perdidas\n• Soluções: chunking de documentos, aplicação do padrão RAG, seleção de modelos com janelas de contexto maiores\n• Temperatura é um parâmetro de diversidade de resposta não relacionado ao processamento de documentos\n• O Amazon Bedrock oferece modelos com vários tamanhos de janela de contexto",
        "key_points_es": "Comprendiendo las Ventanas de Contexto\n• La ventana de contexto es el número máximo de tokens que un LLM puede procesar en una sola solicitud\n• Cuando los documentos superan la ventana de contexto, el procesamiento falla o se pierde información de las partes anteriores\n• Soluciones: fragmentación de documentos, aplicación del patrón RAG, selección de modelos con ventanas de contexto más grandes\n• La temperatura es un parámetro de diversidad de respuesta no relacionado con el procesamiento de documentos\n• Amazon Bedrock ofrece modelos con varios tamaños de ventana de contexto",
        "ref_links": [
            {"name": "Amazon Bedrock 컨텍스트 윈도우 가이드", "name_en": "Amazon Bedrock Context Window Guide", "name_pt": "Guia de Janela de Contexto do Amazon Bedrock", "name_es": "Guía de Ventana de Contexto de Amazon Bedrock", "url": "https://docs.aws.amazon.com/bedrock/latest/userguide/inference-parameters.html"},
            {"name": "LLM 컨텍스트 윈도우 이해", "name_en": "Understanding LLM Context Windows", "name_pt": "Entendendo Janelas de Contexto de LLM", "name_es": "Comprendiendo las Ventanas de Contexto de LLM", "url": "https://aws.amazon.com/blogs/machine-learning/"}
        ]
    },
    {
        "id": "awsaifc01-q328",
        "exam_id": "aws-aif-c01",
        "text": "한 학술 기관이 내부 연구 자료를 기반으로 질문에 답변하는 AI 도우미를 구축하려 한다. 이 기관은 모델을 재학습하지 않고 최신 연구 내용이 응답에 반영되길 원한다.\n\n모델 재학습 없이 최신 내부 지식을 응답에 반영하는 가장 적합한 접근 방식은 무엇인가?",
        "text_en": "An academic institution wants to build an AI assistant that answers questions based on internal research materials. The institution wants the latest research content to be reflected in responses without retraining the model.\n\nWhat is the most appropriate approach to reflect the latest internal knowledge in responses without retraining the model?",
        "text_pt": "Uma instituição acadêmica quer construir um assistente de IA que responda perguntas com base em materiais de pesquisa internos. A instituição deseja que o conteúdo de pesquisa mais recente seja refletido nas respostas sem retreinar o modelo.\n\nQual é a abordagem mais adequada para refletir o conhecimento interno mais recente nas respostas sem retreinar o modelo?",
        "text_es": "Una institución académica quiere construir un asistente de IA que responda preguntas basadas en materiales de investigación internos. La institución quiere que el contenido de investigación más reciente se refleje en las respuestas sin reentrenar el modelo.\n\n¿Cuál es el enfoque más adecuado para reflejar el conocimiento interno más reciente en las respuestas sin reentrenar el modelo?",
        "correct_option_id": "b",
        "options": [
            {
                "option_id": "a",
                "text": "모델 전체 재훈련",
                "text_en": "Full model retraining",
                "text_pt": "Retreinamento completo do modelo",
                "text_es": "Reentrenamiento completo del modelo",
                "explanation": "모델 전체 재훈련은 방대한 컴퓨팅 자원과 시간이 필요하며, 최신 지식을 지속적으로 반영하기 위한 방법으로 비효율적입니다. 또한 문제에서 명시적으로 재학습 없이 반영하길 원한다고 했으므로 적합하지 않습니다.",
                "explanation_en": "Full model retraining requires extensive computing resources and time, making it inefficient for continuously reflecting the latest knowledge. Additionally, the problem explicitly states a desire to reflect knowledge without retraining, making this option inappropriate.",
                "explanation_pt": "O retreinamento completo do modelo requer recursos computacionais extensos e tempo, tornando-o ineficiente para refletir continuamente o conhecimento mais recente. Além disso, o problema afirma explicitamente o desejo de refletir o conhecimento sem retreinamento, tornando esta opção inadequada.",
                "explanation_es": "El reentrenamiento completo del modelo requiere extensos recursos informáticos y tiempo, lo que lo hace ineficiente para reflejar continuamente el conocimiento más reciente. Además, el problema establece explícitamente el deseo de reflejar el conocimiento sin reentrenamiento, lo que hace que esta opción sea inapropiada.",
                "sort_order": 1
            },
            {
                "option_id": "b",
                "text": "RAG, 외부 문서 검색 연동",
                "text_en": "RAG with external document retrieval integration",
                "text_pt": "RAG com integração de recuperação de documentos externos",
                "text_es": "RAG con integración de recuperación de documentos externos",
                "explanation": "RAG(Retrieval-Augmented Generation)는 LLM의 응답 생성 시 외부 문서 저장소에서 관련 문서를 검색하여 컨텍스트로 제공하는 방법입니다. 모델 재훈련 없이도 최신 문서를 지식 베이스에 추가하면 바로 응답에 반영되므로, 내부 연구 자료 기반 AI 도우미에 가장 적합합니다.",
                "explanation_en": "RAG (Retrieval-Augmented Generation) is a method that retrieves relevant documents from an external document store and provides them as context when an LLM generates responses. New documents added to the knowledge base are immediately reflected in responses without model retraining, making it the most suitable approach for an AI assistant based on internal research materials.",
                "explanation_pt": "RAG (Retrieval-Augmented Generation) é um método que recupera documentos relevantes de um armazenamento de documentos externo e os fornece como contexto quando um LLM gera respostas. Novos documentos adicionados à base de conhecimento são imediatamente refletidos nas respostas sem retreinamento do modelo, tornando-o o mais adequado para um assistente de IA baseado em materiais de pesquisa internos.",
                "explanation_es": "RAG (Retrieval-Augmented Generation) es un método que recupera documentos relevantes de un almacén de documentos externo y los proporciona como contexto cuando un LLM genera respuestas. Los nuevos documentos agregados a la base de conocimientos se reflejan inmediatamente en las respuestas sin reentrenamiento del modelo, lo que lo hace el más adecuado para un asistente de IA basado en materiales de investigación internos.",
                "sort_order": 2
            },
            {
                "option_id": "c",
                "text": "Temperature 값 증가",
                "text_en": "Increasing Temperature value",
                "text_pt": "Aumentando o valor de Temperature",
                "text_es": "Aumentando el valor de Temperature",
                "explanation": "Temperature 값 증가는 LLM 응답의 다양성과 창의성을 높이는 매개변수 조정으로, 새로운 지식을 모델에 반영하는 것과는 전혀 관계가 없습니다.",
                "explanation_en": "Increasing the Temperature value is a parameter adjustment that increases the diversity and creativity of LLM responses, and has nothing to do with reflecting new knowledge in the model.",
                "explanation_pt": "Aumentar o valor de Temperature é um ajuste de parâmetro que aumenta a diversidade e criatividade das respostas do LLM, e não tem nada a ver com refletir novos conhecimentos no modelo.",
                "explanation_es": "Aumentar el valor de Temperature es un ajuste de parámetros que aumenta la diversidad y creatividad de las respuestas del LLM, y no tiene nada que ver con reflejar nuevos conocimientos en el modelo.",
                "sort_order": 3
            },
            {
                "option_id": "d",
                "text": "배치 추론 적용",
                "text_en": "Applying batch inference",
                "text_pt": "Aplicando inferência em lote",
                "text_es": "Aplicando inferencia por lotes",
                "explanation": "배치 추론(Batch Inference)은 여러 입력을 한꺼번에 처리하는 방법으로 처리 효율성을 높이는 기법입니다. 새로운 지식을 모델 응답에 반영하는 방법과는 무관합니다.",
                "explanation_en": "Batch inference is a method that processes multiple inputs at once to improve processing efficiency. It is unrelated to methods for reflecting new knowledge in model responses.",
                "explanation_pt": "Inferência em lote é um método que processa múltiplas entradas de uma vez para melhorar a eficiência do processamento. Não está relacionado com métodos para refletir novos conhecimentos nas respostas do modelo.",
                "explanation_es": "La inferencia por lotes es un método que procesa múltiples entradas a la vez para mejorar la eficiencia del procesamiento. No está relacionado con métodos para reflejar nuevos conocimientos en las respuestas del modelo.",
                "sort_order": 4
            }
        ],
        "tag": "FM 애플리케이션 설계와 RAG",
        "tag_en": "FM Application Design and RAG",
        "tag_pt": "Design de Aplicações FM e RAG",
        "tag_es": "Diseño de Aplicaciones FM y RAG",
        "explanation": "RAG(Retrieval-Augmented Generation)는 LLM의 기본 지식을 확장하기 위해 외부 문서 저장소에서 관련 문서를 실시간으로 검색하여 프롬프트 컨텍스트로 제공하는 아키텍처 패턴입니다. 사용자 질의 시 벡터 데이터베이스에서 유사 문서를 검색하고, 검색된 내용을 LLM 프롬프트에 포함시켜 최신·내부 지식 기반 응답을 생성합니다.\n\n모델 전체 재훈련은 방대한 GPU 자원과 시간이 소요되고, 새 연구 자료가 추가될 때마다 반복해야 하는 비용·시간 비효율적인 방법입니다. Temperature 조정과 배치 추론은 지식 갱신과 무관한 추론 설정 및 처리 방식입니다.\n\nAWS에서는 Amazon Bedrock Knowledge Bases를 통해 S3에 저장된 내부 문서를 자동으로 청크·임베딩하고 Amazon OpenSearch Serverless 또는 Aurora PostgreSQL에 인덱싱하여 RAG 파이프라인을 구축할 수 있습니다. 새 문서를 S3에 업로드하면 자동으로 Knowledge Base가 업데이트되어 모델 재훈련 없이 최신 지식이 반영됩니다.",
        "explanation_en": "RAG (Retrieval-Augmented Generation) is an architectural pattern that extends the base knowledge of an LLM by retrieving relevant documents from an external document store in real time and providing them as prompt context. When a user queries, similar documents are retrieved from a vector database and the retrieved content is included in the LLM prompt to generate responses based on up-to-date internal knowledge.\n\nFull model retraining requires extensive GPU resources and time, and must be repeated every time new research materials are added, making it cost and time-inefficient. Temperature adjustment and batch inference are inference settings and processing methods unrelated to knowledge updates.\n\nOn AWS, Amazon Bedrock Knowledge Bases can automatically chunk and embed internal documents stored in S3 and index them in Amazon OpenSearch Serverless or Aurora PostgreSQL to build a RAG pipeline. When new documents are uploaded to S3, the Knowledge Base is automatically updated, reflecting the latest knowledge without model retraining.",
        "explanation_pt": "RAG (Retrieval-Augmented Generation) é um padrão arquitetural que estende o conhecimento base de um LLM recuperando documentos relevantes de um armazenamento de documentos externo em tempo real e fornecendo-os como contexto de prompt. Quando um usuário consulta, documentos similares são recuperados de um banco de dados vetorial e o conteúdo recuperado é incluído no prompt do LLM para gerar respostas baseadas em conhecimento interno atualizado.\n\nO retreinamento completo do modelo requer extensos recursos GPU e tempo, e deve ser repetido toda vez que novos materiais de pesquisa são adicionados, tornando-o ineficiente em custo e tempo. Ajuste de temperatura e inferência em lote são configurações de inferência e métodos de processamento não relacionados a atualizações de conhecimento.\n\nNa AWS, o Amazon Bedrock Knowledge Bases pode automaticamente fragmentar e incorporar documentos internos armazenados no S3 e indexá-los no Amazon OpenSearch Serverless ou Aurora PostgreSQL para construir um pipeline RAG. Quando novos documentos são enviados para o S3, a Knowledge Base é automaticamente atualizada, refletindo o conhecimento mais recente sem retreinamento do modelo.",
        "explanation_es": "RAG (Retrieval-Augmented Generation) es un patrón arquitectónico que extiende el conocimiento base de un LLM recuperando documentos relevantes de un almacén de documentos externo en tiempo real y proporcionándolos como contexto de prompt. Cuando un usuario consulta, se recuperan documentos similares de una base de datos vectorial y el contenido recuperado se incluye en el prompt del LLM para generar respuestas basadas en conocimiento interno actualizado.\n\nEl reentrenamiento completo del modelo requiere extensos recursos de GPU y tiempo, y debe repetirse cada vez que se agregan nuevos materiales de investigación, lo que lo hace ineficiente en costo y tiempo. El ajuste de temperatura y la inferencia por lotes son configuraciones de inferencia y métodos de procesamiento no relacionados con las actualizaciones de conocimiento.\n\nEn AWS, Amazon Bedrock Knowledge Bases puede fragmentar e incrustar automáticamente documentos internos almacenados en S3 e indexarlos en Amazon OpenSearch Serverless o Aurora PostgreSQL para construir un pipeline RAG. Cuando se cargan nuevos documentos en S3, la Knowledge Base se actualiza automáticamente, reflejando el conocimiento más reciente sin reentrenamiento del modelo.",
        "key_points": "RAG 아키텍처의 핵심\n• RAG는 모델 재훈련 없이 외부 문서 검색으로 최신 지식을 응답에 반영하는 패턴\n• 벡터 DB에 문서를 임베딩 저장 → 질의 시 유사 문서 검색 → LLM 프롬프트 주입\n• 새 문서 추가만으로 지식 베이스 실시간 업데이트 가능\n• Amazon Bedrock Knowledge Bases로 RAG 파이프라인 완전 관리형 구축 가능\n• 내부 도메인 지식, 최신 연구 자료 반영에 가장 효율적인 방법",
        "key_points_en": "Core of RAG Architecture\n• RAG is a pattern that reflects the latest knowledge in responses through external document retrieval without model retraining\n• Documents are stored as embeddings in a vector DB, similar documents retrieved at query time, injected into LLM prompt\n• Knowledge base can be updated in real time by simply adding new documents\n• Amazon Bedrock Knowledge Bases enables fully managed RAG pipeline construction\n• Most efficient method for reflecting internal domain knowledge and latest research materials",
        "key_points_pt": "Núcleo da Arquitetura RAG\n• RAG é um padrão que reflete o conhecimento mais recente nas respostas através da recuperação de documentos externos sem retreinamento do modelo\n• Documentos são armazenados como embeddings em um banco de dados vetorial, documentos similares recuperados no momento da consulta, injetados no prompt do LLM\n• A base de conhecimento pode ser atualizada em tempo real simplesmente adicionando novos documentos\n• O Amazon Bedrock Knowledge Bases permite a construção de pipeline RAG totalmente gerenciado\n• Método mais eficiente para refletir conhecimento de domínio interno e materiais de pesquisa mais recentes",
        "key_points_es": "Núcleo de la Arquitectura RAG\n• RAG es un patrón que refleja el conocimiento más reciente en las respuestas a través de la recuperación de documentos externos sin reentrenamiento del modelo\n• Los documentos se almacenan como embeddings en una base de datos vectorial, documentos similares recuperados en el momento de la consulta, inyectados en el prompt del LLM\n• La base de conocimientos puede actualizarse en tiempo real simplemente agregando nuevos documentos\n• Amazon Bedrock Knowledge Bases permite la construcción de un pipeline RAG completamente administrado\n• Método más eficiente para reflejar conocimiento de dominio interno y materiales de investigación más recientes",
        "ref_links": [
            {"name": "Amazon Bedrock Knowledge Bases", "name_en": "Amazon Bedrock Knowledge Bases", "name_pt": "Amazon Bedrock Knowledge Bases", "name_es": "Amazon Bedrock Knowledge Bases", "url": "https://aws.amazon.com/bedrock/knowledge-bases/"},
            {"name": "RAG 아키텍처 AWS 블로그", "name_en": "RAG Architecture AWS Blog", "name_pt": "Blog AWS sobre Arquitetura RAG", "name_es": "Blog de AWS sobre Arquitectura RAG", "url": "https://aws.amazon.com/blogs/machine-learning/question-answering-using-retrieval-augmented-generation-with-foundation-models-in-amazon-sagemaker-jumpstart/"}
        ]
    },
    {
        "id": "awsaifc01-q329",
        "exam_id": "aws-aif-c01",
        "text": "한 소셜 미디어 분석 팀이 게시글 감정 분석 모델을 개발하고 있다. 팀은 입력 문장을 여러 범주로 분류하는 작업을 수행하려 한다.\n\n이 작업을 위한 가장 적절한 ML 학습 방식은 무엇인가?",
        "text_en": "A social media analytics team is developing a sentiment analysis model for posts. The team wants to perform a task that classifies input sentences into multiple categories.\n\nWhat is the most appropriate ML learning approach for this task?",
        "text_pt": "Uma equipe de análise de mídia social está desenvolvendo um modelo de análise de sentimentos para postagens. A equipe deseja realizar uma tarefa que classifica frases de entrada em várias categorias.\n\nQual é a abordagem de aprendizado de ML mais adequada para esta tarefa?",
        "text_es": "Un equipo de análisis de redes sociales está desarrollando un modelo de análisis de sentimientos para publicaciones. El equipo quiere realizar una tarea que clasifique oraciones de entrada en múltiples categorías.\n\n¿Cuál es el enfoque de aprendizaje de ML más adecuado para esta tarea?",
        "correct_option_id": "b",
        "options": [
            {
                "option_id": "a",
                "text": "비지도 학습 클러스터링",
                "text_en": "Unsupervised learning clustering",
                "text_pt": "Clustering de aprendizado não supervisionado",
                "text_es": "Clustering de aprendizaje no supervisado",
                "explanation": "비지도 학습 클러스터링은 레이블 없이 데이터의 숨겨진 구조나 패턴을 발견하는 방법입니다. 감정을 미리 정의된 범주(긍정/부정/중립 등)로 분류하려면 레이블된 훈련 데이터가 필요한 지도 학습이 적합합니다.",
                "explanation_en": "Unsupervised learning clustering discovers hidden structures or patterns in data without labels. To classify sentiment into predefined categories (positive/negative/neutral, etc.), supervised learning with labeled training data is more appropriate.",
                "explanation_pt": "O clustering de aprendizado não supervisionado descobre estruturas ou padrões ocultos nos dados sem rótulos. Para classificar sentimentos em categorias predefinidas (positivo/negativo/neutro, etc.), o aprendizado supervisionado com dados de treinamento rotulados é mais apropriado.",
                "explanation_es": "El clustering de aprendizaje no supervisado descubre estructuras o patrones ocultos en los datos sin etiquetas. Para clasificar sentimientos en categorías predefinidas (positivo/negativo/neutro, etc.), el aprendizaje supervisado con datos de entrenamiento etiquetados es más apropiado.",
                "sort_order": 1
            },
            {
                "option_id": "b",
                "text": "지도 학습 분류",
                "text_en": "Supervised learning classification",
                "text_pt": "Classificação de aprendizado supervisionado",
                "text_es": "Clasificación de aprendizaje supervisado",
                "explanation": "지도 학습 분류(Supervised Learning Classification)는 레이블된 훈련 데이터를 사용하여 입력 데이터를 미리 정의된 범주로 분류하는 방법입니다. 감정 분석처럼 긍정, 부정, 중립 등의 범주가 사전에 정의된 작업에 가장 적합합니다.",
                "explanation_en": "Supervised learning classification uses labeled training data to classify input data into predefined categories. It is most suitable for tasks like sentiment analysis where categories such as positive, negative, and neutral are defined in advance.",
                "explanation_pt": "A classificação de aprendizado supervisionado usa dados de treinamento rotulados para classificar dados de entrada em categorias predefinidas. É mais adequada para tarefas como análise de sentimentos, onde categorias como positivo, negativo e neutro são definidas antecipadamente.",
                "explanation_es": "La clasificación de aprendizaje supervisado utiliza datos de entrenamiento etiquetados para clasificar datos de entrada en categorías predefinidas. Es más adecuada para tareas como el análisis de sentimientos, donde las categorías como positivo, negativo y neutro están definidas de antemano.",
                "sort_order": 2
            },
            {
                "option_id": "c",
                "text": "강화 학습 정책 최적화",
                "text_en": "Reinforcement learning policy optimization",
                "text_pt": "Otimização de política de aprendizado por reforço",
                "text_es": "Optimización de políticas de aprendizaje por refuerzo",
                "explanation": "강화 학습 정책 최적화는 에이전트가 환경과 상호작용하며 보상을 최대화하는 행동 정책을 학습하는 방법입니다. 텍스트 분류 작업에는 적합하지 않습니다.",
                "explanation_en": "Reinforcement learning policy optimization is a method where an agent learns a behavior policy that maximizes rewards by interacting with an environment. It is not appropriate for text classification tasks.",
                "explanation_pt": "A otimização de política de aprendizado por reforço é um método onde um agente aprende uma política de comportamento que maximiza recompensas interagindo com um ambiente. Não é adequado para tarefas de classificação de texto.",
                "explanation_es": "La optimización de políticas de aprendizaje por refuerzo es un método donde un agente aprende una política de comportamiento que maximiza las recompensas interactuando con un entorno. No es apropiado para tareas de clasificación de texto.",
                "sort_order": 3
            },
            {
                "option_id": "d",
                "text": "자기지도 학습 사전 학습",
                "text_en": "Self-supervised learning pre-training",
                "text_pt": "Pré-treinamento de aprendizado auto-supervisionado",
                "text_es": "Preentrenamiento de aprendizaje auto-supervisado",
                "explanation": "자기지도 학습 사전 학습은 레이블 없이 대규모 데이터를 통해 범용 표현을 학습하는 방법으로, BERT나 GPT 같은 모델이 사용합니다. 이는 다운스트림 분류 작업을 위한 사전 단계로, 직접적인 감정 분류 작업에 해당하지 않습니다.",
                "explanation_en": "Self-supervised learning pre-training is a method that learns general representations through large-scale data without labels, used by models like BERT and GPT. This is a preliminary stage for downstream classification tasks and does not directly correspond to sentiment classification tasks.",
                "explanation_pt": "O pré-treinamento de aprendizado auto-supervisionado é um método que aprende representações gerais através de dados em grande escala sem rótulos, usado por modelos como BERT e GPT. Esta é uma etapa preliminar para tarefas de classificação downstream e não corresponde diretamente às tarefas de classificação de sentimentos.",
                "explanation_es": "El preentrenamiento de aprendizaje auto-supervisado es un método que aprende representaciones generales a través de datos a gran escala sin etiquetas, utilizado por modelos como BERT y GPT. Esta es una etapa preliminar para tareas de clasificación downstream y no corresponde directamente a las tareas de clasificación de sentimientos.",
                "sort_order": 4
            }
        ],
        "tag": "AI·ML 개념과 알고리즘",
        "tag_en": "AI and ML Concepts and Algorithms",
        "tag_pt": "Conceitos e Algoritmos de IA e ML",
        "tag_es": "Conceptos y Algoritmos de IA y ML",
        "explanation": "지도 학습 분류(Supervised Classification)는 미리 레이블링된 훈련 데이터를 통해 모델이 입력 패턴과 출력 범주 간의 매핑을 학습하는 방법입니다. 감정 분석에서는 긍정, 부정, 중립 등 미리 정의된 범주가 있고 각 훈련 샘플에 레이블이 부여되어 있으므로 지도 학습 분류가 가장 적합합니다.\n\n비지도 학습 클러스터링은 레이블 없이 데이터의 자연스러운 군집을 발견하는 방법으로, 범주가 사전 정의된 감정 분석과는 다릅니다. 강화 학습은 순차적 의사결정 문제에 적합하고, 자기지도 학습 사전 학습은 대규모 언어 모델의 기반 표현 학습 단계로 분류 작업 자체가 아닙니다.\n\nAWS에서는 Amazon Comprehend가 감정 분석을 포함한 텍스트 분류를 지원하며, Amazon SageMaker를 통해 커스텀 분류 모델을 학습하고 배포할 수 있습니다. Hugging Face 기반의 사전 학습된 감정 분석 모델도 SageMaker JumpStart에서 바로 사용할 수 있습니다.",
        "explanation_en": "Supervised classification is a method where a model learns the mapping between input patterns and output categories through pre-labeled training data. In sentiment analysis, there are predefined categories such as positive, negative, and neutral, and each training sample is assigned a label, making supervised learning classification the most suitable approach.\n\nUnsupervised learning clustering discovers natural groupings in data without labels, which differs from sentiment analysis with predefined categories. Reinforcement learning is suitable for sequential decision-making problems, and self-supervised learning pre-training is the base representation learning phase for large language models, not classification tasks themselves.\n\nOn AWS, Amazon Comprehend supports text classification including sentiment analysis, and Amazon SageMaker allows training and deploying custom classification models. Pre-trained sentiment analysis models based on Hugging Face are also immediately available in SageMaker JumpStart.",
        "explanation_pt": "A classificação supervisionada é um método onde um modelo aprende o mapeamento entre padrões de entrada e categorias de saída através de dados de treinamento pré-rotulados. Na análise de sentimentos, há categorias predefinidas como positivo, negativo e neutro, e cada amostra de treinamento recebe um rótulo, tornando a classificação de aprendizado supervisionado a abordagem mais adequada.\n\nO clustering de aprendizado não supervisionado descobre agrupamentos naturais nos dados sem rótulos, o que difere da análise de sentimentos com categorias predefinidas. O aprendizado por reforço é adequado para problemas de tomada de decisão sequencial, e o pré-treinamento de aprendizado auto-supervisionado é a fase de aprendizado de representação base para modelos de linguagem grandes, não as tarefas de classificação em si.\n\nNa AWS, o Amazon Comprehend suporta classificação de texto, incluindo análise de sentimentos, e o Amazon SageMaker permite treinar e implantar modelos de classificação personalizados. Modelos de análise de sentimentos pré-treinados baseados em Hugging Face também estão imediatamente disponíveis no SageMaker JumpStart.",
        "explanation_es": "La clasificación supervisada es un método donde un modelo aprende el mapeo entre patrones de entrada y categorías de salida a través de datos de entrenamiento prelabeled. En el análisis de sentimientos, hay categorías predefinidas como positivo, negativo y neutro, y a cada muestra de entrenamiento se le asigna una etiqueta, lo que hace que la clasificación de aprendizaje supervisado sea el enfoque más adecuado.\n\nEl clustering de aprendizaje no supervisado descubre agrupaciones naturales en los datos sin etiquetas, lo que difiere del análisis de sentimientos con categorías predefinidas. El aprendizaje por refuerzo es adecuado para problemas de toma de decisiones secuenciales, y el preentrenamiento de aprendizaje auto-supervisado es la fase de aprendizaje de representación base para modelos de lenguaje grandes, no las tareas de clasificación en sí.\n\nEn AWS, Amazon Comprehend admite la clasificación de texto, incluido el análisis de sentimientos, y Amazon SageMaker permite entrenar e implementar modelos de clasificación personalizados. Los modelos de análisis de sentimientos preentrenados basados en Hugging Face también están disponibles inmediatamente en SageMaker JumpStart.",
        "key_points": "지도 학습 분류의 특징\n• 지도 학습 분류는 레이블된 데이터로 미리 정의된 범주에 입력을 분류하는 방법\n• 감정 분석: 긍정/부정/중립 등 사전 정의 범주 → 지도 학습 최적\n• 비지도 클러스터링은 레이블 없이 자연 군집 발견 (범주 미정의 시 활용)\n• AWS Amazon Comprehend: 감정 분석 및 텍스트 분류 관리형 서비스\n• SageMaker JumpStart에서 Hugging Face 사전 학습 분류 모델 즉시 활용 가능",
        "key_points_en": "Characteristics of Supervised Learning Classification\n• Supervised learning classification classifies inputs into predefined categories using labeled data\n• Sentiment analysis: predefined categories like positive/negative/neutral - optimal for supervised learning\n• Unsupervised clustering discovers natural groupings without labels (used when categories are undefined)\n• AWS Amazon Comprehend: managed service for sentiment analysis and text classification\n• Hugging Face pre-trained classification models immediately available in SageMaker JumpStart",
        "key_points_pt": "Características da Classificação de Aprendizado Supervisionado\n• A classificação de aprendizado supervisionado classifica entradas em categorias predefinidas usando dados rotulados\n• Análise de sentimentos: categorias predefinidas como positivo/negativo/neutro - ótimo para aprendizado supervisionado\n• O clustering não supervisionado descobre agrupamentos naturais sem rótulos (usado quando as categorias são indefinidas)\n• AWS Amazon Comprehend: serviço gerenciado para análise de sentimentos e classificação de texto\n• Modelos de classificação pré-treinados Hugging Face disponíveis imediatamente no SageMaker JumpStart",
        "key_points_es": "Características de la Clasificación de Aprendizaje Supervisado\n• La clasificación de aprendizaje supervisado clasifica entradas en categorías predefinidas usando datos etiquetados\n• Análisis de sentimientos: categorías predefinidas como positivo/negativo/neutro - óptimo para aprendizaje supervisado\n• El clustering no supervisado descubre agrupaciones naturales sin etiquetas (usado cuando las categorías no están definidas)\n• AWS Amazon Comprehend: servicio administrado para análisis de sentimientos y clasificación de texto\n• Modelos de clasificación preentrenados de Hugging Face disponibles inmediatamente en SageMaker JumpStart",
        "ref_links": [
            {"name": "Amazon Comprehend 감정 분석", "name_en": "Amazon Comprehend Sentiment Analysis", "name_pt": "Análise de Sentimentos do Amazon Comprehend", "name_es": "Análisis de Sentimientos de Amazon Comprehend", "url": "https://docs.aws.amazon.com/comprehend/latest/dg/how-sentiment.html"},
            {"name": "Amazon SageMaker JumpStart", "name_en": "Amazon SageMaker JumpStart", "name_pt": "Amazon SageMaker JumpStart", "name_es": "Amazon SageMaker JumpStart", "url": "https://aws.amazon.com/sagemaker/jumpstart/"}
        ]
    },
    {
        "id": "awsaifc01-q330",
        "exam_id": "aws-aif-c01",
        "text": "한 디지털 비서 서비스가 긴 사용자 질문을 처리하고 있다. 시스템은 중요한 단어에 더 높은 가중치를 부여해 응답 품질을 개선하려 한다.\n\n이를 가능하게 하는 Transformer 아키텍처의 핵심 메커니즘은 무엇인가?",
        "text_en": "A digital assistant service is processing long user questions. The system wants to improve response quality by assigning higher weights to important words.\n\nWhat is the core mechanism of the Transformer architecture that enables this?",
        "text_pt": "Um serviço de assistente digital está processando perguntas longas de usuários. O sistema deseja melhorar a qualidade das respostas atribuindo pesos mais altos a palavras importantes.\n\nQual é o mecanismo central da arquitetura Transformer que permite isso?",
        "text_es": "Un servicio de asistente digital está procesando preguntas largas de usuarios. El sistema quiere mejorar la calidad de las respuestas asignando pesos más altos a las palabras importantes.\n\n¿Cuál es el mecanismo central de la arquitectura Transformer que permite esto?",
        "correct_option_id": "b",
        "options": [
            {
                "option_id": "a",
                "text": "드롭아웃 정규화",
                "text_en": "Dropout regularization",
                "text_pt": "Regularização de dropout",
                "text_es": "Regularización de dropout",
                "explanation": "드롭아웃 정규화는 학습 중 일부 뉴런을 무작위로 비활성화하여 과적합을 방지하는 기법입니다. 단어 간 중요도 가중치 계산과는 관련이 없습니다.",
                "explanation_en": "Dropout regularization is a technique that randomly deactivates some neurons during training to prevent overfitting. It has nothing to do with calculating importance weights between words.",
                "explanation_pt": "A regularização de dropout é uma técnica que desativa aleatoriamente alguns neurônios durante o treinamento para evitar o sobreajuste. Não tem nada a ver com o cálculo de pesos de importância entre palavras.",
                "explanation_es": "La regularización de dropout es una técnica que desactiva aleatoriamente algunas neuronas durante el entrenamiento para evitar el sobreajuste. No tiene nada que ver con calcular pesos de importancia entre palabras.",
                "sort_order": 1
            },
            {
                "option_id": "b",
                "text": "셀프 어텐션",
                "text_en": "Self-attention",
                "text_pt": "Auto-atenção (self-attention)",
                "text_es": "Auto-atención (self-attention)",
                "explanation": "셀프 어텐션(Self-Attention)은 Transformer의 핵심 메커니즘으로, 입력 시퀀스의 각 단어가 다른 모든 단어와의 연관성을 계산하여 가중치를 부여합니다. 이를 통해 문맥에서 중요한 단어에 높은 가중치가 자동으로 할당되어 응답 품질이 향상됩니다.",
                "explanation_en": "Self-attention is the core mechanism of the Transformer, where each word in the input sequence calculates its relevance to all other words and assigns weights accordingly. This automatically assigns higher weights to contextually important words, improving response quality.",
                "explanation_pt": "Auto-atenção (self-attention) é o mecanismo central do Transformer, onde cada palavra na sequência de entrada calcula sua relevância para todas as outras palavras e atribui pesos de acordo. Isso atribui automaticamente pesos mais altos a palavras contextualmente importantes, melhorando a qualidade das respostas.",
                "explanation_es": "La auto-atención (self-attention) es el mecanismo central del Transformer, donde cada palabra en la secuencia de entrada calcula su relevancia para todas las demás palabras y asigna pesos en consecuencia. Esto asigna automáticamente pesos más altos a las palabras contextualmente importantes, mejorando la calidad de las respuestas.",
                "sort_order": 2
            },
            {
                "option_id": "c",
                "text": "배치 정규화",
                "text_en": "Batch normalization",
                "text_pt": "Normalização de lote (batch normalization)",
                "text_es": "Normalización por lotes (batch normalization)",
                "explanation": "배치 정규화는 각 레이어의 입력을 정규화하여 학습을 안정화하는 기법입니다. 단어 간 어텐션 가중치 계산과는 다른 목적을 가진 기법으로, Transformer의 핵심 메커니즘이 아닙니다.",
                "explanation_en": "Batch normalization is a technique that stabilizes training by normalizing inputs to each layer. It serves a different purpose from calculating attention weights between words and is not a core mechanism of the Transformer.",
                "explanation_pt": "A normalização de lote é uma técnica que estabiliza o treinamento normalizando as entradas para cada camada. Serve a um propósito diferente do cálculo de pesos de atenção entre palavras e não é um mecanismo central do Transformer.",
                "explanation_es": "La normalización por lotes es una técnica que estabiliza el entrenamiento normalizando las entradas a cada capa. Sirve a un propósito diferente al cálculo de pesos de atención entre palabras y no es un mecanismo central del Transformer.",
                "sort_order": 3
            },
            {
                "option_id": "d",
                "text": "합성곱 필터",
                "text_en": "Convolutional filters",
                "text_pt": "Filtros convolucionais",
                "text_es": "Filtros convolucionales",
                "explanation": "합성곱 필터는 CNN(Convolutional Neural Network)의 핵심 구성 요소로, 이미지 등 공간적 데이터에서 지역적 패턴을 추출하는 데 사용됩니다. Transformer 아키텍처의 메커니즘이 아닙니다.",
                "explanation_en": "Convolutional filters are core components of CNNs (Convolutional Neural Networks) used to extract local patterns from spatial data such as images. They are not mechanisms of the Transformer architecture.",
                "explanation_pt": "Os filtros convolucionais são componentes centrais das CNNs (Redes Neurais Convolucionais) usados para extrair padrões locais de dados espaciais, como imagens. Eles não são mecanismos da arquitetura Transformer.",
                "explanation_es": "Los filtros convolucionales son componentes centrales de las CNNs (Redes Neuronales Convolucionales) utilizados para extraer patrones locales de datos espaciales como imágenes. No son mecanismos de la arquitectura Transformer.",
                "sort_order": 4
            }
        ],
        "tag": "생성형 AI 개념과 구조",
        "tag_en": "Generative AI Concepts and Architecture",
        "tag_pt": "Conceitos e Arquitetura de IA Generativa",
        "tag_es": "Conceptos y Arquitectura de IA Generativa",
        "explanation": "셀프 어텐션(Self-Attention) 메커니즘은 2017년 Attention is All You Need 논문에서 소개된 Transformer 아키텍처의 핵심 구성 요소입니다. 각 단어(토큰)가 시퀀스 내 다른 모든 단어와의 관련성을 쿼리(Query), 키(Key), 밸류(Value) 벡터를 통해 계산하고, 중요한 단어에 높은 어텐션 가중치를 부여합니다.\n\n드롭아웃은 과적합 방지 정규화 기법이며, 배치 정규화는 학습 안정화 기법입니다. 합성곱 필터는 CNN에서 공간적 패턴을 추출하는 데 사용되며 Transformer와는 무관합니다. 이 세 기법 모두 단어 간 가중치를 동적으로 계산하는 어텐션 메커니즘과는 다른 목적을 가집니다.\n\n멀티-헤드 어텐션(Multi-Head Attention)은 셀프 어텐션을 여러 표현 부공간에서 병렬로 적용하여 다양한 관점에서 단어 간 관계를 포착합니다. AWS의 Amazon Bedrock에서 사용 가능한 GPT, Claude, Titan 등 대부분의 현대 LLM은 Transformer 기반 아키텍처를 사용합니다.",
        "explanation_en": "The self-attention mechanism is the core component of the Transformer architecture introduced in the 2017 paper Attention is All You Need. Each word (token) calculates its relevance to all other words in the sequence through Query, Key, and Value vectors, assigning higher attention weights to important words.\n\nDropout is a regularization technique to prevent overfitting, and batch normalization is a technique for stabilizing training. Convolutional filters are used to extract spatial patterns in CNNs and are unrelated to Transformers. All three techniques serve different purposes from the attention mechanism that dynamically calculates weights between words.\n\nMulti-head attention applies self-attention in parallel across multiple representation subspaces to capture relationships between words from different perspectives. Most modern LLMs available in AWS Amazon Bedrock, such as GPT, Claude, and Titan, use Transformer-based architectures.",
        "explanation_pt": "O mecanismo de auto-atenção (self-attention) é o componente central da arquitetura Transformer introduzida no artigo de 2017 Attention is All You Need. Cada palavra (token) calcula sua relevância para todas as outras palavras na sequência através de vetores Query, Key e Value, atribuindo pesos de atenção mais altos a palavras importantes.\n\nDropout é uma técnica de regularização para evitar sobreajuste, e a normalização de lote é uma técnica para estabilizar o treinamento. Os filtros convolucionais são usados para extrair padrões espaciais em CNNs e não estão relacionados com Transformers. As três técnicas servem a propósitos diferentes do mecanismo de atenção que calcula dinamicamente os pesos entre as palavras.\n\nA atenção multi-cabeça (Multi-head attention) aplica a auto-atenção em paralelo em vários subespaços de representação para capturar relações entre palavras de diferentes perspectivas. A maioria dos LLMs modernos disponíveis no AWS Amazon Bedrock, como GPT, Claude e Titan, usa arquiteturas baseadas em Transformer.",
        "explanation_es": "El mecanismo de auto-atención (self-attention) es el componente central de la arquitectura Transformer introducida en el artículo de 2017 Attention is All You Need. Cada palabra (token) calcula su relevancia para todas las demás palabras en la secuencia a través de vectores Query, Key y Value, asignando pesos de atención más altos a palabras importantes.\n\nEl dropout es una técnica de regularización para prevenir el sobreajuste, y la normalización por lotes es una técnica para estabilizar el entrenamiento. Los filtros convolucionales se usan para extraer patrones espaciales en CNNs y no están relacionados con los Transformers. Las tres técnicas sirven a propósitos diferentes del mecanismo de atención que calcula dinámicamente los pesos entre palabras.\n\nLa atención multi-cabeza (Multi-head attention) aplica la auto-atención en paralelo en múltiples subespacios de representación para capturar relaciones entre palabras desde diferentes perspectivas. La mayoría de los LLMs modernos disponibles en AWS Amazon Bedrock, como GPT, Claude y Titan, utilizan arquitecturas basadas en Transformer.",
        "key_points": "Transformer 셀프 어텐션 메커니즘\n• 셀프 어텐션은 입력 시퀀스 내 각 단어가 다른 모든 단어와의 관련성을 계산\n• Query, Key, Value 벡터를 통해 어텐션 가중치를 동적으로 계산\n• 문맥에서 중요한 단어에 높은 가중치가 자동으로 할당됨\n• 멀티-헤드 어텐션으로 여러 표현 부공간에서 병렬 관계 포착 가능\n• GPT, Claude, Titan 등 현대 LLM은 모두 Transformer 기반 구조 사용",
        "key_points_en": "Transformer Self-Attention Mechanism\n• Self-attention calculates the relevance of each word in an input sequence to all other words\n• Attention weights are dynamically calculated through Query, Key, and Value vectors\n• Higher weights are automatically assigned to contextually important words\n• Multi-head attention enables parallel relationship capture across multiple representation subspaces\n• Modern LLMs like GPT, Claude, and Titan all use Transformer-based architectures",
        "key_points_pt": "Mecanismo de Auto-Atenção do Transformer\n• Auto-atenção calcula a relevância de cada palavra em uma sequência de entrada para todas as outras palavras\n• Os pesos de atenção são calculados dinamicamente através de vetores Query, Key e Value\n• Pesos mais altos são atribuídos automaticamente a palavras contextualmente importantes\n• A atenção multi-cabeça permite a captura paralela de relações em vários subespaços de representação\n• LLMs modernos como GPT, Claude e Titan usam arquiteturas baseadas em Transformer",
        "key_points_es": "Mecanismo de Auto-Atención del Transformer\n• La auto-atención calcula la relevancia de cada palabra en una secuencia de entrada para todas las demás palabras\n• Los pesos de atención se calculan dinámicamente a través de vectores Query, Key y Value\n• Los pesos más altos se asignan automáticamente a las palabras contextualmente importantes\n• La atención multi-cabeza permite la captura paralela de relaciones en múltiples subespacios de representación\n• Los LLMs modernos como GPT, Claude y Titan usan arquitecturas basadas en Transformer",
        "ref_links": [
            {"name": "Attention is All You Need 논문", "name_en": "Attention is All You Need Paper", "name_pt": "Artigo Attention is All You Need", "name_es": "Artículo Attention is All You Need", "url": "https://arxiv.org/abs/1706.03762"},
            {"name": "Amazon Bedrock Foundation Models", "name_en": "Amazon Bedrock Foundation Models", "name_pt": "Modelos Fundacionais do Amazon Bedrock", "name_es": "Modelos de Fundación de Amazon Bedrock", "url": "https://aws.amazon.com/bedrock/"}
        ]
    }
]

questions_json_str = json.dumps(questions, ensure_ascii=False)
result = subprocess.run(
    ["python3", ".claude/skills/sql-generator/scripts/insert_supabase.py",
     "--questions-json", questions_json_str,
     "--set-id", "2308ba42-6e58-4aee-bc43-4ad6ca01c37b",
     "--sort-order-start", "11"],
    capture_output=True, text=True, cwd="/Users/sunghwanki/Desktop/Github_Project/cloud-exam-prep"
)
print(result.stdout)
if result.returncode != 0:
    print("STDERR:", result.stderr)
