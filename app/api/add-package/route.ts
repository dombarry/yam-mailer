import { type NextRequest, NextResponse } from "next/server"
import type { Package, PackageNoIds } from "@/lib/types"
import { pollFromQueue } from "@/lib/handleCounter"
import { getCollectionAsync } from "@/lib/getCollection"
import sendEmail from "@/lib/sendEmail"

export async function POST(request: NextRequest) {
  let PACKAGE_GLOBAL: Package | undefined

  try {
    const packageNoIds = (await request.json()) as PackageNoIds
    const collection = await getCollectionAsync("Packages")

    // Get the building from the request or default to "cobeen"
    const building = packageNoIds.building || "cobeen"

    console.log(`Polling from queue for building: ${building}`)
    const packageId = await pollFromQueue(building)
    console.log(`Got package ID: ${packageId}`)

    const package_data = {
      ...packageNoIds,
      packageId: packageId,
    }

    const inserted_id = (await collection.insertOne(package_data)).insertedId

    const inserted_object: Package = {
      _id: inserted_id,
      ...package_data,
    }

    PACKAGE_GLOBAL = inserted_object

    // Try to send email with better error handling
    try {
      await sendEmail(inserted_object, building)
      console.log(`Email sent successfully for package ${packageId} in ${building}`)
    } catch (emailError) {
      console.error(`Failed to send email for package ${packageId} in ${building}:`, emailError)

      // Log the failed email to a separate collection for retry
      try {
        const failedEmailsCollection = await getCollectionAsync("failed_emails")
        await failedEmailsCollection.insertOne({
          package: inserted_object,
          building,
          error: (emailError as Error).message,
          timestamp: new Date(),
        })
        console.log(`Logged failed email for package ${packageId} for later retry`)
      } catch (logError) {
        console.error(`Failed to log failed email for package ${packageId}:`, logError)
      }

      // Continue with the request - don't fail the package addition just because email failed
    }

    return NextResponse.json(inserted_object, { status: 200 })
  } catch (error) {
    console.error(error)
    if (PACKAGE_GLOBAL) {
      return NextResponse.json(PACKAGE_GLOBAL, { status: 500 })
    } else {
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 501 })
    }
  }
}

