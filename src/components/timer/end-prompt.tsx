'use client'

import { useState } from 'react'
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react'


interface EndPromptProps {
  onComplete: (reflection?: string) => void
}

const quickOptions = [
  { label: 'Finished task', icon: '✓' },
  { label: 'Made progress', icon: '→' },
  { label: 'Got distracted', icon: '~' },
  { label: 'Need more time', icon: '+' },
]

export function EndPrompt({ onComplete }: EndPromptProps) {
  const [reflection, setReflection] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  return (
    <div className="animate-fade-in space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-saturn-success/10 mb-3">
          <CheckCircle className="w-8 h-8 text-saturn-success" />
        </div>
        <h3 className="text-lg font-semibold text-saturn-text">Nice work!</h3>
        <p className="text-sm text-saturn-text-secondary mt-1">What did you accomplish?</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quickOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => onComplete(option.label)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-saturn-surface border border-saturn-border text-saturn-text text-sm font-medium hover:border-saturn-primary/30 min-h-[44px] transition-colors"
          >
            <span>{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          className="flex items-center gap-2 text-sm text-saturn-text-secondary hover:text-saturn-primary transition-colors mx-auto"
        >
          <MessageCircle className="w-4 h-4" />
          Add a note
        </button>
      ) : (
        <div className="space-y-3">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What went well? What was challenging?"
            className="w-full px-4 py-3 rounded-xl border border-saturn-border bg-saturn-surface text-saturn-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-saturn-primary/20 focus:border-saturn-primary min-h-[80px]"
            autoFocus
          />
          <button
            onClick={() => onComplete(reflection || undefined)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-saturn-primary text-white text-sm font-medium hover:bg-saturn-primary-hover min-h-[44px] w-full justify-center transition-colors"
          >
            Done
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <button
        onClick={() => onComplete()}
        className="text-sm text-saturn-muted hover:text-saturn-text-secondary transition-colors mx-auto block"
      >
        Skip
      </button>
    </div>
  )
}
