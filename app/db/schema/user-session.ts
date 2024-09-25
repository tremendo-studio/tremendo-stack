import { createId } from "@paralleldrive/cuid2"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema } from "drizzle-zod"

import user from "./user"

const userSession = sqliteTable("user_sessions", {
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  deleted: integer("used", { mode: "boolean" }).notNull().default(false),
  expiresAt: text("expires_at").notNull(),
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  userId: text("user_id").references(() => user.id),
})

export default userSession
export const insertUserSessionSchema = createInsertSchema(userSession)
