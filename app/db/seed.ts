import * as seeds from "./seeds"
import env from "~/env"
import { client, db } from "~/db"
import * as schema from "./schema"

if (!env.DB_SEEDING) {
  throw new Error('You must set DB_SEEDING to "true" when running seeds')
}

for (const table of [schema.user]) {
  db.delete(table)
}

await seeds.user(db)

client.close()
