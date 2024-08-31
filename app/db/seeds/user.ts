import { Db } from "~/db"
import users from "./data/users.json"
import * as schema from "~/db/schema"

export default async function seed(db: Db) {
  await Promise.all(
    users.map(async (user) => {
      await db
        .insert(schema.user)
        .values({
          ...user,
        })
        .returning()
    }),
  )
}
