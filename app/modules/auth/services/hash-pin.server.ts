import bcrypt from "bcrypt"

import { HASH_SALT_ROUNDS } from "../config"

type HashOtpArgs = {
  otp: string
  salt?: number
}

type HashOtpDeps = {
  hash: typeof bcrypt.hash
}

export async function HashPin(args: HashOtpArgs, deps?: HashOtpDeps) {
  const { otp, salt = HASH_SALT_ROUNDS } = args
  const { hash = bcrypt.hash } = deps || {}

  return hash(otp, salt)
}

export type HashPin = typeof HashPin
