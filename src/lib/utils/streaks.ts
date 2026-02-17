import { addDays, format, getDay } from 'date-fns'
import type { HabitFrequency } from '@/types/models'

/**
 * Calculate the current streak for a habit based on its completions and frequency.
 * Walks backwards from today, counting consecutive scheduled days that have completions.
 */
export function calculateStreak(
  completions: { completed_date: string }[],
  frequency: HabitFrequency
): number {
  const completionSet = new Set(completions.map((c) => c.completed_date))
  const today = new Date()
  let streak = 0
  let currentDate = today

  // Walk backwards up to 365 days
  for (let i = 0; i < 365; i++) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const isScheduled = isDayScheduled(currentDate, frequency)

    if (isScheduled) {
      if (completionSet.has(dateStr)) {
        streak++
      } else {
        // If today isn't completed yet, give benefit of the doubt
        if (i === 0) {
          currentDate = addDays(currentDate, -1)
          continue
        }
        break
      }
    }

    currentDate = addDays(currentDate, -1)
  }

  return streak
}

/**
 * Check if a given day is a scheduled day for a habit frequency.
 */
export function isDayScheduled(date: Date, frequency: HabitFrequency): boolean {
  const dayOfWeek = getDay(date) // 0=Sunday, 1=Monday, ..., 6=Saturday

  switch (frequency.type) {
    case 'daily':
      return true
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5
    case 'specific_days':
      return (frequency.days_of_week ?? []).includes(dayOfWeek)
    case 'times_per_week':
      // For "X times per week", every day counts as schedulable
      return true
    default:
      return true
  }
}

/**
 * Get the best streak for a habit (longest consecutive streak in history).
 */
export function getBestStreak(
  completions: { completed_date: string }[],
  frequency: HabitFrequency
): number {
  if (completions.length === 0) return 0

  const sorted = [...completions]
    .map((c) => c.completed_date)
    .sort()

  const completionSet = new Set(sorted)
  let bestStreak = 0
  let currentStreak = 0

  const startDate = new Date(sorted[0])
  const endDate = new Date(sorted[sorted.length - 1])
  let currentDate = startDate

  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const isScheduled = isDayScheduled(currentDate, frequency)

    if (isScheduled) {
      if (completionSet.has(dateStr)) {
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    currentDate = addDays(currentDate, 1)
  }

  return bestStreak
}

/**
 * Get completion rate for a date range.
 */
export function getCompletionRate(
  completions: { completed_date: string }[],
  frequency: HabitFrequency,
  startDate: Date,
  endDate: Date
): number {
  const completionSet = new Set(completions.map((c) => c.completed_date))
  let scheduledDays = 0
  let completedDays = 0

  let currentDate = startDate
  while (currentDate <= endDate) {
    if (isDayScheduled(currentDate, frequency)) {
      scheduledDays++
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      if (completionSet.has(dateStr)) {
        completedDays++
      }
    }
    currentDate = addDays(currentDate, 1)
  }

  return scheduledDays === 0 ? 0 : completedDays / scheduledDays
}
