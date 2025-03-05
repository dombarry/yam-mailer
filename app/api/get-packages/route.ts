import { type NextRequest, NextResponse } from "next/server"
import type { Package } from "@/lib/types"
import { getCollectionAsync } from "@/lib/getCollection"

export async function GET(request: NextRequest) {
  try {
    const collection = await getCollectionAsync("Packages")
    const data: Package[] = (await collection.find({}).toArray()) as Package[]
    return NextResponse.json({ records: data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ID = await request.json()
    const collection = await getCollectionAsync("Packages")
    const data: Package[] = (await collection.find({ studentId: ID }).toArray()) as Package[]
    return NextResponse.json({ records: data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

