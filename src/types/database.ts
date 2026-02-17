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
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          timezone: string
          notification_preferences: Json
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          timezone?: string
          notification_preferences?: Json
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          timezone?: string
          notification_preferences?: Json
          onboarding_completed?: boolean
          updated_at?: string
        }
      }
      lists: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          sort_order: number
          is_inbox: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string
          sort_order?: number
          is_inbox?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          color?: string
          icon?: string
          sort_order?: number
          is_inbox?: boolean
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          list_id: string | null
          title: string
          description: string | null
          is_completed: boolean
          is_top_three: boolean
          priority: number
          due_date: string | null
          scheduled_date: string | null
          time_block_id: string | null
          sort_order: number
          is_recurring: boolean
          recurrence_rule: Json | null
          recurrence_parent_id: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          list_id?: string | null
          title: string
          description?: string | null
          is_completed?: boolean
          is_top_three?: boolean
          priority?: number
          due_date?: string | null
          scheduled_date?: string | null
          time_block_id?: string | null
          sort_order?: number
          is_recurring?: boolean
          recurrence_rule?: Json | null
          recurrence_parent_id?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          list_id?: string | null
          title?: string
          description?: string | null
          is_completed?: boolean
          is_top_three?: boolean
          priority?: number
          due_date?: string | null
          scheduled_date?: string | null
          time_block_id?: string | null
          sort_order?: number
          is_recurring?: boolean
          recurrence_rule?: Json | null
          recurrence_parent_id?: string | null
          completed_at?: string | null
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          icon: string
          frequency: Json
          target_per_day: number
          reminder_time: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          frequency?: Json
          target_per_day?: number
          reminder_time?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          color?: string
          icon?: string
          frequency?: Json
          target_per_day?: number
          reminder_time?: string | null
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_date: string
          count: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_date: string
          count?: number
          note?: string | null
          created_at?: string
        }
        Update: {
          count?: number
          note?: string | null
        }
      }
      time_blocks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          color: string
          category: string
          is_completed: boolean
          is_recurring: boolean
          recurrence_rule: Json | null
          recurrence_parent_id: string | null
          task_ids: string[]
          routine_template_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          color?: string
          category?: string
          is_completed?: boolean
          is_recurring?: boolean
          recurrence_rule?: Json | null
          recurrence_parent_id?: string | null
          task_ids?: string[]
          routine_template_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          color?: string
          category?: string
          is_completed?: boolean
          is_recurring?: boolean
          recurrence_rule?: Json | null
          recurrence_parent_id?: string | null
          task_ids?: string[]
          routine_template_id?: string | null
          updated_at?: string
        }
      }
      weekly_plans: {
        Row: {
          id: string
          user_id: string
          week_start: string
          goals: Json
          reflection: string | null
          energy_rating: number | null
          focus_areas: string[] | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          goals?: Json
          reflection?: string | null
          energy_rating?: number | null
          focus_areas?: string[] | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          goals?: Json
          reflection?: string | null
          energy_rating?: number | null
          focus_areas?: string[] | null
          is_completed?: boolean
          updated_at?: string
        }
      }
      partner_invites: {
        Row: {
          id: string
          inviter_id: string
          invitee_email: string | null
          invite_token: string
          status: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          inviter_id: string
          invitee_email?: string | null
          invite_token?: string
          status?: string
          expires_at?: string
          created_at?: string
        }
        Update: {
          invitee_email?: string | null
          status?: string
        }
      }
      partner_links: {
        Row: {
          id: string
          user_a_id: string
          user_b_id: string
          invite_id: string | null
          is_active: boolean
          user_a_shares: Json
          user_b_shares: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_a_id: string
          user_b_id: string
          invite_id?: string | null
          is_active?: boolean
          user_a_shares?: Json
          user_b_shares?: Json
          created_at?: string
        }
        Update: {
          is_active?: boolean
          user_a_shares?: Json
          user_b_shares?: Json
        }
      }
      timer_sessions: {
        Row: {
          id: string
          user_id: string
          duration_seconds: number
          actual_seconds: number | null
          type: string
          task_id: string | null
          time_block_id: string | null
          completed: boolean
          reflection: string | null
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          duration_seconds: number
          actual_seconds?: number | null
          type?: string
          task_id?: string | null
          time_block_id?: string | null
          completed?: boolean
          reflection?: string | null
          started_at: string
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          actual_seconds?: number | null
          completed?: boolean
          reflection?: string | null
          ended_at?: string | null
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          keys: Json
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          keys: Json
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          endpoint?: string
          keys?: Json
          user_agent?: string | null
        }
      }
      routine_templates: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          is_system: boolean
          category: string
          blocks: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          is_system?: boolean
          category?: string
          blocks?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          category?: string
          blocks?: Json
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_partner_summary: {
        Args: {
          partner_user_id: string
        }
        Returns: Json
      }
    }
    Enums: Record<string, never>
  }
}
