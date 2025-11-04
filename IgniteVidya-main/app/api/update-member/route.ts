import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    const { 
      memberId,
      name,
      firstName,
      lastName,
      email,
      relation,
      phone,
      photo,
      position,
      role,
      customFields,
    } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { success: false, message: 'Member ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('apnaparivar');

    // Build update object
    const updateData: any = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (relation !== undefined) updateData.relation = relation;
    if (phone !== undefined) updateData.phone = phone;
    if (photo !== undefined) updateData.photo_url = photo;
    if (position !== undefined) updateData.position = position;
    if (role !== undefined) updateData.role = role;
    if (customFields !== undefined) updateData.customFields = customFields;

    // Update member
    const result = await db.collection('family_members').updateOne(
      { _id: new ObjectId(memberId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Updated member ${memberId}`);

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      memberId,
    });

  } catch (error) {
    console.error('❌ Error updating member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update member', error: String(error) },
      { status: 500 }
    );
  }
}

