import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json(
        { success: false, message: 'Family ID is required' },
        { status: 400 }
      );
    }

    // Fetch all family members for this family
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select(`
        id,
        name,
        relation,
        email,
        phone,
        photo_url,
        age,
        location,
        custom_fields,
        is_online,
        last_active,
        joined_date
      `)
      .eq('added_by_id', familyId)
      .eq('is_active', true)
      .order('joined_date', { ascending: true });

    if (membersError) {
      console.error('Error fetching family members:', membersError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch family members' },
        { status: 500 }
      );
    }

    // Fetch family relationships
    const { data: relationships, error: relationshipsError } = await supabase
      .from('family_relationships')
      .select(`
        id,
        member_id,
        related_to_id,
        relationship_type,
        is_primary
      `)
      .in('member_id', members?.map(m => m.id) || []);

    if (relationshipsError) {
      console.error('Error fetching relationships:', relationshipsError);
    }

    // Fetch family statistics
    const { data: stats, error: statsError } = await supabase
      .from('family_stats')
      .select('*')
      .eq('family_id', familyId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') { // Ignore "not found" error
      console.error('Error fetching family stats:', statsError);
    }

    // Transform data for family tree visualization
    const familyTreeData = {
      members: members || [],
      relationships: relationships || [],
      stats: stats || {
        total_members: members?.length || 0,
        active_members: members?.filter(m => m.is_online).length || 0,
        family_tree_depth: calculateTreeDepth(relationships || []),
        average_age: calculateAverageAge(members || [])
      }
    };

    return NextResponse.json({
      success: true,
      data: familyTreeData
    });

  } catch (error) {
    console.error('Error fetching family tree:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch family tree data' },
      { status: 500 }
    );
  }
}

// Helper function to calculate tree depth
function calculateTreeDepth(relationships: any[]): number {
  // Simple calculation - in a real app, you'd implement proper tree traversal
  const generations = new Set();
  relationships.forEach(rel => {
    // Add logic to determine generation levels based on relationships
    generations.add(1); // Placeholder
  });
  return Math.max(generations.size, 1);
}

// Helper function to calculate average age
function calculateAverageAge(members: any[]): number {
  if (members.length === 0) return 0;
  const totalAge = members.reduce((sum, member) => sum + (member.age || 0), 0);
  return Math.round(totalAge / members.length);
}

export async function POST(request: NextRequest) {
  try {
    const { action, familyId } = await request.json();

    if (action === 'refresh_stats') {
      // Recalculate and update family statistics
      const { data: members } = await supabase
        .from('family_members')
        .select('id, age, is_online')
        .eq('added_by_id', familyId)
        .eq('is_active', true);

      if (members) {
        const activeCount = members.filter(m => m.is_online).length;
        const avgAge = calculateAverageAge(members);

        const { error } = await supabase
          .from('family_stats')
          .upsert([
            {
              family_id: familyId,
              total_members: members.length,
              active_members: activeCount,
              average_age: avgAge,
              last_updated: new Date().toISOString()
            }
          ]);

        if (error) {
          console.error('Error updating stats:', error);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing family tree request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    );
  }
}