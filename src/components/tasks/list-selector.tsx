'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import type { List } from '@/types/models'

interface ListSelectorProps {
  lists: List[]
  selectedId: string | null
  onChange: (listId: string) => void
  className?: string
}

export function ListSelector({
  lists,
  selectedId,
  onChange,
  className,
}: ListSelectorProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedList = lists.find((l) => l.id === selectedId)

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <label className="text-sm font-medium text-saturn-text mb-1.5 block">
        List
      </label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center justify-between w-full min-h-[44px] px-3 py-2',
          'rounded-button border border-saturn-border bg-saturn-surface',
          'text-base text-saturn-text',
          'hover:bg-gray-50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-saturn-primary focus:border-transparent'
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedList ? (
            <>
              <span
                className="shrink-0 w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedList.color }}
              />
              <span className="truncate">{selectedList.name}</span>
            </>
          ) : (
            <span className="text-saturn-muted">Select a list</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-saturn-muted shrink-0 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full py-1 bg-saturn-surface rounded-button border border-saturn-border shadow-lg max-h-[240px] overflow-y-auto"
          >
            {lists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => {
                  onChange(list.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex items-center gap-2 w-full min-h-[44px] px-3 py-2 text-left text-sm',
                  'hover:bg-gray-50 active:bg-gray-100 transition-colors',
                  list.id === selectedId
                    ? 'text-saturn-primary font-medium'
                    : 'text-saturn-text'
                )}
              >
                <span
                  className="shrink-0 w-3 h-3 rounded-full"
                  style={{ backgroundColor: list.color }}
                />
                <span className="flex-1 truncate">{list.name}</span>
                {list.id === selectedId && (
                  <Check className="h-4 w-4 text-saturn-primary shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
