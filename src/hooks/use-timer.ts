'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '@/stores/timer-store'
import { useSupabase } from '@/providers/supabase-provider'

export function useTimer() {
  const workerRef = useRef<Worker | null>(null)
  const store = useTimerStore()
  const { supabase, user } = useSupabase()

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/timer-worker.ts', import.meta.url)
    )

    workerRef.current.onmessage = (e) => {
      switch (e.data.type) {
        case 'TICK':
          store.setRemaining(e.data.remaining)
          break
        case 'COMPLETE':
          store.setStatus('completed')
          playCompletionSound()
          sendNotification()
          break
        case 'PAUSED':
          store.setStatus('paused')
          store.setRemaining(e.data.remaining)
          break
        case 'RESET':
          break
      }
    }

    return () => workerRef.current?.terminate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = useCallback(async (durationSeconds?: number) => {
    const duration = durationSeconds ?? store.totalSeconds
    store.setDuration(duration)
    store.setStatus('running')
    workerRef.current?.postMessage({ type: 'START', duration })

    // Create timer session in Supabase
    if (user) {
      const { data } = await supabase
        .from('timer_sessions')
        .insert({
          user_id: user.id,
          duration_seconds: duration,
          type: 'focus',
          task_id: store.taskId,
          time_block_id: store.timeBlockId,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (data) {
        store.setSessionId(data.id)
      }
    }
  }, [supabase, user, store])

  const pause = useCallback(() => {
    workerRef.current?.postMessage({ type: 'PAUSE' })
  }, [])

  const resume = useCallback(() => {
    store.setStatus('running')
    workerRef.current?.postMessage({ type: 'RESUME' })
  }, [store])

  const addTime = useCallback((seconds: number = 300) => {
    store.addTime(seconds)
    if (store.status === 'running') {
      workerRef.current?.postMessage({ type: 'ADD_TIME', seconds })
    }
  }, [store])

  const reset = useCallback(() => {
    workerRef.current?.postMessage({ type: 'RESET' })
    store.reset()
  }, [store])

  const complete = useCallback(async (reflection?: string) => {
    if (user && store.sessionId) {
      const actualSeconds = store.totalSeconds - store.remainingSeconds
      await supabase
        .from('timer_sessions')
        .update({
          actual_seconds: actualSeconds,
          completed: true,
          reflection,
          ended_at: new Date().toISOString(),
        })
        .eq('id', store.sessionId)
    }
    reset()
  }, [supabase, user, store, reset])

  return {
    status: store.status,
    totalSeconds: store.totalSeconds,
    remainingSeconds: store.remainingSeconds,
    taskId: store.taskId,
    sessionId: store.sessionId,
    start,
    pause,
    resume,
    addTime,
    reset,
    complete,
    setDuration: store.setDuration,
    setTaskId: store.setTaskId,
    setTimeBlockId: store.setTimeBlockId,
  }
}

function playCompletionSound() {
  try {
    const audio = new Audio('/sounds/timer-end.mp3')
    audio.play().catch(() => {})
  } catch {
    // Ignore audio errors
  }
}

function sendNotification() {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('Timer complete!', {
      body: 'Great focus session. How did it go?',
      icon: '/icons/icon-192x192.png',
    })
  }
}
