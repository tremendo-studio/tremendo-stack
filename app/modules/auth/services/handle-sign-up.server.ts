import { createId } from "@paralleldrive/cuid2"
import { redirect } from "@remix-run/node"
import { eq } from "drizzle-orm"

import { DB } from "~/db"
import { InsertUserSchema, userSchema } from "~/db/schema"
import { log } from "~/logger.server"
import { serverInternalError } from "~/utils/server-internal-error.server"

import { CookieStorage, CreatePin, HashPin, InsertOneTimePassword } from "."
import { OTP_MAX_AGE } from "../config"

type HandleSignUpArgs = {
  request: Request
  userData: InsertUserSchema
}

type HandleSignUpDeps = {
  cookieStorage: CookieStorage
  createPin: CreatePin
  db: DB
  hashPin: HashPin
  insertOneTimePassword: InsertOneTimePassword
}

export async function HandleSignUp(args: HandleSignUpArgs, deps?: HandleSignUpDeps) {
  const { request, userData } = args
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

  const user = await db.select().from(userSchema).where(eq(userSchema.email, userData.email))
  if (!user.length) await db.insert(userSchema).values(userData)

  try {
    await insertOneTimePassword({
      email: userData.email,
      expiresAt: new Date(Date.now() + OTP_MAX_AGE * 1000).toISOString(),
      hash: pinHash,
      id: otpId,
    })
  } catch (error) {
    log.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Failed to insert one-time password:",
    )
    return serverInternalError()
  }

  console.debug("Email sent: ", pin)

  const session = await cookieStorage.getSession(request.headers.get("Cookie"))
  session.set("otpId", otpId)

  return redirect("/auth", {
    headers: {
      "Set-Cookie": await cookieStorage.commitSession(session),
    },
  })
}
