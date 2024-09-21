import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import env from "~/env"

// For inspiration: https://github.com/w3cj/bytedash

export const client = createClient({
  authToken: env.DB_TOKEN,
  url: env.DB_URL,
})

export const db = drizzle(client)
export type Db = typeof db
