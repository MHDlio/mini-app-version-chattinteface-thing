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
      resumes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: Json
          created_at: string
          updated_at: string
          language: string
          template: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: Json
          created_at?: string
          updated_at?: string
          language: string
          template: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: Json
          created_at?: string
          updated_at?: string
          language?: string
          template?: string
        }
      }
      cover_letters: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          company: string
          position: string
          created_at: string
          updated_at: string
          language: string
          template: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          company: string
          position: string
          created_at?: string
          updated_at?: string
          language: string
          template: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          company?: string
          position?: string
          created_at?: string
          updated_at?: string
          language?: string
          template?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          created_at: string
          updated_at: string
          language: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: string
          created_at?: string
          updated_at?: string
          language: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          created_at?: string
          updated_at?: string
          language?: string
        }
      }
    }
  }
}