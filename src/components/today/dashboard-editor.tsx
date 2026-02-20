'use client'

import { ChevronUp, ChevronDown, RotateCcw, Clock, Zap, Star, CheckSquare, Target, ClipboardList, Timer, Users } from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import { useDashboardStore, WIDGET_DEFINITIONS } from '@/stores/dashboard-store'

const ICON_MAP: Record<string, React.ReactNode> = {
  'clock': <Clock className="w-4 h-4" />,
  'zap': <Zap className="w-4 h-4" />,
  'star': <Star className="w-4 h-4" />,
  'check-square': <CheckSquare className="w-4 h-4" />,
  'target': <Target className="w-4 h-4" />,
  'clipboard-list': <ClipboardList className="w-4 h-4" />,
  'timer': <Timer className="w-4 h-4" />,
  'users': <Users className="w-4 h-4" />,
}

export function DashboardEditor() {
  const { widgets, editing, setEditing, toggleWidget, moveWidget, resetToDefaults } = useDashboardStore()

  return (
    <Drawer open={editing} onClose={() => setEditing(false)} title="Customize Dashboard">
      <div className="space-y-1">
        {widgets.map((widget, index) => {
          const def = WIDGET_DEFINITIONS.find((d) => d.id === widget.id)
          if (!def) return null

          return (
            <div
              key={widget.id}
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-saturn-bg"
            >
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => moveWidget(index, index - 1)}
                  disabled={index === 0}
                  className="p-0.5 rounded text-saturn-muted hover:text-saturn-text disabled:opacity-20 transition-colors"
                  aria-label="Move up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveWidget(index, index + 1)}
                  disabled={index === widgets.length - 1}
                  className="p-0.5 rounded text-saturn-muted hover:text-saturn-text disabled:opacity-20 transition-colors"
                  aria-label="Move down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-saturn-text-secondary shrink-0">
                {ICON_MAP[def.icon]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-saturn-text">{def.label}</p>
                <p className="text-xs text-saturn-muted truncate">{def.description}</p>
              </div>

              <Toggle
                checked={widget.enabled}
                onChange={() => toggleWidget(widget.id)}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-saturn-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          className="w-full flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to defaults
        </Button>
      </div>
    </Drawer>
  )
}
