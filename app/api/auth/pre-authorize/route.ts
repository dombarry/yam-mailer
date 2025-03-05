import { type NextRequest, NextResponse } from "next/server"
import { getCollectionAsync } from "@/lib/getCollection"
import { createInviteCode, verifyToken } from "@/lib/jwt-node"
import { cookies } from "next/headers"
import type { InviteRequest, PreAuthorizedUser } from "@/lib/types"
import { sendInviteEmail } from "@/lib/sendInviteEmail"

// This endpoint allows admins to pre-authorize users
export async function POST(request: NextRequest) {
  try {
    // Verify the admin is logged in
    const token = cookies().get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get invite data
    const inviteData: InviteRequest = await request.json()

    // Validate the invite data
    if (!inviteData.email || !inviteData.building || !inviteData.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user is already pre-authorized
    const collection = await getCollectionAsync("preAuthorizedUsers")
    const existingUser = await collection.findOne({
      email: inviteData.email,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already has a pending invitation" }, { status: 400 })
    }

    // Create invite code
    const inviteCode = await createInviteCode(inviteData.email)

    // Create pre-authorized user
    const preAuthorizedUser: PreAuthorizedUser = {
      email: inviteData.email,
      name: inviteData.name || "",
      building: inviteData.building,
      role: inviteData.role,
      inviteCode,
      used: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
    }

    await collection.insertOne(preAuthorizedUser)

    // Send invite email
    await sendInviteEmail(preAuthorizedUser)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error pre-authorizing user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Get all pre-authorized users for admin
export async function GET(request: NextRequest) {
  try {
    // Verify the admin is logged in
    const token = cookies().get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all pre-authorized users for this admin's building
    const collection = await getCollectionAsync("preAuthorizedUsers")
    const preAuthorizedUsers = await collection
      .find({
        building: payload.building,
        used: false,
        expiresAt: { $gt: new Date() },
      })
      .toArray()

    return NextResponse.json(preAuthorizedUsers, { status: 200 })
  } catch (error) {
    console.error("Error getting pre-authorized users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

