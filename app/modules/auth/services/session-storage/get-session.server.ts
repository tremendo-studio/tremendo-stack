import { eq } from "drizzle-orm"

import { db } from "~/db"
import { authSession } from "~/db/schema"
import { castToError } from "~/utils/error.server"

import cookieSessionStorage from "../cookie-session-storage.server"
import { SessionStorageDeps } from "./types"

type GetSessionArgs = Request

export async function getSession(request: GetSessionArgs, deps?: SessionStorageDeps) {
  const { cookieStorage = cookieSessionStorage, dbClient = db } = deps || {}

  const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
  const sessionId = cookieSession.get("sessionId")
  if (!sessionId) return

  try {
    return (await dbClient.select().from(authSession).where(eq(authSession.id, sessionId)))[0]
  } catch (error) {
    throw castToError(error)
  }
}
