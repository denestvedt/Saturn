'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Check } from 'lucide-react'
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils/cn'
import { useSupabase } from '@/providers/supabase-provider'
import type { WeeklyPlan, WeeklyGoal } from '@/types/models'


export default function WeeklyPlanPage() {
  const { supabase, user } = useSupabase()
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')

  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [loading, setLoading] = useState(true)

  const [goals, setGoals] = useState<WeeklyGoal[]>([])
  const [newGoalText, setNewGoalText] = useState('')
  const [reflection, setReflection] = useState('')
  const [energyRating, setEnergyRating] = useState<number | null>(null)
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [newFocusArea, setNewFocusArea] = useState('')
  const [saving, setSaving] = useState(false)

  // Fetch plan for selected week
  useEffect(() => {
    async function fetchPlan() {
      if (!user) return
      setLoading(true)

      const { data } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStartStr)
        .maybeSingle()

      if (data) {
        setPlan(data)
        setGoals((data.goals as unknown as WeeklyGoal[]) ?? [])
        setReflection(data.reflection ?? '')
        setEnergyRating(data.energy_rating)
        setFocusAreas(data.focus_areas ?? [])
      } else {
        setPlan(null)
        setGoals([])
        setReflection('')
        setEnergyRating(null)
        setFocusAreas([])
      }
      setLoading(false)
    }
    fetchPlan()
  }, [supabase, user, weekStartStr])

  const addGoal = useCallback(() => {
    const text = newGoalText.trim()
    if (!text) return
    setGoals((prev) => [...prev, { text, completed: false }])
    setNewGoalText('')
  }, [newGoalText])

  const toggleGoal = useCallback((index: number) => {
    setGoals((prev) =>
      prev.map((g, i) =>
        i === index ? { ...g, completed: !g.completed } : g
      )
    )
  }, [])

  const removeGoal = useCallback((index: number) => {
    setGoals((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const addFocusArea = useCallback(() => {
    const area = newFocusArea.trim()
    if (!area || focusAreas.includes(area)) return
    setFocusAreas((prev) => [...prev, area])
    setNewFocusArea('')
  }, [newFocusArea, focusAreas])

  const removeFocusArea = useCallback((index: number) => {
    setFocusAreas((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSave = useCallback(async () => {
    if (!user) return
    setSaving(true)

    const planData = {
      goals: goals as unknown as import('@/types/database').Json,
      reflection: reflection.trim() || null,
      energy_rating: energyRating,
      focus_areas: focusAreas.length > 0 ? focusAreas : null,
      updated_at: new Date().toISOString(),
    }

    if (plan) {
      const { data } = await supabase
        .from('weekly_plans')
        .update(planData)
        .eq('id', plan.id)
        .select()
        .single()
      if (data) setPlan(data)
    } else {
      const { data } = await supabase
        .from('weekly_plans')
        .insert({
          user_id: user.id,
          week_start: weekStartStr,
          ...planData,
        })
        .select()
        .single()
      if (data) setPlan(data)
    }

    setSaving(false)
  }, [supabase, user, plan, weekStartStr, goals, reflection, energyRating, focusAreas])

  const completedCount = useMemo(() => goals.filter((g) => g.completed).length, [goals])

  return (
    <div className="min-h-full">
      <Header title="Weekly Plan" />

      <div className="px-4 pb-8 max-w-lg mx-auto space-y-4">
        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekStart((w) => subWeeks(w, 1))}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5 text-saturn-text" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-saturn-text">
              Week of {format(weekStart, 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-saturn-text-secondary">
              {format(weekStart, 'MMM d')} – {format(addWeeks(weekStart, 1), 'MMM d')}
            </p>
          </div>
          <button
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5 text-saturn-text" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-card" />
            <Skeleton className="h-24 w-full rounded-card" />
          </div>
        ) : (
          <>
            {/* Goals */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-saturn-text">
                  Weekly Goals
                </h2>
                {goals.length > 0 && (
                  <span className="text-xs text-saturn-text-secondary">
                    {completedCount}/{goals.length} done
                  </span>
                )}
              </div>

              {goals.length === 0 ? (
                <p className="text-sm text-saturn-muted mb-3">
                  What do you want to accomplish this week?
                </p>
              ) : (
                <div className="space-y-2 mb-3">
                  {goals.map((goal, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 min-h-[44px] group"
                    >
                      <button
                        onClick={() => toggleGoal(i)}
                        className={cn(
                          'shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors',
                          goal.completed
                            ? 'bg-saturn-success border-saturn-success'
                            : 'border-saturn-border hover:border-saturn-primary'
                        )}
                      >
                        {goal.completed && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </button>
                      <span
                        className={cn(
                          'flex-1 text-sm',
                          goal.completed
                            ? 'text-saturn-muted line-through'
                            : 'text-saturn-text'
                        )}
                      >
                        {goal.text}
                      </span>
                      <button
                        onClick={() => removeGoal(i)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all"
                        aria-label="Remove goal"
                      >
                        <X className="h-4 w-4 text-saturn-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a goal..."
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addGoal()
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={addGoal}
                  disabled={!newGoalText.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Focus areas */}
            <Card>
              <h2 className="text-base font-semibold text-saturn-text mb-3">
                Focus Areas
              </h2>

              {focusAreas.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {focusAreas.map((area, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-saturn-primary/10 text-saturn-primary text-sm font-medium"
                    >
                      {area}
                      <button
                        onClick={() => removeFocusArea(i)}
                        className="hover:bg-saturn-primary/20 rounded-full p-0.5"
                        aria-label={`Remove ${area}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Health, Work project..."
                  value={newFocusArea}
                  onChange={(e) => setNewFocusArea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addFocusArea()
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={addFocusArea}
                  disabled={!newFocusArea.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Energy rating */}
            <Card>
              <h2 className="text-base font-semibold text-saturn-text mb-3">
                Energy Level
              </h2>
              <p className="text-sm text-saturn-text-secondary mb-3">
                How&apos;s your energy this week? This helps plan realistic goals.
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnergyRating(level)}
                    className={cn(
                      'flex-1 min-h-[44px] rounded-xl text-sm font-medium transition-all',
                      energyRating === level
                        ? 'bg-saturn-primary text-white shadow-sm scale-105'
                        : 'bg-gray-100 text-saturn-text-secondary hover:bg-gray-200'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-xs text-saturn-muted">
                <span>Low</span>
                <span>High</span>
              </div>
            </Card>

            {/* Reflection */}
            <Card>
              <h2 className="text-base font-semibold text-saturn-text mb-3">
                Weekly Reflection
              </h2>
              <Textarea
                placeholder="How did the week go? What did you learn? What will you change?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                autoResize
                className="min-h-[100px]"
              />
            </Card>

            {/* Save */}
            <Button onClick={handleSave} loading={saving} fullWidth>
              {plan ? 'Update plan' : 'Save plan'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
