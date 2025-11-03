import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication (only admin and member dashboards)
  const protectedRoutes = ['/admin', '/member']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // If user is not logged in and trying to access protected route
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access login page, redirect to subscription
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/subscription', req.url))
  }

  // Check subscription status for protected routes
  if (session && isProtectedRoute && !req.nextUrl.pathname.startsWith('/subscription')) {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status, current_period_end')
      .eq('user_id', session.user.id)
      .single()

    // If no subscription or expired, redirect to subscription page
    if (!subscription || 
        !['trial', 'active'].includes(subscription.status) ||
        new Date(subscription.current_period_end) < new Date()) {
      return NextResponse.redirect(new URL('/subscription', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
