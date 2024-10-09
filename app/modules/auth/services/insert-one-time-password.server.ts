import { DB } from "~/db"
import { InsertOneTimePasswordSchema, oneTimePasswordSchema } from "~/db/schema"
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

  const oneTimePassword = (
    await db
      .insert(oneTimePasswordSchema)
      .values({ ...args })
      .returning()
  )[0]

  log.info(`OTP inserted: Email - ${oneTimePassword.email}`)
  return oneTimePassword
}

export type InsertOneTimePassword = typeof InsertOneTimePassword
