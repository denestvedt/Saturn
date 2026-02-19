'use client'

import { useEffect, type ReactNode } from 'react'
import {
  motion,
  AnimatePresence,
  useDragControls,
  type PanInfo,
} from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  className,
}: DrawerProps) {
  const dragControls = useDragControls()

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative w-full bg-saturn-surface rounded-t-2xl shadow-xl',
              'max-h-[85vh] overflow-y-auto',
              'p-5 pb-8',
              className
            )}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center mb-4 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1.5 rounded-full bg-saturn-border" />
            </div>

            {title && (
              <h2 className="text-lg font-semibold text-saturn-text mb-4">
                {title}
              </h2>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
