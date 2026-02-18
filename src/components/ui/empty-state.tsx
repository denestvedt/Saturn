'use client'

import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-saturn-primary/10">
          <Icon className="h-8 w-8 text-saturn-primary" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-saturn-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-saturn-text-secondary max-w-xs mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
