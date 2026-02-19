'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import type { TimeBlock, TimeBlockInsert } from '@/types/models'
import type { Database } from '@/types/database'
import { addDays, format } from 'date-fns'

type TimeBlockUpdate = Database['public']['Tables']['time_blocks']['Update']

export function useTimeBlocks(date: string) {
  const { supabase, user } = useSupabase()
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBlocks = useCallback(async () => {
    if (!user) {
      setBlocks([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Fetch blocks that overlap with the given date
    const dayStart = `${date}T00:00:00`
    const dayEnd = `${date}T23:59:59`

    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', dayStart)
      .lte('start_time', dayEnd)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching time blocks:', error)
    } else {
      setBlocks(data ?? [])
    }
    setLoading(false)
  }, [supabase, user, date])

  useEffect(() => {
    fetchBlocks()
  }, [fetchBlocks])

  const createBlock = useCallback(
    async (block: Omit<TimeBlockInsert, 'user_id'>) => {
      if (!user) return null

      const newBlock: TimeBlockInsert = {
        ...block,
        user_id: user.id,
      }

      // Optimistic update
      const optimisticBlock: TimeBlock = {
        id: crypto.randomUUID(),
        user_id: user.id,
        title: block.title,
        description: block.description ?? null,
        start_time: block.start_time,
        end_time: block.end_time,
        color: block.color ?? '#6366F1',
        category: block.category ?? 'focus',
        is_completed: block.is_completed ?? false,
        is_recurring: block.is_recurring ?? false,
        recurrence_rule: block.recurrence_rule ?? null,
        recurrence_parent_id: block.recurrence_parent_id ?? null,
        task_ids: block.task_ids ?? [],
        routine_template_id: block.routine_template_id ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setBlocks((prev) =>
        [...prev, optimisticBlock].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        )
      )

      const { data, error } = await supabase
        .from('time_blocks')
        .insert(newBlock)
        .select()
        .single()

      if (error) {
        console.error('Error creating time block:', error)
        setBlocks((prev) => prev.filter((b) => b.id !== optimisticBlock.id))
        return null
      }

      setBlocks((prev) =>
        prev.map((b) => (b.id === optimisticBlock.id ? data : b))
      )
      return data
    },
    [supabase, user]
  )

  const updateBlock = useCallback(
    async (id: string, updates: TimeBlockUpdate) => {
      if (!user) return null

      // Optimistic update
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, ...updates, updated_at: new Date().toISOString() }
            : b
        )
      )

      const { data, error } = await supabase
        .from('time_blocks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating time block:', error)
        fetchBlocks()
        return null
      }

      setBlocks((prev) => prev.map((b) => (b.id === id ? data : b)))
      return data
    },
    [supabase, user, fetchBlocks]
  )

  const deleteBlock = useCallback(
    async (id: string) => {
      if (!user) return false

      const previousBlocks = blocks
      setBlocks((prev) => prev.filter((b) => b.id !== id))

      const { error } = await supabase
        .from('time_blocks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting time block:', error)
        setBlocks(previousBlocks)
        return false
      }

      return true
    },
    [supabase, user, blocks]
  )

  const moveBlock = useCallback(
    async (id: string, newStartTime: string, newEndTime: string) => {
      return updateBlock(id, {
        start_time: newStartTime,
        end_time: newEndTime,
      })
    },
    [updateBlock]
  )

  return {
    blocks,
    loading,
    createBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
  }
}

export function useWeekBlocks(weekStart: string) {
  const { supabase, user } = useSupabase()
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBlocks = useCallback(async () => {
    if (!user) {
      setBlocks([])
      setLoading(false)
      return
    }

    setLoading(true)

    const start = `${weekStart}T00:00:00`
    const weekEndDate = format(addDays(new Date(weekStart), 6), 'yyyy-MM-dd')
    const end = `${weekEndDate}T23:59:59`

    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', start)
      .lte('start_time', end)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching week blocks:', error)
    } else {
      setBlocks(data ?? [])
    }
    setLoading(false)
  }, [supabase, user, weekStart])

  useEffect(() => {
    fetchBlocks()
  }, [fetchBlocks])

  const createBlock = useCallback(
    async (block: Omit<TimeBlockInsert, 'user_id'>) => {
      if (!user) return null

      const newBlock: TimeBlockInsert = {
        ...block,
        user_id: user.id,
      }

      const optimisticBlock: TimeBlock = {
        id: crypto.randomUUID(),
        user_id: user.id,
        title: block.title,
        description: block.description ?? null,
        start_time: block.start_time,
        end_time: block.end_time,
        color: block.color ?? '#6366F1',
        category: block.category ?? 'focus',
        is_completed: block.is_completed ?? false,
        is_recurring: block.is_recurring ?? false,
        recurrence_rule: block.recurrence_rule ?? null,
        recurrence_parent_id: block.recurrence_parent_id ?? null,
        task_ids: block.task_ids ?? [],
        routine_template_id: block.routine_template_id ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setBlocks((prev) =>
        [...prev, optimisticBlock].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        )
      )

      const { data, error } = await supabase
        .from('time_blocks')
        .insert(newBlock)
        .select()
        .single()

      if (error) {
        console.error('Error creating time block:', error)
        setBlocks((prev) => prev.filter((b) => b.id !== optimisticBlock.id))
        return null
      }

      setBlocks((prev) =>
        prev.map((b) => (b.id === optimisticBlock.id ? data : b))
      )
      return data
    },
    [supabase, user]
  )

  const updateBlock = useCallback(
    async (id: string, updates: TimeBlockUpdate) => {
      if (!user) return null

      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, ...updates, updated_at: new Date().toISOString() }
            : b
        )
      )

      const { data, error } = await supabase
        .from('time_blocks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating time block:', error)
        fetchBlocks()
        return null
      }

      setBlocks((prev) => prev.map((b) => (b.id === id ? data : b)))
      return data
    },
    [supabase, user, fetchBlocks]
  )

  const deleteBlock = useCallback(
    async (id: string) => {
      if (!user) return false

      const previousBlocks = blocks
      setBlocks((prev) => prev.filter((b) => b.id !== id))

      const { error } = await supabase
        .from('time_blocks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting time block:', error)
        setBlocks(previousBlocks)
        return false
      }

      return true
    },
    [supabase, user, blocks]
  )

  const moveBlock = useCallback(
    async (id: string, newStartTime: string, newEndTime: string) => {
      return updateBlock(id, {
        start_time: newStartTime,
        end_time: newEndTime,
      })
    },
    [updateBlock]
  )

  return {
    blocks,
    loading,
    createBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
  }
}
