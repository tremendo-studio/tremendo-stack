import { Db } from "~/db"

import { compareOTP } from "../otp.server"
import { GetSession } from "../session-storage.server"

export type AuthenticateArgs = {
  maxAge?: number
  otp: string
  request: Request
}

export type AuthenticateDeps = {
  compare: typeof compareOTP
  dbClient: Db
  getSession: GetSession
}
