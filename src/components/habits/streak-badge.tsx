'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md'
}

export function StreakBadge({ streak, size = 'sm' }: StreakBadgeProps) {
  const isMilestone = [7, 14, 30, 60, 90, 100, 365].includes(streak)

  // Color transitions based on streak length
  const colorClass =
    streak >= 30
      ? 'text-red-500'
      : streak >= 7
        ? 'text-orange-500'
        : 'text-saturn-text-secondary'

  const bgClass =
    streak >= 30
      ? 'bg-red-50'
      : streak >= 7
        ? 'bg-orange-50'
        : 'bg-gray-100'

  if (streak === 0) {
    return null
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        bgClass,
        colorClass,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        isMilestone && 'ring-2 ring-offset-1',
        isMilestone && streak >= 30
          ? 'ring-red-300'
          : isMilestone && streak >= 7
            ? 'ring-orange-300'
            : isMilestone
              ? 'ring-gray-300'
              : ''
      )}
    >
      <Flame
        className={cn(
          size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
          streak >= 7 && 'animate-pulse'
        )}
      />
      {streak}
    </span>
  )
}
