import { createId } from "@paralleldrive/cuid2"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const userSession = sqliteTable("user_session", {
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  deleted: integer("used", { mode: "boolean" }).notNull().default(false),
  email: text("email").notNull(),
  expiresAt: text("expires_at").notNull(),
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
})

export const insertUserSessionSchema = createInsertSchema(userSession)
export const selectUserSchema = createSelectSchema(userSession)

export type InsertUserSessionSchema = z.infer<typeof insertUserSessionSchema>
export type SelectUserSessionSchema = z.infer<typeof selectUserSchema>
