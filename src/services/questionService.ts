import { supabase } from '@/lib/supabase';
import type { Question } from '@/types/exam';

interface QuestionRow {
  id: string;
  exam_id: string;
  text: string;
  correct_option_id: string;
  explanation: string;
  difficulty: number;
  question_options: Array<{
    id: string;
    option_id: string;
    text: string;
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
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    tags: q.question_tags.map(t => t.tag),
    difficulty: q.difficulty as 1 | 2 | 3,
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
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    tags: q.question_tags.map(t => t.tag),
    difficulty: q.difficulty as 1 | 2 | 3,
  };
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
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    tags: q.question_tags.map(t => t.tag),
    difficulty: q.difficulty as 1 | 2 | 3,
  }));
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
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    tags: q.question_tags.map(t => t.tag),
    difficulty: q.difficulty as 1 | 2 | 3,
  }));
}
