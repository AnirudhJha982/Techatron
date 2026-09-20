import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import NextAuth from "next-auth"
import createMiddleware from "next-intl/middleware"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export const locales = [
  'en', 'hi', 'as', 'or', 'mr', 'gu', 'pa', 'ta', 'te', 'kn', 'ml', 'ur',
  'sa', 'mai', 'sat', 'ks', 'ne', 'kok', 'sd', 'doi', 'brx', 'mni'
]

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en'
})

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  
  // Basic protected routes check
  const isProtectedRoute = pathname.includes('/farmer/') || pathname.includes('/worker/') || pathname.includes('/admin/')
  if (isProtectedRoute && !isLoggedIn) {
    const locale = pathname.split('/')[1] || 'en'
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
  }

  // Next-intl handles the actual routing/rewrites
  return intlMiddleware(req as any)
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)'],
}
