'use client'

import { useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import { DAYS_OF_WEEK } from '@/lib/constants'
import {
  describeRecurrence,
  createRecurrenceRule,
} from '@/lib/utils/recurrence'
import type { RecurrenceRule } from '@/types/models'

type RecurrencePattern = 'daily' | 'weekdays' | 'weekly' | 'monthly'

interface RecurringConfigProps {
  rule: RecurrenceRule
  onChange: (rule: RecurrenceRule) => void
  className?: string
}

const FREQUENCY_OPTIONS: { value: RecurrencePattern; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export function RecurringConfig({
  rule,
  onChange,
  className,
}: RecurringConfigProps) {
  // Determine which pattern matches the current rule
  const currentPattern = useMemo((): RecurrencePattern => {
    if (rule.frequency === 'daily') return 'daily'
    if (rule.frequency === 'monthly') return 'monthly'
    if (rule.frequency === 'weekly') {
      const days = rule.days_of_week ?? []
      const weekdays = [1, 2, 3, 4, 5]
      if (
        days.length === weekdays.length &&
        weekdays.every((d) => days.includes(d))
      ) {
        return 'weekdays'
      }
      return 'weekly'
    }
    return 'daily'
  }, [rule])

  const handlePatternChange = useCallback(
    (pattern: RecurrencePattern) => {
      onChange(createRecurrenceRule(pattern))
    },
    [onChange]
  )

  const handleDayToggle = useCallback(
    (dayValue: number) => {
      const currentDays = rule.days_of_week ?? []
      let newDays: number[]

      if (currentDays.includes(dayValue)) {
        newDays = currentDays.filter((d) => d !== dayValue)
        // Don't allow empty days -- keep at least one
        if (newDays.length === 0) return
      } else {
        newDays = [...currentDays, dayValue]
      }

      onChange({
        ...rule,
        frequency: 'weekly',
        days_of_week: newDays,
      })
    },
    [rule, onChange]
  )

  const description = describeRecurrence(rule)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Frequency picker */}
      <div>
        <label className="text-sm font-medium text-saturn-text mb-2 block">
          Frequency
        </label>
        <div className="flex flex-wrap gap-2">
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePatternChange(option.value)}
              className={cn(
                'min-h-[44px] px-4 py-2 rounded-button text-sm font-medium',
                'border transition-all duration-150',
                'active:scale-95',
                currentPattern === option.value
                  ? 'bg-saturn-primary text-white border-saturn-primary'
                  : 'bg-saturn-surface text-saturn-text border-saturn-border hover:bg-gray-50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Day-of-week picker for weekly */}
      {(currentPattern === 'weekly' || currentPattern === 'weekdays') && (
        <div>
          <label className="text-sm font-medium text-saturn-text mb-2 block">
            On these days
          </label>
          <div className="flex gap-1.5">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = (rule.days_of_week ?? []).includes(day.value)
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={cn(
                    'min-h-[44px] min-w-[44px] flex items-center justify-center',
                    'rounded-full text-sm font-medium',
                    'transition-all duration-150',
                    'active:scale-90',
                    isSelected
                      ? 'bg-saturn-primary text-white'
                      : 'bg-saturn-surface text-saturn-text border border-saturn-border hover:bg-gray-50'
                  )}
                  aria-label={day.label}
                  aria-pressed={isSelected}
                >
                  {day.short}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Human-readable description */}
      <p className="text-sm text-saturn-text-secondary">
        Repeats: {description}
      </p>
    </div>
  )
}
