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
}
