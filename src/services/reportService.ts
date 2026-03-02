import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type QuestionReport = Database['public']['Tables']['question_reports']['Row'];
export type ReportReason = 'wrong_answer' | 'unclear' | 'typo' | 'other';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export interface SubmitReportInput {
  questionId: string;
  userId?: string;
  userEmail?: string;
  reason: ReportReason;
  comment?: string;
}

/** 학생: 문제 신고 제출 */
export async function submitReport(input: SubmitReportInput): Promise<void> {
  const { error } = await supabase.from('question_reports').insert({
    question_id: input.questionId,
    user_id: input.userId ?? null,
    user_email: input.userEmail ?? null,
    reason: input.reason,
    comment: input.comment ?? null,
  });
  if (error) throw error;
}

/** 학생: 내 신고 목록 조회 (최신순) */
export async function getMyReports(userId: string): Promise<QuestionReport[]> {
  const { data, error } = await supabase
    .from('question_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** 학생: 특정 문제에 대해 내가 이미 신고했는지 확인 */
export async function hasReported(questionId: string, userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('question_reports')
    .select('id', { count: 'exact', head: true })
    .eq('question_id', questionId)
    .eq('user_id', userId);
  if (error) return false;
  return (count ?? 0) > 0;
}

/** 관리자: 전체 신고 목록 조회 */
export async function getAllReports(statusFilter?: ReportStatus | 'all'): Promise<QuestionReport[]> {
  let query = supabase
    .from('question_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** 관리자: 신고 상태·답변 업데이트 */
export async function updateReport(
  reportId: string,
  updates: {
    status: ReportStatus;
    adminNote?: string;
    resolvedBy?: string;
  }
): Promise<void> {
  const patch: Database['public']['Tables']['question_reports']['Update'] = {
    status: updates.status,
    admin_note: updates.adminNote ?? null,
  };
  if (updates.status === 'resolved' || updates.status === 'dismissed') {
    patch.resolved_by = updates.resolvedBy ?? null;
    patch.resolved_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('question_reports')
    .update(patch)
    .eq('id', reportId);
  if (error) throw error;
}

/** 관리자: 상태별 신고 수 카운트 */
export async function getReportCounts(): Promise<Record<ReportStatus | 'total', number>> {
  const { data, error } = await supabase
    .from('question_reports')
    .select('status');
  if (error) throw error;

  const counts: Record<string, number> = { total: 0, pending: 0, reviewing: 0, resolved: 0, dismissed: 0 };
  (data ?? []).forEach(r => {
    counts.total++;
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  });
  return counts as Record<ReportStatus | 'total', number>;
}

/** 학생: 문제 ID 배열 → 세트 이름 + 세트 내 순서 매핑 조회 */
export interface QuestionSetInfo {
  setName: string;
  sortOrder: number;  // 1-indexed 순서
}

export async function getQuestionSetInfo(
  questionIds: string[]
): Promise<Record<string, QuestionSetInfo>> {
  if (questionIds.length === 0) return {};

  const { data, error } = await supabase
    .from('exam_set_questions')
    .select('question_id, sort_order, exam_sets(name)')
    .in('question_id', questionIds);

  if (error || !data) return {};

  const map: Record<string, QuestionSetInfo> = {};
  for (const row of data) {
    const setName = (row.exam_sets as { name: string } | null)?.name ?? '';
    // 동일 문제가 여러 세트에 있으면 첫 번째만 사용
    if (!map[row.question_id]) {
      map[row.question_id] = {
        setName,
        sortOrder: row.sort_order,
      };
    }
  }
  return map;
}

export const REASON_LABELS: Record<ReportReason, string> = {
  wrong_answer: '정답 오류',
  unclear: '문제 불명확',
  typo: '오타/표기 오류',
  other: '기타',
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: '검토 대기',
  reviewing: '검토 중',
  resolved: '처리 완료',
  dismissed: '기각',
};
