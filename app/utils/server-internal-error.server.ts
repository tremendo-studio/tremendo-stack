import { json } from "@remix-run/node"

export function serverInternalError() {
  return json(
    {
      message:
        "An error occurred while processing your request. Please try again later or contact support if the issue persists.",
      ok: false,
    },
    { status: 500 },
  )
}

export type ServerInternalError = typeof serverInternalError
