import { createCookieSessionStorage, redirect } from "@remix-run/node"

const AUTH_SESSION_KEY = "sessionId"

type SessionData = {
  sessionId: string
}

const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    httpOnly: true,
    maxAge: 60,
    name: "auth_session",
    path: "/",
    sameSite: "lax",
    secrets: ["secret"],
    secure: true,
  },
})

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie")
  return sessionStorage.getSession(cookie)
}

export async function createAuthSession({
  redirectTo,
  remember,
  request,
  sessionId,
}: {
  redirectTo: string
  remember: number
  request: Request
  sessionId: string
}) {
  const session = await getSession(request)
  session.set(AUTH_SESSION_KEY, sessionId)
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember,
      }),
    },
  })
}
