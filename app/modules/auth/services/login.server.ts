import { eq } from "drizzle-orm"

import { db, Db } from "~/db"
import { authSession } from "~/db/schema"
import { AppError } from "~/utils/error.server"

import { compareOTP } from "./otp.server"
import { getSession as getSessionDep } from "./session-storage.server"

const MAX_ATTEMPTS = 3
const MAX_AGE = 15 * 60 * 10080

type LogInArgs = {
  maxAge?: number
  otp: string
  request: Request
}

type LogInDeps = {
  dbClient: Db
  getSession: typeof getSessionDep
}

export async function logIn({ maxAge = MAX_AGE, otp, request }: LogInArgs, deps?: LogInDeps) {
  const { dbClient, getSession } = deps || { dbClient: db, getSession: getSessionDep }
  const session = await getSession(request)

  try {
    if (new Date(session.expiresAt).getTime() < Date.now())
      throw new AppError({
        message: "OTP expired",
        name: "LOG_IN_OTP_EXPIRED",
        statusCode: 400,
        userMessage: "Your password has expired. Please request a new one.",
      })

    const validPassword = await compareOTP({ hash: session.otpHash, otp })
    if (!validPassword) {
      const dbSession = (
        await dbClient
          .update(authSession)
          .set({ loginAttempts: session.loginAttempts + 1 })
          .where(eq(authSession.id, session.id))
          .returning()
      )[0]

      const maxAttemptsReached = dbSession.loginAttempts >= MAX_ATTEMPTS

      throw new AppError({
        message: maxAttemptsReached ? "Maximum attempts reached" : "Invalid OTP",
        name: maxAttemptsReached ? "LOG_IN_MAX_ATTEMPTS" : "LOG_IN_INVALID_OTP",
        statusCode: 400,

        userMessage: maxAttemptsReached
          ? "Maximum attempts reached. Please request a new password."
          : "Invalid OTP. Please check your input and try again.",
      })
    }

    const dbSession = (
      await dbClient
        .update(authSession)
        .set({ expiresAt: new Date(Date.now() + maxAge * 1000).toISOString(), loggedIn: true })
        .returning()
    )[0]

    return dbSession
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError({})
  }
}
