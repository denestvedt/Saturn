'use client'

import { ProgressRing } from '@/components/ui/progress-ring'
import { secondsToDisplay } from '@/lib/utils/dates'
import type { TimerStatus } from '@/types/models'

interface TimerDisplayProps {
  totalSeconds: number
  remainingSeconds: number
  status: TimerStatus
}

export function TimerDisplay({ totalSeconds, remainingSeconds, status }: TimerDisplayProps) {
  const progress = totalSeconds > 0
    ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100
    : 0

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ProgressRing
          progress={progress}
          size={260}
          strokeWidth={8}
          className={status === 'completed' ? 'text-saturn-success' : 'text-saturn-primary'}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tabular-nums tracking-tight text-saturn-text">
            {secondsToDisplay(remainingSeconds)}
          </span>
          <span className="text-sm text-saturn-text-secondary mt-1 capitalize">
            {status === 'idle' ? 'Ready' : status === 'completed' ? 'Done!' : status}
          </span>
        </div>
      </div>
    </div>
  )
}
