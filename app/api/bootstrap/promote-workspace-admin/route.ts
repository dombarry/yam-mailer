import { type NextRequest, NextResponse } from "next/server"
import { getCollectionAsync } from "@/lib/getCollection"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Check if the bootstrap key is correct (simple security measure)
    const { bootstrapKey, userId } = await request.json()

    if (bootstrapKey !== process.env.BOOTSTRAP_KEY) {
      return NextResponse.json({ error: "Invalid bootstrap key" }, { status: 403 })
    }

    // Validate input
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    // Update the user role
    const userCollection = await getCollectionAsync("users")
    const result = await userCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { role: "workspace_admin" } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "User already has workspace admin role" }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "User promoted to workspace admin successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Promotion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

