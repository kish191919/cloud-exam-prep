import { supabase } from '@/lib/supabase';
import type { ExamSession, Question } from '@/types/exam';
import { getQuestionsForExam } from './questionService';

// Helper to convert database session to ExamSession type
function dbToExamSession(dbSession: any, questions: Question[]): ExamSession {
  return {
    id: dbSession.id,
    examId: dbSession.exam_id,
    examTitle: dbSession.exam_title,
    status: dbSession.status,
    startedAt: new Date(dbSession.started_at).getTime(),
    pausedElapsed: dbSession.paused_elapsed,
    submittedAt: dbSession.submitted_at ? new Date(dbSession.submitted_at).getTime() : undefined,
    timeLimitSec: dbSession.time_limit_sec,
    answers: dbSession.answers || {},
    bookmarks: dbSession.bookmarks || [],
    currentIndex: dbSession.current_index,
    questions,
    score: dbSession.score,
    correctCount: dbSession.correct_count,
    totalCount: dbSession.total_count,
    tagBreakdown: dbSession.tag_breakdown || undefined,
  };
}

export async function createSession(
  examId: string,
  examTitle: string,
  questions: Question[],
  timeLimitMinutes: number,
  userId?: string,
  setId?: string
): Promise<string> {
  // @ts-ignore - Supabase type inference issue
  const { data, error } = await supabase
    .from('exam_sessions')
    .insert({
      exam_id: examId,
      exam_title: examTitle,
      status: 'in_progress' as const,
      time_limit_sec: timeLimitMinutes * 60,
      user_id: userId || null,
      set_id: setId || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create session');
  }

  return data.id;
}

export async function getSession(
  sessionId: string,
  questions?: Question[]
): Promise<ExamSession | null> {
  // @ts-ignore - Supabase type inference issue
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  if (!data) return null;

  // If questions not provided, load them from database
  let sessionQuestions = questions || [];
  if (!questions || questions.length === 0) {
    try {
      // @ts-ignore - Supabase type inference issue
      sessionQuestions = await getQuestionsForExam(data.exam_id);
    } catch (error) {
      console.error('Error loading questions for session:', error);
      return null;
    }
  }

  return dbToExamSession(data, sessionQuestions);
}

export async function getAllSessions(userId?: string): Promise<ExamSession[]> {
  let query = supabase
    .from('exam_sessions')
    .select('*')
    .order('started_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.is('user_id', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }

  // Return sessions without questions - questions will be loaded separately when needed
  // This avoids fetching the same questions multiple times
  return (data || []).map(s => dbToExamSession(s, []));
}

export async function updateSession(session: ExamSession): Promise<void> {
  // @ts-ignore - Supabase type inference issue
  const { error } = await supabase
    .from('exam_sessions')
    .update({
      status: session.status,
      paused_elapsed: session.pausedElapsed,
      submitted_at: session.submittedAt ? new Date(session.submittedAt).toISOString() : null,
      answers: session.answers,
      bookmarks: session.bookmarks,
      current_index: session.currentIndex,
      score: session.score,
      correct_count: session.correctCount,
      total_count: session.totalCount,
      tag_breakdown: session.tagBreakdown,
    })
    .eq('id', session.id);

  if (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('exam_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}
