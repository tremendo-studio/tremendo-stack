import { client, db } from "~/db"

import * as schema from "./schema"
import * as seeds from "./seeds"

for (const table of [schema.user]) {
  db.delete(table)
}

await seeds.user(db)

client.close()
