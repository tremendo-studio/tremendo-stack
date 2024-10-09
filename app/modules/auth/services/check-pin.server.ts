import bcrypt from "bcrypt"

type CheckOtpArgs = {
  hash: string
  pin: string
}

type CheckOtpDeps = {
  compare: typeof bcrypt.compare
}

export async function CheckPin(args: CheckOtpArgs, deps?: CheckOtpDeps) {
  const { hash, pin } = args
  const { compare = bcrypt.compare } = deps || {}

  return await compare(pin, hash)
}

export type CheckPin = typeof CheckPin
