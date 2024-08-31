import { Config } from "drizzle-kit"
import env from "~/env"

export default {
  schema: "./app/db/schema/index.ts",
  out: "./app/db/migrations",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: env.DB_URL,
    authToken: env.DB_TOKEN,
  },
} satisfies Config
