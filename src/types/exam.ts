export interface QuestionOption {
  id: string;
  text: string;
  textEn?: string;
  explanation?: string;
  explanationEn?: string;
}

export interface Question {
  id: string;
  text: string;
  textEn?: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  explanationEn?: string;
  tags: string[];
  keyPoints?: string;
  keyPointsEn?: string;
  refLinks?: { name: string; url: string }[];
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

export type ExamMode = 'practice' | 'study' | 'exam';

export interface ExamSession {
  id: string;
  examId: string;
  examTitle: string;
  status: 'in_progress' | 'paused' | 'submitted';
  mode?: ExamMode;
  randomizeOptions?: boolean;
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
