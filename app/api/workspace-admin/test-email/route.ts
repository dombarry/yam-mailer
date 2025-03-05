import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt-node"
import { cookies } from "next/headers"
import nodemailer from "nodemailer"
import { MARQUETTE_EMAIL } from "@/lib/CONFIG"

export async function POST(request: NextRequest) {
  try {
    // Verify the workspace admin is logged in
    const token = cookies().get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== "workspace_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get email data
    const { email, subject, content } = await request.json()

    // Validate input
    if (!email || !subject || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Set up transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MARQUETTE_EMAIL,
        pass: process.env.MARQUETTE_GMAIL_PASS,
      },
      debug: true, // Enable debug output
    })

    // Verify transporter
    const verified = await transporter.verify()
    if (!verified) {
      return NextResponse.json(
        {
          error: "Email configuration error. Could not verify transporter.",
          details: "Check your MARQUETTE_GMAIL_PASS environment variable.",
        },
        { status: 500 },
      )
    }

    // Send test email
    const mailOptions = {
      from: MARQUETTE_EMAIL,
      to: email,
      subject: subject,
      text: content,
    }

    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json(
      {
        success: true,
        message: "Test email sent successfully",
        details: {
          messageId: info.messageId,
          response: info.response,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

