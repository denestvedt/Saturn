'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/today')
    router.refresh()
  }

  return (
    <div className="animate-fade-in">
      <p className="mb-8 text-center text-saturn-text-secondary">
        Structure your day, not your brain.
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
              placeholder="Your password"
              required
              autoComplete="current-password"
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
            'Sign in'
          )}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <p>
          <Link
            href="/forgot-password"
            className="text-saturn-primary hover:text-saturn-primary-hover transition-colors"
          >
            Forgot your password?
          </Link>
        </p>
        <p className="text-saturn-text-secondary">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-saturn-primary hover:text-saturn-primary-hover transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
