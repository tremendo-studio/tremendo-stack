import { redirect } from "@remix-run/node"

import { SelectOneTimePasswordSchema } from "~/db/schema"
import { serverInternalError } from "~/utils/server-internal-error.server"

import { CookieStorage, InsertSession, UpdateOneTimePassword } from "."
import { OTP_KEY, USER_SESSION_KEY, USER_SESSION_MAX_AGE } from "../config"
import { CheckPin } from "./check-pin.server"

type HandleAuthArgs = {
  oneTimePassword: SelectOneTimePasswordSchema
  request: Request
}

type HandleAuthDeps = {
  checkPin: CheckPin
  cookieStorage: CookieStorage
  insertSession: InsertSession
  updateOneTimePassword: UpdateOneTimePassword
  updateOtp: UpdateOneTimePassword
}

export async function Authenticate(args: HandleAuthArgs, deps?: HandleAuthDeps) {
  const { oneTimePassword, request } = args
  const {
    cookieStorage = CookieStorage,
    insertSession = InsertSession,
    updateOneTimePassword = UpdateOneTimePassword,
  } = deps || {}

  const updateOtpResult = await updateOneTimePassword({ ...oneTimePassword, used: true })
  if (!updateOtpResult.ok) return updateOtpResult.error

  const sessionResult = await insertSession({
    email: oneTimePassword.email,
    expiresAt: new Date(USER_SESSION_MAX_AGE * 1000).toISOString(),
  })

  if (!sessionResult.ok) return sessionResult.error

  const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
  cookieSession.unset(OTP_KEY)
  cookieSession.set(USER_SESSION_KEY, sessionResult.value.id)

  return redirect("/dashboard", {
    headers: { "Set-Cookie": await cookieStorage.commitSession(cookieSession) },
  })
}

export type HandleAuth = typeof Authenticate
