import { useState, useEffect, useCallback } from 'react';
import { ExamSession, ExamMode, Question } from '@/types/exam';
import * as sessionService from '@/services/sessionService';

// Keep localStorage as fallback for offline support
const SESSIONS_KEY = 'cloudmaster_sessions';
const modeKey = (id: string) => `cloudmaster_mode_${id}`;

function loadSessionsFromLocalStorage(): Record<string, ExamSession> {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSessionsToLocalStorage(sessions: Record<string, ExamSession>) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function createSession(
  examId: string,
  examTitle: string,
  questions: Question[],
  timeLimitMinutes: number,
  mode: ExamMode = 'exam',
  userId?: string
): Promise<string> {
  try {
    // Try to create in Supabase first
    const sessionId = await sessionService.createSession(
      examId,
      examTitle,
      questions,
      timeLimitMinutes,
      userId
    );
    // Store mode in localStorage (DB doesn't have a mode column)
    localStorage.setItem(modeKey(sessionId), mode);
    return sessionId;
  } catch (error) {
    console.warn('Failed to create session in Supabase, using localStorage:', error);
    // Fallback to localStorage
    const sessionId = `session_${Date.now()}`;
    const session: ExamSession = {
      id: sessionId,
      examId,
      examTitle,
      status: 'in_progress',
      mode,
      startedAt: Date.now(),
      pausedElapsed: 0,
      timeLimitSec: timeLimitMinutes * 60,
      answers: {},
      bookmarks: [],
      currentIndex: 0,
      questions,
    };
    const sessions = loadSessionsFromLocalStorage();
    sessions[sessionId] = session;
    saveSessionsToLocalStorage(sessions);
    return sessionId;
  }
}

export function getAllSessions(): ExamSession[] {
  // For now, use localStorage (will be updated when auth is implemented)
  return Object.values(loadSessionsFromLocalStorage()).sort((a, b) => b.startedAt - a.startedAt);
}

export async function getSession(
  sessionId: string
): Promise<ExamSession | null> {
  try {
    // Try Supabase first
    const session = await sessionService.getSession(sessionId);
    if (session) {
      // Attach mode from localStorage
      const storedMode = localStorage.getItem(modeKey(sessionId)) as ExamMode | null;
      if (storedMode) session.mode = storedMode;
      return session;
    }
  } catch (error) {
    console.warn('Failed to fetch session from Supabase, using localStorage:', error);
  }

  // Fallback to localStorage (mode already in session object)
  return loadSessionsFromLocalStorage()[sessionId] || null;
}

export function useExamSession(sessionId: string | null) {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const s = await getSession(sessionId);
        setSession(s);
      } catch (error) {
        console.error('Error loading session:', error);
        // Fallback to localStorage
        const localSession = loadSessionsFromLocalStorage()[sessionId] || null;
        setSession(localSession);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  useEffect(() => {
    async function saveSession() {
      if (!session) return;

      try {
        // Try to save to Supabase
        await sessionService.updateSession(session);
      } catch (error) {
        console.warn('Failed to update session in Supabase, using localStorage:', error);
        // Fallback to localStorage
        const sessions = loadSessionsFromLocalStorage();
        sessions[session.id] = session;
        saveSessionsToLocalStorage(sessions);
      }
    }

    if (!loading && session) {
      saveSession();
    }
  }, [session, loading]);

  const selectAnswer = useCallback((questionId: string, optionId: string) => {
    setSession(prev => prev ? {
      ...prev,
      answers: { ...prev.answers, [questionId]: optionId },
    } : null);
  }, []);

  const toggleBookmark = useCallback((questionId: string) => {
    setSession(prev => {
      if (!prev) return null;
      const bookmarks = prev.bookmarks.includes(questionId)
        ? prev.bookmarks.filter(id => id !== questionId)
        : [...prev.bookmarks, questionId];
      return { ...prev, bookmarks };
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setSession(prev => prev ? { ...prev, currentIndex: index } : null);
  }, []);

  const submitExam = useCallback(() => {
    setSession(prev => {
      if (!prev || prev.status === 'submitted') return prev;
      let correct = 0;
      const tagStats: Record<string, { correct: number; total: number }> = {};
      prev.questions.forEach(q => {
        q.tags.forEach(tag => {
          if (!tagStats[tag]) tagStats[tag] = { correct: 0, total: 0 };
          tagStats[tag].total++;
        });
        if (prev.answers[q.id] === q.correctOptionId) {
          correct++;
          q.tags.forEach(tag => { tagStats[tag].correct++; });
        }
      });
      return {
        ...prev,
        status: 'submitted' as const,
        submittedAt: Date.now(),
        score: Math.round((correct / prev.questions.length) * 100),
        correctCount: correct,
        totalCount: prev.questions.length,
        tagBreakdown: tagStats,
      };
    });
  }, []);

  return { session, loading, selectAnswer, toggleBookmark, goToQuestion, submitExam };
}
