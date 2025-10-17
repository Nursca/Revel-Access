import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get wallet from query or header (assume SIWE or wallet query param; adjust if using cookies)
  const wallet = request.nextUrl.searchParams.get('wallet') || request.headers.get('x-wallet-address')
  if (!wallet) return res // Skip if no wallet

  const { data: user } = await supabase
    .from('users')
    .select('role, display_name')
    .eq('wallet_address', wallet)
    .single()

  const { pathname } = request.nextUrl

  if (!user) {
    // No profile—redirect to onboarding
    if (pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  } else if (user.role === 'creator' && pathname === '/onboarding') {
    // Creator complete—redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } else if (user.role === 'fan' && pathname === '/onboarding') {
    // Fan complete—redirect to explore
    return NextResponse.redirect(new URL('/explore', request.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}