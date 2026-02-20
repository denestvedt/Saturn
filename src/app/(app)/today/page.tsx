'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { NextBlockCard } from '@/components/today/next-block-card'
import { FocusButton } from '@/components/today/focus-button'
import { DailyTopThree } from '@/components/today/daily-top-three'
import { RemainingTasks } from '@/components/today/remaining-tasks'
import { HabitMiniGrid } from '@/components/today/habit-mini-grid'
import { WeeklyPlanWidget } from '@/components/today/weekly-plan-widget'
import { TimerWidget } from '@/components/today/timer-widget'
import { PartnerWidget } from '@/components/today/partner-widget'
import { DashboardEditor } from '@/components/today/dashboard-editor'
import { Skeleton } from '@/components/ui/skeleton'
import { useSupabase } from '@/providers/supabase-provider'
import { useDashboardStore } from '@/stores/dashboard-store'
import { format } from 'date-fns'
import type { Task, TimeBlock, Habit, HabitCompletion } from '@/types/models'

export default function TodayPage() {
  const { supabase, user } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])

  const { widgets, setEditing } = useDashboardStore()

  const today = format(new Date(), 'yyyy-MM-dd')

  const fetchData = useCallback(async () => {
    if (!user) return

    const [tasksRes, blocksRes, habitsRes, completionsRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .or(`scheduled_date.eq.${today},is_top_three.eq.true`)
        .eq('is_completed', false)
        .order('sort_order'),
      supabase
        .from('time_blocks')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', `${today}T00:00:00`)
        .lte('start_time', `${today}T23:59:59`)
        .order('start_time'),
      supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_date', today),
    ])

    setTasks(tasksRes.data ?? [])
    setBlocks(blocksRes.data ?? [])
    setHabits(habitsRes.data ?? [])
    setCompletions(completionsRes.data ?? [])
    setLoading(false)
  }, [supabase, user, today])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleTask = useCallback(async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newCompleted = !task.is_completed
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
          : t
      )
    )

    await supabase
      .from('tasks')
      .update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', taskId)
  }, [supabase, tasks])

  const toggleHabit = useCallback(async (habitId: string) => {
    if (!user) return
    const existing = completions.find((c) => c.habit_id === habitId)

    if (existing) {
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id))
      await supabase.from('habit_completions').delete().eq('id', existing.id)
    } else {
      const newCompletion = {
        habit_id: habitId,
        user_id: user.id,
        completed_date: today,
      }
      const { data } = await supabase
        .from('habit_completions')
        .insert(newCompletion)
        .select()
        .single()
      if (data) {
        setCompletions((prev) => [...prev, data])
      }
    }
  }, [supabase, user, today, completions])

  // Find current or next block
  const now = new Date()
  const currentBlock = blocks.find(
    (b) => new Date(b.start_time) <= now && new Date(b.end_time) > now
  )
  const nextBlock = currentBlock || blocks.find((b) => new Date(b.start_time) > now) || null

  const topThree = tasks.filter((t) => t.is_top_three)
  const remaining = tasks.filter((t) => !t.is_top_three)

  const greeting = getGreeting()

  const enabledWidgets = widgets.filter((w) => w.enabled)

  const gearButton = (
    <button
      onClick={() => setEditing(true)}
      className="p-2 rounded-xl text-saturn-muted hover:text-saturn-text bg-saturn-surface border border-saturn-border hover:bg-gray-100 transition-colors"
      aria-label="Customize dashboard"
    >
      <Settings2 className="w-5 h-5" />
    </button>
  )

  const widgetComponents: Record<string, React.ReactNode> = {
    'next-block': <NextBlockCard block={nextBlock} isCurrentBlock={!!currentBlock} />,
    'focus-button': <FocusButton />,
    'top-three': (
      <DailyTopThree
        tasks={topThree}
        onToggle={toggleTask}
        onAdd={() => {
          window.location.href = '/tasks'
        }}
      />
    ),
    'remaining-tasks': <RemainingTasks tasks={remaining} onToggle={toggleTask} />,
    'habits': (
      <HabitMiniGrid
        habits={habits}
        completions={completions}
        onToggle={toggleHabit}
      />
    ),
    'weekly-plan': <WeeklyPlanWidget />,
    'timer-stats': <TimerWidget />,
    'partner': <PartnerWidget />,
  }

  if (loading) {
    return (
      <div className="min-h-full">
        <Header title="Today" actions={gearButton} />
        <div className="px-4 space-y-4 max-w-lg mx-auto">
          <Skeleton className="h-24 w-full rounded-card" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-card" />
          <Skeleton className="h-12 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <Header
        title="Today"
        subtitle={greeting}
        actions={gearButton}
      />

      <div className="px-4 pb-8 space-y-4 max-w-lg mx-auto">
        {enabledWidgets.map((widget) => (
          <div key={widget.id}>{widgetComponents[widget.id]}</div>
        ))}

        {enabledWidgets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-saturn-muted text-sm">No widgets enabled.</p>
            <button
              onClick={() => setEditing(true)}
              className="text-saturn-primary text-sm font-medium mt-2 hover:underline"
            >
              Customize your dashboard
            </button>
          </div>
        )}
      </div>

      <DashboardEditor />
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
