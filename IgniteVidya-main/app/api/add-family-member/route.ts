import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const { firstName, lastName, relation, email, phone, photo, familyId, addedBy } = formData;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('apnaparivar');
    
    // Create member document
    const memberData = {
      family_id: familyId,
      user_id: null,
      email: email,
      first_name: firstName,
      last_name: lastName,
      relation: relation,
      phone: phone || null,
      photo_url: photo || null,
      is_admin: false,
      is_primary_admin: false,
      invited_by: addedBy,
      invitation_accepted: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Insert into MongoDB
    const result = await db.collection('family_members').insertOne(memberData);

    if (!result.insertedId) {
      console.error('MongoDB insert failed');
      return NextResponse.json(
        { success: false, message: 'Failed to save family member to database' },
        { status: 500 }
      );
    }

    const newMember = {
      id: result.insertedId.toString(),
      ...memberData
    };

    console.log('✅ Member saved to MongoDB:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: `Family member ${firstName} ${lastName} has been added successfully to MongoDB!`,
      data: {
        memberId: newMember.id,
        firstName: newMember.first_name,
        lastName: newMember.last_name,
        relation: newMember.relation,
        email: newMember.email
      }
    });

  } catch (error) {
    console.error('Error adding family member to MongoDB:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add family member', error: String(error) },
      { status: 500 }
    );
  }
}

