'use client'

import { useState, useCallback, useEffect } from 'react'
import { UserPlus, Copy, Check, Users, Unlink } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

import { useSupabase } from '@/providers/supabase-provider'
import type { PartnerLink, PartnerInvite, PartnerSummary } from '@/types/models'

export default function PartnerPage() {
  const { supabase, user } = useSupabase()

  const [partnerLink, setPartnerLink] = useState<PartnerLink | null>(null)
  const [pendingInvite, setPendingInvite] = useState<PartnerInvite | null>(null)
  const [partnerSummary, setPartnerSummary] = useState<PartnerSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const [inviteEmail, setInviteEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)

  // Load partner data
  useEffect(() => {
    async function loadPartnerData() {
      if (!user) return

      // Check for active partner link (user can be either side)
      const { data: asA } = await supabase
        .from('partner_links')
        .select('*')
        .eq('user_a_id', user.id)
        .eq('is_active', true)
        .limit(1)

      const { data: asB } = await supabase
        .from('partner_links')
        .select('*')
        .eq('user_b_id', user.id)
        .eq('is_active', true)
        .limit(1)

      const link = (asA?.[0] ?? asB?.[0] ?? null) as PartnerLink | null

      if (link) {
        setPartnerLink(link)

        // Get partner profile
        const partnerId = link.user_a_id === user.id ? link.user_b_id : link.user_a_id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerId)
          .limit(1)
        const profile = profileData?.[0] as import('@/types/models').Profile | undefined

        setPartnerSummary({
          display_name: profile?.display_name ?? 'Partner',
          tasks_completed_today: 0,
          habits_completed_today: 0,
          current_streaks: null,
        })
      }

      // Check for pending invites
      const { data: invites } = await supabase
        .from('partner_invites')
        .select('*')
        .eq('inviter_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (invites) {
        setPendingInvite(invites)
      }

      setLoading(false)
    }
    loadPartnerData()
  }, [supabase, user])

  const handleSendInvite = useCallback(async () => {
    if (!user || !inviteEmail.trim()) return
    setSending(true)

    const { data, error } = await supabase
      .from('partner_invites')
      .insert({
        inviter_id: user.id,
        invitee_email: inviteEmail.trim(),
        invite_token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (!error && data) {
      setPendingInvite(data)
      setInviteEmail('')
    }
    setSending(false)
  }, [supabase, user, inviteEmail])

  const handleCopyInvite = useCallback(async () => {
    if (!pendingInvite) return
    const link = `${window.location.origin}/partner/accept?token=${pendingInvite.invite_token}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [pendingInvite])

  const handleUnlink = useCallback(async () => {
    if (!partnerLink) return
    await supabase
      .from('partner_links')
      .update({ is_active: false })
      .eq('id', partnerLink.id)

    setPartnerLink(null)
    setPartnerSummary(null)
    setShowUnlinkConfirm(false)
  }, [supabase, partnerLink])

  if (loading) {
    return (
      <div className="min-h-full">
        <Header title="Partner" />
        <div className="px-4 max-w-lg mx-auto space-y-4">
          <Skeleton className="h-48 w-full rounded-card" />
          <Skeleton className="h-32 w-full rounded-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <Header
        title="Partner"
        subtitle="Accountability partner system"
      />

      <div className="px-4 pb-8 max-w-lg mx-auto space-y-4">
        {partnerLink && partnerSummary ? (
          <>
            {/* Partner summary */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-saturn-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-saturn-primary" />
                </div>
                <div>
                  <p className="font-semibold text-saturn-text">
                    {partnerSummary.display_name || 'Your Partner'}
                  </p>
                  <p className="text-xs text-saturn-text-secondary">
                    Accountability partner
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-saturn-primary">
                    {partnerSummary.tasks_completed_today}
                  </p>
                  <p className="text-xs text-saturn-text-secondary mt-1">
                    Tasks today
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-saturn-success">
                    {partnerSummary.habits_completed_today}
                  </p>
                  <p className="text-xs text-saturn-text-secondary mt-1">
                    Habits today
                  </p>
                </div>
              </div>

              {/* Current streaks */}
              {partnerSummary.current_streaks && partnerSummary.current_streaks.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-saturn-text mb-2">Active streaks</p>
                  <div className="space-y-2">
                    {partnerSummary.current_streaks.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-saturn-text-secondary">{s.name}</span>
                        <span className="font-semibold text-saturn-warning">
                          {s.streak} day{s.streak !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Unlink */}
            <Button
              variant="ghost"
              onClick={() => setShowUnlinkConfirm(true)}
              className="text-saturn-danger hover:bg-red-50 w-full"
            >
              <Unlink className="h-4 w-4 mr-2" />
              Remove partner
            </Button>

            <ConfirmDialog
              open={showUnlinkConfirm}
              onClose={() => setShowUnlinkConfirm(false)}
              onConfirm={handleUnlink}
              title="Remove partner?"
              message="You'll both lose access to each other's progress. You can always link up again later."
              confirmLabel="Remove"
              variant="danger"
            />
          </>
        ) : (
          <>
            {/* No partner - invite flow */}
            <EmptyState
              icon={Users}
              title="No partner yet"
              description="Invite someone to be your accountability partner. You'll see each other's daily progress."
            />

            {pendingInvite ? (
              <Card>
                <p className="text-sm font-medium text-saturn-text mb-2">
                  Invite sent!
                </p>
                <p className="text-sm text-saturn-text-secondary mb-3">
                  Sent to {pendingInvite.invitee_email ?? 'your partner'}. Share the link below or wait for them to accept.
                </p>
                <Button
                  variant="secondary"
                  onClick={handleCopyInvite}
                  fullWidth
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy invite link
                    </>
                  )}
                </Button>
              </Card>
            ) : (
              <Card>
                <p className="text-sm font-medium text-saturn-text mb-3">
                  Send an invite
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="Partner's email address"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSendInvite()
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendInvite}
                    loading={sending}
                    disabled={!inviteEmail.trim()}
                    fullWidth
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send invite
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
