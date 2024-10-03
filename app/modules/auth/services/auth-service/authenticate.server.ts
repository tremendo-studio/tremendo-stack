import { eq } from "drizzle-orm"

import { db } from "~/db"
import { authSession } from "~/db/schema"
import { logger } from "~/logger.server"

import { AuthError } from "../auth-service.server"
import { compareOTP } from "../otp.server"
import { getSession as getSessionDep } from "../session-storage.server"
import { AuthenticateArgs, AuthenticateDeps } from "./types"

const MAX_ATTEMPTS = 3
const MAX_AGE = 15 * 60 * 10080

export async function authenticate(args: AuthenticateArgs, deps?: AuthenticateDeps) {
  const { maxAge = MAX_AGE, otp, request } = args
  const { compare = compareOTP, dbClient = db, getSession = getSessionDep } = deps || {}

  const session = await getSession(request)
  if (!session) {
    logger.error(
      {
        context: {
          session,
        },
      },
      "Auth Service: missing or invalid session",
    )
    throw new AuthError("Missing or invalid session", { statusCode: 400 })
  }

  const currentTime = new Date()
  if (new Date(session.expiresAt).getTime() < currentTime.getTime()) {
    logger.error(
      {
        context: {
          currentTime,
          session,
        },
      },
      "Auth Service: OTP has expired",
    )
    throw new AuthError("Login OTP has expired", {
      statusCode: 400,
      userMessage: "Your one-time password (OTP) has expired. Please request a new OTP to log in.",
    })
  }

  const validPassword = await compare({ hash: session.otpHash, otp })
  if (!validPassword) {
    const dbSession = (
      await dbClient
        .update(authSession)
        .set({ authAttempts: session.authAttempts + 1 })
        .where(eq(authSession.id, session.id))
        .returning()
    )[0]

    const maxAttemptsReached = dbSession.authAttempts >= MAX_ATTEMPTS
    const error = maxAttemptsReached
      ? new AuthError("Maximum login attempts reached", {
          context: dbSession,
          statusCode: 400,
          userMessage:
            "You have reached the maximum number of attempts. Please request a new OTP to continue.",
        })
      : new AuthError("Invalid login OTP", {
          context: dbSession,
          statusCode: 400,
          userMessage: "The OTP you entered is invalid. Please check your input and try again.",
        })

    throw error
  }

  const dbSession = (
    await dbClient
      .update(authSession)
      .set({ authenticated: true, expiresAt: new Date(Date.now() + maxAge * 1000).toISOString() })
      .returning()
  )[0]

  return dbSession
}
