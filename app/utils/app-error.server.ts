import { json } from "@remix-run/node"

const DEFAULT_USER_MESSAGE =
  "An error occurred while processing your request. Please try again later or contact support if the issue persists."
const DEFAULT_STATUS_CODE = 500

export type AppErrorExtraArgs = { context?: object; statusCode?: number; userMessage?: string }

export class AppError extends Error {
  context
  statusCode
  userMessage

  constructor(message?: string, extraArgs?: AppErrorExtraArgs) {
    super(message)
    this.userMessage = extraArgs?.userMessage || DEFAULT_USER_MESSAGE
    this.statusCode = extraArgs?.statusCode || DEFAULT_STATUS_CODE
    this.name = "AppError"
    this.context = extraArgs?.context || {}
    Error.captureStackTrace(this, this.constructor)
  }

  toResponse() {
    return json({ message: this.userMessage, ok: false }, { status: this.statusCode })
  }
}

export function mapToResponse(error: unknown) {
  return error instanceof AppError
    ? error.toResponse()
    : json(
        {
          message: DEFAULT_USER_MESSAGE,
          ok: false,
        },
        { status: DEFAULT_STATUS_CODE },
      )
}
