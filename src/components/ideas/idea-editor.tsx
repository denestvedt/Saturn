'use client'

import { useState, useEffect } from 'react'
import { Drawer } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { IDEA_STATUSES, type Idea, type IdeaStatus } from '@/stores/ideas-store'

interface IdeaEditorProps {
  open: boolean
  onClose: () => void
  idea: Idea | null
  onSave: (data: { name: string; description: string; status: IdeaStatus }) => void
  onDelete?: () => void
}

export function IdeaEditor({ open, onClose, idea, onSave, onDelete }: IdeaEditorProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<IdeaStatus>('new')

  useEffect(() => {
    if (open) {
      setName(idea?.name ?? '')
      setDescription(idea?.description ?? '')
      setStatus(idea?.status ?? 'new')
    }
  }, [open, idea])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim(), status })
    onClose()
  }

  return (
    <Drawer open={open} onClose={onClose} title={idea ? 'Edit Idea' : 'New Idea'}>
      <div className="space-y-4">
        <Input
          label="Idea Name"
          placeholder="What's the idea?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="Describe the idea in more detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoResize
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-saturn-text">Status</label>
          <div className="flex flex-wrap gap-2">
            {IDEA_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all min-h-[36px]',
                  status === s.value
                    ? 'text-white shadow-sm'
                    : 'bg-saturn-bg text-saturn-text-secondary border border-saturn-border'
                )}
                style={status === s.value ? { backgroundColor: s.color } : undefined}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} fullWidth disabled={!name.trim()}>
            {idea ? 'Save Changes' : 'Add Idea'}
          </Button>
        </div>

        {idea && onDelete && (
          <Button variant="danger" fullWidth onClick={onDelete}>
            Delete Idea
          </Button>
        )}
      </div>
    </Drawer>
  )
}
