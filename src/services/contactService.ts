import { supabase } from '@/lib/supabase';
import type { ContactMessage, ContactInput, ContactStatus } from '@/types/contact';

function toContactMessage(row: Record<string, unknown>): ContactMessage {
  return {
    id: row.id as string,
    userId: row.user_id as string | null,
    userEmail: row.user_email as string,
    userName: row.user_name as string | null,
    category: row.category as ContactMessage['category'],
    subject: row.subject as string,
    message: row.message as string,
    status: row.status as ContactStatus,
    adminResponse: row.admin_response as string | null,
    respondedBy: row.responded_by as string | null,
    respondedAt: row.responded_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** 회원이 문의 제출 */
export async function submitContact(input: ContactInput): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert({
    user_id: input.userId,
    user_email: input.userEmail,
    user_name: input.userName ?? null,
    category: input.category,
    subject: input.subject,
    message: input.message,
  });
  if (error) throw error;
}

/** 회원 본인 문의 목록 조회 */
export async function getMyContacts(userId: string): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toContactMessage);
}

/** 관리자: 전체 문의 목록 조회 (service_role 사용) */
export async function getAllContacts(statusFilter?: ContactStatus | 'all'): Promise<ContactMessage[]> {
  let query = supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toContactMessage);
}

/** 관리자: 상태별 건수 조회 */
export async function getContactCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('status');
  if (error) throw error;
  const counts: Record<string, number> = { total: 0, unread: 0, read: 0, responded: 0, closed: 0 };
  for (const row of data ?? []) {
    counts.total = (counts.total ?? 0) + 1;
    const s = (row as { status: string }).status;
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}

/** 관리자: 문의 상태 및 답변 업데이트 */
export async function updateContact(
  id: string,
  updates: { status?: ContactStatus; adminResponse?: string; respondedBy?: string }
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.adminResponse !== undefined) patch.admin_response = updates.adminResponse;
  if (updates.respondedBy !== undefined) {
    patch.responded_by = updates.respondedBy;
    patch.responded_at = new Date().toISOString();
  }
  const { error } = await supabase.from('contact_messages').update(patch).eq('id', id);
  if (error) throw error;
}

/** 관리자: 미확인(unread) 문의 건수만 빠르게 조회 */
export async function getUnreadContactCount(): Promise<number> {
  const { count, error } = await supabase
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'unread');
  if (error) return 0;
  return count ?? 0;
}
