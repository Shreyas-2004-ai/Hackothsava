import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      // Return sample data when Supabase is not configured
      console.log('Supabase not configured, returning sample family data');
      const sampleMembers = [
        // Great-Grandparents Generation
        {
          id: 'member-1',
          name: 'Mohan Kumar',
          relation: 'Great-Grandfather',
          email: 'mohan.kumar@example.com',
          phone: '+91-9876543201',
          addedAt: new Date(Date.now() - 86400000 * 40).toISOString()
        },
        {
          id: 'member-2',
          name: 'Kamala Kumar',
          relation: 'Great-Grandmother',
          email: 'kamala.kumar@example.com',
          phone: '+91-9876543202',
          addedAt: new Date(Date.now() - 86400000 * 39).toISOString()
        },
        // Grandparents Generation
        {
          id: 'member-3',
          name: 'Ramesh Kumar',
          relation: 'Grandfather',
          email: 'ramesh.kumar@example.com',
          phone: '+91-9876543203',
          addedAt: new Date(Date.now() - 86400000 * 35).toISOString()
        },
        {
          id: 'member-4',
          name: 'Sunita Kumar',
          relation: 'Grandmother',
          email: 'sunita.kumar@example.com',
          phone: '+91-9876543204',
          addedAt: new Date(Date.now() - 86400000 * 34).toISOString()
        },
        {
          id: 'member-5',
          name: 'Suresh Sharma',
          relation: 'Grandfather',
          email: 'suresh.sharma@example.com',
          phone: '+91-9876543205',
          addedAt: new Date(Date.now() - 86400000 * 33).toISOString()
        },
        {
          id: 'member-6',
          name: 'Lakshmi Sharma',
          relation: 'Grandmother',
          email: 'lakshmi.sharma@example.com',
          phone: '+91-9876543206',
          addedAt: new Date(Date.now() - 86400000 * 32).toISOString()
        },
        // Parents Generation
        {
          id: 'member-7',
          name: 'Rajesh Kumar',
          relation: 'Father',
          email: 'rajesh.kumar@example.com',
          phone: '+91-9876543207',
          addedAt: new Date(Date.now() - 86400000 * 30).toISOString()
        },
        {
          id: 'member-8',
          name: 'Priya Kumar',
          relation: 'Mother',
          email: 'priya.kumar@example.com',
          phone: '+91-9876543208',
          addedAt: new Date(Date.now() - 86400000 * 29).toISOString()
        },
        {
          id: 'member-9',
          name: 'Vikram Kumar',
          relation: 'Uncle',
          email: 'vikram.kumar@example.com',
          phone: '+91-9876543209',
          addedAt: new Date(Date.now() - 86400000 * 28).toISOString()
        },
        {
          id: 'member-10',
          name: 'Meera Kumar',
          relation: 'Aunt',
          email: 'meera.kumar@example.com',
          phone: '+91-9876543210',
          addedAt: new Date(Date.now() - 86400000 * 27).toISOString()
        },
        // Current Generation
        {
          id: 'member-11',
          name: 'Arjun Kumar',
          relation: 'Son',
          email: 'arjun.kumar@example.com',
          phone: '+91-9876543211',
          addedAt: new Date(Date.now() - 86400000 * 25).toISOString()
        },
        {
          id: 'member-12',
          name: 'Anita Kumar',
          relation: 'Daughter',
          email: 'anita.kumar@example.com',
          phone: '+91-9876543212',
          addedAt: new Date(Date.now() - 86400000 * 24).toISOString()
        },
        {
          id: 'member-13',
          name: 'Rohit Kumar',
          relation: 'Cousin',
          email: 'rohit.kumar@example.com',
          phone: '+91-9876543213',
          addedAt: new Date(Date.now() - 86400000 * 23).toISOString()
        },
        {
          id: 'member-14',
          name: 'Kavya Kumar',
          relation: 'Cousin',
          email: 'kavya.kumar@example.com',
          phone: '+91-9876543214',
          addedAt: new Date(Date.now() - 86400000 * 22).toISOString()
        },
        // Next Generation
        {
          id: 'member-15',
          name: 'Little Aarav',
          relation: 'Grandchild',
          email: 'aarav.kumar@example.com',
          phone: '+91-9876543215',
          addedAt: new Date(Date.now() - 86400000 * 10).toISOString()
        },
        {
          id: 'member-16',
          name: 'Baby Diya',
          relation: 'Grandchild',
          email: 'diya.kumar@example.com',
          phone: '+91-9876543216',
          addedAt: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ];

      return NextResponse.json({ 
        success: true, 
        members: sampleMembers
      });
    }

    const { data: members, error } = await supabase
      .from('family_members')
      .select('id, first_name, last_name, email, phone, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch family members' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      members: (members || []).map(member => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`.trim(),
        relation: 'Family Member', // Default relation since we don't have this field
        email: member.email,
        phone: member.phone,
        addedAt: member.created_at
      }))
    });

  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch family members' },
      { status: 500 }
    );
  }
}