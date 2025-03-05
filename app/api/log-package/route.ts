import { type NextRequest, NextResponse } from "next/server"
import type { Package } from "@/lib/types"
import { ObjectId } from "mongodb"
import { getCollectionAsync } from "@/lib/getCollection"

export async function POST(request: NextRequest) {
  try {
    const pkg = (await request.json()) as Package
    const collection = await getCollectionAsync("PackageLog")

    // Separate objectid so we generate a new timestamp of retrieval
    const { _id, ...log } = pkg

    // Get ingested time from ObjectId
    const ingestedTime = new ObjectId(_id).getTimestamp()

    const logNoId = {
      ...log,
      ingestedTime,
      resolved: true,
    }

    // Insert package and get the object
    const inserted_id = (await collection.insertOne(logNoId)).insertedId

    const inserted_object = {
      ...logNoId,
      _id: inserted_id,
    }

    return NextResponse.json(inserted_object, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to log package" }, { status: 500 })
  }
}

