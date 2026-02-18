'use client'

import { cn } from '@/lib/utils/cn'
import { TIMER_PRESETS } from '@/lib/constants'

interface PresetPickerProps {
  selectedSeconds: number
  onSelect: (seconds: number) => void
}

export function PresetPicker({ selectedSeconds, onSelect }: PresetPickerProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {TIMER_PRESETS.map((preset) => (
        <button
          key={preset.seconds}
          onClick={() => onSelect(preset.seconds)}
          className={cn(
            'px-5 py-3 rounded-xl text-[15px] font-semibold min-h-[48px] min-w-[80px] transition-all',
            selectedSeconds === preset.seconds
              ? 'bg-saturn-primary text-white shadow-md'
              : 'bg-saturn-surface text-saturn-text border border-saturn-border hover:border-saturn-primary/30'
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
