import { createId } from "@paralleldrive/cuid2"
import { char, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"

const user = pgTable("users", {
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  id: char("id", { length: 24 })
    .$default(() => createId())
    .primaryKey(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
})

export default user

export const insertUserSchema = createInsertSchema(user)
