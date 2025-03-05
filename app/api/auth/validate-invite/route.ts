import { type NextRequest, NextResponse } from "next/server"
import { getCollectionAsync } from "@/lib/getCollection"
import { verifyInviteCode } from "@/lib/jwt-node"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const code = searchParams.get("code")

    if (!email || !code) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    // Verify the invite code
    const validEmail = await verifyInviteCode(code)
    if (!validEmail || validEmail !== email) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    // Check if the pre-authorized user exists and is valid
    const collection = await getCollectionAsync("preAuthorizedUsers")
    const preAuthorizedUser = await collection.findOne({
      email,
      inviteCode: code,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!preAuthorizedUser) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    return NextResponse.json({ valid: true }, { status: 200 })
  } catch (error) {
    console.error("Error validating invite:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}

