import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOTP(otp: string, email: string) {
  return await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    html: `<strong>${otp}</strong>`,
    subject: "OTP password",
    to: [email],
  })
}
