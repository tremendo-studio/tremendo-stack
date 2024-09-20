import bcrypt from "bcrypt"

const SALT_ROUNDS = 10

export async function hash(otp: string) {
  return await bcrypt.hash(otp, SALT_ROUNDS)
}

export async function compare(otp: string, hash: string) {
  return await bcrypt.compare(otp, hash)
}
