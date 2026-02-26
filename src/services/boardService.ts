import { supabase } from '@/lib/supabase';
import type { Announcement, AnnouncementInput } from '@/types/announcement';

function toAnnouncement(row: Record<string, unknown>): Announcement {
  return {
    id:        row.id as string,
    category:  row.category as Announcement['category'],
    title:     row.title as string,
    titleEn:   (row.title_en as string | null) ?? null,
    content:   row.content as string,
    contentEn: (row.content_en as string | null) ?? null,
    examId:    (row.exam_id as string | null) ?? null,
    isPinned:  row.is_pinned as boolean,
    isActive:  row.is_active as boolean,
    authorId:  (row.author_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getAnnouncements(opts?: {
  category?: string;
  examId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Announcement[]; count: number }> {
  let query = supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (opts?.category && opts.category !== 'all') {
    query = query.eq('category', opts.category);
  }
  if (opts?.examId) {
    query = query.eq('exam_id', opts.examId);
  }
  const limit = opts?.limit ?? 20;
  if (opts?.offset) {
    query = query.range(opts.offset, opts.offset + limit - 1);
  } else {
    query = query.limit(limit);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []).map(toAnnouncement), count: count ?? 0 };
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) return null;
  return toAnnouncement(data as Record<string, unknown>);
}

export async function getAllAnnouncementsAdmin(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => toAnnouncement(row as Record<string, unknown>));
}

export async function createAnnouncement(input: AnnouncementInput): Promise<string> {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      category:   input.category,
      title:      input.title,
      title_en:   input.titleEn ?? null,
      content:    input.content,
      content_en: input.contentEn ?? null,
      exam_id:    input.examId ?? null,
      is_pinned:  input.isPinned ?? false,
      is_active:  input.isActive ?? true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return (data as { id: string }).id;
}

export async function updateAnnouncement(
  id: string,
  input: Partial<AnnouncementInput>,
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (input.category   !== undefined) payload.category   = input.category;
  if (input.title      !== undefined) payload.title      = input.title;
  if (input.titleEn    !== undefined) payload.title_en   = input.titleEn;
  if (input.content    !== undefined) payload.content    = input.content;
  if (input.contentEn  !== undefined) payload.content_en = input.contentEn;
  if (input.examId     !== undefined) payload.exam_id    = input.examId;
  if (input.isPinned   !== undefined) payload.is_pinned  = input.isPinned;
  if (input.isActive   !== undefined) payload.is_active  = input.isActive;

  const { error } = await supabase
    .from('announcements')
    .update(payload)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase
    .from('announcements')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
}
