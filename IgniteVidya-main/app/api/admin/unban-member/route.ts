import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { target_member_id, family_id } = await request.json();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get admin member ID
    const { data: admin, error: adminError } = await supabase
      .from('family_members')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .eq('family_id', family_id)
      .single();

    if (adminError || !admin || !admin.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Call the unban function
    const { data, error } = await supabase.rpc('unban_family_member', {
      p_family_id: family_id,
      p_admin_id: admin.id,
      p_target_member_id: target_member_id
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Member unbanned successfully' 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
