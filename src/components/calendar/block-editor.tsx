'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Drawer } from '@/components/ui/drawer'
import { Modal } from '@/components/ui/modal'
import { BLOCK_CATEGORIES } from '@/lib/constants'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { TimeBlock, BlockCategory } from '@/types/models'

interface BlockEditorProps {
  block: TimeBlock | null // null = creating new
  onSave: (data: {
    title: string
    description: string | null
    start_time: string
    end_time: string
    category: BlockCategory
    color: string
    is_completed: boolean
  }) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

export function BlockEditor({ block, onSave, onDelete, onClose }: BlockEditorProps) {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const isEditing = !!block

  const [title, setTitle] = useState(block?.title ?? '')
  const [description, setDescription] = useState(block?.description ?? '')
  const [date, setDate] = useState(
    block ? format(new Date(block.start_time), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  )
  const [startTime, setStartTime] = useState(
    block ? format(new Date(block.start_time), 'HH:mm') : '09:00'
  )
  const [endTime, setEndTime] = useState(
    block ? format(new Date(block.end_time), 'HH:mm') : '09:30'
  )
  const [category, setCategory] = useState<BlockCategory>(
    (block?.category as BlockCategory) ?? 'focus'
  )
  const [isCompleted, setIsCompleted] = useState(block?.is_completed ?? false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedCategory = BLOCK_CATEGORIES.find((c) => c.value === category)!

  const handleSave = useCallback(async () => {
    if (!title.trim()) return

    setSaving(true)
    try {
      const startDateTime = new Date(`${date}T${startTime}:00`)
      const endDateTime = new Date(`${date}T${endTime}:00`)

      // If end time is before start time, assume next day is not intended - just swap
      if (endDateTime <= startDateTime) {
        endDateTime.setTime(startDateTime.getTime() + 30 * 60 * 1000) // default 30 min
      }

      onSave({
        title: title.trim(),
        description: description.trim() || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        category,
        color: selectedCategory.color,
        is_completed: isCompleted,
      })
    } finally {
      setSaving(false)
    }
  }, [title, description, date, startTime, endTime, category, selectedCategory, isCompleted, onSave])

  const handleDelete = useCallback(() => {
    if (block && onDelete) {
      onDelete(block.id)
    }
  }, [block, onDelete])

  const content = (
    <div className="space-y-5">
      {/* Title */}
      <Input
        label="Title"
        placeholder="What are you doing?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />

      {/* Description */}
      <Textarea
        label="Description (optional)"
        placeholder="Notes, links, details..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        autoResize
        className="min-h-[60px]"
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Time range */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          label="End time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      {/* Category selector */}
      <div>
        <p className="text-sm font-medium text-saturn-text mb-2">Category</p>
        <div className="grid grid-cols-3 gap-2">
          {BLOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value as BlockCategory)}
              className={cn(
                'min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                category === cat.value
                  ? 'ring-2 ring-offset-2 shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              )}
              style={{
                backgroundColor: `${cat.color}15`,
                color: cat.color,
                ...(category === cat.value ? { ringColor: cat.color } : {}),
              }}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Completed toggle */}
      {isEditing && (
        <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
          <div
            className={cn(
              'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors',
              isCompleted
                ? 'border-saturn-success bg-saturn-success'
                : 'border-saturn-border'
            )}
          >
            {isCompleted && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
            className="sr-only"
          />
          <span className="text-sm font-medium text-saturn-text">
            Mark as completed
          </span>
        </label>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {isEditing && onDelete && (
          <>
            {showDeleteConfirm ? (
              <div className="flex gap-2 flex-1">
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={handleDelete}
                >
                  Confirm Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-saturn-danger"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </>
        )}

        <div className="flex gap-2 ml-auto">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={!title.trim()}
          >
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )

  const editorTitle = isEditing ? 'Edit Block' : 'New Block'

  // Mobile: Drawer, Desktop: Modal
  if (isDesktop) {
    return (
      <Modal open onClose={onClose} title={editorTitle}>
        {content}
      </Modal>
    )
  }

  return (
    <Drawer open onClose={onClose} title={editorTitle}>
      {content}
    </Drawer>
  )
}
