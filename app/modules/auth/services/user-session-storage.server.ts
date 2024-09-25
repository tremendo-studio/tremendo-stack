import { createCookieSessionStorage, redirect, SessionStorage } from "@remix-run/node"
import { eq } from "drizzle-orm"

import { db } from "~/db"
import { userSession } from "~/db/schema"

const AUTH_SESSION_KEY = "sessionId"
const AUTH_SESSION_MAX_AGE = 15 * 60

type SessionData = {
  sessionId: string
}

type ConstructorArgs = {
  cookieSessionStorage?: SessionStorage
  request: Request
  sessionKey?: string
  sessionMaxAge?: number
}

type SaveSessionArgs = {
  redirectTo: string
  userId: string
}

const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    httpOnly: true,
    name: "user_session",
    path: "/",
    sameSite: "lax",
    secrets: ["secret"],
    secure: true,
  },
})

export default class UserSessionStorage {
  #cookieSessionStorage: SessionStorage
  #request: Request
  #sessionKey: string
  #sessionMaxAge: number

  constructor({
    cookieSessionStorage = sessionStorage,
    request,
    sessionKey = AUTH_SESSION_KEY,
    sessionMaxAge = AUTH_SESSION_MAX_AGE,
  }: ConstructorArgs) {
    this.#cookieSessionStorage = cookieSessionStorage
    this.#sessionMaxAge = sessionMaxAge
    this.#request = request
    this.#sessionKey = sessionKey
  }

  async #getCookieSession() {
    return await this.#cookieSessionStorage.getSession(this.#request.headers.get("Cookie"))
  }

  async #getSessionId() {
    const cookieSession = await this.#getCookieSession()
    return cookieSession.get(this.#sessionKey) as Promise<SessionData["sessionId"] | undefined>
  }

  async deleteSession(redirectTo: string) {
    const cookieSession = await this.#getCookieSession()
    const sessionId = await this.#getSessionId()
    if (!sessionId) throw Error()

    const dbSession = await db
      .update(userSession)
      .set({ deleted: true })
      .where(eq(userSession.id, sessionId))
      .returning()

    return {
      redirect: redirect(redirectTo, {
        headers: {
          "Set-Cookie": await sessionStorage.destroySession(cookieSession),
        },
      }),
      session: dbSession[0],
    }
  }

  async getSession() {
    const sessionId = await this.#getSessionId()
    if (!sessionId) return

    const session = (await db.select().from(userSession).where(eq(userSession.id, sessionId)))[0]
    if (!session || new Date(session.expiresAt).getTime() < Date.now()) return

    return session
  }

  async saveSession({ redirectTo, userId }: SaveSessionArgs) {
    const dbSession = await db
      .insert(userSession)
      .values({
        expiresAt: new Date(Date.now() + this.#sessionMaxAge * 1000).toISOString(),
        userId,
      })
      .returning()

    const cookieSession = await this.#getCookieSession()
    cookieSession.set(this.#sessionKey, dbSession[0].id)

    return {
      redirect: redirect(redirectTo, {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(cookieSession, {
            maxAge: this.#sessionMaxAge,
          }),
        },
      }),
      session: dbSession[0],
    }
  }
}
