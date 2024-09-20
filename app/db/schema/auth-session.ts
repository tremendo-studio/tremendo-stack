import { createId } from "@paralleldrive/cuid2"
import { boolean, char, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"

const authSession = pgTable("auth_sessions", {
  attempts: integer("attempts")
    .notNull()
    .$default(() => 0),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
  id: char("id", { length: 24 })
    .$default(() => createId())
    .primaryKey(),
  otpHash: varchar("otp_hash").notNull(),
  used: boolean("used").notNull().default(false),
  userEmail: varchar("email", { length: 255 }).notNull(),
})

export default authSession

export const insertAuthSessionSchema = createInsertSchema(authSession)
