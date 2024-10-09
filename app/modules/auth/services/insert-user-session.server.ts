import { DB } from "~/db"
import { InsertUserSessionSchema, userSession } from "~/db/schema"
import { log } from "~/logger.server"

type InsertUserSessionArgs = InsertUserSessionSchema

type InsertUserSessionDeps = {
  db: DB
}

export async function InsertUserSession(args: InsertUserSessionArgs, deps?: InsertUserSessionDeps) {
  const { db = DB } = deps || {}

  const session = (
    await db
      .insert(userSession)
      .values({ ...args })
      .returning()
  )[0]

  log.info(`Session inserted: Email - ${session.email}`)
  return session
}

export type InsertUserSession = typeof InsertUserSession
