import { eq } from "drizzle-orm"

import { db, Db } from "~/db"
import { authSession } from "~/db/schema"
import { AppError, castToError } from "~/utils/error.server"

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
  const { dbClient = db, getSession = getSessionDep } = deps || {}
  const session = await getSession(request)

  try {
    if (new Date(session.expiresAt).getTime() < Date.now())
      throw new AppError({
        message: "Login OTP has expired",
        name: "LOG_IN_OTP_EXPIRED",
        statusCode: 400,
        userMessage:
          "Your one-time password (OTP) has expired. Please request a new OTP to log in.",
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
        message: maxAttemptsReached ? "Maximum login attempts reached" : "Invalid login OTP",
        name: maxAttemptsReached ? "LOG_IN_MAX_ATTEMPTS_REACHED" : "LOG_IN_INVALID_OTP",
        statusCode: 400,

        userMessage: maxAttemptsReached
          ? "You have reached the maximum number of attempts. Please request a new OTP to continue."
          : "The OTP you entered is invalid. Please check your input and try again.",
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
    throw castToError(error)
  }
}
