'use client'

import { format, startOfMonth, endOfMonth, addDays, getDay } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/card'
import type { Habit, HabitCompletion } from '@/types/models'

interface MonthlyHeatmapProps {
  habit: Habit
  completions: HabitCompletion[]
  month: Date
}

/**
 * Parse a hex color and return rgba with variable opacity.
 */
function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function MonthlyHeatmap({
  habit,
  completions,
  month,
}: MonthlyHeatmapProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)

  // Build the days of the month
  const days: Date[] = []
  let current = monthStart
  while (current <= monthEnd) {
    days.push(new Date(current))
    current = addDays(current, 1)
  }

  // Build a completion count map for this habit: date -> count
  const completionMap = new Map<string, number>()
  for (const c of completions) {
    if (c.habit_id === habit.id) {
      const existing = completionMap.get(c.completed_date) || 0
      completionMap.set(c.completed_date, existing + c.count)
    }
  }

  // Determine max count for scaling intensity
  const maxCount = Math.max(1, ...Array.from(completionMap.values()))

  // Calculate offset for starting day of week (Monday = 0)
  // getDay returns 0=Sun, 1=Mon... We want Mon=0
  const startDayOfWeek = getDay(monthStart)
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  // Grid: 7 columns for Mon-Sun, enough rows to cover the month
  const totalCells = offset + days.length
  const rows = Math.ceil(totalCells / 7)

  return (
    <Card padding="sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: habit.color }}
        />
        <h3 className="text-sm font-semibold text-saturn-text truncate">
          {habit.name}
        </h3>
        <span className="text-xs text-saturn-text-secondary ml-auto">
          {format(month, 'MMMM yyyy')}
        </span>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => (
          <div
            key={i}
            className="text-center text-[10px] text-saturn-muted font-medium"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: rows * 7 }, (_, i) => {
          const dayIndex = i - offset

          // Empty cell for offset or overflow
          if (dayIndex < 0 || dayIndex >= days.length) {
            return <div key={i} className="aspect-square" />
          }

          const day = days[dayIndex]
          const dateStr = format(day, 'yyyy-MM-dd')
          const count = completionMap.get(dateStr) || 0

          // Compute color intensity
          const intensity = count > 0 ? Math.max(0.2, count / maxCount) : 0
          const bgColor =
            count > 0
              ? hexToRgba(habit.color, intensity)
              : undefined

          return (
            <div
              key={i}
              className={cn(
                'aspect-square rounded-sm transition-colors',
                count === 0 && 'bg-gray-100'
              )}
              style={bgColor ? { backgroundColor: bgColor } : undefined}
              title={`${format(day, 'MMM d')}: ${count > 0 ? `${count} completion${count > 1 ? 's' : ''}` : 'No completion'}`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[10px] text-saturn-muted mr-1">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((level) => (
          <div
            key={level}
            className={cn('w-3 h-3 rounded-sm', level === 0 && 'bg-gray-100')}
            style={
              level > 0
                ? { backgroundColor: hexToRgba(habit.color, level) }
                : undefined
            }
          />
        ))}
        <span className="text-[10px] text-saturn-muted ml-1">More</span>
      </div>
    </Card>
  )
}
