import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-saturn-bg px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-saturn-primary">
            Saturn Structure
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
