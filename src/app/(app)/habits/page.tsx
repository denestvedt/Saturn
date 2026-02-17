'use client'

import { useState, useCallback, useMemo } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfWeek, startOfMonth, addWeeks, subWeeks } from 'date-fns'
import { Header } from '@/components/layout/header'
import { HabitCard } from '@/components/habits/habit-card'
import { WeeklyGrid } from '@/components/habits/weekly-grid'
import { MonthlyHeatmap } from '@/components/habits/monthly-heatmap'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/modal'
import { Drawer } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils/cn'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useHabits, useHabitCompletions } from '@/hooks/use-habits'
import { calculateStreak, getCompletionRate } from '@/lib/utils/streaks'
import { HABIT_FREQUENCIES, DAYS_OF_WEEK } from '@/lib/constants'
import type { Habit, HabitFrequency } from '@/types/models'
import { Target } from 'lucide-react'

type ViewMode = 'list' | 'grid' | 'heatmap'

const HABIT_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16']

export default function HabitsPage() {
  const { habits, loading: habitsLoading, createHabit, updateHabit, deleteHabit } = useHabits()

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const weekEnd = format(addWeeks(weekStart, 1), 'yyyy-MM-dd')
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')

  const { completions, loading: completionsLoading, toggleCompletion } = useHabitCompletions(
    weekStartStr,
    weekEnd
  )

  const today = format(new Date(), 'yyyy-MM-dd')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showEditor, setShowEditor] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const isDesktop = useMediaQuery('(min-width: 640px)')

  // Habit editor form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formColor, setFormColor] = useState(HABIT_COLORS[0])
  const [formFreqType, setFormFreqType] = useState<HabitFrequency['type']>('daily')
  const [formDays, setFormDays] = useState<number[]>([])
  const [formTimesPerWeek, setFormTimesPerWeek] = useState(3)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const openEditor = useCallback((habit: Habit | null) => {
    if (habit) {
      setEditingHabit(habit)
      setFormName(habit.name)
      setFormDescription(habit.description ?? '')
      setFormColor(habit.color)
      const freq = habit.frequency as unknown as HabitFrequency
      setFormFreqType(freq.type)
      setFormDays(freq.days_of_week ?? [])
      setFormTimesPerWeek(freq.times_per_week ?? 3)
    } else {
      setEditingHabit(null)
      setFormName('')
      setFormDescription('')
      setFormColor(HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)])
      setFormFreqType('daily')
      setFormDays([])
      setFormTimesPerWeek(3)
    }
    setShowEditor(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formName.trim()) return
    setSaving(true)

    const frequency = {
      type: formFreqType,
      ...(formFreqType === 'specific_days' ? { days_of_week: formDays } : {}),
      ...(formFreqType === 'times_per_week' ? { times_per_week: formTimesPerWeek } : {}),
    } as unknown as import('@/types/database').Json

    if (editingHabit) {
      await updateHabit(editingHabit.id, {
        name: formName.trim(),
        description: formDescription.trim() || null,
        color: formColor,
        frequency,
      })
    } else {
      await createHabit({
        name: formName.trim(),
        description: formDescription.trim() || null,
        color: formColor,
        frequency,
      })
    }

    setSaving(false)
    setShowEditor(false)
  }, [formName, formDescription, formColor, formFreqType, formDays, formTimesPerWeek, editingHabit, updateHabit, createHabit])

  const handleDelete = useCallback(async () => {
    if (!editingHabit) return
    await deleteHabit(editingHabit.id)
    setShowDeleteConfirm(false)
    setShowEditor(false)
  }, [editingHabit, deleteHabit])

  const handleToggleToday = useCallback(
    (habitId: string) => {
      toggleCompletion(habitId, today)
    },
    [toggleCompletion, today]
  )

  // Calculate streaks and rates for each habit
  const habitStats = useMemo(() => {
    const stats = new Map<string, { streak: number; rate: number }>()
    for (const habit of habits) {
      const freq = habit.frequency as unknown as HabitFrequency
      const habitCompletions = completions.filter((c) => c.habit_id === habit.id)
      const streak = calculateStreak(habitCompletions, freq)
      const rate = getCompletionRate(habitCompletions, freq, weekStart, new Date())
      stats.set(habit.id, { streak, rate })
    }
    return stats
  }, [habits, completions, weekStart])

  const loading = habitsLoading || completionsLoading

  const editorContent = (
    <div className="space-y-5">
      <Input
        label="Habit name"
        placeholder="e.g., Meditate for 10 minutes"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        autoFocus
      />

      <Textarea
        label="Description (optional)"
        placeholder="Why this habit matters..."
        value={formDescription}
        onChange={(e) => setFormDescription(e.target.value)}
        autoResize
        className="min-h-[60px]"
      />

      {/* Color */}
      <div>
        <p className="text-sm font-medium text-saturn-text mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFormColor(c)}
              className={cn(
                'w-8 h-8 rounded-full transition-transform',
                formColor === c && 'ring-2 ring-offset-2 scale-110'
              )}
              style={{ backgroundColor: c, '--tw-ring-color': c } as React.CSSProperties}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div>
        <p className="text-sm font-medium text-saturn-text mb-2">Frequency</p>
        <div className="grid grid-cols-2 gap-2">
          {HABIT_FREQUENCIES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFormFreqType(f.value as HabitFrequency['type'])}
              className={cn(
                'min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium transition-all text-left',
                formFreqType === f.value
                  ? 'bg-saturn-primary/10 text-saturn-primary border border-saturn-primary'
                  : 'bg-gray-50 text-saturn-text-secondary border border-saturn-border hover:bg-gray-100'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Specific days selector */}
      {formFreqType === 'specific_days' && (
        <div className="flex gap-2">
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() =>
                setFormDays((prev) =>
                  prev.includes(d.value)
                    ? prev.filter((v) => v !== d.value)
                    : [...prev, d.value]
                )
              }
              className={cn(
                'flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-all',
                formDays.includes(d.value)
                  ? 'bg-saturn-primary text-white'
                  : 'bg-gray-100 text-saturn-text-secondary hover:bg-gray-200'
              )}
            >
              {d.short}
            </button>
          ))}
        </div>
      )}

      {/* Times per week */}
      {formFreqType === 'times_per_week' && (
        <div>
          <p className="text-sm text-saturn-text-secondary mb-2">
            Times per week: <span className="font-semibold text-saturn-text">{formTimesPerWeek}</span>
          </p>
          <input
            type="range"
            min={1}
            max={7}
            value={formTimesPerWeek}
            onChange={(e) => setFormTimesPerWeek(Number(e.target.value))}
            className="w-full accent-saturn-primary"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} loading={saving} disabled={!formName.trim()} fullWidth>
          {editingHabit ? 'Save changes' : 'Create habit'}
        </Button>
        {editingHabit && (
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            className="shrink-0 text-saturn-danger hover:bg-red-50"
            aria-label="Delete habit"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete habit?"
        message="This habit and its history will be archived. You can restore it later from settings."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )

  return (
    <div className="min-h-full">
      <Header
        title="Habits"
        actions={
          <Button size="sm" onClick={() => openEditor(null)}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        }
      />

      <div className="px-4 pb-8 max-w-lg mx-auto space-y-4">
        {/* View mode tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['list', 'grid', 'heatmap'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'flex-1 min-h-[36px] rounded-lg text-sm font-medium capitalize transition-all',
                viewMode === mode
                  ? 'bg-white text-saturn-text shadow-sm'
                  : 'text-saturn-text-secondary hover:text-saturn-text'
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Week navigation for grid view */}
        {viewMode === 'grid' && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWeekStart((w) => subWeeks(w, 1))}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5 text-saturn-text" />
            </button>
            <span className="text-sm font-medium text-saturn-text">
              Week of {format(weekStart, 'MMM d')}
            </span>
            <button
              onClick={() => setWeekStart((w) => addWeeks(w, 1))}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5 text-saturn-text" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-card" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No habits yet"
            description="Start small. Pick one habit and build from there."
          />
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {habits.map((habit) => {
              const stats = habitStats.get(habit.id)
              const todayDone = completions.some(
                (c) => c.habit_id === habit.id && c.completed_date === today
              )
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  todayCompleted={todayDone}
                  streak={stats?.streak ?? 0}
                  completionRate={stats?.rate ?? 0}
                  onToggle={() => handleToggleToday(habit.id)}
                  onClick={() => openEditor(habit)}
                />
              )
            })}
          </div>
        ) : viewMode === 'grid' ? (
          <WeeklyGrid
            habits={habits}
            completions={completions}
            weekStart={weekStart}
            onToggle={toggleCompletion}
          />
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <MonthlyHeatmap
                key={habit.id}
                habit={habit}
                completions={completions}
                month={startOfMonth(new Date())}
              />
            ))}
          </div>
        )}
      </div>

      {/* Habit editor */}
      {showEditor && (
        isDesktop ? (
          <Modal open onClose={() => setShowEditor(false)} title={editingHabit ? 'Edit habit' : 'New habit'}>
            {editorContent}
          </Modal>
        ) : (
          <Drawer open onClose={() => setShowEditor(false)} title={editingHabit ? 'Edit habit' : 'New habit'}>
            {editorContent}
          </Drawer>
        )
      )}
    </div>
  )
}
