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
          certification: 'AWS' | 'GCP' | 'AZURE'
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
          certification: 'AWS' | 'GCP' | 'AZURE'
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
          certification?: 'AWS' | 'GCP' | 'AZURE'
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
          text_en: string | null
          text_pt: string | null
          text_es: string | null
          correct_option_id: string
          explanation: string
          explanation_en: string | null
          explanation_pt: string | null
          explanation_es: string | null
          key_points: string | null
          key_points_en: string | null
          key_points_pt: string | null
          key_points_es: string | null
          ref_links: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          exam_id: string
          text: string
          text_en?: string | null
          text_pt?: string | null
          text_es?: string | null
          correct_option_id: string
          explanation: string
          explanation_en?: string | null
          explanation_pt?: string | null
          explanation_es?: string | null
          key_points?: string | null
          key_points_en?: string | null
          key_points_pt?: string | null
          key_points_es?: string | null
          ref_links?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          text?: string
          text_en?: string | null
          text_pt?: string | null
          text_es?: string | null
          correct_option_id?: string
          explanation?: string
          explanation_en?: string | null
          explanation_pt?: string | null
          explanation_es?: string | null
          key_points?: string | null
          key_points_en?: string | null
          key_points_pt?: string | null
          key_points_es?: string | null
          ref_links?: Json
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
          text_en: string | null
          text_pt: string | null
          text_es: string | null
          explanation: string | null
          explanation_en: string | null
          explanation_pt: string | null
          explanation_es: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          question_id: string
          option_id: string
          text: string
          text_en?: string | null
          text_pt?: string | null
          text_es?: string | null
          explanation?: string | null
          explanation_en?: string | null
          explanation_pt?: string | null
          explanation_es?: string | null
          sort_order: number
        }
        Update: {
          id?: string
          question_id?: string
          option_id?: string
          text?: string
          text_en?: string | null
          text_pt?: string | null
          text_es?: string | null
          explanation?: string | null
          explanation_en?: string | null
          explanation_pt?: string | null
          explanation_es?: string | null
          sort_order?: number
        }
      }
      exam_sets: {
        Row: {
          id: string
          exam_id: string
          name: string
          type: 'full' | 'sample'
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          name: string
          type: 'full' | 'sample'
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          name?: string
          type?: 'full' | 'sample'
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      exam_set_questions: {
        Row: {
          set_id: string
          question_id: string
          sort_order: number
        }
        Insert: {
          set_id: string
          question_id: string
          sort_order?: number
        }
        Update: {
          set_id?: string
          question_id?: string
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
      announcements: {
        Row: {
          id: string
          category: 'notice' | 'info' | 'tip' | 'update'
          title: string
          title_en: string | null
          content: string
          content_en: string | null
          exam_id: string | null
          is_pinned: boolean
          is_active: boolean
          author_id: string | null
          cover_image_url: string | null
          ref_links: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: 'notice' | 'info' | 'tip' | 'update'
          title: string
          title_en?: string | null
          content: string
          content_en?: string | null
          exam_id?: string | null
          is_pinned?: boolean
          is_active?: boolean
          author_id?: string | null
          cover_image_url?: string | null
          ref_links?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: 'notice' | 'info' | 'tip' | 'update'
          title?: string
          title_en?: string | null
          content?: string
          content_en?: string | null
          exam_id?: string | null
          is_pinned?: boolean
          is_active?: boolean
          author_id?: string | null
          cover_image_url?: string | null
          ref_links?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          provider: 'aws' | 'gcp' | 'azure' | 'general'
          exam_id: string | null
          category: string | null
          tags: string[]
          title: string
          title_en: string | null
          excerpt: string | null
          excerpt_en: string | null
          content: string
          content_en: string | null
          cover_image_url: string | null
          read_time_minutes: number | null
          ref_links: Json
          is_published: boolean
          published_at: string | null
          is_pinned: boolean
          author_id: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          provider: 'aws' | 'gcp' | 'azure' | 'general'
          exam_id?: string | null
          category?: string | null
          tags?: string[]
          title: string
          title_en?: string | null
          excerpt?: string | null
          excerpt_en?: string | null
          content?: string
          content_en?: string | null
          cover_image_url?: string | null
          read_time_minutes?: number | null
          ref_links?: Json
          is_published?: boolean
          published_at?: string | null
          is_pinned?: boolean
          author_id?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          provider?: 'aws' | 'gcp' | 'azure' | 'general'
          exam_id?: string | null
          category?: string | null
          tags?: string[]
          title?: string
          title_en?: string | null
          excerpt?: string | null
          excerpt_en?: string | null
          content?: string
          content_en?: string | null
          cover_image_url?: string | null
          read_time_minutes?: number | null
          ref_links?: Json
          is_published?: boolean
          published_at?: string | null
          is_pinned?: boolean
          author_id?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      question_reports: {
        Row: {
          id: string
          question_id: string
          user_id: string | null
          user_email: string | null
          user_name: string | null
          reason: 'wrong_answer' | 'unclear' | 'typo' | 'other'
          comment: string | null
          status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          admin_note: string | null
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          user_id?: string | null
          user_email?: string | null
          user_name?: string | null
          reason: 'wrong_answer' | 'unclear' | 'typo' | 'other'
          comment?: string | null
          status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          admin_note?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          user_id?: string | null
          user_email?: string | null
          user_name?: string | null
          reason?: 'wrong_answer' | 'unclear' | 'typo' | 'other'
          comment?: string | null
          status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          admin_note?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
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
          certification: 'AWS' | 'GCP' | 'AZURE'
          description: string
          time_limit_minutes: number
          passing_score: number
          version: string
          question_count: number
          created_at: string
          updated_at: string
        }
      }
      exam_sets_view: {
        Row: {
          id: string
          exam_id: string
          name: string
          type: 'full' | 'sample'
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          question_count: number
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
