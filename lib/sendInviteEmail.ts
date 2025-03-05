import { MARQUETTE_EMAIL } from "./CONFIG"
import type { PreAuthorizedUser } from "./types"
import nodemailer from "nodemailer"

export async function sendInviteEmail(user: PreAuthorizedUser): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MARQUETTE_EMAIL,
        pass: process.env.MARQUETTE_GMAIL_PASS,
      },
    })

    const verified = await transporter.verify()
    if (!verified) {
      throw new Error("Email transporter verification failed")
    }

    const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?email=${encodeURIComponent(user.email)}&code=${encodeURIComponent(user.inviteCode)}`

    const mailOptions = {
      from: MARQUETTE_EMAIL,
      to: user.email,
      subject: "Invitation to Yam Mailroom System",
      text: `
Hello${user.name ? ` ${user.name}` : ""},

You have been invited to join the Yam Mailroom System as a ${user.role === "admin" ? "Administrator" : "Desk Receptionist"} for ${user.building.charAt(0).toUpperCase() + user.building.slice(1)} Hall.

To complete your registration, please click the link below:

${registrationUrl}

This invitation will expire in 7 days.

Best regards,
Yam Mailroom Team
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #f5a623; padding: 20px; text-align: center; color: white;">
    <h1>Yam Mailroom System</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
    <p>Hello${user.name ? ` ${user.name}` : ""},</p>
    
    <p>You have been invited to join the Yam Mailroom System as a <strong>${user.role === "admin" ? "Administrator" : "Desk Receptionist"}</strong> for <strong>${user.building.charAt(0).toUpperCase() + user.building.slice(1)} Hall</strong>.</p>
    
    <p>To complete your registration, please click the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${registrationUrl}" style="background-color: #f5a623; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Complete Registration</a>
    </div>
    
    <p>This invitation will expire in 7 days.</p>
    
    <p>Best regards,<br>Yam Mailroom Team</p>
  </div>
</div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Error sending invite email:", error)
    return false
  }
}

