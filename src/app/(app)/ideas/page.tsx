'use client'

import { useState } from 'react'
import { Plus, Lightbulb } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { IdeaEditor } from '@/components/ideas/idea-editor'
import { useIdeasStore, IDEA_STATUSES, type Idea, type IdeaStatus } from '@/stores/ideas-store'
import { cn } from '@/lib/utils/cn'
import { format } from 'date-fns'

const STATUS_FILTERS: { value: IdeaStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  ...IDEA_STATUSES.map((s) => ({ value: s.value, label: s.label })),
]

export default function IdeasPage() {
  const { ideas, addIdea, updateIdea, deleteIdea } = useIdeasStore()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [filter, setFilter] = useState<IdeaStatus | 'all'>('all')

  const filteredIdeas = filter === 'all' ? ideas : ideas.filter((i) => i.status === filter)

  const handleAdd = () => {
    setEditingIdea(null)
    setEditorOpen(true)
  }

  const handleTap = (idea: Idea) => {
    setEditingIdea(idea)
    setEditorOpen(true)
  }

  const handleSave = (data: { name: string; description: string; status: IdeaStatus }) => {
    if (editingIdea) {
      updateIdea(editingIdea.id, data)
    } else {
      addIdea(data)
    }
  }

  const handleDelete = () => {
    if (editingIdea) {
      deleteIdea(editingIdea.id)
      setEditorOpen(false)
      setEditingIdea(null)
    }
  }

  return (
    <div className="min-h-full">
      <Header
        title="Idea Parking Lot"
        subtitle={`${ideas.length} idea${ideas.length !== 1 ? 's' : ''} parked`}
        actions={
          <Button size="sm" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            New
          </Button>
        }
      />

      <div className="px-4 pb-8 max-w-lg mx-auto">
        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {STATUS_FILTERS.map((f) => {
            const statusDef = IDEA_STATUSES.find((s) => s.value === f.value)
            const count = f.value === 'all' ? ideas.length : ideas.filter((i) => i.status === f.value).length
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all min-h-[36px]',
                  filter === f.value
                    ? 'text-white shadow-sm'
                    : 'bg-saturn-surface text-saturn-text-secondary border border-saturn-border'
                )}
                style={
                  filter === f.value
                    ? { backgroundColor: statusDef?.color ?? '#6366F1' }
                    : undefined
                }
              >
                {f.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Ideas list */}
        {filteredIdeas.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title={filter === 'all' ? 'No ideas yet' : `No ${STATUS_FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} ideas`}
            description={filter === 'all' ? 'Park your ideas here so they don\'t get lost.' : 'Try changing the filter to see more ideas.'}
            action={
              filter === 'all'
                ? <Button size="sm" onClick={handleAdd}><Plus className="w-4 h-4" />Add an idea</Button>
                : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredIdeas.map((idea) => {
              const statusDef = IDEA_STATUSES.find((s) => s.value === idea.status)
              return (
                <button
                  key={idea.id}
                  onClick={() => handleTap(idea)}
                  className="w-full text-left bg-saturn-surface rounded-card p-4 border border-saturn-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          'text-[15px] font-medium',
                          idea.status === 'dropped' ? 'text-saturn-muted line-through' : 'text-saturn-text'
                        )}
                      >
                        {idea.name}
                      </h3>
                      {idea.description && (
                        <p className="text-sm text-saturn-text-secondary mt-1 line-clamp-2">
                          {idea.description}
                        </p>
                      )}
                      <p className="text-xs text-saturn-muted mt-2">
                        {format(new Date(idea.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className="shrink-0 text-white text-xs"
                      style={{ backgroundColor: statusDef?.color }}
                    >
                      {statusDef?.label}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <IdeaEditor
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setEditingIdea(null)
        }}
        idea={editingIdea}
        onSave={handleSave}
        onDelete={editingIdea ? handleDelete : undefined}
      />
    </div>
  )
}
