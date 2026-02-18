'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils/cn'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  autoResize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, helperText, error, autoResize = false, className, id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const internalRef = useRef<HTMLTextAreaElement | null>(null)

    const resize = useCallback(() => {
      const el = internalRef.current
      if (!el || !autoResize) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [autoResize])

    useEffect(() => {
      resize()
    }, [resize, props.value])

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-saturn-text"
          >
            {label}
          </label>
        )}
        <textarea
          ref={(node) => {
            internalRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          id={inputId}
          rows={3}
          onInput={autoResize ? resize : undefined}
          className={cn(
            'min-h-[88px] w-full rounded-button border bg-saturn-surface px-3 py-2.5 text-base text-saturn-text',
            'placeholder:text-saturn-muted',
            'transition-colors duration-150 resize-y',
            'focus:outline-none focus:ring-2 focus:ring-saturn-primary focus:border-transparent',
            error
              ? 'border-saturn-danger focus:ring-saturn-danger'
              : 'border-saturn-border',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            autoResize && 'resize-none overflow-hidden',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-saturn-danger">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-saturn-text-secondary"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
