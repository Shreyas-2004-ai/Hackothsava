import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const members = await db
      .collection('family_members')
      .find({})
      .sort({ addedAt: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      members: members.map(member => ({
        id: member._id,
        name: member.name,
        relation: member.relation,
        email: member.email,
        phone: member.phone,
        addedAt: member.addedAt
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