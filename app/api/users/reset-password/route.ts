import { type NextRequest, NextResponse } from "next/server"
import { resetUserPassword } from "@/lib/auth"

// No runtime specification needed with bcryptjs

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword } = await request.json()
    const success = await resetUserPassword(userId, newPassword)

    if (success) {
      return NextResponse.json({ success: true }, { status: 200 })
    } else {
      return NextResponse.json({ error: "Failed to reset password" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

