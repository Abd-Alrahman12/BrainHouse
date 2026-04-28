import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { videoSectionsTable } from "./video-sections";

export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  sectionId: integer("section_id").notNull().references(() => videoSectionsTable.id, { onDelete: "cascade" }),
});

export type Video = typeof videosTable.$inferSelect;
