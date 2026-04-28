import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const devicesTable = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  ip: text("ip").notNull(),
  userAgent: text("user_agent").notNull(),
  lastActive: timestamp("last_active", { withTimezone: true }).notNull().defaultNow(),
});

export type Device = typeof devicesTable.$inferSelect;
