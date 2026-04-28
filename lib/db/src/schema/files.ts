import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { fileCategoriesTable } from "./file-categories";

export const filesTable = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  categoryId: integer("category_id").notNull().references(() => fileCategoriesTable.id, { onDelete: "cascade" }),
});

export type CourseFile = typeof filesTable.$inferSelect;
