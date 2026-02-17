import { useState, useEffect, useCallback } from 'react';
import { ExamSession, ExamMode, Question } from '@/types/exam';
import * as sessionService from '@/services/sessionService';
import { getQuestionsByIds } from '@/services/questionService';
import { useAuth } from '@/contexts/AuthContext';

const SESSIONS_KEY = 'cloudmaster_sessions';
const modeKey = (id: string) => `cloudmaster_mode_${id}`;
const randomizeKey = (id: string) => `cloudmaster_randomize_${id}`;
const questionIdsKey = (id: string) => `cloudmaster_questionids_${id}`;

// Anonymous sessions use IDs starting with 'session_'.
// They are stored in sessionStorage so they vanish when the tab/browser is closed.
// Logged-in sessions use UUID IDs from Supabase.
function isAnonymousSession(sessionId: string): boolean {
  return sessionId.startsWith('session_');
}

function getStorageForSession(sessionId: string): Storage {
  return isAnonymousSession(sessionId) ? sessionStorage : localStorage;
}

function loadSessionsFromStorage(storage: Storage): Record<string, ExamSession> {
  try {
    const raw = storage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSessionsToStorage(sessions: Record<string, ExamSession>, storage: Storage) {
  storage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function createSession(
  examId: string,
  examTitle: string,
  questions: Question[],
  timeLimitMinutes: number,
  mode: ExamMode = 'exam',
  randomizeOptions: boolean = false,
  userId: string | null = null,
  initialBookmarks: string[] = []
): Promise<string> {
  // ── Anonymous user: skip Supabase, use sessionStorage (clears on tab close) ──
  if (!userId) {
    const sessionId = `session_${Date.now()}`;
    const session: ExamSession = {
      id: sessionId,
      examId,
      examTitle,
      status: 'in_progress',
      mode,
      randomizeOptions,
      startedAt: Date.now(),
      pausedElapsed: 0,
      timeLimitSec: timeLimitMinutes * 60,
      answers: {},
      bookmarks: initialBookmarks,
      currentIndex: 0,
      questions,
    };
    const sessions = loadSessionsFromStorage(sessionStorage);
    sessions[sessionId] = session;
    saveSessionsToStorage(sessions, sessionStorage);
    sessionStorage.setItem(modeKey(sessionId), mode);
    if (randomizeOptions) sessionStorage.setItem(randomizeKey(sessionId), 'true');
    sessionStorage.setItem(questionIdsKey(sessionId), JSON.stringify(questions.map(q => q.id)));
    return sessionId;
  }

  // ── Logged-in user: save to Supabase ─────────────────────────────────────
  try {
    const sessionId = await sessionService.createSession(
      examId, examTitle, questions, timeLimitMinutes, userId
    );

    if (initialBookmarks.length > 0) {
      await sessionService.updateSession({
        id: sessionId, examId, examTitle,
        status: 'in_progress', startedAt: Date.now(), pausedElapsed: 0,
        timeLimitSec: timeLimitMinutes * 60, answers: {}, bookmarks: initialBookmarks,
        currentIndex: 0, questions,
      });
    }

    localStorage.setItem(modeKey(sessionId), mode);
    if (randomizeOptions) localStorage.setItem(randomizeKey(sessionId), 'true');
    localStorage.setItem(questionIdsKey(sessionId), JSON.stringify(questions.map(q => q.id)));
    return sessionId;
  } catch (error) {
    console.warn('Failed to create session in Supabase, using localStorage:', error);
    // Network fallback for logged-in users: localStorage (persists, unlike sessionStorage)
    const sessionId = `session_${Date.now()}`;
    const session: ExamSession = {
      id: sessionId, examId, examTitle,
      status: 'in_progress', mode, randomizeOptions,
      startedAt: Date.now(), pausedElapsed: 0,
      timeLimitSec: timeLimitMinutes * 60,
      answers: {}, bookmarks: initialBookmarks, currentIndex: 0, questions,
    };
    const sessions = loadSessionsFromStorage(localStorage);
    sessions[sessionId] = session;
    saveSessionsToStorage(sessions, localStorage);
    localStorage.setItem(questionIdsKey(sessionId), JSON.stringify(questions.map(q => q.id)));
    return sessionId;
  }
}

export async function getAllSessions(userId?: string): Promise<ExamSession[]> {
  // Anonymous: load from sessionStorage only (no Supabase)
  if (!userId) {
    return Object.values(loadSessionsFromStorage(sessionStorage))
      .sort((a, b) => b.startedAt - a.startedAt);
  }

  // Logged-in: load from Supabase
  try {
    return await sessionService.getAllSessions(userId);
  } catch (error) {
    console.warn('Failed to fetch sessions from Supabase, using localStorage:', error);
    return Object.values(loadSessionsFromStorage(localStorage))
      .sort((a, b) => b.startedAt - a.startedAt);
  }
}

export async function getSession(sessionId: string): Promise<ExamSession | null> {
  // ── Anonymous session: load from sessionStorage ───────────────────────────
  if (isAnonymousSession(sessionId)) {
    const session = loadSessionsFromStorage(sessionStorage)[sessionId] || null;
    if (session) {
      const storedMode = sessionStorage.getItem(modeKey(sessionId)) as ExamMode | null;
      if (storedMode) session.mode = storedMode;
      const storedRandomize = sessionStorage.getItem(randomizeKey(sessionId));
      if (storedRandomize === 'true') session.randomizeOptions = true;
    }
    return session;
  }

  // ── Logged-in session: load from Supabase ────────────────────────────────
  try {
    const storedQuestionIdsStr = localStorage.getItem(questionIdsKey(sessionId));
    let questions: Question[] | undefined = undefined;

    if (storedQuestionIdsStr) {
      try {
        const questionIds = JSON.parse(storedQuestionIdsStr) as string[];
        questions = await getQuestionsByIds(questionIds);
      } catch (error) {
        console.error('Failed to load specific questions for session:', error);
      }
    }

    const session = await sessionService.getSession(sessionId, questions);
    if (session) {
      const storedMode = localStorage.getItem(modeKey(sessionId)) as ExamMode | null;
      if (storedMode) session.mode = storedMode;
      const storedRandomize = localStorage.getItem(randomizeKey(sessionId));
      if (storedRandomize === 'true') session.randomizeOptions = true;
      return session;
    }
  } catch (error) {
    console.warn('Failed to fetch session from Supabase, using localStorage:', error);
  }

  return loadSessionsFromStorage(localStorage)[sessionId] || null;
}

export function useExamSession(sessionId: string | null) {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) { setLoading(false); return; }
      try {
        const s = await getSession(sessionId);
        setSession(s);
      } catch (error) {
        console.error('Error loading session:', error);
        const storage = isAnonymousSession(sessionId) ? sessionStorage : localStorage;
        setSession(loadSessionsFromStorage(storage)[sessionId] || null);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    async function persist() {
      if (!session) return;

      // Anonymous session: update sessionStorage only (no Supabase)
      if (isAnonymousSession(session.id)) {
        const sessions = loadSessionsFromStorage(sessionStorage);
        sessions[session.id] = session;
        saveSessionsToStorage(sessions, sessionStorage);
        return;
      }

      // Logged-in session: save to Supabase
      try {
        await sessionService.updateSession(session);
      } catch (error) {
        console.warn('Failed to update session in Supabase, using localStorage:', error);
        const sessions = loadSessionsFromStorage(localStorage);
        sessions[session.id] = session;
        saveSessionsToStorage(sessions, localStorage);
      }
    }

    if (!loading && session) persist();
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

  // Explicit save before navigation (avoids timing race with auto-save useEffect)
  const saveSession = useCallback(async (currentSession?: ExamSession | null) => {
    const s = currentSession ?? session;
    if (!s) return;

    if (isAnonymousSession(s.id)) {
      const sessions = loadSessionsFromStorage(sessionStorage);
      sessions[s.id] = s;
      saveSessionsToStorage(sessions, sessionStorage);
      return;
    }

    try {
      await sessionService.updateSession(s);
    } catch {
      const sessions = loadSessionsFromStorage(localStorage);
      sessions[s.id] = s;
      saveSessionsToStorage(sessions, localStorage);
    }
  }, [session]);

  return { session, loading, selectAnswer, toggleBookmark, goToQuestion, submitExam, saveSession };
}
