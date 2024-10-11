import { DB } from "~/db"
import {
  InsertOneTimePasswordSchema,
  oneTimePasswordSchema,
  SelectOneTimePasswordSchema,
} from "~/db/schema"
import { log } from "~/logger.server"
import { AsyncResult } from "~/utils/result"
import { serverInternalError } from "~/utils/server-internal-error.server"

type InsertOneTimePasswordArgs = InsertOneTimePasswordSchema

type InsertOneTimePasswordDeps = {
  db: DB
}

export async function InsertOneTimePassword(
  args: InsertOneTimePasswordArgs,
  deps?: InsertOneTimePasswordDeps,
): AsyncResult<SelectOneTimePasswordSchema, Response> {
  const { db = DB } = deps || {}

  try {
    const oneTimePassword = (
      await db
        .insert(oneTimePasswordSchema)
        .values({ ...args })
        .returning()
    )[0]

    log.info(`OTP inserted: Email - ${oneTimePassword.email}`)
    return { ok: true, value: oneTimePassword }
  } catch (error) {
    log.error(`Failed to insert OTP: ${error instanceof Error ? error.message : "Unknown error"}`)
    return { error: serverInternalError(), ok: false }
  }
}

export type InsertOneTimePassword = typeof InsertOneTimePassword
