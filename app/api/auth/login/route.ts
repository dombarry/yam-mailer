import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import type { LoginCredentials } from "@/lib/types"
import { cookies } from "next/headers"

// No runtime specification needed with bcryptjs

export async function POST(request: NextRequest) {
  try {
    const credentials: LoginCredentials = await request.json()
    const response = await authenticateUser(credentials)

    if (response.success && response.token) {
      // Set JWT token as HTTP-only cookie
      cookies().set({
        name: "auth_token",
        value: response.token,
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "strict",
      })

      // Don't send the token in the response body for security
      const { token, ...responseWithoutToken } = response
      return NextResponse.json(responseWithoutToken, { status: 200 })
    } else {
      return NextResponse.json(response, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

