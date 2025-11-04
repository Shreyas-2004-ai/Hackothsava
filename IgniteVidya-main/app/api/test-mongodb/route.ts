import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("apnaparivar");

    // Test connection by listing collections
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      message: "✅ MongoDB Connected Successfully!",
      database: "apnaparivar",
      collections: collections.map((c: any) => c.name),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "❌ MongoDB Connection Failed",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
