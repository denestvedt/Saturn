'use client'

import { Play, Pause, RotateCcw, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { TimerStatus } from '@/types/models'

interface TimerControlsProps {
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onAddTime: () => void
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onAddTime,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {status === 'idle' && (
        <button
          onClick={onStart}
          className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-saturn-primary text-white shadow-lg hover:bg-saturn-primary-hover active:scale-95 transition-all"
        >
          <Play className="w-8 h-8 ml-1" />
        </button>
      )}

      {status === 'running' && (
        <>
          <button
            onClick={onReset}
            className="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-saturn-surface border border-saturn-border text-saturn-text-secondary hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={onPause}
            className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-saturn-accent text-white shadow-lg active:scale-95 transition-all"
          >
            <Pause className="w-8 h-8" />
          </button>
          <button
            onClick={onAddTime}
            className="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-saturn-surface border border-saturn-border text-saturn-text-secondary hover:bg-gray-50 transition-colors"
            title="Add 5 minutes"
          >
            <Plus className="w-5 h-5" />
          </button>
        </>
      )}

      {status === 'paused' && (
        <>
          <button
            onClick={onReset}
            className="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-saturn-surface border border-saturn-border text-saturn-text-secondary hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={onResume}
            className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-saturn-primary text-white shadow-lg hover:bg-saturn-primary-hover active:scale-95 transition-all"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
          <button
            onClick={onAddTime}
            className="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-saturn-surface border border-saturn-border text-saturn-text-secondary hover:bg-gray-50 transition-colors"
            title="Add 5 minutes"
          >
            <Plus className="w-5 h-5" />
          </button>
        </>
      )}

      {status === 'completed' && (
        <button
          onClick={onReset}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-medium min-h-[48px] transition-colors',
            'bg-saturn-surface border border-saturn-border text-saturn-text hover:bg-gray-50'
          )}
        >
          <RotateCcw className="w-4 h-4" />
          Start New
        </button>
      )}
    </div>
  )
}
