import { Heading, Hr, Tailwind, Text } from "@react-email/components"
import tailwindConfig from "tailwind.config"

type OtpEmailProps = {
  otp: string
}

export default function OtpTemplate({ otp }: OtpEmailProps) {
  return (
    <Tailwind config={tailwindConfig}>
      <Heading as="h2">Tremendo Stack</Heading>
      <Hr />
      <Text>One Time Password: {otp}</Text>
    </Tailwind>
  )
}
