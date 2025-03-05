import type { User } from "./types"
import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"
const encoder = new TextEncoder()

export interface JwtPayload {
  userId: string
  email: string
  role: string
  building: string
  name: string
  exp?: number
}

export async function createToken(user: Omit<User, "passwordHash">): Promise<string> {
  const payload: JwtPayload = {
    userId: user._id as string,
    email: user.email,
    role: user.role,
    building: user.building,
    name: user.name,
  }

  // Use jose library which is compatible with Edge Runtime
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encoder.encode(JWT_SECRET))

  return token
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    // Use jose library which is compatible with Edge Runtime
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET))
    return payload as JwtPayload
  } catch (error) {
    return null
  }
}

export async function createInviteCode(email: string): Promise<string> {
  const payload = {
    email,
    type: "invite",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  }

  const token = await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).sign(encoder.encode(JWT_SECRET))

  return token
}

export async function verifyInviteCode(inviteCode: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(inviteCode, encoder.encode(JWT_SECRET))

    if (payload.type !== "invite") {
      return null
    }

    return payload.email as string
  } catch (error) {
    return null
  }
}

