import { create } from 'zustand'
import type { TimerStatus } from '@/types/models'

interface TimerState {
  status: TimerStatus
  totalSeconds: number
  remainingSeconds: number
  taskId: string | null
  timeBlockId: string | null
  sessionId: string | null
  setDuration: (seconds: number) => void
  setRemaining: (seconds: number) => void
  setStatus: (status: TimerStatus) => void
  setTaskId: (taskId: string | null) => void
  setTimeBlockId: (id: string | null) => void
  setSessionId: (sessionId: string | null) => void
  addTime: (seconds: number) => void
  reset: () => void
}

export const useTimerStore = create<TimerState>((set) => ({
  status: 'idle',
  totalSeconds: 600,
  remainingSeconds: 600,
  taskId: null,
  timeBlockId: null,
  sessionId: null,
  setDuration: (seconds) => set({ totalSeconds: seconds, remainingSeconds: seconds }),
  setRemaining: (seconds) => set({ remainingSeconds: seconds }),
  setStatus: (status) => set({ status }),
  setTaskId: (taskId) => set({ taskId }),
  setTimeBlockId: (id) => set({ timeBlockId: id }),
  setSessionId: (sessionId) => set({ sessionId }),
  addTime: (seconds) =>
    set((state) => ({
      totalSeconds: state.totalSeconds + seconds,
      remainingSeconds: state.remainingSeconds + seconds,
    })),
  reset: () =>
    set({
      status: 'idle',
      totalSeconds: 600,
      remainingSeconds: 600,
      taskId: null,
      timeBlockId: null,
      sessionId: null,
    }),
}))
