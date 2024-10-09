import { DB } from "~/db"
import { InsertOneTimePasswordSchema, oneTimePassword } from "~/db/schema"
import { log } from "~/logger.server"

type InsertOneTimePasswordArgs = InsertOneTimePasswordSchema

type InsertOneTimePasswordDeps = {
  db: DB
}

export async function InsertOneTimePassword(
  args: InsertOneTimePasswordArgs,
  deps?: InsertOneTimePasswordDeps,
) {
  const { db = DB } = deps || {}

  const session = (
    await db
      .insert(oneTimePassword)
      .values({ ...args })
      .returning()
  )[0]

  log.info(`OTP inserted: Email - ${session.userEmail}`)
  return session
}

export type InsertOneTimePassword = typeof InsertOneTimePassword
