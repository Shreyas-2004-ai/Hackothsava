import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json(
        { success: false, message: 'Member ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('apnaparivar');

    // Check if member exists
    const member = await db.collection('family_members').findOne({
      _id: new ObjectId(memberId),
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Remove references to this member from other members
    await db.collection('family_members').updateMany(
      { parentId: memberId },
      { $set: { parentId: null } }
    );

    await db.collection('family_members').updateMany(
      { spouseId: memberId },
      { $set: { spouseId: null } }
    );

    await db.collection('family_members').updateMany(
      { children: memberId },
      { $pull: { children: memberId } }
    );

    // Delete the member
    const result = await db.collection('family_members').deleteOne({
      _id: new ObjectId(memberId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete member' },
        { status: 500 }
      );
    }

    console.log(`✅ Deleted member ${memberId}`);

    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully',
      memberId,
    });

  } catch (error) {
    console.error('❌ Error deleting member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete member', error: String(error) },
      { status: 500 }
    );
  }
}

