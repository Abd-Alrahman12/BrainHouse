import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { coursesTable } from "./courses";

export const interactiveSessionsTable = pgTable("interactive_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  link: text("link").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
});

export type InteractiveSession = typeof interactiveSessionsTable.$inferSelect;
