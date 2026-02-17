'use client'

import { Clock, ArrowRight } from 'lucide-react'
import { formatTime, formatTimeRange } from '@/lib/utils/dates'
import { ENCOURAGEMENT_MESSAGES } from '@/lib/constants'
import type { TimeBlock } from '@/types/models'
import Link from 'next/link'
import { useMemo } from 'react'

interface NextBlockCardProps {
  block: TimeBlock | null
  isCurrentBlock?: boolean
}

export function NextBlockCard({ block, isCurrentBlock }: NextBlockCardProps) {
  const message = useMemo(() => {
    return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)]
  }, [])

  if (!block) {
    return (
      <div className="bg-saturn-surface rounded-card p-5 border border-saturn-border">
        <div className="flex items-center gap-3 text-saturn-text-secondary">
          <Clock className="w-5 h-5" />
          <div>
            <p className="text-sm font-medium">No more blocks today</p>
            <p className="text-xs text-saturn-muted mt-0.5">Enjoy your free time!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link href="/calendar" className="block">
      <div
        className="rounded-card p-5 border transition-shadow hover:shadow-md"
        style={{ borderColor: block.color, borderLeftWidth: '4px' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-saturn-text-secondary uppercase tracking-wide mb-1">
              {isCurrentBlock ? 'Happening now' : 'Up next'}
            </p>
            <h3 className="text-lg font-semibold text-saturn-text truncate">{block.title}</h3>
            <p className="text-sm text-saturn-text-secondary mt-0.5">
              {formatTimeRange(block.start_time, block.end_time)}
            </p>
          </div>
          <div className="shrink-0 mt-1">
            <ArrowRight className="w-5 h-5 text-saturn-muted" />
          </div>
        </div>
        <p className="text-xs text-saturn-muted mt-3 italic">{message}</p>
      </div>
    </Link>
  )
}
