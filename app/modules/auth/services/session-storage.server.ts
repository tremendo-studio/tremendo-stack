import { eq } from "drizzle-orm"

import { db, Db } from "~/db"
import { authSession } from "~/db/schema"

import cookieSessionStorage from "./cookie-session-storage.server"

const AUTH_SESSION_KEY = "sessionId"
const AUTH_SESSION_MAX_AGE = 15 * 60

type CreateSessionArgs = {
  email: string
  maxAge?: number
  otpHash: string
  request: Request
}

type CreateSessionDeps = {
  cookieStorage: typeof cookieSessionStorage
  dbClient: Db
}

export async function createSession(
  { email, maxAge = AUTH_SESSION_MAX_AGE, otpHash, request }: CreateSessionArgs,
  deps?: CreateSessionDeps,
) {
  const { cookieStorage = cookieSessionStorage, dbClient = db } = deps || {}

  const dbSession = await dbClient
    .insert(authSession)
    .values({
      expiresAt: new Date(Date.now() + maxAge * 1000).toISOString(),
      otpHash: otpHash,
      userEmail: email,
    })
    .returning()

  const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
  cookieSession.set(AUTH_SESSION_KEY, dbSession[0].id)

  return {
    cookie: await cookieStorage.commitSession(cookieSession),
    session: dbSession,
  }
}

type DeleteSessionArgs = {
  request: Request
}

type DeleteSessionDeps = {
  cookieStorage: typeof cookieSessionStorage
  dbClient: Db
}

export async function deleteSession({ request }: DeleteSessionArgs, deps?: DeleteSessionDeps) {
  const { cookieStorage = cookieSessionStorage, dbClient = db } = deps || {}

  const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
  const sessionId = cookieSession.get(AUTH_SESSION_KEY)
  if (!sessionId) throw Error()

  const dbSession = await dbClient
    .update(authSession)
    .set({ deleted: true })
    .where(eq(authSession.id, sessionId))
    .returning()

  return {
    cookie: await cookieStorage.destroySession(cookieSession),
    session: dbSession,
  }
}

type GetSessionArgs = Request

type GetSessionDeps = {
  cookieStorage: typeof cookieSessionStorage
  dbClient: Db
}

export async function getSession(request: GetSessionArgs, deps?: GetSessionDeps) {
  const { cookieStorage = cookieSessionStorage, dbClient = db } = deps || {}

  const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
  const sessionId = cookieSession.get("sessionId")
  if (!sessionId) throw Error()

  const dbSession = (
    await dbClient.select().from(authSession).where(eq(authSession.id, sessionId))
  )[0]
  if (!dbSession) throw Error()

  return dbSession
}

type UpdateSessionArgs = {
  expiresAt?: string
  loggedIn?: boolean
  loginAttempts?: number
  request: Request
}

type UpdateSessionDeps = {
  cookieStorage: typeof cookieSessionStorage
  dbClient: Db
}

export async function updateSession(
  { expiresAt, loggedIn, loginAttempts, request }: UpdateSessionArgs,
  deps?: UpdateSessionDeps,
) {
  const { cookieStorage = cookieSessionStorage, dbClient = db } = deps || {}

  const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
  const sessionId = cookieSession.get("sessionId")
  if (!sessionId) throw Error("Invalid session")

  const dbSession = await dbClient
    .update(authSession)
    .set({ expiresAt, loggedIn, loginAttempts })
    .returning()
  return dbSession[0]
}
