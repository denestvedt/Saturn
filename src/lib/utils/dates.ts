import {
  format,
  formatDistanceToNow,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addMinutes,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  parseISO,
  differenceInMinutes,
  getDay,
} from 'date-fns'

export {
  format,
  formatDistanceToNow,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addMinutes,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  parseISO,
  differenceInMinutes,
  getDay,
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'h:mm a')
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d')
}

export function formatDayOfWeek(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEE')
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getWeekDates(date: Date = new Date()): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = []
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  for (let d = start; d <= end; d = addDays(d, 1)) {
    dates.push(new Date(d))
  }
  return dates
}

export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function secondsToDisplay(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function getTimeSlotPosition(time: Date | string, dayStartHour: number = 6): number {
  const d = typeof time === 'string' ? parseISO(time) : time
  const hours = d.getHours() + d.getMinutes() / 60
  return (hours - dayStartHour) * 48 * 2 // 48px per 30 minutes
}
