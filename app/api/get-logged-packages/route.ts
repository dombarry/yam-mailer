import { type NextRequest, NextResponse } from "next/server"
import type { LogPackage } from "@/lib/types"
import { getCollectionAsync } from "@/lib/getCollection"

export async function GET(request: NextRequest) {
  try {
    const collection = await getCollectionAsync("PackageLog")
    const data: LogPackage[] = (await collection.find({}).toArray()) as LogPackage[]
    return NextResponse.json({ records: data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ID = await request.json()
    const collection = await getCollectionAsync("PackageLog")
    const data: LogPackage[] = (await collection.find({ studentId: ID }).toArray()) as LogPackage[]
    return NextResponse.json({ records: data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

