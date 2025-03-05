import { type NextRequest, NextResponse } from "next/server"
import { getCollectionAsync } from "@/lib/getCollection"

export async function GET(request: NextRequest) {
  try {
    const collection = await getCollectionAsync("cobeen")
    const data = await collection.find({}).toArray()

    // Transform the data to match the expected Student format
    const students = data.map((student) => ({
      _id: student._id,
      Last_Name: student.Last_Name,
      First_Name: student.First_Name,
      University_ID: student.University_ID,
      Default_Email: student.Default_Email,
    }))

    return NextResponse.json({ records: students }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to get students" }, { status: 500 })
  }
}

