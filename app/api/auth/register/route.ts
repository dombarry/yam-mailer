import { type NextRequest, NextResponse } from "next/server"
import { getCollectionAsync } from "@/lib/getCollection"
import { createToken, verifyInviteCode } from "@/lib/jwt-node"
import { cookies } from "next/headers"
import bcryptjs from "bcryptjs"
import type { RegisterRequest, User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const registerData: RegisterRequest = await request.json()

    // Validate the registration data
    if (!registerData.email || !registerData.name || !registerData.password || !registerData.inviteCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the invite code
    const email = await verifyInviteCode(registerData.inviteCode)
    if (!email || email !== registerData.email) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 400 })
    }

    // Get the pre-authorized user
    const preAuthCollection = await getCollectionAsync("preAuthorizedUsers")
    const preAuthorizedUser = await preAuthCollection.findOne({
      email: registerData.email,
      inviteCode: registerData.inviteCode,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!preAuthorizedUser) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 400 })
    }

    // Check if user already exists
    const userCollection = await getCollectionAsync("users")
    const existingUser = await userCollection.findOne({ email: registerData.email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create the user
    const passwordHash = await bcryptjs.hash(registerData.password, 10)
    const newUser: User = {
      email: registerData.email,
      name: registerData.name,
      building: preAuthorizedUser.building,
      role: preAuthorizedUser.role,
      passwordHash,
    }

    const result = await userCollection.insertOne(newUser)

    // Mark the pre-authorized user as used
    await preAuthCollection.updateOne({ _id: preAuthorizedUser._id }, { $set: { used: true } })

    // Create and set JWT token
    const { passwordHash: _, ...userWithoutPassword } = newUser
    userWithoutPassword._id = result.insertedId.toString()

    const token = await createToken(userWithoutPassword)

    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "strict",
    })

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

