import { supabase } from '@/lib/supabase';
import type { Question, ExamSet } from '@/types/exam';

function parseRefLinks(raw: any): { name: string; url: string }[] | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return Array.isArray(raw) ? raw : [];
}

interface QuestionRow {
  id: string;
  exam_id: string;
  text: string;
  text_en: string | null;
  text_pt: string | null;
  text_es: string | null;
  text_ja: string | null;
  correct_option_id: string;
  explanation: string;
  explanation_en: string | null;
  explanation_pt: string | null;
  explanation_es: string | null;
  explanation_ja: string | null;
  key_points: string | null;
  key_points_en: string | null;
  key_points_pt: string | null;
  key_points_es: string | null;
  key_points_ja: string | null;
  ref_links: any;
  question_options: Array<{
    id: string;
    option_id: string;
    text: string;
    text_en: string | null;
    text_pt: string | null;
    text_es: string | null;
    text_ja: string | null;
    explanation: string | null;
    explanation_en: string | null;
    explanation_pt: string | null;
    explanation_es: string | null;
    explanation_ja: string | null;
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
        text_en,
        text_pt,
        text_es,
        text_ja,
        explanation,
        explanation_en,
        explanation_pt,
        explanation_es,
        explanation_ja,
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
    textEn: q.text_en ?? undefined,
    textPt: q.text_pt ?? undefined,
    textEs: q.text_es ?? undefined,
    textJa: q.text_ja ?? undefined,
    options: q.question_options
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(opt => ({
        id: opt.option_id,
        text: opt.text,
        textEn: opt.text_en ?? undefined,
        textPt: opt.text_pt ?? undefined,
        textEs: opt.text_es ?? undefined,
        textJa: opt.text_ja ?? undefined,
        explanation: opt.explanation ?? undefined,
        explanationEn: opt.explanation_en ?? undefined,
        explanationPt: opt.explanation_pt ?? undefined,
        explanationEs: opt.explanation_es ?? undefined,
        explanationJa: opt.explanation_ja ?? undefined,
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    explanationEn: q.explanation_en ?? undefined,
    explanationPt: q.explanation_pt ?? undefined,
    explanationEs: q.explanation_es ?? undefined,
    explanationJa: q.explanation_ja ?? undefined,
    tags: q.question_tags.map(t => t.tag),
    keyPoints: q.key_points ?? undefined,
    keyPointsEn: q.key_points_en ?? undefined,
    keyPointsPt: q.key_points_pt ?? undefined,
    keyPointsEs: q.key_points_es ?? undefined,
    keyPointsJa: q.key_points_ja ?? undefined,
    refLinks: parseRefLinks(q.ref_links),
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
        text_en,
        text_pt,
        text_es,
        text_ja,
        explanation,
        explanation_en,
        explanation_pt,
        explanation_es,
        explanation_ja,
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
    textEn: q.text_en ?? undefined,
    textPt: q.text_pt ?? undefined,
    textEs: q.text_es ?? undefined,
    textJa: q.text_ja ?? undefined,
    options: q.question_options
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(opt => ({
        id: opt.option_id,
        text: opt.text,
        textEn: opt.text_en ?? undefined,
        textPt: opt.text_pt ?? undefined,
        textEs: opt.text_es ?? undefined,
        textJa: opt.text_ja ?? undefined,
        explanation: opt.explanation ?? undefined,
        explanationEn: opt.explanation_en ?? undefined,
        explanationPt: opt.explanation_pt ?? undefined,
        explanationEs: opt.explanation_es ?? undefined,
        explanationJa: opt.explanation_ja ?? undefined,
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    explanationEn: q.explanation_en ?? undefined,
    explanationPt: q.explanation_pt ?? undefined,
    explanationEs: q.explanation_es ?? undefined,
    explanationJa: q.explanation_ja ?? undefined,
    tags: q.question_tags.map(t => t.tag),
    keyPoints: q.key_points ?? undefined,
    keyPointsEn: q.key_points_en ?? undefined,
    keyPointsPt: q.key_points_pt ?? undefined,
    keyPointsEs: q.key_points_es ?? undefined,
    keyPointsJa: q.key_points_ja ?? undefined,
    refLinks: parseRefLinks(q.ref_links),
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
        text_en,
        text_pt,
        text_es,
        text_ja,
        explanation,
        explanation_en,
        explanation_pt,
        explanation_es,
        explanation_ja,
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

  const mapped = new Map(
    (data as unknown as QuestionRow[]).map(q => [q.id, {
      id: q.id,
      text: q.text,
      textEn: q.text_en ?? undefined,
      textPt: q.text_pt ?? undefined,
      textEs: q.text_es ?? undefined,
      textJa: q.text_ja ?? undefined,
      options: q.question_options
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(opt => ({
          id: opt.option_id,
          text: opt.text,
          textEn: opt.text_en ?? undefined,
          textPt: opt.text_pt ?? undefined,
          textEs: opt.text_es ?? undefined,
          textJa: opt.text_ja ?? undefined,
          explanation: opt.explanation ?? undefined,
          explanationEn: opt.explanation_en ?? undefined,
          explanationPt: opt.explanation_pt ?? undefined,
          explanationEs: opt.explanation_es ?? undefined,
          explanationJa: opt.explanation_ja ?? undefined,
        })),
      correctOptionId: q.correct_option_id,
      explanation: q.explanation,
      explanationEn: q.explanation_en ?? undefined,
      explanationPt: q.explanation_pt ?? undefined,
      explanationEs: q.explanation_es ?? undefined,
      explanationJa: q.explanation_ja ?? undefined,
      tags: q.question_tags.map(t => t.tag),
      keyPoints: q.key_points ?? undefined,
      keyPointsEn: q.key_points_en ?? undefined,
      keyPointsPt: q.key_points_pt ?? undefined,
      keyPointsEs: q.key_points_es ?? undefined,
      keyPointsJa: q.key_points_ja ?? undefined,
      refLinks: parseRefLinks(q.ref_links),
    }])
  );

  // Preserve the order of questionIds (e.g. shuffled sort_order from exam_set_questions)
  return questionIds.map(id => mapped.get(id)).filter((q): q is Question => q !== undefined);
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
        *,
        question_options (
          option_id,
          text,
          text_en,
          text_pt,
          text_es,
          text_ja,
          explanation,
          explanation_en,
          explanation_pt,
          explanation_es,
          explanation_ja,
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
      textEn: q.text_en ?? undefined,
      textPt: q.text_pt ?? undefined,
      textEs: q.text_es ?? undefined,
      textJa: q.text_ja ?? undefined,
      options: (q.question_options as any[])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((opt: any) => ({
          id: opt.option_id,
          text: opt.text,
          textEn: opt.text_en ?? undefined,
          textPt: opt.text_pt ?? undefined,
          textEs: opt.text_es ?? undefined,
          textJa: opt.text_ja ?? undefined,
          explanation: opt.explanation ?? undefined,
          explanationEn: opt.explanation_en ?? undefined,
          explanationPt: opt.explanation_pt ?? undefined,
          explanationEs: opt.explanation_es ?? undefined,
          explanationJa: opt.explanation_ja ?? undefined,
        })),
      correctOptionId: q.correct_option_id,
      explanation: q.explanation,
      explanationEn: q.explanation_en ?? undefined,
      explanationPt: q.explanation_pt ?? undefined,
      explanationEs: q.explanation_es ?? undefined,
      explanationJa: q.explanation_ja ?? undefined,
      tags: (q.question_tags as any[]).map((t: any) => t.tag),
      keyPoints: q.key_points ?? undefined,
      keyPointsEn: q.key_points_en ?? undefined,
      keyPointsPt: q.key_points_pt ?? undefined,
      keyPointsEs: q.key_points_es ?? undefined,
      keyPointsJa: q.key_points_ja ?? undefined,
      refLinks: parseRefLinks(q.ref_links),
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
        text_en,
        text_pt,
        text_es,
        text_ja,
        explanation,
        explanation_en,
        explanation_pt,
        explanation_es,
        explanation_ja,
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
    textEn: q.text_en ?? undefined,
    textPt: q.text_pt ?? undefined,
    textEs: q.text_es ?? undefined,
    textJa: q.text_ja ?? undefined,
    options: q.question_options
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(opt => ({
        id: opt.option_id,
        text: opt.text,
        textEn: opt.text_en ?? undefined,
        textPt: opt.text_pt ?? undefined,
        textEs: opt.text_es ?? undefined,
        textJa: opt.text_ja ?? undefined,
        explanation: opt.explanation ?? undefined,
        explanationEn: opt.explanation_en ?? undefined,
        explanationPt: opt.explanation_pt ?? undefined,
        explanationEs: opt.explanation_es ?? undefined,
        explanationJa: opt.explanation_ja ?? undefined,
      })),
    correctOptionId: q.correct_option_id,
    explanation: q.explanation,
    explanationEn: q.explanation_en ?? undefined,
    explanationPt: q.explanation_pt ?? undefined,
    explanationEs: q.explanation_es ?? undefined,
    explanationJa: q.explanation_ja ?? undefined,
    tags: q.question_tags.map(t => t.tag),
    keyPoints: q.key_points ?? undefined,
    keyPointsEn: q.key_points_en ?? undefined,
    keyPointsPt: q.key_points_pt ?? undefined,
    keyPointsEs: q.key_points_es ?? undefined,
    keyPointsJa: q.key_points_ja ?? undefined,
    refLinks: parseRefLinks(q.ref_links),
  }));
}
