export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      exams: {
        Row: {
          id: string
          title: string
          code: string
          certification: 'AWS' | 'GCP' | 'Azure'
          description: string
          time_limit_minutes: number
          passing_score: number
          version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          code: string
          certification: 'AWS' | 'GCP' | 'Azure'
          description: string
          time_limit_minutes: number
          passing_score: number
          version: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          code?: string
          certification?: 'AWS' | 'GCP' | 'Azure'
          description?: string
          time_limit_minutes?: number
          passing_score?: number
          version?: string
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          exam_id: string
          text: string
          correct_option_id: string
          explanation: string
          difficulty: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          exam_id: string
          text: string
          correct_option_id: string
          explanation: string
          difficulty: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          text?: string
          correct_option_id?: string
          explanation?: string
          difficulty?: number
          created_at?: string
          updated_at?: string
        }
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          option_id: string
          text: string
          sort_order: number
        }
        Insert: {
          id?: string
          question_id: string
          option_id: string
          text: string
          sort_order: number
        }
        Update: {
          id?: string
          question_id?: string
          option_id?: string
          text?: string
          sort_order?: number
        }
      }
      question_tags: {
        Row: {
          id: string
          question_id: string
          tag: string
        }
        Insert: {
          id?: string
          question_id: string
          tag: string
        }
        Update: {
          id?: string
          question_id?: string
          tag?: string
        }
      }
      exam_sessions: {
        Row: {
          id: string
          user_id: string | null
          exam_id: string
          exam_title: string
          status: 'in_progress' | 'paused' | 'submitted'
          started_at: string
          paused_elapsed: number
          submitted_at: string | null
          time_limit_sec: number
          answers: Json
          bookmarks: string[]
          current_index: number
          score: number | null
          correct_count: number | null
          total_count: number | null
          tag_breakdown: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          exam_id: string
          exam_title: string
          status?: 'in_progress' | 'paused' | 'submitted'
          started_at?: string
          paused_elapsed?: number
          submitted_at?: string | null
          time_limit_sec: number
          answers?: Json
          bookmarks?: string[]
          current_index?: number
          score?: number | null
          correct_count?: number | null
          total_count?: number | null
          tag_breakdown?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          exam_id?: string
          exam_title?: string
          status?: 'in_progress' | 'paused' | 'submitted'
          started_at?: string
          paused_elapsed?: number
          submitted_at?: string | null
          time_limit_sec?: number
          answers?: Json
          bookmarks?: string[]
          current_index?: number
          score?: number | null
          correct_count?: number | null
          total_count?: number | null
          tag_breakdown?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      exam_list: {
        Row: {
          id: string
          title: string
          code: string
          certification: 'AWS' | 'GCP' | 'Azure'
          description: string
          time_limit_minutes: number
          passing_score: number
          version: string
          question_count: number
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
