import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { videosTable } from "./videos";

export const videoProgressTable = pgTable("video_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  videoId: integer("video_id").notNull().references(() => videosTable.id, { onDelete: "cascade" }),
  watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
});

export type VideoProgress = typeof videoProgressTable.$inferSelect;
