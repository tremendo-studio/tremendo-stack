import { createId } from "@paralleldrive/cuid2"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema } from "drizzle-zod"

const authSession = sqliteTable("auth_sessions", {
  attempts: integer("attempts")
    .notNull()
    .$default(() => 0),
  createdAt: text("created_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  expiresAt: text("expires_at").notNull(),
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  otpHash: text("otp_hash").notNull(),
  used: integer("id", { mode: "boolean" }).notNull().default(false),
  userEmail: text("user_email").notNull(),
})

export default authSession

export const insertAuthSessionSchema = createInsertSchema(authSession)
