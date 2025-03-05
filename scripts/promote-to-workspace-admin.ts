import { MongoClient, ObjectId } from "mongodb"

async function promoteToWorkspaceAdmin(userId: string) {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set")
    }

    const client = new MongoClient(uri)
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("Mailroom")
    const usersCollection = db.collection("users")

    // Find the user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw new Error(`User with ID ${userId} not found`)
    }

    console.log(`Found user: ${user.name} (${user.email}) with role: ${user.role}`)

    // Update the user role
    const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { role: "workspace_admin" } })

    if (result.modifiedCount === 0) {
      console.log("User already has workspace admin role")
    } else {
      console.log(`Successfully promoted user to workspace admin`)
    }

    await client.close()
    console.log("Disconnected from MongoDB")
  } catch (error) {
    console.error("Error:", error)
  }
}

// Usage: Replace with the actual user ID you want to promote
const userId = "your-user-id-here" // Replace with actual user ID
promoteToWorkspaceAdmin(userId)

