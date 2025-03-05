import { type NextRequest, NextResponse } from "next/server"
import { getCollectionAsync } from "@/lib/getCollection"
import { verifyToken } from "@/lib/jwt-node"
import { cookies } from "next/headers"
import { MongoClient } from "mongodb"
import bcryptjs from "bcryptjs"
import type { User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    // Verify the workspace admin is logged in
    const token = cookies().get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "workspace_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get building data
    const { buildingName, adminEmail, adminName } = await request.json()

    // Validate input
    if (!buildingName || !adminEmail || !adminName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to MongoDB
    const uri = process.env.MONGODB_URI as string
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db("Mailroom")

    // Check if building already exists
    const existingCollection = await db.listCollections({ name: buildingName }).toArray()
    if (existingCollection.length > 0) {
      return NextResponse.json({ error: "Building already exists" }, { status: 400 })
    }

    // Create collections for the new building
    await db.createCollection(buildingName) // Main roster collection
    await db.createCollection(`${buildingName}_queue`) // Queue collection

    // Initialize counter for the new building
    const countersCollection = await getCollectionAsync("counters")
    await countersCollection.insertOne({
      building: buildingName,
      seq_value: 1,
    })

    // Create admin user for the new building
    const userCollection = await getCollectionAsync("users")

    // Check if user already exists
    const existingUser = await userCollection.findOne({ email: adminEmail })
    if (existingUser) {
      return NextResponse.json({ error: "Admin user already exists" }, { status: 400 })
    }

    // Create the admin user
    const passwordHash = await bcryptjs.hash("changeme", 10) // Default password
    const adminUser: User = {
      email: adminEmail,
      name: adminName,
      building: buildingName,
      role: "admin",
      passwordHash,
    }

    await userCollection.insertOne(adminUser)

    return NextResponse.json(
      {
        success: true,
        message: "Building created successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error creating building:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

