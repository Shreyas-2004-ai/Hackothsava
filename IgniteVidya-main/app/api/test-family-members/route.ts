import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Get all family members
    const members = await db
      .collection("family_members")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    // Get collection stats using countDocuments and estimatedDocumentSize
    const count = await db.collection("family_members").countDocuments();

    // Calculate estimated size (this is approximate)
    const sampleDoc = members[0];
    const estimatedDocSize = sampleDoc ? JSON.stringify(sampleDoc).length : 0;
    const estimatedTotalSize = estimatedDocSize * count;

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      totalMembers: members.length,
      members: members.map((member) => ({
        id: member._id,
        name: member.name,
        email: member.email,
        relation: member.relation,
        phone: member.phone,
        created_at: member.created_at,
        added_at: member.added_at,
      })),
      collectionStats: {
        count: count,
        estimatedSize: estimatedTotalSize,
        avgObjSize: estimatedDocSize,
      },
    });
  } catch (error) {
    console.error("Error testing family members:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to MongoDB or fetch family members",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "clear") {
      const { db } = await connectToDatabase();
      const result = await db.collection("family_members").deleteMany({});

      return NextResponse.json({
        success: true,
        message: `Cleared ${result.deletedCount} family members from database`,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in test action:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform test action",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
