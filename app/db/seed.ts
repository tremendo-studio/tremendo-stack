import { sql } from "drizzle-orm"
import { getTableName, Table } from "drizzle-orm/table"

import { client, Db, db } from "~/db"

import * as schema from "./schema"
import * as seeds from "./seeds"

async function resetTable(db: Db, table: Table) {
  return db.execute(sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`))
}

for (const table of [schema.user]) {
  resetTable(db, table)
}

await seeds.user(db)

client.end()
