import * as schema from "~/db/schema"

import { Db } from ".."
import users from "./data/users.json"

export default async function seed(db: Db) {
  await Promise.all(
    users.map(async (user) => {
      await db
        .insert(schema.userSchema)
        .values({
          ...user,
        })
        .returning()
    }),
  )
}
