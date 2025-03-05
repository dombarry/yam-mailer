import type { User, LoginCredentials, AuthResponse } from "./types"
import { getCollectionAsync } from "./getCollection"
import { createToken, verifyToken } from "./jwt-node"
import { ObjectId } from "mongodb"
import bcryptjs from "bcryptjs"

const SALT_ROUNDS = 10

export async function createUser(user: Omit<User, "passwordHash"> & { password: string }): Promise<User> {
  const collection = await getCollectionAsync("users")

  // Check if user already exists
  const existingUser = await collection.findOne({ email: user.email })
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password with bcryptjs
  const passwordHash = await bcryptjs.hash(user.password, SALT_ROUNDS)

  // Create user
  const newUser = {
    ...user,
    passwordHash,
  }
  delete (newUser as any).password

  await collection.insertOne(newUser)
  return newUser
}

export async function authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const collection = await getCollectionAsync("users")

  // Find user
  const user = await collection.findOne({
    email: credentials.email,
    building: credentials.building,
  })

  if (!user) {
    return {
      success: false,
      error: "Invalid credentials",
    }
  }

  // Verify password with bcryptjs
  const validPassword = await bcryptjs.compare(credentials.password, user.passwordHash)
  if (!validPassword) {
    return {
      success: false,
      error: "Invalid credentials",
    }
  }

  // Return user without password hash
  const { passwordHash, ...userWithoutPassword } = user

  // Create JWT token
  const token = await createToken(userWithoutPassword)

  return {
    success: true,
    user: userWithoutPassword as Omit<User, "passwordHash">,
    token,
  }
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const collection = await getCollectionAsync("users")

  // Hash new password with bcryptjs
  const passwordHash = await bcryptjs.hash(newPassword, SALT_ROUNDS)

  // Update user
  const result = await collection.updateOne({ _id: new ObjectId(userId) }, { $set: { passwordHash } })

  return result.modifiedCount === 1
}

export async function getAllUsers(): Promise<Omit<User, "passwordHash">[]> {
  const collection = await getCollectionAsync("users")
  const users = await collection.find({}).toArray()

  return users.map((user) => {
    const { passwordHash, ...userWithoutPassword } = user
    return userWithoutPassword
  })
}

export async function getUserFromToken(token: string): Promise<Omit<User, "passwordHash"> | null> {
  try {
    const payload = await verifyToken(token)
    if (!payload) return null

    const collection = await getCollectionAsync("users")
    const user = await collection.findOne({ _id: new ObjectId(payload.userId) })

    if (!user) return null

    const { passwordHash, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    return null
  }
}

