export type AnnouncementCategory = 'notice' | 'info' | 'tip' | 'update';

export interface Announcement {
  id: string;
  category: AnnouncementCategory;
  title: string;
  titleEn: string | null;
  content: string;
  contentEn: string | null;
  examId: string | null;
  isPinned: boolean;
  isActive: boolean;
  authorId: string | null;
  coverImageUrl: string | null;
  refLinks: string | null;       // JSON: [{"name":"...","url":"..."}]
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementInput {
  category: AnnouncementCategory;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  examId?: string | null;
  isPinned?: boolean;
  isActive?: boolean;
  coverImageUrl?: string | null;
  refLinks?: string | null;
}
