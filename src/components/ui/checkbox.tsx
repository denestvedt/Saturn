'use client'

import { type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function Checkbox({
  label,
  checked,
  className,
  id,
  ...props
}: CheckboxProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex items-center gap-3 min-h-[44px] min-w-[44px] cursor-pointer select-none',
        props.disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            'h-6 w-6 rounded-md border-2 transition-all duration-150 flex items-center justify-center',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-saturn-primary peer-focus-visible:ring-offset-2',
            checked
              ? 'bg-saturn-primary border-saturn-primary'
              : 'border-saturn-muted bg-saturn-surface'
          )}
        >
          {checked && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
        </div>
      </div>
      {label && (
        <span className="text-base text-saturn-text">{label}</span>
      )}
    </label>
  )
}
