import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  // Clear the auth cookie
  cookies().set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    expires: new Date(0),
    path: "/",
    sameSite: "strict",
  })

  return NextResponse.json({ success: true }, { status: 200 })
}

