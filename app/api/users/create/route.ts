import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"

// No runtime specification needed with bcryptjs

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    const user = await createUser(userData)
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

