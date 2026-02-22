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

// ─── 구독 / 프로필 관리 ───────────────────────────────────────────────────────

export interface ProfileResult {
  id: string;
  email: string | null;
  subscription_tier: 'free' | 'premium';
  subscription_expires_at: string | null;
  created_at: string;
}

export async function getAllProfiles(
  page: number = 0,
  pageSize: number = 20,
  filterTier?: 'free' | 'premium',
  searchEmail?: string,
): Promise<{ data: ProfileResult[]; count: number }> {
  let query = supabase
    .from('profiles')
    .select('id, email, subscription_tier, subscription_expires_at, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filterTier) query = query.eq('subscription_tier', filterTier);
  if (searchEmail?.trim()) query = query.ilike('email', `%${searchEmail.trim()}%`);
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data || []) as ProfileResult[], count: count ?? 0 };
}

export async function updateSubscriptionTier(
  userId: string,
  tier: 'free' | 'premium',
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', userId);
  if (error) throw error;
}

// ─── 통계 / 분석 ──────────────────────────────────────────────────────────────

export interface OverviewStats {
  todaySessions: number;
  weekSubmitted: number;
  avgScore: number | null;
  inProgressSessions: number;
  newUsersWeek: number;
}

export interface RecentSession {
  id: string;
  examTitle: string;
  examId: string;
  score: number | null;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  userEmail: string | null;
  durationSec: number | null;
  pausedElapsed: number;
}

export interface ExamStat {
  examId: string;
  examTitle: string;
  totalSessions: number;
  submittedSessions: number;
  avgScore: number | null;
  passRate: number | null;     // % 점수 >= 70
  avgDurationMin: number | null;
  topWeakTags: { tag: string; correctRate: number; total: number }[];
}

export interface SetStat {
  setId: string | null;
  setName: string;
  examId: string;
  examTitle: string;
  totalSessions: number;
  submittedSessions: number;
  avgScore: number | null;
  avgDurationMin: number | null;
}

export interface HourStat {
  hour: number;   // 0-23
  count: number;
}

export interface WeekdayStat {
  day: number;    // 0=일, 1=월 ... 6=토
  count: number;
}

export async function getAdminOverview(): Promise<OverviewStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [todayRes, weekRes, avgRes, inProgressRes, newUsersRes] = await Promise.all([
    supabase
      .from('exam_sessions')
      .select('id', { count: 'exact', head: true })
      .gte('started_at', todayStart),
    supabase
      .from('exam_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'submitted')
      .gte('submitted_at', weekAgo),
    supabase
      .from('exam_sessions')
      .select('score')
      .eq('status', 'submitted')
      .not('score', 'is', null),
    supabase
      .from('exam_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'in_progress'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo),
  ]);

  const scores = (avgRes.data || []).map((r: any) => r.score as number);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  return {
    todaySessions: todayRes.count ?? 0,
    weekSubmitted: weekRes.count ?? 0,
    avgScore,
    inProgressSessions: inProgressRes.count ?? 0,
    newUsersWeek: newUsersRes.count ?? 0,
  };
}

export async function getRecentSessions(limit: number = 10): Promise<RecentSession[]> {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('id, exam_title, exam_id, score, status, started_at, submitted_at, paused_elapsed, user_id')
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  const rows = (data || []) as any[];

  // Fetch emails for user_ids in batch
  const userIds = [...new Set(rows.map((r: any) => r.user_id).filter(Boolean))];
  let emailMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);
    (profiles || []).forEach((p: any) => { emailMap[p.id] = p.email ?? ''; });
  }

  return rows.map((r: any) => {
    const startMs = new Date(r.started_at).getTime();
    const endMs = r.submitted_at ? new Date(r.submitted_at).getTime() : null;
    const durationSec = endMs ? Math.max(0, Math.round((endMs - startMs) / 1000) - (r.paused_elapsed ?? 0)) : null;
    return {
      id: r.id,
      examTitle: r.exam_title,
      examId: r.exam_id,
      score: r.score,
      status: r.status,
      startedAt: r.started_at,
      submittedAt: r.submitted_at,
      userEmail: r.user_id ? (emailMap[r.user_id] ?? null) : null,
      durationSec,
      pausedElapsed: r.paused_elapsed ?? 0,
    };
  });
}

export async function getExamStats(): Promise<ExamStat[]> {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('exam_id, exam_title, status, score, started_at, submitted_at, paused_elapsed, tag_breakdown');
  if (error) throw error;

  const rows = (data || []) as any[];
  const examMap: Record<string, {
    examTitle: string;
    total: number;
    submitted: number;
    scores: number[];
    durations: number[];
    tagTotals: Record<string, { correct: number; total: number }>;
  }> = {};

  for (const r of rows) {
    if (!examMap[r.exam_id]) {
      examMap[r.exam_id] = { examTitle: r.exam_title, total: 0, submitted: 0, scores: [], durations: [], tagTotals: {} };
    }
    const e = examMap[r.exam_id];
    e.total++;
    if (r.status === 'submitted') {
      e.submitted++;
      if (r.score !== null) e.scores.push(r.score);
      if (r.submitted_at) {
        const dur = Math.max(0, (new Date(r.submitted_at).getTime() - new Date(r.started_at).getTime()) / 1000 - (r.paused_elapsed ?? 0));
        e.durations.push(dur);
      }
      if (r.tag_breakdown) {
        for (const [tag, stats] of Object.entries(r.tag_breakdown as Record<string, { correct: number; total: number }>)) {
          if (!e.tagTotals[tag]) e.tagTotals[tag] = { correct: 0, total: 0 };
          e.tagTotals[tag].correct += stats.correct;
          e.tagTotals[tag].total += stats.total;
        }
      }
    }
  }

  return Object.entries(examMap).map(([examId, e]) => {
    const avgScore = e.scores.length > 0 ? Math.round(e.scores.reduce((a, b) => a + b, 0) / e.scores.length) : null;
    const passRate = e.scores.length > 0 ? Math.round((e.scores.filter(s => s >= 70).length / e.scores.length) * 100) : null;
    const avgDurationMin = e.durations.length > 0 ? Math.round(e.durations.reduce((a, b) => a + b, 0) / e.durations.length / 60) : null;
    const topWeakTags = Object.entries(e.tagTotals)
      .filter(([, v]) => v.total >= 3)
      .map(([tag, v]) => ({ tag, correctRate: Math.round((v.correct / v.total) * 100), total: v.total }))
      .sort((a, b) => a.correctRate - b.correctRate)
      .slice(0, 5);
    return { examId, examTitle: e.examTitle, totalSessions: e.total, submittedSessions: e.submitted, avgScore, passRate, avgDurationMin, topWeakTags };
  });
}

export async function getSetStats(): Promise<SetStat[]> {
  // Join exam_sessions with exam_sets via set_id
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('exam_id, exam_title, status, score, started_at, submitted_at, paused_elapsed, set_id, exam_sets(name)');
  if (error) throw error;

  const rows = (data || []) as any[];
  const setMap: Record<string, {
    setName: string;
    examId: string;
    examTitle: string;
    total: number;
    submitted: number;
    scores: number[];
    durations: number[];
  }> = {};

  for (const r of rows) {
    const key = r.set_id ?? '__none__';
    const setName = r.set_id ? (r.exam_sets?.name ?? '(알 수 없음)') : '(미분류)';
    if (!setMap[key]) {
      setMap[key] = { setName, examId: r.exam_id, examTitle: r.exam_title, total: 0, submitted: 0, scores: [], durations: [] };
    }
    const s = setMap[key];
    s.total++;
    if (r.status === 'submitted') {
      s.submitted++;
      if (r.score !== null) s.scores.push(r.score);
      if (r.submitted_at) {
        const dur = Math.max(0, (new Date(r.submitted_at).getTime() - new Date(r.started_at).getTime()) / 1000 - (r.paused_elapsed ?? 0));
        s.durations.push(dur);
      }
    }
  }

  return Object.entries(setMap).map(([setId, s]) => ({
    setId: setId === '__none__' ? null : setId,
    setName: s.setName,
    examId: s.examId,
    examTitle: s.examTitle,
    totalSessions: s.total,
    submittedSessions: s.submitted,
    avgScore: s.scores.length > 0 ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) : null,
    avgDurationMin: s.durations.length > 0 ? Math.round(s.durations.reduce((a, b) => a + b, 0) / s.durations.length / 60) : null,
  })).sort((a, b) => b.totalSessions - a.totalSessions);
}

export async function getHourlyActivity(days: number = 30): Promise<{ hourly: HourStat[]; weekday: WeekdayStat[] }> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('started_at')
    .gte('started_at', since);
  if (error) throw error;

  const hourly: HourStat[] = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  const weekday: WeekdayStat[] = Array.from({ length: 7 }, (_, d) => ({ day: d, count: 0 }));

  for (const r of (data || []) as any[]) {
    const d = new Date(r.started_at);
    hourly[d.getHours()].count++;
    weekday[d.getDay()].count++;
  }

  return { hourly, weekday };
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
