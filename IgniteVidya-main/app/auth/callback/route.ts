import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // 'admin' or 'member'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if user is already a family member
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('*, families(*)')
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        // User already exists, redirect based on role
        if (existingMember.is_admin) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        } else {
          return NextResponse.redirect(new URL('/member/dashboard', request.url))
        }
      } else {
        // New user
        if (type === 'admin') {
          // Redirect to family creation page
          return NextResponse.redirect(new URL('/admin/create-family', request.url))
        } else {
          // Check if they have an invitation
          const { data: invitation } = await supabase
            .from('family_invitations')
            .select('*')
            .eq('email', user.email)
            .eq('is_used', false)
            .gte('expires_at', new Date().toISOString())
            .single()

          if (invitation) {
            // Redirect to accept invitation page
            return NextResponse.redirect(new URL(`/member/accept-invitation?token=${invitation.token}`, request.url))
          } else {
            // No invitation found
            return NextResponse.redirect(new URL('/member/no-invitation', request.url))
          }
        }
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}
