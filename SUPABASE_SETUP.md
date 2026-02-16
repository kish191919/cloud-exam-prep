# Supabase 설정 가이드

이 가이드는 Cloud Exam Prep 애플리케이션을 Supabase 데이터베이스와 연동하는 방법을 설명합니다.

## 📋 사전 준비

1. [Supabase](https://app.supabase.com) 계정 생성
2. Node.js 18+ 및 npm 설치

## 🚀 설정 단계

### 1. Supabase 프로젝트 생성

1. [Supabase 대시보드](https://app.supabase.com)에 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: cloud-exam-prep (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (안전하게 보관)
   - **Region**: 가장 가까운 지역 선택 (예: Northeast Asia - Seoul)
4. "Create new project" 클릭 (완료까지 1-2분 소요)

### 2. 데이터베이스 스키마 생성

1. Supabase 프로젝트 대시보드에서 **SQL Editor** 탭 클릭
2. "New query" 클릭
3. `supabase/migrations/20260216_initial_schema.sql` 파일의 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 스키마 생성

### 3. 초기 데이터 삽입

1. SQL Editor에서 다시 "New query" 클릭
2. `supabase/migrations/20260216_seed_data.sql` 파일의 내용을 복사하여 붙여넣기
3. "Run" 버튼 클릭하여 초기 데이터 삽입

### 4. API 키 설정

1. Supabase 대시보드에서 **Settings** > **API** 탭 이동
2. 다음 정보를 복사:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** 키 (공개 API 키)

### 5. 환경 변수 설정

1. 프로젝트 루트의 `.env` 파일을 열기
2. 복사한 정보를 입력:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **주의**: `.env` 파일은 Git에 커밋하지 마세요! (이미 .gitignore에 추가됨)

### 6. 애플리케이션 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## ✅ 설정 확인

1. 애플리케이션 실행 후 "Practice Exams" 페이지 접속
2. "AWS Certified AI Practitioner" 시험이 10개 문제와 함께 표시되는지 확인
3. "Start Exam" 클릭하여 시험 시작
4. 문제가 정상적으로 로드되는지 확인

## 🗂️ 데이터베이스 구조

### 테이블

- **exams**: 시험 정보 (제목, 코드, 시간 제한 등)
- **questions**: 시험 문제
- **question_options**: 문제의 선택지
- **question_tags**: 문제의 태그 (주제별 분류)
- **exam_sessions**: 사용자 시험 세션 (진행 상황 저장)

### 뷰

- **exam_list**: 시험 목록과 문제 개수를 보여주는 뷰

## 📝 데이터 관리

### Supabase 대시보드에서 직접 관리

1. **Table Editor** 탭에서 데이터 조회/수정/삭제
2. 새 시험 추가:
   - `exams` 테이블에 시험 정보 추가
   - `questions` 테이블에 문제 추가
   - `question_options` 테이블에 선택지 추가
   - `question_tags` 테이블에 태그 추가

### SQL로 새 문제 추가 예시

```sql
-- 1. 문제 추가
INSERT INTO questions (id, exam_id, text, correct_option_id, explanation, difficulty)
VALUES (
  'aif-q11',
  'aws-aif-c01',
  'What is the primary benefit of using Amazon SageMaker?',
  'c',
  'Amazon SageMaker provides a complete ML workflow platform.',
  2
);

-- 2. 선택지 추가
INSERT INTO question_options (question_id, option_id, text, sort_order)
VALUES
  ('aif-q11', 'a', 'Lower costs', 1),
  ('aif-q11', 'b', 'Better security', 2),
  ('aif-q11', 'c', 'Complete ML workflow', 3),
  ('aif-q11', 'd', 'Faster compute', 4);

-- 3. 태그 추가
INSERT INTO question_tags (question_id, tag)
VALUES
  ('aif-q11', 'SageMaker'),
  ('aif-q11', 'ML Platform');
```

## 🔒 보안 설정

현재 설정:

- ✅ Row Level Security (RLS) 활성화됨
- ✅ 시험/문제 데이터는 모든 사용자가 읽기 가능
- ✅ 시험 세션은 생성한 사용자만 접근 가능
- ✅ 익명 사용자도 시험 응시 가능 (LocalStorage 폴백)

## 🔄 오프라인 지원

애플리케이션은 Supabase 연결 실패 시 자동으로 LocalStorage로 폴백됩니다:

- Supabase 우선 시도
- 실패 시 LocalStorage 사용 (기존 방식)
- 콘솔에 경고 메시지 출력

## 📊 대시보드 기능

Supabase 대시보드에서 확인 가능:

1. **Database**: 테이블 구조 및 데이터
2. **Table Editor**: GUI로 데이터 편집
3. **SQL Editor**: SQL 쿼리 실행
4. **Logs**: 에러 및 성능 모니터링
5. **Database**: 백업 및 복원

## 🆘 문제 해결

### "Missing Supabase environment variables" 에러

- `.env` 파일이 존재하는지 확인
- 환경 변수가 `VITE_` 접두사로 시작하는지 확인
- 개발 서버 재시작 (`npm run dev`)

### 데이터가 로드되지 않음

1. Supabase 프로젝트가 활성화되어 있는지 확인
2. SQL 마이그레이션이 정상적으로 실행되었는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인
4. Supabase 대시보드 > Logs에서 에러 확인

### RLS 정책 에러

- SQL Editor에서 정책이 올바르게 생성되었는지 확인
- 익명 접근이 필요한 경우 `anon` 역할에 권한 부여 확인

## 🎓 다음 단계

1. **사용자 인증 추가**: Supabase Auth 연동
2. **더 많은 시험 추가**: SAA-C03, DEA-C01 문제 추가
3. **통계 기능**: 사용자별 성적 추적
4. **실시간 업데이트**: Supabase Realtime 구독
5. **이미지 지원**: Supabase Storage로 문제 이미지 관리

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
