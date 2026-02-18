'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addDays, subDays, isToday } from 'date-fns'
import { Header } from '@/components/layout/header'
import { DraggableBlock } from '@/components/calendar/time-block'
import { TimeSlot } from '@/components/calendar/time-slot'
import { NowLine } from '@/components/calendar/now-line'
import { QuickAddBlock } from '@/components/calendar/quick-add-block'
import { BlockEditor } from '@/components/calendar/block-editor'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTimeBlocks } from '@/hooks/use-time-blocks'
import { generateTimeSlots, getDayViewHeight, parseSlotId } from '@/lib/utils/time-blocks'
import type { TimeBlock, BlockCategory } from '@/types/models'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const { blocks, loading, createBlock, updateBlock, deleteBlock } = useTimeBlocks(dateStr)

  const [quickAddSlot, setQuickAddSlot] = useState<Date | null>(null)
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current && isToday(selectedDate)) {
      const now = new Date()
      const hours = now.getHours()
      const scrollTo = Math.max(0, (hours - 7) * 96)
      scrollRef.current.scrollTop = scrollTo
    }
  }, [selectedDate])

  const goToday = () => setSelectedDate(new Date())
  const goPrev = () => setSelectedDate((d) => subDays(d, 1))
  const goNext = () => setSelectedDate((d) => addDays(d, 1))

  const timeSlots = generateTimeSlots(selectedDate)
  const dayHeight = getDayViewHeight()

  const handleSlotClick = useCallback((slotId: string) => {
    const startTime = parseSlotId(slotId)
    setQuickAddSlot(startTime)
  }, [])

  const handleQuickAdd = useCallback(
    async (data: { title: string; start_time: string; end_time: string; category: BlockCategory; color: string }) => {
      await createBlock(data)
      setQuickAddSlot(null)
    },
    [createBlock]
  )

  const handleBlockClick = useCallback((block: TimeBlock) => {
    setEditingBlock(block)
    setShowEditor(true)
  }, [])

  const handleEditorSave = useCallback(
    async (data: {
      title: string
      description: string | null
      start_time: string
      end_time: string
      category: BlockCategory
      color: string
      is_completed: boolean
    }) => {
      if (editingBlock) {
        await updateBlock(editingBlock.id, data)
      } else {
        await createBlock(data)
      }
      setShowEditor(false)
      setEditingBlock(null)
    },
    [editingBlock, updateBlock, createBlock]
  )

  const handleEditorDelete = useCallback(
    async (id: string) => {
      await deleteBlock(id)
      setShowEditor(false)
      setEditingBlock(null)
    },
    [deleteBlock]
  )

  const dateLabel = isToday(selectedDate)
    ? 'Today'
    : format(selectedDate, 'EEE, MMM d')

  return (
    <div className="min-h-full flex flex-col">
      <Header
        title="Calendar"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditingBlock(null)
              setShowEditor(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Block
          </Button>
        }
      />

      {/* Date navigation */}
      <div className="px-4 pb-3 flex items-center justify-between max-w-lg mx-auto w-full">
        <button
          onClick={goPrev}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5 text-saturn-text" />
        </button>

        <button
          onClick={goToday}
          className="text-base font-semibold text-saturn-text hover:text-saturn-primary transition-colors"
        >
          {dateLabel}
        </button>

        <button
          onClick={goNext}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5 text-saturn-text" />
        </button>
      </div>

      {/* Day view */}
      <div className="flex-1 overflow-hidden px-4 pb-4 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="relative overflow-y-auto rounded-xl bg-saturn-surface border border-saturn-border"
            style={{ height: 'calc(100vh - 240px)' }}
          >
            <div className="relative" style={{ height: `${dayHeight}px` }}>
              {/* Time slots */}
              {timeSlots.map((slot) => (
                <TimeSlot
                  key={slot.id}
                  id={slot.id}
                  label={slot.label}
                  top={slot.top}
                  onClick={() => handleSlotClick(slot.id)}
                />
              ))}

              {/* Time blocks */}
              {blocks.map((block) => (
                <DraggableBlock
                  key={block.id}
                  block={block}
                  onClick={handleBlockClick}
                />
              ))}

              {/* Now line */}
              <NowLine date={selectedDate} />

              {/* Quick add popover */}
              {quickAddSlot && (
                <QuickAddBlock
                  startTime={quickAddSlot}
                  onClose={() => setQuickAddSlot(null)}
                  onSave={handleQuickAdd}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Block editor */}
      {showEditor && (
        <BlockEditor
          block={editingBlock}
          onSave={handleEditorSave}
          onDelete={handleEditorDelete}
          onClose={() => {
            setShowEditor(false)
            setEditingBlock(null)
          }}
        />
      )}
    </div>
  )
}
