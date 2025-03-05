import { type NextRequest, NextResponse } from "next/server"
import { getCollectionAsync } from "@/lib/getCollection"
import bcryptjs from "bcryptjs"
import type { User } from "@/lib/types"

// This is a one-time setup endpoint to create the initial admin user
// In production, this should be secured or removed after initial setup
export async function POST(request: NextRequest) {
  try {
    // Check if the bootstrap key is correct (simple security measure)
    const { bootstrapKey, email, name, password, building } = await request.json()

    if (bootstrapKey !== process.env.BOOTSTRAP_KEY) {
      return NextResponse.json({ error: "Invalid bootstrap key" }, { status: 403 })
    }

    // Validate input
    if (!email || !name || !password || !building) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if users collection already has any users
    const userCollection = await getCollectionAsync("users")
    const userCount = await userCollection.countDocuments()

    if (userCount > 0) {
      return NextResponse.json({ error: "Bootstrap already completed" }, { status: 400 })
    }

    // Create the admin user
    const passwordHash = await bcryptjs.hash(password, 10)
    const adminUser: User = {
      email,
      name,
      building,
      role: "admin",
      passwordHash,
    }

    await userCollection.insertOne(adminUser)

    return NextResponse.json(
      {
        success: true,
        message: "Initial admin user created successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Bootstrap error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

