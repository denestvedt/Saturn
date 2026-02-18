'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-saturn-bg">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-saturn-primary/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-saturn-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-saturn-text mb-2">
          You&apos;re offline
        </h1>
        <p className="text-sm text-saturn-text-secondary mb-6">
          Saturn Structure needs an internet connection to sync your data.
          Check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2 rounded-xl bg-saturn-primary text-white font-medium text-sm hover:bg-saturn-primary-hover transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
