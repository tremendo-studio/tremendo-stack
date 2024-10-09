import { createId } from "@paralleldrive/cuid2"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const oneTimePasswordSchema = sqliteTable("one_time_password", {
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  email: text("email").notNull(),
  expiresAt: text("expires_at").notNull(),
  hash: text("hash").notNull(),
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  validateAttempts: integer("validate_attempts")
    .notNull()
    .$default(() => 0),
})

export const insertOneTimePasswordSchema = createInsertSchema(oneTimePasswordSchema)
export const selectOneTimePasswordSchema = createSelectSchema(oneTimePasswordSchema)

export type InsertOneTimePasswordSchema = z.infer<typeof insertOneTimePasswordSchema>
export type SelectOneTimePasswordSchema = z.infer<typeof selectOneTimePasswordSchema>
