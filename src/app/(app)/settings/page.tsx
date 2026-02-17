'use client'

import { useState, useCallback, useEffect } from 'react'
import { LogOut, Bell, Globe, User, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import { useSupabase } from '@/providers/supabase-provider'
import type { Profile } from '@/types/models'

export default function SettingsPage() {
  const { supabase, user } = useSupabase()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [notifyReminders, setNotifyReminders] = useState(true)
  const [notifyPartner, setNotifyPartner] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setDisplayName(data.display_name ?? '')
        setTimezone(data.timezone)
        const prefs = data.notification_preferences as Record<string, boolean> | null
        if (prefs) {
          setNotifyReminders(prefs.reminders ?? true)
          setNotifyPartner(prefs.partner ?? true)
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase, user])

  const handleSave = useCallback(async () => {
    if (!user) return
    setSaving(true)

    await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        timezone,
        notification_preferences: {
          reminders: notifyReminders,
          partner: notifyPartner,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setSaving(false)
  }, [supabase, user, displayName, timezone, notifyReminders, notifyPartner])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-full">
        <Header title="Settings" />
        <div className="px-4 max-w-lg mx-auto space-y-4">
          <Skeleton className="h-40 w-full rounded-card" />
          <Skeleton className="h-32 w-full rounded-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <Header title="Settings" />

      <div className="px-4 pb-8 max-w-lg mx-auto space-y-6">
        {/* Profile */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-saturn-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-saturn-primary" />
            </div>
            <div>
              <p className="font-medium text-saturn-text">Profile</p>
              <p className="text-xs text-saturn-text-secondary">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Display name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <div>
              <label className="text-sm font-medium text-saturn-text mb-1.5 block">
                <Globe className="h-4 w-4 inline mr-1.5" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={cn(
                  'w-full min-h-[44px] px-3 py-2 rounded-button',
                  'bg-saturn-surface border border-saturn-border',
                  'text-sm text-saturn-text',
                  'focus:outline-none focus:ring-2 focus:ring-saturn-primary/30 focus:border-saturn-primary'
                )}
              >
                {Intl.supportedValuesOf('timeZone').map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-saturn-warning/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-saturn-warning" />
            </div>
            <p className="font-medium text-saturn-text">Notifications</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between min-h-[44px]">
              <div>
                <p className="text-sm font-medium text-saturn-text">Reminders</p>
                <p className="text-xs text-saturn-text-secondary">
                  Get notified for habits and time blocks
                </p>
              </div>
              <Toggle
                checked={notifyReminders}
                onChange={setNotifyReminders}
              />
            </div>

            <div className="flex items-center justify-between min-h-[44px]">
              <div>
                <p className="text-sm font-medium text-saturn-text">Partner updates</p>
                <p className="text-xs text-saturn-text-secondary">
                  Notifications from your accountability partner
                </p>
              </div>
              <Toggle
                checked={notifyPartner}
                onChange={setNotifyPartner}
              />
            </div>
          </div>
        </Card>

        {/* Save button */}
        <Button onClick={handleSave} loading={saving} fullWidth>
          Save settings
        </Button>

        {/* Account actions */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-saturn-danger" />
            </div>
            <p className="font-medium text-saturn-text">Account</p>
          </div>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-saturn-danger hover:bg-red-50 w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </Card>
      </div>
    </div>
  )
}
