import type { Counter, Package } from "./types"

import type { ObjectId } from "mongodb"
import { getCollectionAsync } from "./getCollection"

const COUNTERS_COLLECTION = "counters"

type QueueItem = {
  _id: ObjectId
  packageNumber: number
  timestamp: Date
}

const releaseNumber = async (pkg: Package, hall: string): Promise<boolean> => {
  const hallCounter = await getCollectionAsync(`${hall}_queue`)
  const { packageId } = pkg
  const res = await hallCounter.insertOne({ packageNumber: packageId, timestamp: new Date() })
  return res.acknowledged
}

const pollFromQueue = async (hall: string): Promise<number> => {
  try {
    const hallCounter = await getCollectionAsync(`${hall}_queue`)
    const polled = await hallCounter.findOneAndDelete({}, { sort: { timestamp: 1 } })

    // Check if polled.value is null
    if (!polled.value) {
      console.log(`No items in queue for ${hall}, generating new package ID`)
      // If no items in queue, generate a new package ID using getAndIncrementCounter
      return await getAndIncrementCounter(hall)
    }

    const { packageNumber } = polled.value as QueueItem
    return packageNumber
  } catch (error) {
    console.error(`Error polling from queue for ${hall}:`, error)
    // Fallback to generating a new package ID
    return await getAndIncrementCounter(hall)
  }
}

// Updated to accept hall parameter
const getAndIncrementCounter = async (hall: string): Promise<number> => {
  const counters = await getCollectionAsync(COUNTERS_COLLECTION)

  // Get the counter for the specific hall
  const counter = (await counters.findOne({ building: hall })) as Counter

  if (!counter) {
    console.log(`No counter found for ${hall}, creating new counter`)
    // Create a new counter for this hall if it doesn't exist
    const newCounter = {
      building: hall,
      seq_value: 1,
    }
    await counters.insertOne(newCounter)
    return 1
  }

  const val = counter.seq_value

  // Increment the counter in the db, unless it will roll over to 1000, then set back to 1
  await counters.updateOne({ _id: counter._id }, { $set: { seq_value: (val + 1) % 999 || 1 } })

  return val
}

export { getAndIncrementCounter, pollFromQueue, releaseNumber }

