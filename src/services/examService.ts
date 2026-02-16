import { supabase } from '@/lib/supabase';
import type { ExamConfig } from '@/types/exam';

export async function getAllExams(): Promise<ExamConfig[]> {
  const { data, error } = await supabase
    .from('exam_list')
    .select('*')
    .order('code', { ascending: true });

  if (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }

  return (data || []).map(exam => ({
    id: exam.id,
    title: exam.title,
    code: exam.code,
    certification: exam.certification as 'AWS' | 'GCP' | 'Azure',
    description: exam.description,
    timeLimitMinutes: exam.time_limit_minutes,
    passingScore: exam.passing_score,
    version: exam.version,
    questionCount: exam.question_count || 0,
  }));
}

export async function getExamById(examId: string): Promise<ExamConfig | null> {
  const { data, error } = await supabase
    .from('exam_list')
    .select('*')
    .eq('id', examId)
    .single();

  if (error) {
    console.error('Error fetching exam:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    code: data.code,
    certification: data.certification as 'AWS' | 'GCP' | 'Azure',
    description: data.description,
    timeLimitMinutes: data.time_limit_minutes,
    passingScore: data.passing_score,
    version: data.version,
    questionCount: data.question_count || 0,
  };
}
