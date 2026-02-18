'use client'

import { format, isPast, isToday } from 'date-fns'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { TASK_PRIORITIES } from '@/lib/constants'
import type { Task, List } from '@/types/models'

interface TaskItemProps {
  task: Task
  lists?: List[]
  onToggle: (id: string) => void
  onTap: (task: Task) => void
  className?: string
}

export function TaskItem({
  task,
  lists,
  onToggle,
  onTap,
  className,
}: TaskItemProps) {
  const priority = TASK_PRIORITIES.find((p) => p.value === task.priority)
  const list = lists?.find((l) => l.id === task.list_id)

  const dueDateObj = task.due_date ? new Date(task.due_date) : null
  const isOverdue = dueDateObj && !task.is_completed && isPast(dueDateObj) && !isToday(dueDateObj)
  const isDueToday = dueDateObj && isToday(dueDateObj)

  return (
    <div
      className={cn(
        'flex items-start gap-3 min-h-[56px] px-4 py-3',
        'border-b border-saturn-border/50 last:border-b-0',
        'transition-colors duration-100',
        'hover:bg-gray-50/50 active:bg-gray-100/50',
        'cursor-pointer select-none',
        task.is_completed && 'opacity-50',
        className
      )}
    >
      {/* Checkbox -- large tap target */}
      <div
        className="pt-0.5"
        onClick={(e) => {
          e.stopPropagation()
          onToggle(task.id)
        }}
      >
        <Checkbox
          checked={task.is_completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.is_completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      {/* Content area -- tap to edit */}
      <div
        className="flex-1 min-w-0 pt-0.5"
        onClick={() => onTap(task)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onTap(task)
          }
        }}
      >
        <div className="flex items-center gap-2">
          {/* Priority dot */}
          {priority && priority.value > 0 && (
            <span
              className="shrink-0 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: priority.color }}
              title={`${priority.label} priority`}
            />
          )}

          {/* Title */}
          <span
            className={cn(
              'text-base text-saturn-text truncate',
              task.is_completed && 'line-through text-saturn-muted'
            )}
          >
            {task.title}
          </span>

          {/* Top 3 indicator */}
          {task.is_top_three && !task.is_completed && (
            <Badge variant="warning" className="shrink-0 text-[10px] px-1.5 py-0">
              Top 3
            </Badge>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Due date */}
          {dueDateObj && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs',
                isOverdue
                  ? 'text-saturn-danger font-medium'
                  : isDueToday
                    ? 'text-saturn-warning font-medium'
                    : 'text-saturn-text-secondary'
              )}
            >
              <Calendar className="h-3 w-3" />
              {isOverdue
                ? 'Overdue'
                : isDueToday
                  ? 'Today'
                  : format(dueDateObj, 'MMM d')}
            </span>
          )}

          {/* List badge */}
          {list && (
            <Badge variant="muted" className="text-[10px] px-1.5 py-0">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: list.color }}
              />
              {list.name}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
