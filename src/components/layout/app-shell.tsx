'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { BottomNav } from './bottom-nav'
import { Sidebar } from './sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <div className="flex h-dvh bg-saturn-bg">
      {isDesktop && <Sidebar />}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
      {!isDesktop && <BottomNav />}
    </div>
  )
}
