import type { Config } from "drizzle-kit"

export default {
  dbCredentials: {
    authToken: process.env.DB_PASSWORD,
    url: process.env.DB_URL!,
  },
  dialect: "sqlite",
  driver: "turso",
  out: "./app/db/migrations",
  schema: "./app/db/schema/index.ts",
} satisfies Config
