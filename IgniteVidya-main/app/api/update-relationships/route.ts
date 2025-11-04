import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { memberId, parentId, spouseId, children } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { success: false, message: 'Member ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('apnaparivar');

    // Convert string IDs to ObjectId
    let memberObjectId: ObjectId;
    try {
      memberObjectId = new ObjectId(memberId);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid member ID format' },
        { status: 400 }
      );
    }

    // Update member relationships
    const updateData: any = {
      updated_at: new Date()
    };

    if (parentId !== undefined && parentId) {
      try {
        updateData.parentId = new ObjectId(parentId).toString();
      } catch (error) {
        updateData.parentId = null;
      }
    } else if (parentId === null) {
      updateData.parentId = null;
    }

    if (spouseId !== undefined && spouseId) {
      try {
        updateData.spouseId = new ObjectId(spouseId).toString();
      } catch (error) {
        updateData.spouseId = null;
      }
    } else if (spouseId === null) {
      updateData.spouseId = null;
    }

    if (children !== undefined) {
      updateData.children = Array.isArray(children) ? children.map((id: string) => {
        try {
          return new ObjectId(id).toString();
        } catch {
          return id;
        }
      }) : [];
    }

    // Update the member
    const result = await db.collection('family_members').updateOne(
      { _id: memberObjectId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // If setting a spouse, also update the spouse's record
    if (spouseId) {
      try {
        const spouseObjectId = new ObjectId(spouseId);
        await db.collection('family_members').updateOne(
          { _id: spouseObjectId },
          { $set: { spouseId: memberId, updated_at: new Date() } }
        );
      } catch (error) {
        console.error('Error updating spouse:', error);
      }
    }

    // If setting children, update parent references
    if (children && Array.isArray(children)) {
      for (const childId of children) {
        try {
          const childObjectId = new ObjectId(childId);
          await db.collection('family_members').updateOne(
            { _id: childObjectId },
            { $set: { parentId: memberId, updated_at: new Date() } }
          );
        } catch (error) {
          console.error(`Error updating child ${childId}:`, error);
        }
      }
    }

    console.log(`✅ Updated relationships for member ${memberId}`);

    return NextResponse.json({
      success: true,
      message: 'Relationships updated successfully',
      data: updateData
    });

  } catch (error) {
    console.error('❌ Error updating relationships:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update relationships',
        error: String(error) 
      },
      { status: 500 }
    );
  }
}

