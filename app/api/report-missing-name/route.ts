import { type NextRequest, NextResponse } from "next/server"
import { reportMissingName } from "@/lib/reportMissingName"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const name = typeof data === "string" ? data : data.name
    const building = data.building || "cobeen"

    const success = await reportMissingName(name, building)

    return NextResponse.json(success, { status: success ? 200 : 500 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(false, { status: 500 })
  }
}

