'use client'

import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export type SkeletonProps = HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-button bg-saturn-border/60 animate-pulse',
        className
      )}
      {...props}
    />
  )
}
