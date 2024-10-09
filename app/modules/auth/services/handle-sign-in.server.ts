import { createId } from "@paralleldrive/cuid2"
import { redirect } from "@remix-run/node"
import { eq } from "drizzle-orm"

import { DB } from "~/db"
import { userSchema } from "~/db/schema"
import { log } from "~/logger.server"
import { serverInternalError } from "~/utils/server-internal-error.server"

import { OTP_MAX_AGE } from "../config"
import { CookieStorage } from "./cookie-session-storage.server"
import { CreatePin } from "./create-pin.server"
import { HashPin } from "./hash-pin.server"
import { InsertOneTimePassword } from "./insert-one-time-password.server"

type HandleSignInArgs = {
  request: Request
  userEmail: string
}

type HandleSignInDeps = {
  cookieStorage: CookieStorage
  createPin: CreatePin
  db: DB
  hashPin: HashPin
  insertOneTimePassword: InsertOneTimePassword
}

export async function HandleSignIn(args: HandleSignInArgs, deps?: HandleSignInDeps) {
  const { request, userEmail } = args
  const {
    cookieStorage = CookieStorage,
    createPin = CreatePin,
    db = DB,
    hashPin = HashPin,
    insertOneTimePassword = InsertOneTimePassword,
  } = deps || {}

  const pin = createPin()
  const pinHash = await hashPin({ otp: pin })

  const otpId = createId()

  try {
    await insertOneTimePassword({
      expiresAt: new Date(Date.now() + OTP_MAX_AGE * 1000).toISOString(),
      hash: pinHash,
      id: otpId,
      userEmail: userEmail,
    })
  } catch (error) {
    log.error(`Failed to insert OTP: ${error instanceof Error ? error.message : "Unknown error"}`)
    return serverInternalError()
  }

  try {
    const user = await db.select().from(userSchema).where(eq(userSchema.email, userEmail))
    if (user) {
      console.debug("Email sent: ", pin)
    }
  } catch (error) {
    log.error(`Failed to insert OTP: ${error instanceof Error ? error.message : "Unknown error"}`)
    return serverInternalError()
  }

  const session = await cookieStorage.getSession(request.headers.get("Cookie"))
  session.set("otpId", otpId)

  return redirect("/auth", {
    headers: {
      "Set-Cookie": await cookieStorage.commitSession(session),
    },
  })
}
