const DEFAULT_USER_MESSAGE =
  "An error occurred while processing your request. Please try again later or contact support if the issue persists."
const DEFAULT_STATUS_CODE = 500
const DEFAULT_NAME = "UNKNOWN_ERROR"
const DEFAULT_MESSAGE = "Unknown error"

type ErrorName =
  | "LOG_IN_INVALID_OTP"
  | "LOG_IN_MAX_ATTEMPTS"
  | "LOG_IN_OTP_EXPIRED"
  | "SESSION_EXPIRED"
  | "UNKNOWN_ERROR"

type ErrorConstructorArgs = {
  message?: string
  name?: ErrorName
  statusCode?: number
  userMessage?: string
}

export class AppError extends Error {
  name
  statusCode
  userMessage

  constructor({
    message = DEFAULT_MESSAGE,
    name = DEFAULT_NAME,
    statusCode = DEFAULT_STATUS_CODE,
    userMessage = DEFAULT_USER_MESSAGE,
  }: ErrorConstructorArgs) {
    super(message)
    this.userMessage = userMessage
    this.statusCode = statusCode
    this.name = name
    Error.captureStackTrace(this, this.constructor)
  }
}
