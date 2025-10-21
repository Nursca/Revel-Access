import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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

  // Protected routes - let component handle auth
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}