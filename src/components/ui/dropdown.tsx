'use client'

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export interface DropdownItem {
  label: string
  value: string
  icon?: ReactNode
  danger?: boolean
}

export interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  onSelect: (value: string) => void
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({
  trigger,
  items,
  onSelect,
  align = 'left',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  function handleSelect(value: string) {
    onSelect(value)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-1 min-w-[180px] py-1',
              'bg-saturn-surface rounded-button border border-saturn-border shadow-lg',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {items.map((item) => (
              <button
                key={item.value}
                onClick={() => handleSelect(item.value)}
                className={cn(
                  'w-full min-h-[44px] px-3 flex items-center gap-2 text-left text-sm transition-colors',
                  'hover:bg-gray-50 active:bg-gray-100',
                  item.danger
                    ? 'text-saturn-danger'
                    : 'text-saturn-text'
                )}
              >
                {item.icon && (
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
