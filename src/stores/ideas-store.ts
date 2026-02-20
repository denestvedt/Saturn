import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type IdeaStatus = 'new' | 'in_progress' | 'on_hold' | 'done' | 'dropped'

export const IDEA_STATUSES: { value: IdeaStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: '#6366F1' },
  { value: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { value: 'on_hold', label: 'On Hold', color: '#9CA3AF' },
  { value: 'done', label: 'Done', color: '#10B981' },
  { value: 'dropped', label: 'Dropped', color: '#EF4444' },
]

export interface Idea {
  id: string
  name: string
  description: string
  status: IdeaStatus
  created_at: string
}

interface IdeasState {
  ideas: Idea[]
  addIdea: (idea: Omit<Idea, 'id' | 'created_at'>) => void
  updateIdea: (id: string, updates: Partial<Omit<Idea, 'id' | 'created_at'>>) => void
  deleteIdea: (id: string) => void
}

export const useIdeasStore = create<IdeasState>()(
  persist(
    (set) => ({
      ideas: [],
      addIdea: (idea) =>
        set((state) => ({
          ideas: [
            {
              ...idea,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
            },
            ...state.ideas,
          ],
        })),
      updateIdea: (id, updates) =>
        set((state) => ({
          ideas: state.ideas.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      deleteIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.filter((i) => i.id !== id),
        })),
    }),
    { name: 'saturn-ideas' }
  )
)
