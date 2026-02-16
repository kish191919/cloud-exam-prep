import { supabase } from '@/lib/supabase';

export interface ExamSetInput {
  examId: string;
  name: string;
  type: 'full' | 'sample';
  description?: string;
  sortOrder?: number;
}

export async function createExamSet(input: ExamSetInput): Promise<string> {
  const { data, error } = await supabase
    .from('exam_sets')
    .insert({
      exam_id: input.examId,
      name: input.name,
      type: input.type,
      description: input.description || null,
      sort_order: input.sortOrder ?? 0,
    })
    .select('id')
    .single();

  if (error) throw error;
  return (data as any).id;
}

export async function updateExamSet(setId: string, updates: Partial<Omit<ExamSetInput, 'examId'>>): Promise<void> {
  const payload: Record<string, any> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

  const { error } = await supabase
    .from('exam_sets')
    .update(payload)
    .eq('id', setId);

  if (error) throw error;
}

export async function deleteExamSet(setId: string): Promise<void> {
  const { error } = await supabase
    .from('exam_sets')
    .delete()
    .eq('id', setId);

  if (error) throw error;
}

export async function getSetQuestionIds(setId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('exam_set_questions')
    .select('question_id')
    .eq('set_id', setId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map((r: any) => r.question_id);
}

export async function updateSetQuestions(setId: string, questionIds: string[]): Promise<void> {
  // Delete all existing assignments for this set
  const { error: delError } = await supabase
    .from('exam_set_questions')
    .delete()
    .eq('set_id', setId);

  if (delError) throw delError;

  if (questionIds.length === 0) return;

  const rows = questionIds.map((qId, idx) => ({
    set_id: setId,
    question_id: qId,
    sort_order: idx + 1,
  }));

  const { error: insError } = await supabase
    .from('exam_set_questions')
    .insert(rows);

  if (insError) throw insError;
}
