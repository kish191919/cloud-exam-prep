-- RLS 정책 보완: 관리자가 모든 신고를 조회·수정할 수 있도록 추가
-- 기존 users_select_own_reports 정책(auth.uid() = user_id)은 학생 전용으로 유지

-- 인증된 사용자(로그인한 관리자 포함)가 모든 신고를 SELECT 가능
CREATE POLICY "authenticated_select_all_reports"
  ON question_reports FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 인증된 사용자(로그인한 관리자)가 신고 상태·답변을 UPDATE 가능
-- 관리자 전용 접근은 앱 레벨 isAdmin() 체크로 보완
CREATE POLICY "authenticated_update_reports"
  ON question_reports FOR UPDATE
  USING (auth.uid() IS NOT NULL);
