import { supabase } from '@/lib/supabase';
import type { Json } from '@/types/database';

export type BlogProvider = 'aws' | 'gcp' | 'azure' | 'general';

export interface BlogPost {
  id: string;
  slug: string;
  provider: BlogProvider;
  examId: string | null;
  category: string | null;
  tags: string[];
  title: string;
  titleEn: string | null;
  titleJa: string | null;
  titleEs: string | null;
  titlePt: string | null;
  excerpt: string | null;
  excerptEn: string | null;
  excerptJa: string | null;
  excerptEs: string | null;
  excerptPt: string | null;
  content: string;
  contentEn: string | null;
  contentJa: string | null;
  contentEs: string | null;
  contentPt: string | null;
  coverImageUrl: string | null;
  readTimeMinutes: number | null;
  refLinks: Json;
  isPublished: boolean;
  publishedAt: string | null;
  isPinned: boolean;
  authorId: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostInput {
  slug: string;
  provider: BlogProvider;
  examId?: string | null;
  category?: string | null;
  tags?: string[];
  title: string;
  titleEn?: string | null;
  titleJa?: string | null;
  titleEs?: string | null;
  titlePt?: string | null;
  excerpt?: string | null;
  excerptEn?: string | null;
  excerptJa?: string | null;
  excerptEs?: string | null;
  excerptPt?: string | null;
  content: string;
  contentEn?: string | null;
  contentJa?: string | null;
  contentEs?: string | null;
  contentPt?: string | null;
  coverImageUrl?: string | null;
  readTimeMinutes?: number | null;
  refLinks?: Json;
  isPublished?: boolean;
  publishedAt?: string | null;
  isPinned?: boolean;
}

function toBlogPost(row: Record<string, unknown>): BlogPost {
  return {
    id:              row.id as string,
    slug:            row.slug as string,
    provider:        row.provider as BlogProvider,
    examId:          (row.exam_id as string | null) ?? null,
    category:        (row.category as string | null) ?? null,
    tags:            (row.tags as string[]) ?? [],
    title:           row.title as string,
    titleEn:         (row.title_en as string | null) ?? null,
    titleJa:         (row.title_ja as string | null) ?? null,
    titleEs:         (row.title_es as string | null) ?? null,
    titlePt:         (row.title_pt as string | null) ?? null,
    excerpt:         (row.excerpt as string | null) ?? null,
    excerptEn:       (row.excerpt_en as string | null) ?? null,
    excerptJa:       (row.excerpt_ja as string | null) ?? null,
    excerptEs:       (row.excerpt_es as string | null) ?? null,
    excerptPt:       (row.excerpt_pt as string | null) ?? null,
    content:         row.content as string,
    contentEn:       (row.content_en as string | null) ?? null,
    contentJa:       (row.content_ja as string | null) ?? null,
    contentEs:       (row.content_es as string | null) ?? null,
    contentPt:       (row.content_pt as string | null) ?? null,
    coverImageUrl:   (row.cover_image_url as string | null) ?? null,
    readTimeMinutes: (row.read_time_minutes as number | null) ?? null,
    refLinks:        (row.ref_links as Json) ?? [],
    isPublished:     row.is_published as boolean,
    publishedAt:     (row.published_at as string | null) ?? null,
    isPinned:        row.is_pinned as boolean,
    authorId:        (row.author_id as string | null) ?? null,
    viewCount:       (row.view_count as number) ?? 0,
    createdAt:       row.created_at as string,
    updatedAt:       row.updated_at as string,
  };
}

/** 읽기 시간 계산 (글자 수 / 500 분) */
export function calcReadTime(content: string): number {
  return Math.max(1, Math.round(content.length / 500));
}

export async function getBlogPosts(opts?: {
  provider?: string;
  examId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}): Promise<{ data: BlogPost[]; count: number }> {
  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false });

  if (opts?.provider && opts.provider !== 'all') {
    query = query.eq('provider', opts.provider);
  }
  if (opts?.examId) {
    query = query.eq('exam_id', opts.examId);
  }
  if (opts?.tags && opts.tags.length > 0) {
    query = query.overlaps('tags', opts.tags);
  }

  const limit = opts?.limit ?? 20;
  if (opts?.offset) {
    query = query.range(opts.offset, opts.offset + limit - 1);
  } else {
    query = query.limit(limit);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []).map(toBlogPost), count: count ?? 0 };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) return null;
  return toBlogPost(data as Record<string, unknown>);
}

/** 태그가 겹치는 관련 포스트 조회 (현재 포스트 제외) */
export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  if (post.tags.length === 0) return [];

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .neq('id', post.id)
    .overlaps('tags', post.tags)
    .limit(limit);

  if (error) return [];
  return (data ?? []).map(row => toBlogPost(row as Record<string, unknown>));
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => toBlogPost(row as Record<string, unknown>));
}

export async function getBlogPostByIdAdmin(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return toBlogPost(data as Record<string, unknown>);
}

export async function createBlogPost(input: BlogPostInput): Promise<string> {
  const readTime = input.readTimeMinutes ?? calcReadTime(input.content);
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug:             input.slug,
      provider:         input.provider,
      exam_id:          input.examId ?? null,
      category:         input.category ?? null,
      tags:             input.tags ?? [],
      title:            input.title,
      title_en:         input.titleEn ?? null,
      title_ja:         input.titleJa ?? null,
      title_es:         input.titleEs ?? null,
      title_pt:         input.titlePt ?? null,
      excerpt:          input.excerpt ?? null,
      excerpt_en:       input.excerptEn ?? null,
      excerpt_ja:       input.excerptJa ?? null,
      excerpt_es:       input.excerptEs ?? null,
      excerpt_pt:       input.excerptPt ?? null,
      content:          input.content,
      content_en:       input.contentEn ?? null,
      content_ja:       input.contentJa ?? null,
      content_es:       input.contentEs ?? null,
      content_pt:       input.contentPt ?? null,
      cover_image_url:  input.coverImageUrl ?? null,
      read_time_minutes: readTime,
      ref_links:        input.refLinks ?? [],
      is_published:     input.isPublished ?? false,
      published_at:     input.isPublished ? (input.publishedAt ?? new Date().toISOString()) : null,
      is_pinned:        input.isPinned ?? false,
    })
    .select('id')
    .single();

  if (error) throw error;
  return (data as { id: string }).id;
}

export async function updateBlogPost(
  id: string,
  input: Partial<BlogPostInput>,
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (input.slug            !== undefined) payload.slug             = input.slug;
  if (input.provider        !== undefined) payload.provider         = input.provider;
  if (input.examId          !== undefined) payload.exam_id          = input.examId;
  if (input.category        !== undefined) payload.category         = input.category;
  if (input.tags            !== undefined) payload.tags             = input.tags;
  if (input.title           !== undefined) payload.title            = input.title;
  if (input.titleEn         !== undefined) payload.title_en         = input.titleEn;
  if (input.titleJa         !== undefined) payload.title_ja         = input.titleJa;
  if (input.titleEs         !== undefined) payload.title_es         = input.titleEs;
  if (input.titlePt         !== undefined) payload.title_pt         = input.titlePt;
  if (input.excerpt         !== undefined) payload.excerpt          = input.excerpt;
  if (input.excerptEn       !== undefined) payload.excerpt_en       = input.excerptEn;
  if (input.excerptJa       !== undefined) payload.excerpt_ja       = input.excerptJa;
  if (input.excerptEs       !== undefined) payload.excerpt_es       = input.excerptEs;
  if (input.excerptPt       !== undefined) payload.excerpt_pt       = input.excerptPt;
  if (input.content         !== undefined) {
    payload.content           = input.content;
    payload.read_time_minutes = input.readTimeMinutes ?? calcReadTime(input.content);
  }
  if (input.contentEn       !== undefined) payload.content_en       = input.contentEn;
  if (input.contentJa       !== undefined) payload.content_ja       = input.contentJa;
  if (input.contentEs       !== undefined) payload.content_es       = input.contentEs;
  if (input.contentPt       !== undefined) payload.content_pt       = input.contentPt;
  if (input.coverImageUrl   !== undefined) payload.cover_image_url  = input.coverImageUrl;
  if (input.refLinks        !== undefined) payload.ref_links        = input.refLinks;
  if (input.isPublished     !== undefined) {
    payload.is_published = input.isPublished;
    if (input.isPublished && !input.publishedAt) {
      payload.published_at = new Date().toISOString();
    }
  }
  if (input.publishedAt     !== undefined) payload.published_at     = input.publishedAt;
  if (input.isPinned        !== undefined) payload.is_pinned        = input.isPinned;

  const { error } = await supabase
    .from('blog_posts')
    .update(payload)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .update({ is_published: false })
    .eq('id', id);
  if (error) throw error;
}

/** 특정 provider의 게시된 포스트에 사용된 exam_id 목록 (중복 제거, 정렬) */
export async function getExamIdsForProvider(provider: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('exam_id')
    .eq('is_published', true)
    .eq('provider', provider)
    .not('exam_id', 'is', null);

  if (error) return [];
  const unique = [...new Set((data ?? []).map(r => (r as { exam_id: string }).exam_id))];
  return unique.sort();
}
