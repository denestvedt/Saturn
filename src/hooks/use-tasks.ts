'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import type { Task, TaskInsert } from '@/types/models'
import type { Database } from '@/types/database'

type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export function useTasks(listId?: string) {
  const { supabase, user } = useSupabase()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch tasks, optionally filtered by list
  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (listId) {
      query = query.eq('list_id', listId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data ?? [])
    }
    setLoading(false)
  }, [supabase, user, listId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Create a new task
  const createTask = useCallback(
    async (task: Omit<TaskInsert, 'user_id'>) => {
      if (!user) return null

      const newTask: TaskInsert = {
        ...task,
        user_id: user.id,
      }

      // Optimistic: generate a temporary id
      const optimisticTask: Task = {
        id: crypto.randomUUID(),
        user_id: user.id,
        list_id: task.list_id ?? null,
        title: task.title,
        description: task.description ?? null,
        is_completed: task.is_completed ?? false,
        is_top_three: task.is_top_three ?? false,
        priority: task.priority ?? 0,
        due_date: task.due_date ?? null,
        scheduled_date: task.scheduled_date ?? null,
        time_block_id: task.time_block_id ?? null,
        sort_order: task.sort_order ?? 0,
        is_recurring: task.is_recurring ?? false,
        recurrence_rule: task.recurrence_rule ?? null,
        recurrence_parent_id: task.recurrence_parent_id ?? null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setTasks((prev) => [optimisticTask, ...prev])

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        // Rollback optimistic update
        setTasks((prev) => prev.filter((t) => t.id !== optimisticTask.id))
        return null
      }

      // Replace optimistic task with real one
      setTasks((prev) =>
        prev.map((t) => (t.id === optimisticTask.id ? data : t))
      )
      return data
    },
    [supabase, user]
  )

  // Update a task
  const updateTask = useCallback(
    async (id: string, updates: TaskUpdate) => {
      if (!user) return null

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...updates, updated_at: new Date().toISOString() }
            : t
        )
      )

      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating task:', error)
        // Refetch to restore correct state
        fetchTasks()
        return null
      }

      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)))
      return data
    },
    [supabase, user, fetchTasks]
  )

  // Delete a task
  const deleteTask = useCallback(
    async (id: string) => {
      if (!user) return false

      // Optimistic removal
      const previousTasks = tasks
      setTasks((prev) => prev.filter((t) => t.id !== id))

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting task:', error)
        setTasks(previousTasks)
        return false
      }

      return true
    },
    [supabase, user, tasks]
  )

  // Toggle task completion
  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id)
      if (!task || !user) return null

      const isCompleted = !task.is_completed
      const completedAt = isCompleted ? new Date().toISOString() : null

      return updateTask(id, {
        is_completed: isCompleted,
        completed_at: completedAt,
      })
    },
    [tasks, user, updateTask]
  )

  // Reorder tasks by providing new sort orders
  const reorderTasks = useCallback(
    async (reorderedTasks: { id: string; sort_order: number }[]) => {
      if (!user) return

      // Optimistic update
      setTasks((prev) =>
        prev
          .map((t) => {
            const reordered = reorderedTasks.find((r) => r.id === t.id)
            return reordered ? { ...t, sort_order: reordered.sort_order } : t
          })
          .sort((a, b) => a.sort_order - b.sort_order)
      )

      // Update each task's sort order in the database
      const promises = reorderedTasks.map(({ id, sort_order }) =>
        supabase
          .from('tasks')
          .update({ sort_order, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', user.id)
      )

      const results = await Promise.all(promises)
      const hasError = results.some((r) => r.error)

      if (hasError) {
        console.error('Error reordering tasks')
        fetchTasks()
      }
    },
    [supabase, user, fetchTasks]
  )

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
  }
}
