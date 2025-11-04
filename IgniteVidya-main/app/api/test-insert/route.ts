import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('apnaparivar');
    
    // Insert a test member
    const result = await db.collection('family_members').insertOne({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      relation: 'Father',
      phone: '1234567890',
      family_id: 'test-family-123',
      is_admin: false,
      is_primary_admin: false,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: '✅ Test data inserted!',
      insertedId: result.insertedId.toString(),
      note: 'Now refresh MongoDB Compass and you will see apnaparivar database!'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '❌ Failed to insert test data',
      error: String(error)
    }, { status: 500 });
  }
}
