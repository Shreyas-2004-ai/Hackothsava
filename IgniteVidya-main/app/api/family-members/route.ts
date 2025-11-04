import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('apnaparivar');

    // Fetch all family members from MongoDB
    const members = await db.collection('family_members').find({}).toArray();

    // Transform MongoDB documents to match our interface
    const familyMembers = members.map((member: any) => ({
      id: member._id.toString(),
      name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown',
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      relation: member.relation || 'Family Member',
      email: member.email || '',
      phone: member.phone || '',
      photo: member.photo_url || member.photo || null,
      photo_url: member.photo_url || member.photo || null,
      generation: member.generation || 0, // Default to 0 if not set
      parentId: member.parentId || null,
      spouseId: member.spouseId || null,
      children: member.children || [],
      customFields: member.customFields || {},
      createdAt: member.created_at || member.added_at || new Date(),
    }));

    console.log(`✅ Fetched ${familyMembers.length} family members from MongoDB`);

    return NextResponse.json({
      success: true,
      data: familyMembers,
      count: familyMembers.length
    });

  } catch (error) {
    console.error('❌ Error fetching family members from MongoDB:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch family members from database',
        error: String(error) 
      },
      { status: 500 }
    );
  }
}

