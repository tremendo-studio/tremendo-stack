import { AppError, AppErrorExtraArgs } from "~/utils/app-error.server"

export class AuthError extends AppError {
  constructor(message?: string, extraArgs?: AppErrorExtraArgs) {
    super(message, extraArgs)
    this.name = "AuthError"
  }
}
