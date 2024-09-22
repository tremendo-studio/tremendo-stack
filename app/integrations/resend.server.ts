import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOTP(otp: string, email: string) {
  const result = await resend.emails.send({
    from: "Tremendo Stack <signup@email-testing.unchill.me>",
    html: `<strong>${otp}</strong>`,
    subject: "OTP password",
    to: [email],
  })

  console.debug(JSON.stringify(result, null, 2))
  return result
}
