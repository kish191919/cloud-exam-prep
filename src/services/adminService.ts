import { supabase } from '@/lib/supabase';

// ─── Exam Set CRUD ────────────────────────────────────────────────────────────

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
  const { error: delError } = await supabase
    .from('exam_set_questions')
    .delete()
    .eq('set_id', setId);

  if (delError) throw delError;
  if (questionIds.length === 0) return;

  const { error: insError } = await supabase
    .from('exam_set_questions')
    .insert(questionIds.map((qId, idx) => ({ set_id: setId, question_id: qId, sort_order: idx + 1 })));

  if (insError) throw insError;
}

// ─── Question CRUD ────────────────────────────────────────────────────────────

export interface QuestionInput {
  examId: string;
  text: string;
  options: { id: 'a' | 'b' | 'c' | 'd'; text: string; explanation?: string }[];
  correctOptionId: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags: string[];
  keyPoints?: string;
  refLinks?: { name: string; url: string }[];
}

/** Generate a unique question ID */
function genQuestionId(examId: string): string {
  const prefix = examId.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 8);
  return `${prefix}-q${Date.now()}`;
}

export async function createQuestion(input: QuestionInput): Promise<string> {
  const questionId = genQuestionId(input.examId);

  const { error: qErr } = await supabase
    .from('questions')
    .insert({
      id: questionId,
      exam_id: input.examId,
      text: input.text,
      correct_option_id: input.correctOptionId,
      explanation: input.explanation,
      difficulty: input.difficulty,
      key_points: input.keyPoints ?? null,
      ref_links: input.refLinks ?? [],
    });
  if (qErr) throw qErr;

  const { error: optErr } = await supabase
    .from('question_options')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(input.options.map((opt, idx) => ({
      question_id: questionId,
      option_id: opt.id,
      text: opt.text,
      explanation: opt.explanation ?? null,
      sort_order: idx + 1,
    })) as any);
  if (optErr) throw optErr;

  const trimmedTags = input.tags.map(t => t.trim()).filter(Boolean);
  if (trimmedTags.length > 0) {
    const { error: tagErr } = await supabase
      .from('question_tags')
      .insert(trimmedTags.map(tag => ({ question_id: questionId, tag })));
    if (tagErr) throw tagErr;
  }

  return questionId;
}

export async function updateQuestion(questionId: string, input: Omit<QuestionInput, 'examId'>): Promise<void> {
  const { error: qErr } = await supabase
    .from('questions')
    .update({
      text: input.text,
      correct_option_id: input.correctOptionId,
      explanation: input.explanation,
      difficulty: input.difficulty,
      key_points: input.keyPoints ?? null,
      ref_links: input.refLinks ?? [],
    })
    .eq('id', questionId);
  if (qErr) throw qErr;

  // Re-insert options
  await supabase.from('question_options').delete().eq('question_id', questionId);
  const { error: optErr } = await supabase
    .from('question_options')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(input.options.map((opt, idx) => ({
      question_id: questionId,
      option_id: opt.id,
      text: opt.text,
      explanation: opt.explanation ?? null,
      sort_order: idx + 1,
    })) as any);
  if (optErr) throw optErr;

  // Re-insert tags
  await supabase.from('question_tags').delete().eq('question_id', questionId);
  const trimmedTags = input.tags.map(t => t.trim()).filter(Boolean);
  if (trimmedTags.length > 0) {
    const { error: tagErr } = await supabase
      .from('question_tags')
      .insert(trimmedTags.map(tag => ({ question_id: questionId, tag })));
    if (tagErr) throw tagErr;
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);
  if (error) throw error;
}

/**
 * Returns a map of questionId -> setId[] for all questions in an exam.
 */
export async function getExamSetQuestionMap(examId: string): Promise<Record<string, string[]>> {
  // First get all set IDs for this exam
  const { data: sets, error: setsErr } = await supabase
    .from('exam_sets')
    .select('id')
    .eq('exam_id', examId);
  if (setsErr) throw setsErr;
  const setIds = (sets || []).map((s: any) => s.id);
  if (setIds.length === 0) return {};

  const { data, error } = await supabase
    .from('exam_set_questions')
    .select('question_id, set_id')
    .in('set_id', setIds);
  if (error) throw error;

  const map: Record<string, string[]> = {};
  for (const row of (data || []) as any[]) {
    if (!map[row.question_id]) map[row.question_id] = [];
    map[row.question_id].push(row.set_id);
  }
  return map;
}

/**
 * Move a question from one set to another.
 * Removes from oldSetId (if provided) and adds to newSetId.
 */
export async function moveQuestionToSet(
  questionId: string,
  newSetId: string,
  oldSetId?: string,
): Promise<void> {
  if (oldSetId) {
    const oldIds = await getSetQuestionIds(oldSetId);
    await updateSetQuestions(oldSetId, oldIds.filter(id => id !== questionId));
  }
  const newIds = await getSetQuestionIds(newSetId);
  if (!newIds.includes(questionId)) {
    await updateSetQuestions(newSetId, [...newIds, questionId]);
  }
}

export async function bulkCreateQuestions(
  examId: string,
  questions: Omit<QuestionInput, 'examId'>[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ success: number; errors: string[] }> {
  let success = 0;
  const errors: string[] = [];

  for (let i = 0; i < questions.length; i++) {
    try {
      await createQuestion({ ...questions[i], examId });
      success++;
    } catch (e: any) {
      errors.push(`Row ${i + 2}: ${e.message ?? String(e)}`);
    }
    onProgress?.(i + 1, questions.length);
  }

  return { success, errors };
}
