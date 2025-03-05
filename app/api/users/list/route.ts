import { type NextRequest, NextResponse } from "next/server"
import { getAllUsers } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

