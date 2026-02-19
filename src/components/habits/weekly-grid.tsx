'use client'

import { motion } from 'framer-motion'
import { format, addDays } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import { isDayScheduled } from '@/lib/utils/streaks'
import { Card } from '@/components/ui/card'
import type { Habit, HabitCompletion, HabitFrequency } from '@/types/models'

interface WeeklyGridProps {
  habits: Habit[]
  completions: HabitCompletion[]
  weekStart: Date
  onToggle: (habitId: string, date: string) => void
}

export function WeeklyGrid({
  habits,
  completions,
  weekStart,
  onToggle,
}: WeeklyGridProps) {
  // Generate 7 days starting from weekStart (Monday)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Build a lookup: "habitId:yyyy-MM-dd" -> boolean
  const completionSet = new Set(
    completions.map((c) => `${c.habit_id}:${c.completed_date}`)
  )

  const isCompleted = (habitId: string, date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return completionSet.has(`${habitId}:${dateStr}`)
  }

  const isScheduled = (habit: Habit, date: Date): boolean => {
    const freq = habit.frequency as unknown as HabitFrequency
    return isDayScheduled(date, freq)
  }

  if (habits.length === 0) return null

  return (
    <Card padding="sm" className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-medium text-saturn-text-secondary pb-2 pr-3 min-w-[100px]">
              Habit
            </th>
            {weekDays.map((day) => (
              <th
                key={day.toISOString()}
                className="text-center text-xs font-medium text-saturn-text-secondary pb-2 px-1 min-w-[40px]"
              >
                <div>{format(day, 'EEE')}</div>
                <div className="text-[10px] text-saturn-muted">
                  {format(day, 'd')}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <tr key={habit.id} className="border-t border-saturn-border/50">
              <td className="py-2.5 pr-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="text-sm font-medium text-saturn-text truncate max-w-[120px]">
                    {habit.name}
                  </span>
                </div>
              </td>
              {weekDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const scheduled = isScheduled(habit, day)
                const completed = isCompleted(habit.id, day)

                return (
                  <td key={dateStr} className="text-center py-2.5 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (scheduled) {
                          onToggle(habit.id, dateStr)
                        }
                      }}
                      disabled={!scheduled}
                      className={cn(
                        'inline-flex items-center justify-center w-8 h-8 rounded-full transition-all',
                        scheduled
                          ? 'cursor-pointer hover:scale-110 active:scale-95'
                          : 'cursor-default'
                      )}
                      aria-label={`${habit.name} ${format(day, 'EEE MMM d')}: ${
                        !scheduled
                          ? 'not scheduled'
                          : completed
                            ? 'completed'
                            : 'not completed'
                      }`}
                    >
                      <motion.div
                        initial={false}
                        animate={
                          completed ? { scale: [1, 1.4, 1] } : { scale: 1 }
                        }
                        transition={{ duration: 0.25 }}
                      >
                        {!scheduled ? (
                          // Gray circle for unscheduled days
                          <div className="w-4 h-4 rounded-full bg-gray-100" />
                        ) : completed ? (
                          // Filled circle for completed
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: habit.color }}
                          />
                        ) : (
                          // Empty circle for scheduled but not completed
                          <div
                            className="w-5 h-5 rounded-full border-2"
                            style={{ borderColor: habit.color + '60' }}
                          />
                        )}
                      </motion.div>
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
