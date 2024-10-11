import { eq } from "drizzle-orm"

import { DB } from "~/db"
import { oneTimePasswordSchema, SelectOneTimePasswordSchema } from "~/db/schema"
import { log } from "~/logger.server"
import { AsyncResult } from "~/utils/result"
import { serverInternalError } from "~/utils/server-internal-error.server"

type UpdateOneTimePasswordArgs = SelectOneTimePasswordSchema

type UpdateOneTimePasswordDeps = {
  db: DB
}

export async function UpdateOneTimePassword(
  args: UpdateOneTimePasswordArgs,
  deps?: UpdateOneTimePasswordDeps,
): AsyncResult<SelectOneTimePasswordSchema, Response> {
  const { expiresAt, id, used, validateAttempts } = args
  const { db = DB } = deps || {}

  try {
    const otp = (
      await db
        .update(oneTimePasswordSchema)
        .set({ expiresAt, used, validateAttempts })
        .where(eq(oneTimePasswordSchema.id, id))
        .returning()
    )[0]

    log.info({ otp: otp }, "One Time Password updated:")
    return { ok: true, value: otp }
  } catch (error) {
    log.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Failed to update one-time password:",
    )
    return { error: serverInternalError(), ok: false }
  }
}

export type UpdateOneTimePassword = typeof UpdateOneTimePassword
