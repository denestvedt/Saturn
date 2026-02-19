import { parseISO, addMinutes, format } from 'date-fns'
import type { TimeBlock } from '@/types/models'

const DAY_START_HOUR = 6
const DAY_END_HOUR = 23
const PIXELS_PER_30MIN = 48

/**
 * Calculate the top position in pixels for a time block in the day view.
 */
export function getBlockTop(startTime: string | Date): number {
  const d = typeof startTime === 'string' ? parseISO(startTime) : startTime
  const hours = d.getHours() + d.getMinutes() / 60
  return (hours - DAY_START_HOUR) * PIXELS_PER_30MIN * 2
}

/**
 * Calculate the height in pixels for a time block based on duration.
 */
export function getBlockHeight(startTime: string | Date, endTime: string | Date): number {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return Math.max(durationHours * PIXELS_PER_30MIN * 2, PIXELS_PER_30MIN) // min 30min height
}

/**
 * Get the total height of the day view container.
 */
export function getDayViewHeight(): number {
  return (DAY_END_HOUR - DAY_START_HOUR) * PIXELS_PER_30MIN * 2
}

/**
 * Generate time slot data for the day view.
 */
export function generateTimeSlots(date: Date): { id: string; hour: number; minute: number; label: string; top: number }[] {
  const slots = []
  for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
    for (const minute of [0, 30]) {
      const dateStr = format(date, 'yyyy-MM-dd')
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      slots.push({
        id: `slot-${dateStr}-${h}${m}`,
        hour,
        minute,
        label: minute === 0 ? format(new Date(2000, 0, 1, hour), 'h a') : '',
        top: (hour - DAY_START_HOUR) * PIXELS_PER_30MIN * 2 + (minute === 30 ? PIXELS_PER_30MIN : 0),
      })
    }
  }
  return slots
}

/**
 * Parse a slot ID to get the start time.
 */
export function parseSlotId(slotId: string): Date {
  // Format: "slot-2026-02-16-0930"
  const parts = slotId.replace('slot-', '')
  const datePart = parts.slice(0, 10)
  const timePart = parts.slice(11)
  const hour = parseInt(timePart.slice(0, 2))
  const minute = parseInt(timePart.slice(2))
  return new Date(`${datePart}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`)
}

/**
 * Check if two time blocks overlap.
 */
export function blocksOverlap(a: { start_time: string; end_time: string }, b: { start_time: string; end_time: string }): boolean {
  const aStart = parseISO(a.start_time).getTime()
  const aEnd = parseISO(a.end_time).getTime()
  const bStart = parseISO(b.start_time).getTime()
  const bEnd = parseISO(b.end_time).getTime()
  return aStart < bEnd && bStart < aEnd
}

/**
 * Find the next available slot of a given duration on a date.
 */
export function findNextAvailableSlot(
  date: Date,
  blocks: TimeBlock[],
  durationMinutes: number
): Date | null {
  const now = new Date()
  let candidate = new Date(date)
  candidate.setHours(Math.max(DAY_START_HOUR, now.getHours()), now.getMinutes() > 30 ? 30 : 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(DAY_END_HOUR, 0, 0, 0)

  while (candidate < endOfDay) {
    const candidateEnd = addMinutes(candidate, durationMinutes)
    const candidateBlock = {
      start_time: candidate.toISOString(),
      end_time: candidateEnd.toISOString(),
    }

    const hasOverlap = blocks.some((b) => blocksOverlap(candidateBlock, b))
    if (!hasOverlap) return candidate

    candidate = addMinutes(candidate, 15)
  }

  return null
}

export { DAY_START_HOUR, DAY_END_HOUR, PIXELS_PER_30MIN }
