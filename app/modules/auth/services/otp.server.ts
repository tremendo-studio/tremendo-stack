import bcrypt from "bcrypt"
import crypto from "crypto"

const SALT_ROUNDS = 10

export function createOTP(length?: number) {
  length = length || 6
  return Array.from({ length }, () => String(crypto.randomInt(0, 10))).join("")
}

type HashOtpArgs = {
  otp: string
  salt?: number
}

type HashOtpDeps = {
  hash: typeof bcrypt.hash
}

export async function hashOTP({ otp, salt = SALT_ROUNDS }: HashOtpArgs, deps?: HashOtpDeps) {
  const { hash = bcrypt.hash } = deps || {}
  return hash(otp, salt)
}

type CompareOtpArgs = {
  hash: string
  otp: string
}

type CompareOtpDeps = {
  compare: typeof bcrypt.compare
}
export function compareOTP({ hash, otp }: CompareOtpArgs, deps?: CompareOtpDeps) {
  const { compare = bcrypt.compare } = deps || {}
  return compare(otp, hash)
}
