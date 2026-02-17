'use client'

import { useState, useCallback, useEffect } from 'react'
import { Trash2, Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useMediaQuery } from '@/hooks/use-media-query'
import { TASK_PRIORITIES } from '@/lib/constants'
import { createRecurrenceRule } from '@/lib/utils/recurrence'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal } from '@/components/ui/modal'
import { Drawer } from '@/components/ui/drawer'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ListSelector } from '@/components/tasks/list-selector'
import { RecurringConfig } from '@/components/tasks/recurring-config'
import type { Task, List, RecurrenceRule } from '@/types/models'
import type { Database } from '@/types/database'

type TaskUpdate = Database['public']['Tables']['tasks']['Update']

interface TaskEditorProps {
  task: Task | null // null = create mode
  onSave: (data: TaskUpdate & { title: string }) => Promise<void> | void
  onDelete?: (id: string) => Promise<void> | void
  onClose: () => void
  lists: List[]
}

interface FormState {
  title: string
  description: string
  list_id: string | null
  priority: number
  due_date: string
  scheduled_date: string
  is_top_three: boolean
  is_recurring: boolean
  recurrence_rule: RecurrenceRule
}

function getInitialState(task: Task | null, lists: List[]): FormState {
  const inbox = lists.find((l) => l.is_inbox)
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    list_id: task?.list_id ?? inbox?.id ?? null,
    priority: task?.priority ?? 0,
    due_date: task?.due_date ?? '',
    scheduled_date: task?.scheduled_date ?? '',
    is_top_three: task?.is_top_three ?? false,
    is_recurring: task?.is_recurring ?? false,
    recurrence_rule: (task?.recurrence_rule as RecurrenceRule) ??
      createRecurrenceRule('daily'),
  }
}

export function TaskEditor({
  task,
  onSave,
  onDelete,
  onClose,
  lists,
}: TaskEditorProps) {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const isCreate = !task

  const [form, setForm] = useState<FormState>(() =>
    getInitialState(task, lists)
  )
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset form when task changes
  useEffect(() => {
    setForm(getInitialState(task, lists))
  }, [task, lists])

  const updateField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) return

    setSaving(true)
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim() || null,
        list_id: form.list_id,
        priority: form.priority,
        due_date: form.due_date || null,
        scheduled_date: form.scheduled_date || null,
        is_top_three: form.is_top_three,
        is_recurring: form.is_recurring,
        recurrence_rule: form.is_recurring ? form.recurrence_rule : null,
      })
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setSaving(false)
    }
  }, [form, onSave, onClose])

  const handleDelete = useCallback(async () => {
    if (!task || !onDelete) return
    try {
      await onDelete(task.id)
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }, [task, onDelete, onClose])

  const content = (
    <div className="space-y-5">
      {/* Title */}
      <Input
        label="What needs to be done?"
        placeholder="e.g., Reply to Sarah's email"
        value={form.title}
        onChange={(e) => updateField('title', e.target.value)}
        autoFocus
      />

      {/* Description */}
      <Textarea
        label="Notes (optional)"
        placeholder="Any details or context..."
        value={form.description}
        onChange={(e) => updateField('description', e.target.value)}
        autoResize
        className="min-h-[66px]"
      />

      {/* List selector */}
      <ListSelector
        lists={lists}
        selectedId={form.list_id}
        onChange={(id) => updateField('list_id', id)}
      />

      {/* Priority */}
      <div>
        <label className="text-sm font-medium text-saturn-text mb-2 block">
          Priority
        </label>
        <div className="flex gap-3">
          {TASK_PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => updateField('priority', p.value)}
              className={cn(
                'flex items-center gap-2 min-h-[44px] px-3 py-2',
                'rounded-button border text-sm font-medium',
                'transition-all duration-150 active:scale-95',
                form.priority === p.value
                  ? 'border-saturn-primary bg-saturn-primary/5 text-saturn-primary'
                  : 'border-saturn-border bg-saturn-surface text-saturn-text hover:bg-gray-50'
              )}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Due date + Scheduled date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Due date"
          type="date"
          value={form.due_date}
          onChange={(e) => updateField('due_date', e.target.value)}
        />
        <Input
          label="Scheduled date"
          type="date"
          value={form.scheduled_date}
          onChange={(e) => updateField('scheduled_date', e.target.value)}
        />
      </div>

      {/* Top 3 toggle */}
      <div
        className={cn(
          'flex items-center gap-3 min-h-[44px] px-3 py-2',
          'rounded-button border border-saturn-border',
          'cursor-pointer hover:bg-gray-50 transition-colors',
          form.is_top_three && 'border-saturn-warning bg-saturn-warning/5'
        )}
        onClick={() => updateField('is_top_three', !form.is_top_three)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            updateField('is_top_three', !form.is_top_three)
          }
        }}
      >
        <Star
          className={cn(
            'h-5 w-5 shrink-0',
            form.is_top_three
              ? 'text-saturn-warning fill-saturn-warning'
              : 'text-saturn-muted'
          )}
        />
        <div className="flex-1">
          <span className="text-sm font-medium text-saturn-text">
            Top 3 for today
          </span>
          <p className="text-xs text-saturn-text-secondary">
            Focus on your 3 most important tasks
          </p>
        </div>
        <Checkbox
          checked={form.is_top_three}
          onChange={() => updateField('is_top_three', !form.is_top_three)}
        />
      </div>

      {/* Recurring toggle + config */}
      <div className="space-y-3">
        <div
          className={cn(
            'flex items-center gap-3 min-h-[44px] px-3 py-2',
            'rounded-button border border-saturn-border',
            'cursor-pointer hover:bg-gray-50 transition-colors',
            form.is_recurring && 'border-saturn-primary bg-saturn-primary/5'
          )}
          onClick={() => updateField('is_recurring', !form.is_recurring)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              updateField('is_recurring', !form.is_recurring)
            }
          }}
        >
          <div className="flex-1">
            <span className="text-sm font-medium text-saturn-text">
              Repeating task
            </span>
            <p className="text-xs text-saturn-text-secondary">
              This task will repeat on a schedule
            </p>
          </div>
          <Checkbox
            checked={form.is_recurring}
            onChange={() => updateField('is_recurring', !form.is_recurring)}
          />
        </div>

        {form.is_recurring && (
          <RecurringConfig
            rule={form.recurrence_rule}
            onChange={(rule) => updateField('recurrence_rule', rule)}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!form.title.trim()}
          fullWidth
        >
          {isCreate ? 'Add task' : 'Save changes'}
        </Button>

        {!isCreate && onDelete && (
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            className="shrink-0 text-saturn-danger hover:bg-red-50"
            aria-label="Delete task"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete task?"
        message="This task will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )

  const title = isCreate ? 'New task' : 'Edit task'

  // Desktop: Modal, Mobile: Drawer
  if (isDesktop) {
    return (
      <Modal open onClose={onClose} title={title}>
        {content}
      </Modal>
    )
  }

  return (
    <Drawer open onClose={onClose} title={title}>
      {content}
    </Drawer>
  )
}
