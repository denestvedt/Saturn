'use client'

import { cn } from '@/lib/utils/cn'

export interface ProgressRingProps {
  /** Progress from 0 to 100 */
  progress: number
  /** Diameter of the ring in pixels */
  size?: number
  /** Width of the stroke in pixels */
  strokeWidth?: number
  /** Color of the progress arc (Tailwind stroke class or CSS color) */
  color?: string
  /** Color of the background track */
  trackColor?: string
  className?: string
  children?: React.ReactNode
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'stroke-saturn-primary',
  trackColor = 'stroke-saturn-border',
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const offset = circumference - (clampedProgress / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackColor}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      {/* Center content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
