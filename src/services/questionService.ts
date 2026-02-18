import { supabase } from '@/lib/supabase';
import type { Question, ExamSet } from '@/types/exam';

interface QuestionRow {
  id: string;
  exam_id: string;
  text: string;
  correct_option_id: string;
  explanation: string;
  difficulty: number;
  key_points: string | null;
  key_point_images: string[] | null;
  ref_links: any;
  question_options: Array<{
    id: string;
    option_id: string;
    text: string;
    explanation: string | null;
    sort_order: number;
  }>;
  question_tags: Array<{
    tag: string;
  }>;
}

export async function getQuestionsForExam(examId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (
        id,
        option_id,
        text,
        explanation,
        sort_order
      ),
      question_tags (
        tag
      )
    `)
    .eq('exam_id', examId)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  if (!data) return [];

  return (data as unknown as QuestionRow[]).map(q => ({
    id: q.id,
    text: q.text,
    options: q.question_options
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(opt => ({
        id: opt.option_id,
        text: opt.text,
        explanation: opt.explanation ?? undefined,
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    tags: q.question_tags.map(t => t.tag),
    difficulty: q.difficulty as 1 | 2 | 3,
    keyPoints: q.key_points ?? undefined,
    keyPointImages: q.key_point_images ?? undefined,
    refLinks: q.ref_links ?? undefined,
  }));
}

export async function getQuestionById(questionId: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (
        id,
        option_id,
        text,
        explanation,
        sort_order
      ),
      question_tags (
        tag
      )
    `)
    .eq('id', questionId)
    .single();

  if (error) {
    console.error('Error fetching question:', error);
    return null;
  }

  if (!data) return null;

  const q = data as unknown as QuestionRow;

  return {
    id: q.id,
    text: q.text,
    options: q.question_options
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(opt => ({
        id: opt.option_id,
        text: opt.text,
        explanation: opt.explanation ?? undefined,
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    tags: q.question_tags.map(t => t.tag),
    difficulty: q.difficulty as 1 | 2 | 3,
    keyPoints: q.key_points ?? undefined,
    keyPointImages: q.key_point_images ?? undefined,
    refLinks: q.ref_links ?? undefined,
  };
}

export async function getQuestionsByIds(questionIds: string[]): Promise<Question[]> {
  if (questionIds.length === 0) return [];

  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (
        id,
        option_id,
        text,
        explanation,
        sort_order
      ),
      question_tags (
        tag
      )
    `)
    .in('id', questionIds);

  if (error) {
    console.error('Error fetching questions by IDs:', error);
    throw error;
  }

  if (!data) return [];

  return (data as unknown as QuestionRow[]).map(q => ({
    id: q.id,
    text: q.text,
    options: q.question_options
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(opt => ({
        id: opt.option_id,
        text: opt.text,
        explanation: opt.explanation ?? undefined,
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    tags: q.question_tags.map(t => t.tag),
    difficulty: q.difficulty as 1 | 2 | 3,
    keyPoints: q.key_points ?? undefined,
    keyPointImages: q.key_point_images ?? undefined,
    refLinks: q.ref_links ?? undefined,
  }));
}

export async function getQuestionsByDifficulty(
  examId: string,
  difficulty: 1 | 2 | 3
): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (
        id,
        option_id,
        text,
        explanation,
        sort_order
      ),
      question_tags (
        tag
      )
    `)
    .eq('exam_id', examId)
    .eq('difficulty', difficulty)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching questions by difficulty:', error);
    throw error;
  }

  if (!data) return [];

  return (data as unknown as QuestionRow[]).map(q => ({
    id: q.id,
    text: q.text,
    options: q.question_options
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(opt => ({
        id: opt.option_id,
        text: opt.text,
        explanation: opt.explanation ?? undefined,
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    tags: q.question_tags.map(t => t.tag),
    difficulty: q.difficulty as 1 | 2 | 3,
    keyPoints: q.key_points ?? undefined,
    keyPointImages: q.key_point_images ?? undefined,
    refLinks: q.ref_links ?? undefined,
  }));
}

export async function getSetsForExam(examId: string): Promise<ExamSet[]> {
  const { data, error } = await supabase
    .from('exam_sets_view')
    .select('*')
    .eq('exam_id', examId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching exam sets:', error);
    return [];
  }

  return (data || []).map((s: any) => ({
    id: s.id,
    examId: s.exam_id,
    name: s.name,
    type: s.type as 'full' | 'sample',
    description: s.description,
    questionCount: s.question_count || 0,
    sortOrder: s.sort_order,
    isActive: s.is_active,
  }));
}

export async function getQuestionsForSet(setId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('exam_set_questions')
    .select(`
      sort_order,
      questions!inner (
        id,
        text,
        correct_option_id,
        explanation,
        difficulty,
        key_points,
        key_point_images,
        ref_links,
        question_options (
          option_id,
          text,
          explanation,
          sort_order
        ),
        question_tags (
          tag
        )
      )
    `)
    .eq('set_id', setId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching questions for set:', error);
    return [];
  }

  return (data || []).map((row: any) => {
    const q = row.questions;
    return {
      id: q.id,
      text: q.text,
      options: (q.question_options as any[])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((opt: any) => ({ id: opt.option_id, text: opt.text, explanation: opt.explanation ?? undefined })),
      correctOptionId: q.correct_option_id,
      explanation: q.explanation,
      tags: (q.question_tags as any[]).map((t: any) => t.tag),
      difficulty: q.difficulty as 1 | 2 | 3,
      keyPoints: q.key_points ?? undefined,
      refLinks: q.ref_links ?? undefined,
    };
  });
}

export async function getQuestionsByTag(examId: string, tag: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options (
        id,
        option_id,
        text,
        explanation,
        sort_order
      ),
      question_tags!inner (
        tag
      )
    `)
    .eq('exam_id', examId)
    .eq('question_tags.tag', tag)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching questions by tag:', error);
    throw error;
  }

  if (!data) return [];

  return (data as unknown as QuestionRow[]).map(q => ({
    id: q.id,
    text: q.text,
    options: q.question_options
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(opt => ({
        id: opt.option_id,
        text: opt.text,
        explanation: opt.explanation ?? undefined,
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    tags: q.question_tags.map(t => t.tag),
    difficulty: q.difficulty as 1 | 2 | 3,
    keyPoints: q.key_points ?? undefined,
    keyPointImages: q.key_point_images ?? undefined,
    refLinks: q.ref_links ?? undefined,
  }));
}
