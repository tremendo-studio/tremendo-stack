import { json } from "@remix-run/node"

const DEFAULT_USER_MESSAGE =
  "An error occurred while processing your request. Please try again later or contact support if the issue persists."
const DEFAULT_STATUS_CODE = 500

type AppErrorExtraArgs = { statusCode?: number; userMessage?: string }

export class AppError extends Error {
  name
  statusCode
  userMessage

  constructor(message?: string, extraArgs?: AppErrorExtraArgs) {
    super(message)
    this.userMessage = extraArgs?.userMessage || DEFAULT_USER_MESSAGE
    this.statusCode = extraArgs?.statusCode || DEFAULT_STATUS_CODE
    this.name = "AppError"
    Error.captureStackTrace(this, this.constructor)
  }
}

export function castToError(error: unknown) {
  return error instanceof AppError ? error : new AppError((error as { message: string })?.message)
}

export function castToResponse(error: unknown) {
  return error instanceof AppError
    ? json({ message: error.userMessage, ok: false }, { status: error.statusCode })
    : json(
        {
          message: DEFAULT_USER_MESSAGE,
          ok: false,
        },
        { status: DEFAULT_STATUS_CODE },
      )
}
