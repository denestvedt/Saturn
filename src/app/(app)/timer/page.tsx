'use client'

import { Header } from '@/components/layout/header'
import { TimerDisplay } from '@/components/timer/timer-display'
import { TimerControls } from '@/components/timer/timer-controls'
import { PresetPicker } from '@/components/timer/preset-picker'
import { EndPrompt } from '@/components/timer/end-prompt'
import { useTimer } from '@/hooks/use-timer'

export default function TimerPage() {
  const timer = useTimer()

  return (
    <div className="min-h-full">
      <Header
        title="Focus Timer"
        subtitle={timer.status === 'idle' ? 'Pick a duration and focus.' : undefined}
      />

      <div className="px-4 pb-8 max-w-md mx-auto">
        <div className="space-y-8">
          {/* Timer Display */}
          <div className="pt-4">
            <TimerDisplay
              totalSeconds={timer.totalSeconds}
              remainingSeconds={timer.remainingSeconds}
              status={timer.status}
            />
          </div>

          {/* Controls */}
          {timer.status !== 'completed' && (
            <TimerControls
              status={timer.status}
              onStart={() => timer.start()}
              onPause={timer.pause}
              onResume={timer.resume}
              onReset={timer.reset}
              onAddTime={() => timer.addTime(300)}
            />
          )}

          {/* Preset Picker - only when idle */}
          {timer.status === 'idle' && (
            <div className="space-y-3">
              <p className="text-sm text-saturn-text-secondary text-center">Duration</p>
              <PresetPicker
                selectedSeconds={timer.totalSeconds}
                onSelect={(seconds) => timer.setDuration(seconds)}
              />
            </div>
          )}

          {/* Add 5 minutes hint */}
          {timer.status === 'running' && (
            <p className="text-xs text-saturn-muted text-center">
              Tap + to add 5 more minutes
            </p>
          )}

          {/* End prompt - when completed */}
          {timer.status === 'completed' && (
            <EndPrompt onComplete={timer.complete} />
          )}
        </div>
      </div>
    </div>
  )
}
