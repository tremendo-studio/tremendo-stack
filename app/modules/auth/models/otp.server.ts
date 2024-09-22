import bcrypt from "bcrypt"
import crypto from "crypto"

const SALT_ROUNDS = 10

export default class OTP {
  #hashedValue?: string
  value: string

  constructor(length = 6) {
    this.value = Array.from({ length }, () => String(crypto.randomInt(0, 10))).join("")
  }

  static compare({ hash, otp }: { hash: string; otp: string }) {
    return bcrypt.compare(otp, hash)
  }

  async hash() {
    if (this.#hashedValue) {
      return this.#hashedValue
    }

    this.#hashedValue = await bcrypt.hash(this.value, SALT_ROUNDS)
    return this.#hashedValue
  }
}
