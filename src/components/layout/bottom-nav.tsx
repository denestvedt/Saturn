'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Sun, Calendar, CheckSquare, Target, Menu, ClipboardList, Users, Timer, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { label: 'Today', href: '/today', icon: Sun },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Habits', href: '/habits', icon: Target },
  { label: 'More', href: '#more', icon: Menu },
]

const moreItems = [
  { label: 'Weekly Plan', href: '/plan', icon: ClipboardList },
  { label: 'Partner', href: '/partner', icon: Users },
  { label: 'Timer', href: '/timer', icon: Timer },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const isActive = (href: string) => {
    if (href === '#more') return showMore
    return pathname.startsWith(href)
  }

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-[72px] left-0 right-0 bg-saturn-surface rounded-t-[20px] shadow-lg z-50 safe-bottom"
            >
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-saturn-text-secondary">More</span>
                  <button
                    onClick={() => setShowMore(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-saturn-muted" />
                  </button>
                </div>
                {moreItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl min-h-[44px] transition-colors',
                        active
                          ? 'bg-saturn-primary/10 text-saturn-primary'
                          : 'text-saturn-text hover:bg-gray-50'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[15px] font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-saturn-surface border-t border-saturn-border z-50 safe-bottom">
        <div className="flex items-center justify-around px-2 h-[72px]">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const isMore = item.href === '#more'

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setShowMore(!showMore)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] rounded-xl transition-colors',
                    active ? 'text-saturn-primary' : 'text-saturn-muted'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] rounded-xl transition-colors',
                  active ? 'text-saturn-primary' : 'text-saturn-muted'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
