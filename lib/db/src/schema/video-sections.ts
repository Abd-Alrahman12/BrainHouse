import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { coursesTable } from "./courses";

export const videoSectionsTable = pgTable("video_sections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
});

export type VideoSection = typeof videoSectionsTable.$inferSelect;
