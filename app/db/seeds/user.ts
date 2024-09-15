import { Db } from "~/db"
import * as schema from "~/db/schema"

import users from "./data/users.json"

export default async function seed(db: Db) {
  await Promise.all(
    users.map(async (user) => {
      await db
        .insert(schema.users)
        .values({
          ...user,
        })
        .returning()
    }),
  )
}
