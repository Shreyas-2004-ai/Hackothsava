import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { message_text, family_id, is_admin_message = false } = await request.json();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get member ID
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('id, family_id')
      .eq('user_id', user.id)
      .eq('family_id', family_id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if member is banned
    const { data: banned } = await supabase
      .from('family_banned_members')
      .select('id')
      .eq('member_id', member.id)
      .eq('is_active', true)
      .single();

    if (banned) {
      return NextResponse.json({ error: 'You are banned from sending messages' }, { status: 403 });
    }

    // Insert message
    const { data: newMessage, error: insertError } = await supabase
      .from('family_messages')
      .insert({
        family_id,
        sender_id: member.id,
        message_text,
        is_admin_message,
        message_type: 'text'
      })
      .select('*, sender:family_members(first_name, last_name, photo_url, is_admin)')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: newMessage }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
