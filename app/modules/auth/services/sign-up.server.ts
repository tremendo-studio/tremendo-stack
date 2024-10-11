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

export async function SignUp(args: HandleSignUpArgs, deps?: HandleSignUpDeps) {
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

  const user = await db.select().from(userSchema).where(eq(userSchema.email, userData.email))
  if (!user.length) await db.insert(userSchema).values(userData)

  const oneTimePassword = await insertOneTimePassword({
    email: userData.email,
    expiresAt: new Date(Date.now() + OTP_MAX_AGE * 1000).toISOString(),
    hash: pinHash,
  })

  if (!oneTimePassword.ok) return oneTimePassword.error

  console.debug("Email sent: ", pin)

  const session = await cookieStorage.getSession(request.headers.get("Cookie"))
  session.set("otpId", oneTimePassword.value.id)

  return redirect("/auth", {
    headers: {
      "Set-Cookie": await cookieStorage.commitSession(session),
    },
  })
}
