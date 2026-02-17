'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import type { Habit, HabitInsert, HabitCompletion } from '@/types/models'
import type { Database } from '@/types/database'

type HabitUpdate = Database['public']['Tables']['habits']['Update']

export function useHabits() {
  const { supabase, user } = useSupabase()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHabits = useCallback(async () => {
    if (!user) {
      setHabits([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching habits:', error)
    } else {
      setHabits(data ?? [])
    }
    setLoading(false)
  }, [supabase, user])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const createHabit = useCallback(
    async (habit: Omit<HabitInsert, 'user_id'>) => {
      if (!user) return null

      const newHabit: HabitInsert = {
        ...habit,
        user_id: user.id,
      }

      const optimisticHabit: Habit = {
        id: crypto.randomUUID(),
        user_id: user.id,
        name: habit.name,
        description: habit.description ?? null,
        color: habit.color ?? '#6366F1',
        icon: habit.icon ?? 'circle',
        frequency: habit.frequency ?? { type: 'daily' },
        target_per_day: habit.target_per_day ?? 1,
        reminder_time: habit.reminder_time ?? null,
        is_active: true,
        sort_order: habit.sort_order ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setHabits((prev) => [optimisticHabit, ...prev])

      const { data, error } = await supabase
        .from('habits')
        .insert(newHabit)
        .select()
        .single()

      if (error) {
        console.error('Error creating habit:', error)
        setHabits((prev) => prev.filter((h) => h.id !== optimisticHabit.id))
        return null
      }

      setHabits((prev) =>
        prev.map((h) => (h.id === optimisticHabit.id ? data : h))
      )
      return data
    },
    [supabase, user]
  )

  const updateHabit = useCallback(
    async (id: string, updates: HabitUpdate) => {
      if (!user) return null

      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, ...updates, updated_at: new Date().toISOString() }
            : h
        )
      )

      const { data, error } = await supabase
        .from('habits')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating habit:', error)
        fetchHabits()
        return null
      }

      setHabits((prev) => prev.map((h) => (h.id === id ? data : h)))
      return data
    },
    [supabase, user, fetchHabits]
  )

  const deleteHabit = useCallback(
    async (id: string) => {
      if (!user) return false

      const previousHabits = habits
      setHabits((prev) => prev.filter((h) => h.id !== id))

      const { error } = await supabase
        .from('habits')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting habit:', error)
        setHabits(previousHabits)
        return false
      }

      return true
    },
    [supabase, user, habits]
  )

  return {
    habits,
    loading,
    createHabit,
    updateHabit,
    deleteHabit,
    refetch: fetchHabits,
  }
}

export function useHabitCompletions(startDate: string, endDate: string) {
  const { supabase, user } = useSupabase()
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCompletions = useCallback(async () => {
    if (!user) {
      setCompletions([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_date', startDate)
      .lte('completed_date', endDate)

    if (error) {
      console.error('Error fetching completions:', error)
    } else {
      setCompletions(data ?? [])
    }
    setLoading(false)
  }, [supabase, user, startDate, endDate])

  useEffect(() => {
    fetchCompletions()
  }, [fetchCompletions])

  const toggleCompletion = useCallback(
    async (habitId: string, date: string) => {
      if (!user) return

      const existing = completions.find(
        (c) => c.habit_id === habitId && c.completed_date === date
      )

      if (existing) {
        // Optimistic removal
        setCompletions((prev) => prev.filter((c) => c.id !== existing.id))

        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existing.id)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error removing completion:', error)
          setCompletions((prev) => [...prev, existing])
        }
      } else {
        // Optimistic insert
        const optimistic: HabitCompletion = {
          id: crypto.randomUUID(),
          habit_id: habitId,
          user_id: user.id,
          completed_date: date,
          count: 1,
          note: null,
          created_at: new Date().toISOString(),
        }

        setCompletions((prev) => [...prev, optimistic])

        const { data, error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            completed_date: date,
            count: 1,
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating completion:', error)
          setCompletions((prev) => prev.filter((c) => c.id !== optimistic.id))
        } else if (data) {
          setCompletions((prev) =>
            prev.map((c) => (c.id === optimistic.id ? data : c))
          )
        }
      }
    },
    [supabase, user, completions]
  )

  return {
    completions,
    loading,
    toggleCompletion,
    refetch: fetchCompletions,
  }
}
