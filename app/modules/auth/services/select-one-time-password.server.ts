import { and, eq } from "drizzle-orm"

import { DB } from "~/db"
import { oneTimePasswordSchema } from "~/db/schema"

type SelectOneTimePasswordArgs = { oneTimePasswordId: string }
type SelectOneTimePasswordDeps = { db: DB }

export async function SelectOneTimePassword(
  args: SelectOneTimePasswordArgs,
  deps?: SelectOneTimePasswordDeps,
) {
  const { oneTimePasswordId } = args
  const { db = DB } = deps || {}

  const results = await db
    .select()
    .from(oneTimePasswordSchema)
    .where(
      and(eq(oneTimePasswordSchema.id, oneTimePasswordId), eq(oneTimePasswordSchema.used, false)),
    )

  return results[0]
}

export type SelectOneTimePassword = typeof SelectOneTimePassword
