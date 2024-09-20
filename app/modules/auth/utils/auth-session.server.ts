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

type CreateAuthSessionArgs = {
  redirectTo: string
  remember: number
  request: Request
  sessionId: string
}

export async function createAuthSession({
  redirectTo,
  remember,
  request,
  sessionId,
}: CreateAuthSessionArgs) {
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

type DeleteAuthSessionArgs = {
  redirectTo: string
  request: Request
}

export async function deleteAuthSession({ redirectTo, request }: DeleteAuthSessionArgs) {
  const session = await getSession(request)
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  })
}

export async function getAuthSessionId(request: Request) {
  const session = await getSession(request)
  return session.get(AUTH_SESSION_KEY)
}
