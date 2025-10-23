import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow these routes
  const publicRoutes = [
    '/',
    '/auth', 
    '/how-it-works',
    '/explore',
    '/profiles',
    '/drops',
    '/_next',
    '/api',
    '/favicon.ico'
  ]

  const isPublic = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublic) {
    return NextResponse.next()
  }

  // Protected routes
  const protectedRoutes = ['/dashboard', '/drops/create', '/settings']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Check custom cookie for wallet (set in client after sign-in)
    const walletCookie = request.cookies.get('revel-wallet')?.value
    if (!walletCookie) {
      console.log("[MIDDLEWARE] No wallet cookie, redirect to /auth")
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    const { data: userData } = await supabase
      .from('users')
      .select('zora_handle')
      .eq('wallet_address', walletCookie.toLowerCase())
      .single()

    if (!userData || !userData.zora_handle) {
      console.log("[MIDDLEWARE] No Zora handle for wallet", walletCookie, "redirect to /auth")
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    console.log("[MIDDLEWARE] Auth OK for", walletCookie)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}