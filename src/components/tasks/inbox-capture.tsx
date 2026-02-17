'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface InboxCaptureProps {
  onTaskCreated: (title: string) => Promise<void> | void
  className?: string
}

export function InboxCapture({ onTaskCreated, className }: InboxCaptureProps) {
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount
  useEffect(() => {
    // Small delay to avoid keyboard popping up on mobile page load
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Clear toast after a brief moment
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    try {
      await onTaskCreated(trimmed)
      setValue('')
      setToast('Added to Inbox')
      inputRef.current?.focus()
    } catch {
      setToast('Could not add task')
    } finally {
      setSubmitting(false)
    }
  }, [value, submitting, onTaskCreated])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2 bg-saturn-surface border border-saturn-border rounded-card p-2 shadow-sm">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim() || submitting}
          className={cn(
            'min-h-[44px] min-w-[44px] flex items-center justify-center rounded-button',
            'bg-saturn-primary text-white',
            'hover:bg-saturn-primary-hover active:scale-95',
            'transition-all duration-150',
            'disabled:opacity-40 disabled:pointer-events-none'
          )}
          aria-label="Add task"
        >
          <Plus className="h-6 w-6" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you need to do?"
          disabled={submitting}
          className={cn(
            'flex-1 min-h-[44px] bg-transparent text-base text-saturn-text',
            'placeholder:text-saturn-muted',
            'focus:outline-none',
            'disabled:opacity-50'
          )}
        />
      </div>

      {/* Brief toast notification */}
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 z-10 px-4 py-1.5 rounded-full bg-saturn-text text-white text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  )
}
