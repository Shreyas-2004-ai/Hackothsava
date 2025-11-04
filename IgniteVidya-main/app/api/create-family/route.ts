import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { familyName, firstName, lastName, email, userId, subscriptionType } = await request.json();

    const client = await clientPromise;
    const db = client.db('apnaparivar');

    // Calculate subscription end date
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // 1 year from now

    // Create family document
    const familyData = {
      family_name: familyName,
      created_by: userId,
      subscription_type: subscriptionType || 'free_trial',
      subscription_start_date: new Date(),
      subscription_end_date: subscriptionEndDate,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const familyResult = await db.collection('families').insertOne(familyData);
    const familyId = familyResult.insertedId.toString();

    // Create primary admin member
    const memberData = {
      family_id: familyId,
      user_id: userId,
      email: email,
      first_name: firstName,
      last_name: lastName || '',
      relation: 'Primary Admin',
      is_admin: true,
      is_primary_admin: true,
      invitation_accepted: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const memberResult = await db.collection('family_members').insertOne(memberData);

    console.log('✅ Family created in MongoDB:', familyId);
    console.log('✅ Primary admin created:', memberResult.insertedId.toString());

    return NextResponse.json({
      success: true,
      message: 'Family created successfully in MongoDB!',
      data: {
        familyId: familyId,
        memberId: memberResult.insertedId.toString(),
        familyName: familyName
      }
    });

  } catch (error) {
    console.error('Error creating family in MongoDB:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create family', error: String(error) },
      { status: 500 }
    );
  }
}
