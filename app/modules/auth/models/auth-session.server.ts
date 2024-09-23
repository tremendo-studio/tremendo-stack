import { createCookieSessionStorage, redirect, SessionStorage } from "@remix-run/node"
import { eq } from "drizzle-orm"

import { db } from "~/db"
import { authSession } from "~/db/schema"

const AUTH_SESSION_KEY = "sessionId"
const DURATION_IN_MINUTES = 15 * 60

type SessionData = {
  sessionId: string
}

type ConstructorArgs = {
  cookieSessionStorage?: SessionStorage
  request: Request
}

type SaveSessionArgs = {
  email: string
  otpHash: string
  redirectTo: string
}

const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    httpOnly: true,
    name: "auth_session",
    path: "/",
    sameSite: "lax",
    secrets: ["secret"],
    secure: true,
  },
})

export default class AuthSession {
  cookieSessionStorage: SessionStorage
  duration: number
  request: Request

  constructor({ cookieSessionStorage = sessionStorage, request }: ConstructorArgs) {
    this.cookieSessionStorage = cookieSessionStorage
    this.duration = DURATION_IN_MINUTES
    this.request = request
  }

  async deleteSession(redirectTo: string) {
    const cookieSession = await this.getCookieSession()
    const sessionId = cookieSession.get(AUTH_SESSION_KEY)

    const dbSession = await db
      .update(authSession)
      .set({ used: true })
      .where(eq(authSession.id, sessionId))
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

  async getCookieSession() {
    return await this.cookieSessionStorage.getSession(this.request.headers.get("Cookie"))
  }

  async getSession() {
    const cookieSession = await this.getCookieSession()
    const sessionId = cookieSession.get(AUTH_SESSION_KEY)
    if (!sessionId) return

    return (await db.select().from(authSession).where(eq(authSession.id, sessionId)))[0]
  }

  async increaseAttempts() {
    const session = await this.getSession()
    if (!session) throw Error("Invalid session")

    const updatedSession = await db
      .update(authSession)
      .set({ attempts: session.attempts + 1 })
      .returning()
    return updatedSession[0]
  }

  async saveSession({ email, otpHash, redirectTo }: SaveSessionArgs) {
    const dbSession = await db
      .insert(authSession)
      .values({
        expiresAt: new Date(Date.now() + this.duration * 1000).toISOString(),
        otpHash: otpHash,
        userEmail: email,
      })
      .returning()

    const cookieSession = await this.getCookieSession()
    cookieSession.set(AUTH_SESSION_KEY, dbSession[0].id)

    return {
      redirect: redirect(redirectTo, {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(cookieSession, {
            maxAge: this.duration,
          }),
        },
      }),
      session: dbSession[0],
    }
  }
}
