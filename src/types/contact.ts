export type ContactCategory = 'complaint' | 'suggestion' | 'inquiry' | 'other';
export type ContactStatus = 'unread' | 'read' | 'responded' | 'closed';

export interface ContactMessage {
  id: string;
  userId: string | null;
  userEmail: string;
  userName: string | null;
  category: ContactCategory;
  subject: string;
  message: string;
  status: ContactStatus;
  adminResponse: string | null;
  respondedBy: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInput {
  userId: string;
  userEmail: string;
  userName?: string;
  category: ContactCategory;
  subject: string;
  message: string;
}

export const CATEGORY_LABELS: Record<ContactCategory, string> = {
  complaint: '불편사항',
  suggestion: '건의사항',
  inquiry: '문의사항',
  other: '기타',
};

export const STATUS_LABELS: Record<ContactStatus, string> = {
  unread: '미확인',
  read: '확인됨',
  responded: '답변완료',
  closed: '종료',
};
