import { createId } from "@paralleldrive/cuid2"
import { sql } from "drizzle-orm"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema } from "drizzle-zod"

const user = sqliteTable("users", {
  createdAt: text("created_at").$default(() => new Date().toISOString()),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  lastName: text("last_name"),
  updatedAt: text("updated_at").$default(() => new Date().toISOString()),
})

export default user

export const insertUserSchema = createInsertSchema(user)
