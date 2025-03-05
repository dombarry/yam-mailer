import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import type { Package } from "@/lib/types"
import { getCollectionAsync } from "@/lib/getCollection"
import { releaseNumber } from "@/lib/handleCounter"

const HALL = "cobeen"

export async function POST(request: NextRequest) {
  try {
    const _id = (await request.json()) as string
    const collection = await getCollectionAsync("Packages")

    // Delete package and store deleted object
    const dbRes = await collection.findOneAndDelete({ _id: new ObjectId(_id) })
    if (!dbRes.value) {
      throw new Error("Error deleting package")
    }

    const pkg = dbRes.value as Package
    const numberFreedSuccess = await releaseNumber(pkg, HALL)

    if (!numberFreedSuccess) {
      throw new Error("Error freeing number")
    }

    return NextResponse.json(numberFreedSuccess, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to remove package" }, { status: 500 })
  }
}

