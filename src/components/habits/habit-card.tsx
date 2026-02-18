'use client'

import { motion } from 'framer-motion'
import { Circle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/card'
import { StreakBadge } from './streak-badge'
import type { Habit } from '@/types/models'

interface HabitCardProps {
  habit: Habit
  todayCompleted: boolean
  streak: number
  completionRate: number
  onToggle: () => void
  onClick: () => void
}

export function HabitCard({
  habit,
  todayCompleted,
  streak,
  completionRate,
  onToggle,
  onClick,
}: HabitCardProps) {
  const ratePercent = Math.round(completionRate * 100)

  return (
    <Card
      padding="none"
      className={cn(
        'overflow-hidden cursor-pointer transition-shadow hover:shadow-md active:scale-[0.99]',
        'select-none'
      )}
    >
      <div className="flex items-stretch">
        {/* Colored left border */}
        <div
          className="w-1.5 shrink-0 rounded-l-card"
          style={{ backgroundColor: habit.color }}
        />

        {/* Main content - tapping opens editor */}
        <button
          type="button"
          onClick={onClick}
          className="flex-1 flex items-center gap-3 p-4 text-left min-h-[64px]"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-saturn-text truncate">
              {habit.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <StreakBadge streak={streak} size="sm" />
              {ratePercent > 0 && (
                <span className="text-xs text-saturn-text-secondary">
                  {ratePercent}% this week
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Completion toggle - separate tap target */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="flex items-center justify-center px-4 min-w-[56px] min-h-[56px] hover:bg-gray-50 active:bg-gray-100 transition-colors"
          aria-label={
            todayCompleted ? 'Mark as not done' : 'Mark as done'
          }
        >
          <motion.div
            initial={false}
            animate={todayCompleted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {todayCompleted ? (
              <CheckCircle2
                className="h-7 w-7"
                style={{ color: habit.color }}
                fill={habit.color}
                strokeWidth={0}
              />
            ) : (
              <Circle
                className="h-7 w-7 text-saturn-border"
                strokeWidth={2}
              />
            )}
          </motion.div>
        </button>
      </div>
    </Card>
  )
}
