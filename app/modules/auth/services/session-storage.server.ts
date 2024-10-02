import { eq } from "drizzle-orm"

import { Db, db } from "~/db"
import { authSession } from "~/db/schema"
import { AppError, mapToError } from "~/utils/app-error.server"

import cookieSessionStorage from "./cookie-session-storage.server"

const AUTH_SESSION_KEY = "sessionId"
const AUTH_SESSION_MAX_AGE = 15 * 60

type SessionStorageDeps = {
  cookieStorage: typeof cookieSessionStorage
  dbClient: Db
}

type CreateSessionArgs = {
  email: string
  maxAge?: number
  otpHash: string
  request: Request
}

export async function createSession(
  { email, maxAge = AUTH_SESSION_MAX_AGE, otpHash, request }: CreateSessionArgs,
  deps?: SessionStorageDeps,
) {
  const { cookieStorage = cookieSessionStorage, dbClient = db } = deps || {}

  try {
    const dbSession = (
      await dbClient
        .insert(authSession)
        .values({
          expiresAt: new Date(Date.now() + maxAge * 1000).toISOString(),
          otpHash: otpHash,
          userEmail: email,
        })
        .returning()
    )[0]

    const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
    cookieSession.set(AUTH_SESSION_KEY, dbSession.id)

    return {
      cookie: await cookieStorage.commitSession(cookieSession),
      session: dbSession,
    }
  } catch (error) {
    throw mapToError(error)
  }
}

type DeleteSessionArgs = {
  request: Request
}

export async function deleteSession({ request }: DeleteSessionArgs, deps?: SessionStorageDeps) {
  const { cookieStorage = cookieSessionStorage, dbClient = db } = deps || {}

  const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
  const sessionId = cookieSession.get(AUTH_SESSION_KEY)
  if (!sessionId) {
    throw new AppError("Session ID is missing cookie", { statusCode: 400 })
  }

  try {
    const dbSession = await dbClient
      .update(authSession)
      .set({ deleted: true })
      .where(eq(authSession.id, sessionId))
      .returning()

    return {
      cookie: await cookieStorage.destroySession(cookieSession),
      session: dbSession[0],
    }
  } catch (error) {
    throw mapToError(error)
  }
}

export type GetSessionArgs = Request

export async function getSession(request: GetSessionArgs, deps?: SessionStorageDeps) {
  const { cookieStorage = cookieSessionStorage, dbClient = db } = deps || {}

  const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
  const sessionId = cookieSession.get(AUTH_SESSION_KEY)
  if (!sessionId) return

  try {
    const dbSession = await dbClient.select().from(authSession).where(eq(authSession.id, sessionId))
    return dbSession[0]
  } catch (error) {
    throw mapToError(error)
  }
}

export type UpdateSessionArgs = {
  expiresAt?: string
  loggedIn?: boolean
  loginAttempts?: number
  request: Request
}

export async function updateSession(
  { expiresAt, loggedIn, loginAttempts, request }: UpdateSessionArgs,
  deps?: SessionStorageDeps,
) {
  const { cookieStorage = cookieSessionStorage, dbClient = db } = deps || {}

  const cookieSession = await cookieStorage.getSession(request.headers.get("Cookie"))
  const sessionId = cookieSession.get(AUTH_SESSION_KEY)
  if (!sessionId) {
    throw new AppError("Session ID is missing cookie", { statusCode: 400 })
  }

  try {
    const dbSession = await dbClient
      .update(authSession)
      .set({ expiresAt, loggedIn, loginAttempts })
      .returning()
    return dbSession[0]
  } catch (error) {
    throw mapToError(error)
  }
}
