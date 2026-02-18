'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { getBlockTop, getBlockHeight } from '@/lib/utils/time-blocks'
import { formatTimeRange } from '@/lib/utils/dates'
import { BLOCK_CATEGORIES } from '@/lib/constants'
import type { TimeBlock as TimeBlockType } from '@/types/models'

interface TimeBlockProps {
  block: TimeBlockType
  onClick: (block: TimeBlockType) => void
}

export function DraggableBlock({ block, onClick }: TimeBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: block.id,
      data: { block },
    })

  const top = getBlockTop(block.start_time)
  const height = getBlockHeight(block.start_time, block.end_time)

  const category = BLOCK_CATEGORIES.find((c) => c.value === block.category)
  const color = block.color || category?.color || '#6366F1'

  const style = {
    top: `${top}px`,
    height: `${height}px`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'absolute left-14 right-2 z-10 rounded-lg px-3 py-1.5 cursor-pointer select-none',
        'border-l-[4px] shadow-sm',
        'transition-shadow duration-150',
        'hover:shadow-md active:shadow-lg',
        'min-h-[44px]',
        isDragging && 'opacity-70 shadow-lg z-30 scale-[1.02]',
        block.is_completed && 'opacity-50'
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick(block)
      }}
      {...listeners}
      {...attributes}
      role="button"
      aria-label={`${block.title}, ${formatTimeRange(block.start_time, block.end_time)}`}
    >
      {/* Background with category color at low opacity */}
      <div
        className="absolute inset-0 rounded-lg rounded-l-none"
        style={{ backgroundColor: `${color}15` }}
      />
      {/* Left border color */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-lg"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium text-saturn-text truncate',
              block.is_completed && 'line-through text-saturn-muted'
            )}
          >
            {block.title}
          </p>
          {height >= 56 && (
            <p className="text-xs text-saturn-text-secondary mt-0.5">
              {formatTimeRange(block.start_time, block.end_time)}
            </p>
          )}
          {height >= 72 && category && (
            <span
              className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {category.label}
            </span>
          )}
        </div>

        {block.is_completed && (
          <div
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
            style={{ backgroundColor: `${color}30` }}
          >
            <Check className="h-3 w-3" style={{ color }} />
          </div>
        )}
      </div>
    </div>
  )
}
