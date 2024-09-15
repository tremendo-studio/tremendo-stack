import { createId } from "@paralleldrive/cuid2"
import { sql } from "drizzle-orm"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema } from "drizzle-zod"

const authSessions = sqliteTable("auth_sessions", {
  createdAt: text("created_at").$default(() => new Date().toISOString()),
  expiresAt: text("expires_at").$default(() => new Date(Date.now() + 10 * 60 * 1000).toISOString()),
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  userEmail: text("user_email").notNull().unique(),
})

export default authSessions

export const insertAuthSessionSchema = createInsertSchema(authSessions)
