import { json } from "@remix-run/node"

export function badRequest(message: string) {
  return json(
    {
      message,
      ok: false,
    },
    { status: 400 },
  )
}

export type BadRequest = typeof badRequest
