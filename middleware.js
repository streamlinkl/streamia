import { NextResponse } from 'next/server'

/**
 * Edge-level auth gate. Runs BEFORE the page renders.
 *
 * Reads the `sl_access` cookie (set on `.streamia.co` by the API) and, if
 * missing on any matched path, redirects to /login with a `next=` param so we
 * can bounce the user back after sign-in. Server components do their own
 * double-check via `getMeServer()`.
 *
 * Matcher below scopes us to paths that are auth-only. Public pages
 * (/, /pricing, /u/[handle], /login, /register, /forgot-password, /_next/*)
 * intentionally skip this middleware.
 */
export function middleware(req) {
  const access = req.cookies.get('sl_access')?.value
  if (access) return NextResponse.next()

  // Build the redirect against the original public host the browser actually
  // hit (test.streamia.co), not the internal Caddy → Next hop (localhost:3100).
  const fwdHost = req.headers.get('x-forwarded-host')
  const fwdProto = req.headers.get('x-forwarded-proto') || 'https'
  const baseHost = fwdHost || req.nextUrl.host
  const dest = req.nextUrl.pathname + (req.nextUrl.search || '')
  const target = new URL(`/login?next=${encodeURIComponent(dest)}`, `${fwdProto}://${baseHost}`)
  return NextResponse.redirect(target)
}

export const config = {
  matcher: [
    '/feed/:path*',
    '/network/:path*',
    '/jobs/:path*',
    '/messages/:path*',
    '/leaderboard/:path*',
    '/reviews/:path*',
    '/analytics/:path*',
    '/companies/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/profile-views/:path*',
    '/offers/:path*',
    '/me/:path*',
    '/dashboard/:path*',
    '/dashboard',
  ],
}
