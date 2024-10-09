import { eq } from "drizzle-orm"

import { DB } from "~/db"
import { oneTimePassword, SelectOneTimePasswordSchema } from "~/db/schema"
import { log } from "~/logger.server"

export type UpdateSessionArgs = SelectOneTimePasswordSchema

type DeleteSessionDeps = {
  db: DB
}

export async function UpdateOneTimePassword(args: UpdateSessionArgs, deps?: DeleteSessionDeps) {
  const { expiresAt, id, used, validateAttempts } = args
  const { db = DB } = deps || {}

  const otp = (
    await db
      .update(oneTimePassword)
      .set({ expiresAt, used, validateAttempts })
      .where(eq(oneTimePassword.id, id))
      .returning()
  )[0]

  log.info({ otp: otp }, "One Time Password updated:")
  return otp
}

export type UpdateOneTimePassword = typeof UpdateOneTimePassword
