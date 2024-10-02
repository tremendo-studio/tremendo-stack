import { eq } from "drizzle-orm"

import { db, Db } from "~/db"
import { authSession } from "~/db/schema"
import { AppError, AppErrorExtraArgs, mapToError } from "~/utils/app-error.server"

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
  compare: typeof compareOTP
  dbClient: Db
  getSession: typeof getSessionDep
}

export async function auth({ maxAge = MAX_AGE, otp, request }: LogInArgs, deps?: LogInDeps) {
  const { compare = compareOTP, dbClient = db, getSession = getSessionDep } = deps || {}

  const session = await getSession(request)
  if (!session) throw new AppError("Missing or invalid session", { statusCode: 400 })

  if (new Date(session.expiresAt).getTime() < Date.now())
    throw new AuthError("Login OTP has expired", {
      statusCode: 400,
      userMessage: "Your one-time password (OTP) has expired. Please request a new OTP to log in.",
    })

  try {
    const validPassword = await compare({ hash: session.otpHash, otp })
    if (!validPassword) {
      const dbSession = (
        await dbClient
          .update(authSession)
          .set({ loginAttempts: session.loginAttempts + 1 })
          .where(eq(authSession.id, session.id))
          .returning()
      )[0]

      const maxAttemptsReached = dbSession.loginAttempts >= MAX_ATTEMPTS

      throw new AuthError(
        maxAttemptsReached ? "Maximum login attempts reached" : "Invalid login OTP",
        {
          statusCode: 400,
          userMessage: maxAttemptsReached
            ? "You have reached the maximum number of attempts. Please request a new OTP to continue."
            : "The OTP you entered is invalid. Please check your input and try again.",
        },
      )
    }

    const dbSession = (
      await dbClient
        .update(authSession)
        .set({ expiresAt: new Date(Date.now() + maxAge * 1000).toISOString(), loggedIn: true })
        .returning()
    )[0]

    return dbSession
  } catch (error) {
    throw mapToError(error)
  }
}

export class AuthError extends AppError {
  constructor(message?: string, extraArgs?: AppErrorExtraArgs) {
    super(message, extraArgs)
    this.name = "AuthError"
  }
}
