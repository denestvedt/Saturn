'use client'

import { cn } from '@/lib/utils/cn'
import type { Habit, HabitCompletion } from '@/types/models'

interface HabitMiniGridProps {
  habits: Habit[]
  completions: HabitCompletion[]
  onToggle: (habitId: string) => void
}

export function HabitMiniGrid({ habits, completions, onToggle }: HabitMiniGridProps) {
  if (habits.length === 0) return null

  const completedIds = new Set(completions.map((c) => c.habit_id))

  return (
    <div className="bg-saturn-surface rounded-card p-4 border border-saturn-border">
      <h3 className="text-sm font-semibold text-saturn-text mb-3">Habits</h3>

      <div className="flex flex-wrap gap-3">
        {habits.map((habit) => {
          const isDone = completedIds.has(habit.id)
          return (
            <button
              key={habit.id}
              onClick={() => onToggle(habit.id)}
              className="flex flex-col items-center gap-1.5 min-w-[60px]"
              title={habit.name}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  isDone
                    ? 'scale-100'
                    : 'border-2 bg-transparent'
                )}
                style={{
                  backgroundColor: isDone ? habit.color : 'transparent',
                  borderColor: isDone ? habit.color : '#E5E7EB',
                }}
              >
                {isDone && (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-[11px] text-saturn-text-secondary font-medium truncate max-w-[60px]">
                {habit.name}
              </span>
            </button>
          )
        })}
      </div>

      {habits.length > 0 && (
        <p className="text-xs text-saturn-muted mt-3 text-center">
          {completedIds.size} of {habits.length} done today
        </p>
      )}
    </div>
  )
}
