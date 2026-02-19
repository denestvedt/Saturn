import { addDays, addMonths, getDay } from 'date-fns'
import type { RecurrenceRule } from '@/types/models'

/**
 * Generate the next N occurrence dates for a recurrence rule starting from a given date.
 */
export function getNextOccurrences(
  rule: RecurrenceRule,
  startDate: Date,
  count: number = 7
): Date[] {
  const dates: Date[] = []
  let current = startDate
  let iterations = 0
  const maxIterations = count * 10 // Safety limit

  while (dates.length < count && iterations < maxIterations) {
    iterations++

    if (isOccurrence(current, rule)) {
      dates.push(new Date(current))
    }

    switch (rule.frequency) {
      case 'daily':
        current = addDays(current, rule.interval)
        break
      case 'weekly':
        current = addDays(current, 1)
        break
      case 'monthly':
        current = addMonths(current, rule.interval)
        break
    }

    if (rule.end_date && current > new Date(rule.end_date)) {
      break
    }
  }

  return dates
}

/**
 * Check if a specific date matches a recurrence rule.
 */
export function isOccurrence(date: Date, rule: RecurrenceRule): boolean {
  const dayOfWeek = getDay(date)

  switch (rule.frequency) {
    case 'daily':
      return true
    case 'weekly':
      return (rule.days_of_week ?? []).includes(dayOfWeek)
    case 'monthly':
      return true // occurs on the same day-of-month
    default:
      return false
  }
}

/**
 * Generate a human-readable description of a recurrence rule.
 */
export function describeRecurrence(rule: RecurrenceRule): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  switch (rule.frequency) {
    case 'daily':
      if (rule.interval === 1) return 'Every day'
      return `Every ${rule.interval} days`
    case 'weekly':
      if (rule.days_of_week && rule.days_of_week.length > 0) {
        const days = rule.days_of_week.map((d) => dayNames[d]).join(', ')
        if (rule.interval === 1) return `Every ${days}`
        return `Every ${rule.interval} weeks on ${days}`
      }
      if (rule.interval === 1) return 'Every week'
      return `Every ${rule.interval} weeks`
    case 'monthly':
      if (rule.interval === 1) return 'Every month'
      return `Every ${rule.interval} months`
    default:
      return 'Custom'
  }
}

/**
 * Create a default recurrence rule for common patterns.
 */
export function createRecurrenceRule(
  pattern: 'daily' | 'weekdays' | 'weekly' | 'monthly'
): RecurrenceRule {
  switch (pattern) {
    case 'daily':
      return { frequency: 'daily', interval: 1 }
    case 'weekdays':
      return { frequency: 'weekly', interval: 1, days_of_week: [1, 2, 3, 4, 5] }
    case 'weekly':
      return { frequency: 'weekly', interval: 1, days_of_week: [getDay(new Date())] }
    case 'monthly':
      return { frequency: 'monthly', interval: 1 }
  }
}
