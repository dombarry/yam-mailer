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

