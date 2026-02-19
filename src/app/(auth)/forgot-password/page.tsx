'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="animate-fade-in text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-saturn-success" />
        <h2 className="mb-2 text-xl font-semibold text-saturn-text">
          Check your email
        </h2>
        <p className="mb-6 text-saturn-text-secondary">
          If an account exists for{' '}
          <span className="font-medium text-saturn-text">{email}</span>,
          you&apos;ll receive a password reset link shortly.
        </p>
        <Link
          href="/login"
          className={cn(
            'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[--radius-button] bg-saturn-primary px-6 font-medium text-white',
            'hover:bg-saturn-primary-hover transition-colors'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <p className="mb-8 text-center text-saturn-text-secondary">
        No worries. Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-saturn-text">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-saturn-muted" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className={cn(
                'min-h-[44px] w-full rounded-[--radius-button] border border-saturn-border bg-saturn-surface py-2.5 pl-10 pr-4 text-saturn-text placeholder:text-saturn-muted',
                'focus:border-saturn-primary focus:outline-none focus:ring-2 focus:ring-saturn-primary/20',
                'transition-colors'
              )}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-[--radius-button] border border-saturn-danger/20 bg-saturn-danger/5 px-4 py-3 text-sm text-saturn-danger">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'flex min-h-[44px] w-full items-center justify-center rounded-[--radius-button] bg-saturn-primary font-medium text-white',
            'hover:bg-saturn-primary-hover focus:outline-none focus:ring-2 focus:ring-saturn-primary/50 focus:ring-offset-2',
            'transition-colors disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-saturn-primary hover:text-saturn-primary-hover transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
