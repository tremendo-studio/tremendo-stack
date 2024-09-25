import { createCookieSessionStorage } from "@remix-run/node"

type SessionData = {
  sessionId: string
}

const cookieSessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    httpOnly: true,
    name: "auth_session",
    path: "/",
    sameSite: "lax",
    secrets: ["secret"],
    secure: true,
  },
})

export default cookieSessionStorage
