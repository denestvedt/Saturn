'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { DEFAULT_LISTS } from '@/lib/constants'
import type { List, ListInsert } from '@/types/models'
import type { Database } from '@/types/database'

type ListUpdate = Database['public']['Tables']['lists']['Update']

export function useLists() {
  const { supabase, user } = useSupabase()
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all lists for the current user
  const fetchLists = useCallback(async () => {
    if (!user) {
      setLists([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching lists:', error)
    } else {
      setLists(data ?? [])
    }
    setLoading(false)
  }, [supabase, user])

  // Ensure user has an inbox list; create one plus default lists if not
  const ensureInbox = useCallback(async () => {
    if (!user) return null

    const { data: existing, error: fetchError } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_inbox', true)
      .maybeSingle()

    if (fetchError) {
      console.error('Error checking inbox:', fetchError)
      return null
    }

    if (existing) return existing

    // No inbox found -- create all default lists
    const defaultInserts: ListInsert[] = DEFAULT_LISTS.map((list, index) => ({
      user_id: user.id,
      name: list.name,
      color: list.color,
      icon: list.icon,
      is_inbox: list.is_inbox,
      sort_order: index,
    }))

    const { data: created, error: insertError } = await supabase
      .from('lists')
      .insert(defaultInserts)
      .select()

    if (insertError) {
      console.error('Error creating default lists:', insertError)
      return null
    }

    setLists(created ?? [])
    return created?.find((l) => l.is_inbox) ?? null
  }, [supabase, user])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  // Create a new list
  const createList = useCallback(
    async (list: Omit<ListInsert, 'user_id'>) => {
      if (!user) return null

      const newList: ListInsert = {
        ...list,
        user_id: user.id,
        sort_order: list.sort_order ?? lists.length,
      }

      const optimisticList: List = {
        id: crypto.randomUUID(),
        user_id: user.id,
        name: list.name,
        color: list.color ?? '#6366F1',
        icon: list.icon ?? 'list',
        sort_order: newList.sort_order ?? lists.length,
        is_inbox: list.is_inbox ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setLists((prev) => [...prev, optimisticList])

      const { data, error } = await supabase
        .from('lists')
        .insert(newList)
        .select()
        .single()

      if (error) {
        console.error('Error creating list:', error)
        setLists((prev) => prev.filter((l) => l.id !== optimisticList.id))
        return null
      }

      setLists((prev) =>
        prev.map((l) => (l.id === optimisticList.id ? data : l))
      )
      return data
    },
    [supabase, user, lists.length]
  )

  // Update a list
  const updateList = useCallback(
    async (id: string, updates: ListUpdate) => {
      if (!user) return null

      setLists((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, ...updates, updated_at: new Date().toISOString() }
            : l
        )
      )

      const { data, error } = await supabase
        .from('lists')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating list:', error)
        fetchLists()
        return null
      }

      setLists((prev) => prev.map((l) => (l.id === id ? data : l)))
      return data
    },
    [supabase, user, fetchLists]
  )

  // Delete a list
  const deleteList = useCallback(
    async (id: string) => {
      if (!user) return false

      const previousLists = lists
      setLists((prev) => prev.filter((l) => l.id !== id))

      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting list:', error)
        setLists(previousLists)
        return false
      }

      return true
    },
    [supabase, user, lists]
  )

  return {
    lists,
    loading,
    createList,
    updateList,
    deleteList,
    ensureInbox,
  }
}
