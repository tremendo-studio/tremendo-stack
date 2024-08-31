import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createId } from "@paralleldrive/cuid2"

const user = sqliteTable("user", {
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull(),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
})

export default user
