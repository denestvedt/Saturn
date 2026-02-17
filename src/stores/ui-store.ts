import { create } from 'zustand'

interface UIState {
  // Modal/drawer state
  activeModal: string | null
  activeDrawer: string | null
  // Calendar view
  calendarView: 'day' | 'week'
  calendarDate: string // ISO date string
  // Task editor
  editingTaskId: string | null
  // Time block editor
  editingBlockId: string | null
  // Habit editor
  editingHabitId: string | null
  // Actions
  openModal: (id: string) => void
  closeModal: () => void
  openDrawer: (id: string) => void
  closeDrawer: () => void
  setCalendarView: (view: 'day' | 'week') => void
  setCalendarDate: (date: string) => void
  setEditingTaskId: (id: string | null) => void
  setEditingBlockId: (id: string | null) => void
  setEditingHabitId: (id: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  activeDrawer: null,
  calendarView: 'day',
  calendarDate: new Date().toISOString().split('T')[0],
  editingTaskId: null,
  editingBlockId: null,
  editingHabitId: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  openDrawer: (id) => set({ activeDrawer: id }),
  closeDrawer: () => set({ activeDrawer: null }),
  setCalendarView: (view) => set({ calendarView: view }),
  setCalendarDate: (date) => set({ calendarDate: date }),
  setEditingTaskId: (id) => set({ editingTaskId: id }),
  setEditingBlockId: (id) => set({ editingBlockId: id }),
  setEditingHabitId: (id) => set({ editingHabitId: id }),
}))
