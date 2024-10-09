import { createId } from "@paralleldrive/cuid2"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const userSchema = sqliteTable("user", {
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  lastName: text("last_name").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .$default(() => new Date().toISOString()),
})

export const insertUserSchema = createInsertSchema(userSchema)

export type InsertUserSchema = z.infer<typeof insertUserSchema>
