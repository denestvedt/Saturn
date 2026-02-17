'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { TaskItem } from '@/components/tasks/task-item'
import type { Task, List } from '@/types/models'

interface TaskListProps {
  tasks: Task[]
  lists?: List[]
  onToggle: (id: string) => void
  onTap: (task: Task) => void
  className?: string
}

export function TaskList({
  tasks,
  lists,
  onToggle,
  onTap,
  className,
}: TaskListProps) {
  const [showCompleted, setShowCompleted] = useState(false)

  const { incomplete, completed } = useMemo(() => {
    const incomplete: Task[] = []
    const completed: Task[] = []

    for (const task of tasks) {
      if (task.is_completed) {
        completed.push(task)
      } else {
        incomplete.push(task)
      }
    }

    return { incomplete, completed }
  }, [tasks])

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No tasks yet"
        description="Add a task above to get started. Keep it simple -- one thing at a time."
        className={className}
      />
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Incomplete tasks */}
      <div className="divide-y divide-saturn-border/30">
        {incomplete.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            lists={lists}
            onToggle={onToggle}
            onTap={onTap}
          />
        ))}
      </div>

      {/* Empty incomplete state */}
      {incomplete.length === 0 && completed.length > 0 && (
        <div className="py-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-saturn-success mx-auto mb-2" />
          <p className="text-base font-medium text-saturn-text">All done!</p>
          <p className="text-sm text-saturn-text-secondary mt-0.5">
            You crushed it. Time for a break?
          </p>
        </div>
      )}

      {/* Completed tasks -- collapsed by default */}
      {completed.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowCompleted((prev) => !prev)}
            className={cn(
              'flex items-center gap-2 w-full min-h-[44px] px-4 py-2',
              'text-sm text-saturn-text-secondary',
              'hover:bg-gray-50/50 transition-colors rounded-button'
            )}
          >
            {showCompleted ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>Completed</span>
            <Badge variant="muted" className="ml-1">
              {completed.length}
            </Badge>
          </button>

          {showCompleted && (
            <div className="divide-y divide-saturn-border/30">
              {completed.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  lists={lists}
                  onToggle={onToggle}
                  onTap={onTap}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
