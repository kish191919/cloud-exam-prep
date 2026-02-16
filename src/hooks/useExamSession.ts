import { useState, useEffect, useCallback } from 'react';
import { ExamSession, Question } from '@/types/exam';

const SESSIONS_KEY = 'cloudmaster_sessions';

function loadSessions(): Record<string, ExamSession> {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSessions(sessions: Record<string, ExamSession>) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function createSession(
  examId: string,
  examTitle: string,
  questions: Question[],
  timeLimitMinutes: number
): string {
  const sessionId = `session_${Date.now()}`;
  const session: ExamSession = {
    id: sessionId,
    examId,
    examTitle,
    status: 'in_progress',
    startedAt: Date.now(),
    pausedElapsed: 0,
    timeLimitSec: timeLimitMinutes * 60,
    answers: {},
    bookmarks: [],
    currentIndex: 0,
    questions,
  };
  const sessions = loadSessions();
  sessions[sessionId] = session;
  saveSessions(sessions);
  return sessionId;
}

export function getAllSessions(): ExamSession[] {
  return Object.values(loadSessions()).sort((a, b) => b.startedAt - a.startedAt);
}

export function getSession(sessionId: string): ExamSession | null {
  return loadSessions()[sessionId] || null;
}

export function useExamSession(sessionId: string | null) {
  const [session, setSession] = useState<ExamSession | null>(null);

  useEffect(() => {
    if (sessionId) {
      const s = getSession(sessionId);
      setSession(s);
    }
  }, [sessionId]);

  useEffect(() => {
    if (session) {
      const sessions = loadSessions();
      sessions[session.id] = session;
      saveSessions(sessions);
    }
  }, [session]);

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

  return { session, selectAnswer, toggleBookmark, goToQuestion, submitExam };
}
