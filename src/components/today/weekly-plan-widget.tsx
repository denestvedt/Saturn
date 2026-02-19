'use client'

import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, ArrowRight } from 'lucide-react'
import { useSupabase } from '@/providers/supabase-provider'
import { startOfWeek, format } from 'date-fns'
import Link from 'next/link'
import type { WeeklyPlan } from '@/types/models'

export function WeeklyPlanWidget() {
  const { supabase, user } = useSupabase()
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPlan = useCallback(async () => {
    if (!user) return
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()
    setPlan(data)
    setLoading(false)
  }, [supabase, user])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  if (loading) return null

  const goals = (plan?.goals as Array<{ text: string; done?: boolean }>) ?? []
  const completedGoals = goals.filter((g) => g.done).length

  return (
    <Link href="/plan" className="block">
      <div className="bg-saturn-surface rounded-card p-4 border border-saturn-border hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-saturn-secondary" />
            <h3 className="text-sm font-semibold text-saturn-text">Weekly Plan</h3>
          </div>
          <ArrowRight className="w-4 h-4 text-saturn-muted" />
        </div>

        {!plan ? (
          <p className="text-sm text-saturn-muted">No plan set for this week. Tap to create one.</p>
        ) : goals.length === 0 ? (
          <p className="text-sm text-saturn-muted">No goals added yet. Tap to add some.</p>
        ) : (
          <>
            <div className="space-y-1.5">
              {goals.slice(0, 3).map((goal, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      goal.done
                        ? 'bg-saturn-success'
                        : 'border-2 border-saturn-border'
                    }`}
                  >
                    {goal.done && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm truncate ${goal.done ? 'text-saturn-muted line-through' : 'text-saturn-text'}`}>
                    {goal.text}
                  </span>
                </div>
              ))}
              {goals.length > 3 && (
                <p className="text-xs text-saturn-muted pl-6">+{goals.length - 3} more</p>
              )}
            </div>
            {goals.length > 0 && (
              <p className="text-xs text-saturn-muted mt-2 text-center">
                {completedGoals} of {goals.length} goals done
              </p>
            )}
          </>
        )}
      </div>
    </Link>
  )
}
