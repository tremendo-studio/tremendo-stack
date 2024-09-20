import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dbCredentials: {
    url: process.env.DB_URL as string,
  },
  dialect: "postgresql",
  out: "./app/db/migrations",
  schema: "./app/db/schema/index.ts",
  strict: true,
  verbose: true,
})
