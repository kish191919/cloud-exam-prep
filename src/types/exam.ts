export interface QuestionOption {
  id: string;
  text: string;
  textEn?: string;
  textPt?: string;
  textEs?: string;
  explanation?: string;
  explanationEn?: string;
  explanationPt?: string;
  explanationEs?: string;
}

export interface Question {
  id: string;
  text: string;
  textEn?: string;
  textPt?: string;
  textEs?: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  explanationEn?: string;
  explanationPt?: string;
  explanationEs?: string;
  tags: string[];
  keyPoints?: string;
  keyPointsEn?: string;
  keyPointsPt?: string;
  keyPointsEs?: string;
  refLinks?: { name: string; name_en?: string; name_pt?: string; name_es?: string; url: string }[];
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
  certification: 'AWS' | 'GCP' | 'AZURE';
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
  setType?: 'sample' | 'full';
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
