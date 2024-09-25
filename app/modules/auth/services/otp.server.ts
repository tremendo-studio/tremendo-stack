import bcrypt from "bcrypt"
import crypto from "crypto"

const SALT_ROUNDS = 10

export function createOTP(length?: number) {
  length = length || 6
  return Array.from({ length }, () => String(crypto.randomInt(0, 10))).join("")
}

export async function hashOTP(otp: string, salt?: number) {
  salt = salt || SALT_ROUNDS
  return bcrypt.hash(otp, salt)
}

export function compareOTP({ hash, otp }: { hash: string; otp: string }) {
  return bcrypt.compare(otp, hash)
}
