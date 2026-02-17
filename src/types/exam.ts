export interface QuestionOption {
  id: string;
  text: string;
  explanation?: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  tags: string[];
  difficulty: 1 | 2 | 3;
}

export interface ExamSet {
  id: string;
  examId: string;
  name: string;
  type: 'full' | 'sample';
  description?: string;
  questionCount: number;
  sortOrder: number;
  isActive: boolean;
}

export interface ExamConfig {
  id: string;
  title: string;
  code: string;
  certification: 'AWS' | 'GCP' | 'Azure';
  description: string;
  timeLimitMinutes: number;
  passingScore: number;
  version: string;
  questionCount: number;
}

export interface ExamSession {
  id: string;
  examId: string;
  examTitle: string;
  status: 'in_progress' | 'paused' | 'submitted';
  startedAt: number;
  pausedElapsed: number;
  submittedAt?: number;
  timeLimitSec: number;
  answers: Record<string, string>;
  bookmarks: string[];
  currentIndex: number;
  questions: Question[];
  score?: number;
  correctCount?: number;
  totalCount?: number;
  tagBreakdown?: Record<string, { correct: number; total: number }>;
}
