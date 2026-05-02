import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { teachersTable } from "./teachers";

export const COLLEGES = [
  { id: 1, name_ar: "كلية العلوم", name_en: "Science" },
  { id: 2, name_ar: "كلية الآداب", name_en: "Arts" },
  { id: 3, name_ar: "كلية العلوم التربوية", name_en: "Education" },
  { id: 4, name_ar: "كلية تكنولوجيا المعلومات", name_en: "IT" },
  { id: 5, name_ar: "كلية الأعمال", name_en: "Business" },
] as const;

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image").notNull(),
  status: text("status").notNull().default("free"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  whatsappNumber: text("whatsapp_number"),
  instructorName: text("instructor_name"),
  teacherId: integer("teacher_id").references(() => teachersTable.id, { onDelete: "set null" }),
  collegeId: integer("college_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
