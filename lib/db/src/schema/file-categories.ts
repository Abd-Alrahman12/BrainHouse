import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { coursesTable } from "./courses";

export const fileCategoriesTable = pgTable("file_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
});

export type FileCategory = typeof fileCategoriesTable.$inferSelect;
