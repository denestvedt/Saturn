'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils/cn'
import { PIXELS_PER_30MIN } from '@/lib/utils/time-blocks'

interface TimeSlotProps {
  id: string
  label: string
  top: number
  onClick: () => void
}

export function TimeSlot({ id, label, top, onClick }: TimeSlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute left-0 right-0 border-t border-saturn-border/40 transition-colors duration-150',
        isOver && 'bg-saturn-primary/10 border-saturn-primary/30'
      )}
      style={{
        top: `${top}px`,
        height: `${PIXELS_PER_30MIN}px`,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={label ? `Add block at ${label}` : 'Add block at this time'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Show time label for full-hour slots */}
      {label && (
        <span className="absolute -top-[9px] left-0 text-xs text-saturn-muted select-none pointer-events-none">
          {label}
        </span>
      )}
    </div>
  )
}
