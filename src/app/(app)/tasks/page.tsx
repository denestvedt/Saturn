'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { InboxCapture } from '@/components/tasks/inbox-capture'
import { TaskList } from '@/components/tasks/task-list'
import { TaskEditor } from '@/components/tasks/task-editor'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import { useTasks } from '@/hooks/use-tasks'
import { useLists } from '@/hooks/use-lists'
import type { Task } from '@/types/models'

export default function TasksPage() {
  const { lists, loading: listsLoading, ensureInbox, createList } = useLists()
  const [selectedListId, setSelectedListId] = useState<string | undefined>(undefined)
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, toggleTask } = useTasks(selectedListId)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  // Ensure inbox exists on mount
  useEffect(() => {
    ensureInbox()
  }, [ensureInbox])

  const handleInboxCapture = useCallback(
    async (title: string) => {
      const inbox = lists.find((l) => l.is_inbox)
      await createTask({ title, list_id: inbox?.id ?? null })
    },
    [createTask, lists]
  )

  const handleTaskTap = useCallback((task: Task) => {
    setEditingTask(task)
    setShowEditor(true)
  }, [])

  const handleSave = useCallback(
    async (data: { title: string } & Record<string, unknown>) => {
      if (editingTask) {
        await updateTask(editingTask.id, data)
      } else {
        await createTask(data as { title: string })
      }
    },
    [editingTask, updateTask, createTask]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTask(id)
    },
    [deleteTask]
  )

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false)
    setEditingTask(null)
  }, [])

  const loading = listsLoading || tasksLoading

  return (
    <div className="min-h-full">
      <Header
        title="Tasks"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditingTask(null)
              setShowEditor(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        }
      />

      <div className="px-4 pb-8 max-w-lg mx-auto space-y-4">
        {/* Quick add */}
        <InboxCapture onTaskCreated={handleInboxCapture} />

        {/* List filter tabs */}
        {!listsLoading && lists.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setSelectedListId(undefined)}
              className={cn(
                'shrink-0 min-h-[36px] px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedListId === undefined
                  ? 'bg-saturn-primary text-white'
                  : 'bg-gray-100 text-saturn-text-secondary hover:bg-gray-200'
              )}
            >
              All
            </button>
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={cn(
                  'shrink-0 min-h-[36px] px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  selectedListId === list.id
                    ? 'text-white'
                    : 'bg-gray-100 text-saturn-text-secondary hover:bg-gray-200'
                )}
                style={
                  selectedListId === list.id
                    ? { backgroundColor: list.color }
                    : undefined
                }
              >
                {list.name}
              </button>
            ))}
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-card" />
            ))}
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            lists={lists}
            onToggle={toggleTask}
            onTap={handleTaskTap}
          />
        )}
      </div>

      {/* Task editor modal/drawer */}
      {showEditor && (
        <TaskEditor
          task={editingTask}
          lists={lists}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  )
}
