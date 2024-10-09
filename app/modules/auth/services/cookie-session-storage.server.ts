import { createCookieSessionStorage } from "@remix-run/node"

type SessionData = {
  otpId: string
  sessionId: string
}

export const CookieStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    httpOnly: true,
    name: "auth_session",
    path: "/",
    sameSite: "lax",
    secrets: ["secret"],
    secure: true,
  },
})

export type CookieStorage = typeof CookieStorage
