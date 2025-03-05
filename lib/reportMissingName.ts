import { MARQUETTE_EMAIL } from "./CONFIG"
import sendEmailWithContent from "./sendEmailWithContent"
import { getCollectionAsync } from "./getCollection"

// Function to get admin email for a specific building
const getAdminEmail = async (building: string): Promise<string> => {
  try {
    const userCollection = await getCollectionAsync("users")
    const admin = await userCollection.findOne({
      building: building,
      role: "admin",
    })

    if (admin && admin.email) {
      return admin.email
    }

    // Default fallback
    return "Dominic.barry@marquette.edu"
  } catch (error) {
    console.error(`Error getting admin email for ${building}:`, error)
    return "Dominic.barry@marquette.edu"
  }
}

// Function to format building name properly
const formatBuildingName = (building: string): string => {
  return building.charAt(0).toUpperCase() + building.slice(1)
}

const getEmailContent = (name: string, building: string): string => {
  const buildingName = formatBuildingName(building)

  return `Hello Facilities Manager,

This email is to notify you that a package with a name not in the system was delivered to ${buildingName} Hall. The name on the package is ${name}.`
}

const reportMissingName = async (name: string, building = "cobeen"): Promise<boolean> => {
  try {
    const adminEmail = await getAdminEmail(building)

    await sendEmailWithContent(
      adminEmail,
      getEmailContent(name, building),
      adminEmail,
      MARQUETTE_EMAIL,
      process.env.MARQUETTE_GMAIL_PASS,
      `Alert - Package with Out-of-System Name Delivered to ${formatBuildingName(building)} Hall`,
    )
    return true
  } catch (err) {
    console.log("Error in reportMissingName", err)
    return false
  }
}

export { reportMissingName }

