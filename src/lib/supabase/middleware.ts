import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session - this is important for keeping the session alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login (except for auth routes and public routes)
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/auth/')
  const isPublicRoute = request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/offline')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')

  if (!user && !isAuthRoute && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/today'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
