import { defineConfig } from "vite"

export default defineConfig({
  dbCredentials: {
    url: process.env.DB_URL,
  },
  dialect: "postgresql",
  schema: "./app/db/schema/index.ts",
  strict: true,
  verbose: true,
})
