// App constants
export const APP_NAME = 'Saturn Structure'
export const APP_DESCRIPTION = 'Structure your day, not your brain. An ADHD-friendly planner.'

// Navigation
export const NAV_ITEMS = [
  { label: 'Today', href: '/today', icon: 'sun' },
  { label: 'Calendar', href: '/calendar', icon: 'calendar' },
  { label: 'Tasks', href: '/tasks', icon: 'check-square' },
  { label: 'Habits', href: '/habits', icon: 'target' },
  { label: 'More', href: '#more', icon: 'menu' },
] as const

export const MORE_ITEMS = [
  { label: 'Weekly Plan', href: '/plan', icon: 'clipboard-list' },
  { label: 'Ideas', href: '/ideas', icon: 'lightbulb' },
  { label: 'Partner', href: '/partner', icon: 'users' },
  { label: 'Timer', href: '/timer', icon: 'timer' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
] as const

// Timer presets (in seconds)
export const TIMER_PRESETS = [
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '25 min', seconds: 1500 },
  { label: '45 min', seconds: 2700 },
  { label: '60 min', seconds: 3600 },
] as const

// Time block categories
export const BLOCK_CATEGORIES = [
  { value: 'focus', label: 'Focus', color: '#6366F1' },
  { value: 'meeting', label: 'Meeting', color: '#EC4899' },
  { value: 'break', label: 'Break', color: '#10B981' },
  { value: 'routine', label: 'Routine', color: '#F59E0B' },
  { value: 'personal', label: 'Personal', color: '#8B5CF6' },
  { value: 'admin', label: 'Admin', color: '#6B7280' },
] as const

// Quick add durations for time blocks (in minutes)
export const QUICK_DURATIONS = [15, 30, 45, 60] as const

// Task priorities
export const TASK_PRIORITIES = [
  { value: 0, label: 'None', color: '#9CA3AF' },
  { value: 1, label: 'Low', color: '#10B981' },
  { value: 2, label: 'Medium', color: '#F59E0B' },
  { value: 3, label: 'High', color: '#EF4444' },
] as const

// Default lists
export const DEFAULT_LISTS = [
  { name: 'Inbox', color: '#6366F1', icon: 'inbox', is_inbox: true },
  { name: 'Work', color: '#EC4899', icon: 'briefcase', is_inbox: false },
  { name: 'Home', color: '#10B981', icon: 'home', is_inbox: false },
  { name: 'Personal', color: '#8B5CF6', icon: 'user', is_inbox: false },
  { name: 'Errands', color: '#F59E0B', icon: 'shopping-cart', is_inbox: false },
] as const

// Habit frequencies
export const HABIT_FREQUENCIES = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'specific_days', label: 'Specific days' },
  { value: 'times_per_week', label: 'X times per week' },
] as const

// Days of week
export const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon', short: 'M' },
  { value: 2, label: 'Tue', short: 'T' },
  { value: 3, label: 'Wed', short: 'W' },
  { value: 4, label: 'Thu', short: 'T' },
  { value: 5, label: 'Fri', short: 'F' },
  { value: 6, label: 'Sat', short: 'S' },
  { value: 0, label: 'Sun', short: 'S' },
] as const

// Supportive messages for the Today view
export const ENCOURAGEMENT_MESSAGES = [
  "You've got this!",
  "One step at a time.",
  "Progress, not perfection.",
  "Small wins add up.",
  "You're doing great.",
  "Just start — momentum will follow.",
  "Be kind to yourself today.",
  "Every check mark counts.",
] as const
