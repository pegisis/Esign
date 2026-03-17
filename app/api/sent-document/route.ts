import nodemailer from "nodemailer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { recipients, ccEmails, subject, message, documentUrl } =
      await req.json()

    console.log("Incoming request:", recipients, ccEmails)

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const toEmails = recipients.map((r: any) => r.email)

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmails,
      cc: ccEmails,
      subject,
      text: message,
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("EMAIL ERROR:", error)   // 👈 IMPORTANT
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}