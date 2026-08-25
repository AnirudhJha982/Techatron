import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import NextAuth from "next-auth"
import createMiddleware from "next-intl/middleware"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export const locales = [
  'en', 'hi', 'bn', 'as', 'or', 'mr', 'gu', 'pa', 'ta', 'te', 'kn', 'ml', 'ur',
  'sa', 'mai', 'sat', 'ks', 'ne', 'kok', 'sd', 'doi', 'brx', 'mni'
]

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en'
})

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Check if it's a protected route (ignores locale prefix)
  const isProtected = locales.some(l => 
    pathname.startsWith(`/${l}/farmer`) || 
    pathname.startsWith(`/${l}/worker`) || 
    pathname.startsWith(`/${l}/admin`)
  )
  
  if (isProtected && !isLoggedIn) {
    const locale = pathname.split('/')[1] || 'en'
    return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl))
  }

  // Next-intl handles the actual routing/rewrites
  return intlMiddleware(req as any)
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
