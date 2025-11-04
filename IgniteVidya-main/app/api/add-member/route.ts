import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendFamilyMemberInvitation } from '@/lib/email';

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

    // Validate required fields
    if (!name || !email || !relation) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and relation are required fields' },
        { status: 400 }
      );
    }

    console.log('📥 Received member data:', { name, email, relation, hasPhoto: !!photo });

    // Connect to MongoDB
    let client;
    try {
      client = await clientPromise;
      console.log('✅ Connected to MongoDB');
    } catch (mongoError) {
      console.error('❌ MongoDB connection error:', mongoError);
      return NextResponse.json(
        { success: false, message: 'Failed to connect to database. Please ensure MongoDB is running on localhost:27017' },
        { status: 500 }
      );
    }

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
    let result;
    try {
      result = await db.collection('family_members').insertOne(memberData);
      console.log('✅ Member inserted into MongoDB with ID:', result.insertedId);
    } catch (insertError) {
      console.error('❌ MongoDB insert error:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to save family member to database. Please check MongoDB connection.' },
        { status: 500 }
      );
    }

    if (!result.insertedId) {
      console.error('❌ MongoDB insert failed - no ID returned');
      return NextResponse.json(
        { success: false, message: 'Failed to save family member to database' },
        { status: 500 }
      );
    }

    console.log('✅ Member successfully added to MongoDB');
    console.log('📊 Saved data:', { 
      id: result.insertedId.toString(),
      name: memberData.name, 
      email, 
      relation, 
      phone: memberData.phone || 'Not provided',
      generation: memberData.generation,
      hasCustomFields: !!customFields,
      hasPhoto: !!photo
    });

    // Send email notification to the added member
    const addedByName = request.headers.get('x-user-name') || 'Your Family Admin';
    let emailSent = false;
    let emailMessage = '';
    
    try {
      console.log('📧 Attempting to send invitation email to:', email);
      const emailResult = await sendFamilyMemberInvitation(
        email,
        memberData.name,
        addedByName
      );
      
      if (emailResult.success) {
        emailSent = true;
        emailMessage = `An invitation email has been sent to ${email}.`;
        console.log('✅ Invitation email sent successfully to:', email);
      } else {
        emailMessage = `Member added successfully, but email could not be sent: ${emailResult.message || emailResult.error || 'Email service not configured'}`;
        console.warn('⚠️ Failed to send invitation email:', emailResult.message || emailResult.error);
      }
    } catch (emailError) {
      emailMessage = `Member added successfully, but email sending failed: ${String(emailError)}`;
      console.error('❌ Error sending invitation email:', emailError);
      // Don't fail the request if email fails - member is already added
    }

    return NextResponse.json({
      success: true,
      message: `${memberData.name} has been added successfully to your family tree! ${emailSent ? emailMessage : 'Note: Email service may need configuration.'}`,
      memberId: result.insertedId.toString(),
      emailSent,
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
