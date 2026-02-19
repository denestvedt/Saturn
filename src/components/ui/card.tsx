'use client'

import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const

export function Card({
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card bg-saturn-surface border border-saturn-border shadow-sm',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-3 mb-3 border-b border-saturn-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
