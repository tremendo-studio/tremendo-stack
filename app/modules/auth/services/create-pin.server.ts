import crypto from "crypto"

import { OTP_LENGTH } from "../config"

export function CreatePin(length?: number) {
  length = length || OTP_LENGTH
  return Array.from({ length }, () => String(crypto.randomInt(0, 10))).join("")
}

export type CreatePin = typeof CreatePin
