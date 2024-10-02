import { json } from "@remix-run/node"
import { ZodError } from "zod"

const DEFAULT_USER_MESSAGE =
  "An error occurred while processing your request. Please try again later or contact support if the issue persists."
const DEFAULT_STATUS_CODE = 500

export type AppErrorExtraArgs = { statusCode?: number; userMessage?: string }

export class AppError extends Error {
  statusCode
  userMessage

  constructor(message?: string, extraArgs?: AppErrorExtraArgs) {
    super(message)
    this.userMessage = extraArgs?.userMessage || DEFAULT_USER_MESSAGE
    this.statusCode = extraArgs?.statusCode || DEFAULT_STATUS_CODE
    this.name = "AppError"
    Error.captureStackTrace(this, this.constructor)
  }

  toResponse() {
    return json({ message: this.userMessage, ok: false }, { status: this.statusCode })
  }
}

export function mapToError(error: unknown) {
  return error instanceof AppError ? error : new AppError((error as { message: string })?.message)
}

export function mapToResponse(error: unknown) {
  let response: Response
  switch (true) {
    case error instanceof AppError:
      response = error.toResponse()
      break
    case error instanceof ZodError:
      response = json(
        {
          fieldErrors: error.flatten().fieldErrors,
          message: "Invalid form data. Please check your input and try again.",
          ok: false,
        },
        {
          status: 400,
        },
      )
      break
    default:
      response = json(
        {
          message: DEFAULT_USER_MESSAGE,
          ok: false,
        },
        { status: DEFAULT_STATUS_CODE },
      )
  }
  return response
}
