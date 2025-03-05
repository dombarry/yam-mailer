import { MARQUETTE_EMAIL } from "./CONFIG"
import type { Package } from "./types"
import nodemailer from "nodemailer"
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

// Get mailroom hours based on building
const getMailroomHours = (building: string): string => {
  // You can customize hours per building if needed
  return "on weekdays from 11a-3p and 5p-7p, on Saturdays 11a-3p, and on Sundays 5p-7p"
}

const getEmailContent = async (pkg: Package, building: string): Promise<string> => {
  const buildingName = formatBuildingName(building)
  const mailroomHours = getMailroomHours(building)

  return `Hello ${pkg.First},

This email is to notify you that you have a package delivered by ${pkg.provider} to pick up in the ${buildingName} Hall mailroom in the first floor lobby. The mailroom is open ${mailroomHours}. Be prepared to provide your student ID to be able to pick up your package. Please let the front desk know if you have any questions!

Best,
${buildingName} Hall Desk Staff`
}

const sendEmail = async (pkg: Package, building = "cobeen") => {
  console.log(`Attempting to send email to ${pkg.Email} for package ${pkg.packageId} in ${building}`)

  try {
    const adminEmail = await getAdminEmail(building)
    const emailContent = await getEmailContent(pkg, building)

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MARQUETTE_EMAIL,
        pass: process.env.MARQUETTE_GMAIL_PASS,
      },
      debug: true, // Enable debug output
    })

    console.log("Verifying email transporter...")
    const verified = await transporter.verify()

    if (!verified) {
      console.error("Transporter verification failed")
      throw new Error("Email transporter verification failed")
    }
    console.log("Transporter verified successfully")

    const mailOptions = {
      from: MARQUETTE_EMAIL,
      to: pkg.Email,
      subject: `Package Available for Pickup at ${formatBuildingName(building)} Hall`,
      text: emailContent,
      replyTo: adminEmail,
      dsn: {
        id: "53201",
        return: "headers",
        notify: ["failure", "delay"],
        recipient: adminEmail,
      },
    }

    console.log(`Sending email with options:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      replyTo: mailOptions.replyTo,
    })

    const res = await transporter.sendMail(mailOptions)
    console.log(`Email sent successfully: ${res.messageId}`)

    if (res.rejected.length > 0) {
      console.error(`Email rejected for recipients: ${res.rejected.join(", ")}`)
      throw new Error(`Email rejected for recipients: ${res.rejected.join(", ")}`)
    }

    return res
  } catch (error) {
    console.error(`Failed to send email: ${(error as Error).message}`)
    throw error
  }
}

export default sendEmail

