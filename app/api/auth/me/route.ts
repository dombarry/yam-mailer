import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt-node"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  // Get token from cookies
  const token = cookies().get("auth_token")?.value

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Verify token
  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  // Return user info
  return NextResponse.json(
    {
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        building: payload.building,
      },
    },
    { status: 200 },
  )
}

