import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WidgetConfig {
  id: string
  enabled: boolean
}

export const WIDGET_DEFINITIONS = [
  { id: 'next-block', label: 'Next Block', icon: 'clock', description: 'Current or upcoming calendar block' },
  { id: 'focus-button', label: 'Focus Timer', icon: 'zap', description: 'Quick-start a 10-minute focus session' },
  { id: 'top-three', label: "Today's Top 3", icon: 'star', description: 'Your three priority tasks for today' },
  { id: 'remaining-tasks', label: 'Remaining Tasks', icon: 'check-square', description: 'Other tasks scheduled for today' },
  { id: 'habits', label: 'Habits', icon: 'target', description: 'Daily habit tracker' },
  { id: 'weekly-plan', label: 'Weekly Plan', icon: 'clipboard-list', description: "This week's goals and progress" },
  { id: 'timer-stats', label: 'Focus Stats', icon: 'timer', description: "Today's focus sessions" },
  { id: 'partner', label: 'Partner', icon: 'users', description: 'Accountability partner status' },
] as const

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'next-block', enabled: true },
  { id: 'focus-button', enabled: true },
  { id: 'top-three', enabled: true },
  { id: 'remaining-tasks', enabled: true },
  { id: 'habits', enabled: true },
  { id: 'weekly-plan', enabled: false },
  { id: 'timer-stats', enabled: false },
  { id: 'partner', enabled: false },
]

interface DashboardState {
  widgets: WidgetConfig[]
  editing: boolean
  setEditing: (editing: boolean) => void
  toggleWidget: (id: string) => void
  moveWidget: (fromIndex: number, toIndex: number) => void
  resetToDefaults: () => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,
      editing: false,
      setEditing: (editing) => set({ editing }),
      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
          ),
        })),
      moveWidget: (fromIndex, toIndex) =>
        set((state) => {
          const widgets = [...state.widgets]
          const [moved] = widgets.splice(fromIndex, 1)
          widgets.splice(toIndex, 0, moved)
          return { widgets }
        }),
      resetToDefaults: () => set({ widgets: DEFAULT_WIDGETS }),
    }),
    {
      name: 'saturn-dashboard',
      partialize: (state) => ({ widgets: state.widgets }),
    }
  )
)
