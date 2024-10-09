import { and, eq } from "drizzle-orm"

import { DB } from "~/db"
import { oneTimePassword } from "~/db/schema"
import { log } from "~/logger.server"
import { serverInternalError } from "~/utils/server-internal-error.server"

type SelectOneTimePasswordArgs = { oneTimePasswordId: string }
type SelectOneTimePasswordDeps = { db: DB }

export async function SelectOneTimePassword(
  args: SelectOneTimePasswordArgs,
  deps?: SelectOneTimePasswordDeps,
) {
  const { oneTimePasswordId } = args
  const { db = DB } = deps || {}

  try {
    const results = await db
      .select()
      .from(oneTimePassword)
      .where(and(eq(oneTimePassword.id, oneTimePasswordId), eq(oneTimePassword.used, false)))

    return results[0]
  } catch (error) {
    log.error(`Failed to get OTP: ${error instanceof Error ? error.message : "Unknown error"}`)
    throw serverInternalError()
  }
}

export type SelectOneTimePassword = typeof SelectOneTimePassword
