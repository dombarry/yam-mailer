import { type NextRequest, NextResponse } from "next/server"
import type { SafeRoster } from "@/lib/types"
import { getCollectionAsync } from "@/lib/getCollection"

export async function POST(request: NextRequest) {
  try {
    const { roster } = (await request.json()) as { roster: SafeRoster[] }

    // Additional validation
    const requiredColumns = ["Last_Name", "First_Name", "University_ID", "Default_Email"]

    // Validate each entry
    roster.forEach((entry) => {
      // Check all required fields are present
      for (const column of requiredColumns) {
        if (!(column in entry)) {
          throw new Error(`Missing required column: ${column}`)
        }
      }

      // Validate University_ID format
      if (entry.University_ID.length !== 9) {
        throw new Error(`Invalid University ID format for student: ${entry.First_Name} ${entry.Last_Name}`)
      }

      // Validate email format
      if (!entry.Default_Email.endsWith("@marquette.edu")) {
        throw new Error(`Invalid email format for student: ${entry.First_Name} ${entry.Last_Name}`)
      }
    })

    const collection = await getCollectionAsync("cobeen")

    // Replace the current roster with the new roster
    await collection.deleteMany({})
    await collection.insertMany(roster)

    return NextResponse.json({ message: "Roster uploaded successfully" }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

