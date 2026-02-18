'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const variantStyles = {
  primary:
    'bg-saturn-primary text-white hover:bg-saturn-primary-hover active:scale-[0.98] shadow-sm',
  secondary:
    'bg-saturn-surface text-saturn-text border border-saturn-border hover:bg-gray-50 active:scale-[0.98]',
  ghost:
    'bg-transparent text-saturn-text hover:bg-gray-100 active:scale-[0.98]',
  danger:
    'bg-saturn-danger text-white hover:bg-red-600 active:scale-[0.98] shadow-sm',
} as const

const sizeStyles = {
  sm: 'min-h-[44px] px-3 py-2 text-sm gap-1.5',
  md: 'min-h-[44px] px-4 py-2.5 text-base gap-2',
  lg: 'min-h-[56px] px-6 py-3 text-lg gap-2.5',
} as const

export type ButtonVariant = keyof typeof variantStyles
export type ButtonSize = keyof typeof sizeStyles

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-button transition-all duration-150 select-none',
          'focus-visible:outline-2 focus-visible:outline-saturn-primary focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
