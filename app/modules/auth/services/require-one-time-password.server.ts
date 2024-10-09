import { redirect } from "@remix-run/node"

import { CookieStorage, SelectOneTimePassword } from "."
import { OTP_KEY } from "../config"

type RequireOneTimePasswordArgs = Request
type RequireOneTimePasswordDeps = {
  cookieStorage: CookieStorage
  selectOneTimePassword: SelectOneTimePassword
}

export async function RequireOneTimePassword(
  request: RequireOneTimePasswordArgs,
  deps?: RequireOneTimePasswordDeps,
) {
  const { cookieStorage = CookieStorage, selectOneTimePassword = SelectOneTimePassword } =
    deps || {}

  const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
  const oneTimePasswordId = cookieSession.get(OTP_KEY)
  if (!oneTimePasswordId) {
    throw redirect("/")
  }

  const oneTimePassword = await selectOneTimePassword({ oneTimePasswordId })

  if (!oneTimePassword) {
    cookieSession.unset(OTP_KEY)
    throw redirect("/", {
      headers: { "Set-Cookie": await cookieStorage.commitSession(cookieSession) },
    })
  }

  return oneTimePassword
}

export type RequireOneTimePassword = typeof RequireOneTimePassword
