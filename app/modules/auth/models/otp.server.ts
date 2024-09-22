import bcrypt from "bcrypt"
import crypto from "crypto"

const SALT_ROUNDS = 10

export default class OTP {
  value: string

  constructor(length = 6) {
    this.value = Array(length)
      .map(() => String(crypto.randomInt(0, 9)))
      .toString()
  }

  static async compare({ hash, otp }: { hash: string; otp: string }) {
    return await bcrypt.compare(otp, hash)
  }

  async hash() {
    return await bcrypt.hash(this.value, SALT_ROUNDS)
  }
}
