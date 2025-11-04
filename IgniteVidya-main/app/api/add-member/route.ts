import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      firstName, 
      lastName, 
      email, 
      relation, 
      phone, 
      customFields,
      photo,
      addedAt 
    } = await request.json();

    const client = await clientPromise;
    const db = client.db('apnaparivar');

    // Determine generation based on relation
    const getGenerationFromRelation = (relation: string): number => {
      const relationLower = relation.toLowerCase();
      if (relationLower.includes('grandfather') || relationLower.includes('grandmother') || 
          relationLower.includes('great')) {
        return 0; // Grandparents
      } else if (relationLower === 'father' || relationLower === 'mother' || 
                 relationLower === 'parent' || relationLower === 'husband' || 
                 relationLower === 'wife' || relationLower === 'spouse') {
        return 1; // Parents
      } else if (relationLower === 'son' || relationLower === 'daughter' || 
                 relationLower === 'child' || relationLower === 'brother' || 
                 relationLower === 'sister' || relationLower === 'uncle' || 
                 relationLower === 'aunt') {
        return 2; // Children/Relatives
      } else if (relationLower.includes('grandson') || relationLower.includes('granddaughter') || 
                 relationLower.includes('grandchild') || relationLower.includes('nephew') || 
                 relationLower.includes('niece')) {
        return 3; // Grandchildren
      }
      return 1; // Default
    };

    // Prepare member data
    const memberData: any = {
      name: name || `${firstName || ''} ${lastName || ''}`.trim() || firstName || lastName || 'Unknown',
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      relation,
      phone: phone || null,
      generation: getGenerationFromRelation(relation),
      customFields: customFields || {},
      photo_url: photo || null,
      parentId: null, // Can be set later when relationships are established
      spouseId: null, // Can be set later when relationships are established
      children: [], // Will be populated when children are added
      added_at: addedAt || new Date().toISOString(),
      created_at: new Date(),
      updated_at: new Date()
    };

    // Insert into MongoDB
    const result = await db.collection('family_members').insertOne(memberData);

    if (!result.insertedId) {
      console.error('❌ MongoDB insert failed');
      return NextResponse.json(
        { success: false, message: 'Failed to save family member to database' },
        { status: 500 }
      );
    }

    console.log('✅ Member added to MongoDB:', result.insertedId);
    console.log('📊 Data:', { 
      name: memberData.name, 
      email, 
      relation, 
      phone: memberData.phone,
      hasCustomFields: !!customFields,
      hasPhoto: !!photo
    });

    return NextResponse.json({
      success: true,
      message: `${memberData.name} has been added successfully to your family tree!`,
      memberId: result.insertedId.toString(),
      data: { 
        name: memberData.name,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        email, 
        relation, 
        phone: memberData.phone 
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add family member. Please try again.', error: String(error) },
      { status: 500 }
    );
  }
}
