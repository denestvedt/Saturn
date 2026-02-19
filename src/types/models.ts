import type { Database } from './database'

// Table row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type List = Database['public']['Tables']['lists']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitCompletion = Database['public']['Tables']['habit_completions']['Row']
export type TimeBlock = Database['public']['Tables']['time_blocks']['Row']
export type WeeklyPlan = Database['public']['Tables']['weekly_plans']['Row']
export type PartnerInvite = Database['public']['Tables']['partner_invites']['Row']
export type PartnerLink = Database['public']['Tables']['partner_links']['Row']
export type TimerSession = Database['public']['Tables']['timer_sessions']['Row']
export type PushSubscription = Database['public']['Tables']['push_subscriptions']['Row']
export type RoutineTemplate = Database['public']['Tables']['routine_templates']['Row']

// Insert types
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type ListInsert = Database['public']['Tables']['lists']['Insert']
export type HabitInsert = Database['public']['Tables']['habits']['Insert']
export type TimeBlockInsert = Database['public']['Tables']['time_blocks']['Insert']

// Recurrence rule shape
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number
  days_of_week?: number[]
  end_date?: string | null
}

// Habit frequency shape
export interface HabitFrequency {
  type: 'daily' | 'weekdays' | 'specific_days' | 'times_per_week'
  days_of_week?: number[]
  times_per_week?: number
}

// Timer status
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

// Block category
export type BlockCategory = 'focus' | 'meeting' | 'break' | 'routine' | 'personal' | 'admin'

// Routine template block shape
export interface TemplateBlock {
  title: string
  duration_minutes: number
  category: BlockCategory
  color: string
  relative_start_minutes: number
  day?: number
}

// Weekly plan goal shape
export interface WeeklyGoal {
  text: string
  completed: boolean
}

// Partner summary shape (returned by get_partner_summary RPC)
export interface PartnerSummary {
  display_name: string
  tasks_completed_today: number
  habits_completed_today: number
  current_streaks: { name: string; streak: number }[] | null
}
