'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { addMinutes, format } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BLOCK_CATEGORIES, QUICK_DURATIONS } from '@/lib/constants'
import { formatTime } from '@/lib/utils/dates'
import type { BlockCategory } from '@/types/models'

interface QuickAddBlockProps {
  startTime: Date
  onClose: () => void
  onSave: (data: {
    title: string
    start_time: string
    end_time: string
    category: BlockCategory
    color: string
  }) => void
}

export function QuickAddBlock({ startTime, onClose, onSave }: QuickAddBlockProps) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState<number>(30)
  const [category, setCategory] = useState<BlockCategory>('focus')

  const selectedCategory = BLOCK_CATEGORIES.find((c) => c.value === category)!
  const endTime = addMinutes(startTime, duration)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      category,
      color: selectedCategory.color,
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="absolute left-14 right-2 z-40 bg-saturn-surface rounded-xl shadow-xl border border-saturn-border p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-saturn-text-secondary">
              {formatTime(startTime)} - {formatTime(endTime)}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-saturn-muted" />
            </button>
          </div>

          {/* Title input */}
          <Input
            placeholder="What are you doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="mb-3"
          />

          {/* Duration quick-select */}
          <div className="mb-3">
            <p className="text-xs font-medium text-saturn-text-secondary mb-1.5">
              Duration
            </p>
            <div className="flex gap-2">
              {QUICK_DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={cn(
                    'flex-1 min-h-[40px] rounded-lg text-sm font-medium transition-colors',
                    duration === d
                      ? 'bg-saturn-primary text-white'
                      : 'bg-gray-100 text-saturn-text hover:bg-gray-200'
                  )}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Category selector */}
          <div className="mb-4">
            <p className="text-xs font-medium text-saturn-text-secondary mb-1.5">
              Category
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {BLOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value as BlockCategory)}
                  className={cn(
                    'min-h-[36px] px-3 py-1 rounded-full text-xs font-medium transition-all',
                    category === cat.value
                      ? 'ring-2 ring-offset-1 scale-105'
                      : 'opacity-70 hover:opacity-100'
                  )}
                  style={{
                    backgroundColor: `${cat.color}20`,
                    color: cat.color,
                    ...(category === cat.value ? { ringColor: cat.color } : {}),
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Create button */}
          <Button type="submit" fullWidth disabled={!title.trim()} size="sm">
            Create Block
          </Button>
        </form>
      </motion.div>
    </AnimatePresence>
  )
}
