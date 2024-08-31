import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createId } from "@paralleldrive/cuid2"
import { createInsertSchema } from "drizzle-zod"
import { sql } from "drizzle-orm"

const user = sqliteTable("user", {
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
})

export default user

export const insertUserSchema = createInsertSchema(user)
