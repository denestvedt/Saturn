'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sun, Calendar, CheckSquare, Target, ClipboardList, Users, Timer, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSupabase } from '@/providers/supabase-provider'
import { useRouter } from 'next/navigation'

const mainNav = [
  { label: 'Today', href: '/today', icon: Sun },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Habits', href: '/habits', icon: Target },
]

const secondaryNav = [
  { label: 'Weekly Plan', href: '/plan', icon: ClipboardList },
  { label: 'Partner', href: '/partner', icon: Users },
  { label: 'Timer', href: '/timer', icon: Timer },
]

export function Sidebar() {
  const pathname = usePathname()
  const { supabase } = useSupabase()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-[240px] h-dvh border-r border-saturn-border bg-saturn-surface flex flex-col shrink-0">
      <div className="p-6 pb-4">
        <h1 className="text-lg font-bold text-saturn-primary">Saturn Structure</h1>
        <p className="text-xs text-saturn-text-secondary mt-0.5">Structure your day, not your brain.</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {mainNav.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl min-h-[40px] text-[14px] font-medium transition-colors',
                active
                  ? 'bg-saturn-primary/10 text-saturn-primary'
                  : 'text-saturn-text-secondary hover:bg-gray-50 hover:text-saturn-text'
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-4 pb-2">
          <div className="h-px bg-saturn-border" />
        </div>

        {secondaryNav.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl min-h-[40px] text-[14px] font-medium transition-colors',
                active
                  ? 'bg-saturn-primary/10 text-saturn-primary'
                  : 'text-saturn-text-secondary hover:bg-gray-50 hover:text-saturn-text'
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-saturn-border space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl min-h-[40px] text-[14px] font-medium transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-saturn-primary/10 text-saturn-primary'
              : 'text-saturn-text-secondary hover:bg-gray-50 hover:text-saturn-text'
          )}
        >
          <Settings className="w-[18px] h-[18px]" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl min-h-[40px] text-[14px] font-medium text-saturn-text-secondary hover:bg-gray-50 hover:text-saturn-text transition-colors w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
