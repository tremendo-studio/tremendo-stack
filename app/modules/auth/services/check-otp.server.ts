import { SelectOneTimePasswordSchema } from "~/db/schema"
import { log } from "~/logger.server"
import { badRequest } from "~/utils/bad-request.server"
import { AsyncResult } from "~/utils/result"
import { serverInternalError } from "~/utils/server-internal-error.server"

import { OTP_MAX_ATTEMPTS } from "../config"
import { CheckPin } from "./check-pin.server"
import { UpdateOneTimePassword } from "./update-one-time-password.server"

type CheckOtpArgs = {
  maxAttempts?: number
  oneTimePassword: SelectOneTimePasswordSchema
  pin: string
}

type CheckOtpDeps = {
  checkPin: CheckPin
  updateOneTimePassword: UpdateOneTimePassword
}

export async function CheckOtp(
  args: CheckOtpArgs,
  deps?: CheckOtpDeps,
): AsyncResult<true, Response> {
  const { maxAttempts = OTP_MAX_ATTEMPTS, oneTimePassword, pin } = args
  const { checkPin = CheckPin, updateOneTimePassword = UpdateOneTimePassword } = deps || {}

  const otpExpired = new Date(oneTimePassword.expiresAt).getTime() < Date.now()
  if (otpExpired) {
    log.error({ oneTimePassword }, "One-time password expired:")
    return {
      error: badRequest(
        "Your one-time password has expired. Please request a new password to log in.",
      ),
      ok: false,
    }
  }

  const maxAttemptsReached = maxAttempts >= maxAttempts
  if (maxAttemptsReached) {
    log.error({ oneTimePassword }, "Maximum login attempts reached:")
    return {
      error: badRequest(
        "You have reached the maximum number of attempts. Please request a new one-time password to continue.",
      ),
      ok: false,
    }
  }

  const isValid = await checkPin({ hash: oneTimePassword.hash, pin })
  if (!isValid) {
    log.error({ oneTimePassword }, "Invalid login one-time password")

    const updateOtpResult = await updateOneTimePassword({
      ...oneTimePassword,
      validateAttempts: oneTimePassword.validateAttempts + 1,
    })

    if (!updateOtpResult.ok) return { error: serverInternalError(), ok: false }

    return {
      error: badRequest(
        "The one-time password you entered is invalid. Please check your input and try again.",
      ),
      ok: false,
    }
  }

  return {
    ok: true,
    value: true,
  }
}
