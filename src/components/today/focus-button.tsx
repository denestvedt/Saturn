'use client'

import { Zap } from 'lucide-react'
import Link from 'next/link'

export function FocusButton() {
  return (
    <Link href="/timer?duration=600" className="block">
      <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-saturn-primary text-white font-semibold text-base shadow-md hover:bg-saturn-primary-hover active:scale-[0.98] transition-all min-h-[56px]">
        <Zap className="w-5 h-5" />
        Start next 10 minutes
      </button>
    </Link>
  )
}
