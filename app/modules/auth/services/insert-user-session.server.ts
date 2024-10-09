import { DB } from "~/db"
import { InsertSessionSchema, sessionSchema } from "~/db/schema"
import { log } from "~/logger.server"

type InsertSessionArgs = InsertSessionSchema

type InsertSessionDeps = {
  db: DB
}

export async function InsertSession(args: InsertSessionArgs, deps?: InsertSessionDeps) {
  const { db = DB } = deps || {}

  const session = (
    await db
      .insert(sessionSchema)
      .values({ ...args })
      .returning()
  )[0]

  log.info(`Session inserted: Email - ${session.email}`)
  return session
}

export type InsertSession = typeof InsertSession
