import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('apnaparivar');

    // Fetch all family members from MongoDB
    const members = await db.collection('family_members').find({}).toArray();

    // Transform MongoDB documents to match our interface
    // Handle both field name formats (first_name/last_name vs firstName/lastName)
    const familyMembers = members.map((member: any) => {
      // Handle different field name formats
      const firstName = member.firstName || member.first_name || '';
      const lastName = member.lastName || member.last_name || '';
      const fullName = member.name || `${firstName} ${lastName}`.trim() || 'Unknown';
      
      return {
        id: member._id.toString(),
        name: fullName,
        firstName: firstName,
        lastName: lastName,
        relation: member.relation || 'Family Member',
        email: member.email || '',
        phone: member.phone || '',
        photo: member.photo_url || member.photo || null,
        photo_url: member.photo_url || member.photo || null,
        generation: member.generation !== undefined ? member.generation : 1, // Default to 1 if not set
        parentId: member.parentId ? member.parentId.toString() : null,
        spouseId: member.spouseId ? member.spouseId.toString() : null,
        children: member.children ? member.children.map((c: any) => c.toString()) : [],
        customFields: member.customFields || {},
        createdAt: member.created_at || member.added_at || member.createdAt || new Date(),
      };
    });

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

