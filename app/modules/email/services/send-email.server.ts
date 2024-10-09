type SendEmailArgs = {
  from?: string
  subject: string
  template: JSX.Element
}
export async function sendEmail(args: SendEmailArgs) {
  console.debug("Email sent: not implemented")
}
