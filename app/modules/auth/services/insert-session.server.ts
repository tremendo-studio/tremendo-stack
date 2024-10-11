import { DB } from "~/db"
import { InsertSessionSchema, SelectSessionSchema, sessionSchema } from "~/db/schema"
import { log } from "~/logger.server"
import { AsyncResult } from "~/utils/result"
import { serverInternalError } from "~/utils/server-internal-error.server"

type InsertSessionArgs = InsertSessionSchema

type InsertSessionDeps = {
  db: DB
}

export async function InsertSession(
  args: InsertSessionArgs,
  deps?: InsertSessionDeps,
): AsyncResult<SelectSessionSchema, Response> {
  const { db = DB } = deps || {}

  try {
    const session = (
      await db
        .insert(sessionSchema)
        .values({ ...args })
        .returning()
    )[0]

    log.info(`Session inserted: Email - ${session.email}`)
    return { ok: true, value: session }
  } catch (error) {
    log.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Failed to insert user session:",
    )
    return { error: serverInternalError(), ok: false }
  }
}

export type InsertSession = typeof InsertSession
