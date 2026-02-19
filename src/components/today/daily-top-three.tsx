'use client'


import { Star, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Task } from '@/types/models'

interface DailyTopThreeProps {
  tasks: Task[]
  onToggle: (taskId: string) => void
  onAdd: () => void
}

export function DailyTopThree({ tasks, onToggle, onAdd }: DailyTopThreeProps) {
  const slots = Array.from({ length: 3 }, (_, i) => tasks[i] || null)

  return (
    <div className="bg-saturn-surface rounded-card p-4 border border-saturn-border">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-saturn-accent" />
        <h3 className="text-sm font-semibold text-saturn-text">Today&apos;s Top 3</h3>
      </div>

      <div className="space-y-2">
        {slots.map((task, index) => (
          <div key={task?.id || `empty-${index}`}>
            {task ? (
              <button
                onClick={() => onToggle(task.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors min-h-[44px] text-left"
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                    task.is_completed
                      ? 'bg-saturn-success border-saturn-success'
                      : 'border-saturn-border'
                  )}
                >
                  {task.is_completed && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[15px] font-medium flex-1',
                    task.is_completed
                      ? 'line-through text-saturn-muted'
                      : 'text-saturn-text'
                  )}
                >
                  {task.title}
                </span>
                <span className="text-xs text-saturn-accent font-medium">#{index + 1}</span>
              </button>
            ) : (
              <button
                onClick={onAdd}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-saturn-border hover:border-saturn-primary/30 transition-colors min-h-[44px]"
              >
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-saturn-muted flex items-center justify-center shrink-0">
                  <Plus className="w-3 h-3 text-saturn-muted" />
                </div>
                <span className="text-sm text-saturn-muted">Add a priority</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {tasks.filter((t) => t.is_completed).length > 0 && (
        <p className="text-xs text-saturn-success mt-3 text-center font-medium">
          {tasks.filter((t) => t.is_completed).length} of {tasks.length} done — nice!
        </p>
      )}
    </div>
  )
}
