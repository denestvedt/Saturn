'use client'

import { useState, useEffect, useCallback } from 'react'
import { Timer, Zap, ArrowRight } from 'lucide-react'
import { useSupabase } from '@/providers/supabase-provider'
import { format } from 'date-fns'
import Link from 'next/link'
import type { TimerSession } from '@/types/models'

export function TimerWidget() {
  const { supabase, user } = useSupabase()
  const [sessions, setSessions] = useState<TimerSession[]>([])
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), 'yyyy-MM-dd')

  const fetchSessions = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('started_at', `${today}T00:00:00`)
      .lte('started_at', `${today}T23:59:59`)
      .eq('completed', true)
      .order('started_at', { ascending: false })
    setSessions(data ?? [])
    setLoading(false)
  }, [supabase, user, today])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  if (loading) return null

  const totalMinutes = Math.round(
    sessions.reduce((sum, s) => sum + (s.actual_seconds ?? 0), 0) / 60
  )

  return (
    <div className="bg-saturn-surface rounded-card p-4 border border-saturn-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-saturn-primary" />
          <h3 className="text-sm font-semibold text-saturn-text">Focus Stats</h3>
        </div>
        <Link href="/timer">
          <ArrowRight className="w-4 h-4 text-saturn-muted" />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 text-center p-3 rounded-xl bg-saturn-primary/5">
          <p className="text-2xl font-bold text-saturn-primary">{totalMinutes}</p>
          <p className="text-xs text-saturn-text-secondary mt-0.5">minutes focused</p>
        </div>
        <div className="flex-1 text-center p-3 rounded-xl bg-saturn-success/5">
          <p className="text-2xl font-bold text-saturn-success">{sessions.length}</p>
          <p className="text-xs text-saturn-text-secondary mt-0.5">sessions done</p>
        </div>
      </div>

      {sessions.length === 0 && (
        <Link href="/timer?duration=600" className="block mt-3">
          <div className="flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-saturn-border hover:border-saturn-primary/30 transition-colors">
            <Zap className="w-3.5 h-3.5 text-saturn-muted" />
            <span className="text-xs text-saturn-muted">Start your first session</span>
          </div>
        </Link>
      )}
    </div>
  )
}
