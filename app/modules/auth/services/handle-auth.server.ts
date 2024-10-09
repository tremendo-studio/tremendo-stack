import { redirect } from "@remix-run/node"

import { SelectOneTimePasswordSchema } from "~/db/schema"
import { log } from "~/logger.server"
import { badRequest } from "~/utils/bad-request.server"
import { serverInternalError } from "~/utils/server-internal-error.server"

import { CookieStorage, InsertSession, UpdateOneTimePassword } from "."
import { OTP_KEY, OTP_MAX_ATTEMPTS, USER_SESSION_KEY, USER_SESSION_MAX_AGE } from "../config"
import { CheckPin } from "./check-pin.server"

type HandleAuthArgs = {
  maxAttempts?: number
  oneTimePassword: SelectOneTimePasswordSchema
  pin: string
  request: Request
}

type HandleAuthDeps = {
  checkPin: CheckPin
  cookieStorage: CookieStorage
  insertSession: InsertSession
  updateOneTimePassword: UpdateOneTimePassword
  updateOtp: UpdateOneTimePassword
}

export async function HandleAuth(args: HandleAuthArgs, deps?: HandleAuthDeps) {
  const { maxAttempts = OTP_MAX_ATTEMPTS, oneTimePassword, pin, request } = args
  const {
    checkPin = CheckPin,
    cookieStorage = CookieStorage,
    insertSession = InsertSession,
    updateOneTimePassword = UpdateOneTimePassword,
  } = deps || {}

  if (new Date(oneTimePassword.expiresAt).getTime() < Date.now()) {
    log.info({ oneTimePassword }, "one-time password expired:")
    return badRequest(
      "Your one-time password has expired. Please request a new password to log in.",
    )
  }

  const maxAttemptsReached = oneTimePassword.validateAttempts >= maxAttempts
  if (maxAttemptsReached) {
    log.info({ oneTimePassword }, "Maximum login attempts reached:")
    return badRequest(
      "You have reached the maximum number of attempts. Please request a new one-time password to continue.",
    )
  }

  const isValid = await checkPin({ hash: oneTimePassword.hash, pin })
  if (!isValid) {
    try {
      await updateOneTimePassword({
        ...oneTimePassword,
        validateAttempts: oneTimePassword.validateAttempts + 1,
      })

      log.info({ oneTimePassword }, "Invalid login one-time password")
      return badRequest(
        "The one-time password you entered is invalid. Please check your input and try again.",
      )
    } catch (error) {
      log.error(
        { error: error instanceof Error ? error.message : "Unknown error" },
        "Failed to update one-time password:",
      )
      return serverInternalError()
    }
  }

  try {
    await updateOneTimePassword({ ...oneTimePassword, used: true })
  } catch (error) {
    log.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Failed to update one-time password:",
    )
    return serverInternalError()
  }

  try {
    const session = await insertSession({
      email: oneTimePassword.email,
      expiresAt: new Date(USER_SESSION_MAX_AGE * 1000).toISOString(),
    })

    const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
    cookieSession.unset(OTP_KEY)
    cookieSession.set(USER_SESSION_KEY, session.id)

    return redirect("/dashboard", {
      headers: { "Set-Cookie": await cookieStorage.commitSession(cookieSession) },
    })
  } catch (error) {
    log.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Failed to insert user session:",
    )
    return serverInternalError()
  }
}

export type HandleAuth = typeof HandleAuth
