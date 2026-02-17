'use client'

import { useState, useEffect } from 'react'
import { isToday } from 'date-fns'
import { getBlockTop, DAY_START_HOUR, DAY_END_HOUR } from '@/lib/utils/time-blocks'

interface NowLineProps {
  date: Date
}

export function NowLine({ date }: NowLineProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60_000) // Update every 60 seconds

    return () => clearInterval(interval)
  }, [])

  // Only show if displaying today
  if (!isToday(date)) return null

  const currentHour = now.getHours() + now.getMinutes() / 60

  // Only show within the visible day range
  if (currentHour < DAY_START_HOUR || currentHour > DAY_END_HOUR) return null

  const top = getBlockTop(now)

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      {/* Red dot on left edge */}
      <div className="absolute -left-1.5 -top-[5px] w-[11px] h-[11px] rounded-full bg-red-500" />
      {/* Red line across */}
      <div className="h-[2px] bg-red-500 w-full" />
    </div>
  )
}
