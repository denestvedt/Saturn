'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, ArrowRight } from 'lucide-react'
import { useSupabase } from '@/providers/supabase-provider'
import Link from 'next/link'

export function PartnerWidget() {
  const { supabase, user } = useSupabase()
  const [hasPartner, setHasPartner] = useState(false)
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPartner = useCallback(async () => {
    if (!user) return
    const { data: links } = await supabase
      .from('partner_links')
      .select('*')
      .eq('is_active', true)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .limit(1)

    if (links && links.length > 0) {
      setHasPartner(true)
      const link = links[0]
      const partnerId = link.user_a_id === user.id ? link.user_b_id : link.user_a_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', partnerId)
        .single()
      setPartnerName(profile?.display_name ?? null)
    }
    setLoading(false)
  }, [supabase, user])

  useEffect(() => {
    fetchPartner()
  }, [fetchPartner])

  if (loading) return null

  return (
    <Link href="/partner" className="block">
      <div className="bg-saturn-surface rounded-card p-4 border border-saturn-border hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-saturn-accent" />
            <h3 className="text-sm font-semibold text-saturn-text">Partner</h3>
          </div>
          <ArrowRight className="w-4 h-4 text-saturn-muted" />
        </div>

        <p className="text-sm text-saturn-text-secondary mt-2">
          {hasPartner
            ? `Paired with ${partnerName || 'your partner'}`
            : 'Invite someone to keep you on track'}
        </p>
      </div>
    </Link>
  )
}
