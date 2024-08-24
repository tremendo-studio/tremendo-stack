import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core"

const user = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email").notNull(),
  },
  (table) => ({
    idEmailUnique: unique("id_email").on(table.id, table.email),
  }),
)

export default user
