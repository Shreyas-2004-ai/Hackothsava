import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const family_id = searchParams.get('family_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!family_id) {
      return NextResponse.json({ error: 'Family ID required' }, { status: 400 });
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is member of this family
    const { data: member } = await supabase
      .from('family_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('family_id', family_id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Not a member of this family' }, { status: 403 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('family_messages')
      .select(`
        *,
        sender:family_members(first_name, last_name, photo_url, is_admin)
      `)
      .eq('family_id', family_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages.reverse() }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
