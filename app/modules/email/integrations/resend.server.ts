import { Resend } from "resend"

const FROM_DEFAULT = "Tremendo Stack <signup@email-testing.unchill.me>"

const resend = new Resend(process.env.RESEND_API_KEY)

type ConstructorArgs = {
  client?: Resend
  from?: string
  subject: string
  template: JSX.Element
}

export default class Email {
  #client: Resend
  #from: string
  #subject: string
  #template: JSX.Element

  constructor({ client = resend, from = FROM_DEFAULT, subject, template }: ConstructorArgs) {
    this.#client = client
    this.#template = template
    this.#subject = subject
    this.#from = from
  }

  async send(to: string) {
    await this.#client.emails.send({
      from: this.#from,
      react: this.#template,
      subject: this.#subject,
      to: [to],
    })
  }
}
