'use client'

import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

const variantStyles = {
  default: 'bg-saturn-primary/10 text-saturn-primary',
  success: 'bg-saturn-success/10 text-saturn-success',
  warning: 'bg-saturn-warning/10 text-amber-700',
  danger: 'bg-saturn-danger/10 text-saturn-danger',
  muted: 'bg-gray-100 text-saturn-text-secondary',
} as const

export type BadgeVariant = keyof typeof variantStyles

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
