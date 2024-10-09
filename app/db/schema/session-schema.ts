import { createId } from "@paralleldrive/cuid2"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const sessionSchema = sqliteTable("session", {
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

export const insertSessionSchema = createInsertSchema(sessionSchema)
export const selectSessionSchema = createSelectSchema(sessionSchema)

export type InsertSessionSchema = z.infer<typeof insertSessionSchema>
export type SelectSessionSchema = z.infer<typeof selectSessionSchema>
