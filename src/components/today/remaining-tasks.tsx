'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import type { Task } from '@/types/models'

interface RemainingTasksProps {
  tasks: Task[]
  onToggle: (taskId: string) => void
}

export function RemainingTasks({ tasks, onToggle }: RemainingTasksProps) {
  const [expanded, setExpanded] = useState(false)
  const incomplete = tasks.filter((t) => !t.is_completed)
  const completed = tasks.filter((t) => t.is_completed)

  if (tasks.length === 0) return null

  return (
    <div className="bg-saturn-surface rounded-card border border-saturn-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-saturn-text-secondary">Remaining tasks</span>
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-saturn-primary/10 text-saturn-primary text-xs font-semibold">
            {incomplete.length}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-saturn-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-saturn-muted" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1">
          {incomplete.map((task) => (
            <button
              key={task.id}
              onClick={() => onToggle(task.id)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors min-h-[40px] text-left"
            >
              <div className="w-5 h-5 rounded border-2 border-saturn-border shrink-0" />
              <span className="text-sm text-saturn-text">{task.title}</span>
            </button>
          ))}
          {completed.length > 0 && (
            <p className="text-xs text-saturn-muted px-2 pt-1">
              {completed.length} completed
            </p>
          )}
        </div>
      )}
    </div>
  )
}
