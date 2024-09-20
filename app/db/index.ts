import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"
const { Client } = pg

import env from "~/env"

// For inspiration: https://github.com/w3cj/bytedash

export const client = new Client({
  connectionString: env.DB_URL,
})

await client.connect()

export const db = drizzle(client)
export type Db = typeof db
