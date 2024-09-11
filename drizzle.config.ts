import { Config } from "drizzle-kit"

import env from "~/env"

export default {
  dbCredentials: {
    authToken: env.DB_TOKEN,
    url: env.DB_URL,
  },
  dialect: "sqlite",
  driver: "turso",
  out: "./app/db/migrations",
  schema: "./app/db/schema/index.ts",
} satisfies Config
