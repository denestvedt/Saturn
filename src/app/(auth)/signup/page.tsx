'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Mail, Lock, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
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
          We sent a confirmation link to{' '}
          <span className="font-medium text-saturn-text">{email}</span>.
          Click the link to activate your account.
        </p>
        <Link
          href="/login"
          className={cn(
            'inline-flex min-h-[44px] items-center justify-center rounded-[--radius-button] bg-saturn-primary px-6 font-medium text-white',
            'hover:bg-saturn-primary-hover transition-colors'
          )}
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <p className="mb-8 text-center text-saturn-text-secondary">
        Let&apos;s build your system.
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

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-saturn-text">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-saturn-muted" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
              className={cn(
                'min-h-[44px] w-full rounded-[--radius-button] border border-saturn-border bg-saturn-surface py-2.5 pl-10 pr-4 text-saturn-text placeholder:text-saturn-muted',
                'focus:border-saturn-primary focus:outline-none focus:ring-2 focus:ring-saturn-primary/20',
                'transition-colors'
              )}
            />
          </div>
          <p className="mt-1.5 text-xs text-saturn-muted">
            Must be at least 6 characters
          </p>
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-saturn-text">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-saturn-muted" />
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              minLength={6}
              autoComplete="new-password"
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
            'Create account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-saturn-text-secondary">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-saturn-primary hover:text-saturn-primary-hover transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
