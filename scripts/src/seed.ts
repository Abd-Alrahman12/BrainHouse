import bcrypt from "bcryptjs";
import { db, usersTable, coursesTable, enrollmentsTable, videoSectionsTable, videosTable, fileCategoriesTable, filesTable, interactiveSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);

  const existingAdmin = await db.select().from(usersTable).where(eq(usersTable.email, "admin@learnhub.com"));
  if (existingAdmin.length > 0) {
    await db.update(usersTable).set({ password: adminPassword }).where(eq(usersTable.email, "admin@learnhub.com"));
    console.log("Admin password updated");
  } else {
    await db.insert(usersTable).values({
      name: "Admin",
      email: "admin@learnhub.com",
      password: adminPassword,
      role: "admin",
      approved: true,
    });
    console.log("Admin user created");
  }

  const existingCourses = await db.select().from(coursesTable);
  if (existingCourses.length === 0) {
    const [course1] = await db.insert(coursesTable).values({
      title: "Web Development Fundamentals",
      description: "Learn HTML, CSS, and JavaScript from scratch. Build modern responsive websites with the latest techniques.",
      coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
      status: "free",
      instructorName: "Sarah Johnson",
      contactEmail: "sarah@learnhub.com",
      whatsappNumber: "1234567890",
    }).returning();

    const [course2] = await db.insert(coursesTable).values({
      title: "Python for Data Science",
      description: "Master Python programming with a focus on data analysis, machine learning, and visualization.",
      coverImage: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
      status: "locked",
      instructorName: "Michael Chen",
      contactEmail: "michael@learnhub.com",
      whatsappNumber: "1234567890",
    }).returning();

    await db.insert(coursesTable).values({
      title: "UI/UX Design Masterclass",
      description: "From wireframes to high-fidelity prototypes. Learn design thinking, user research, and modern design tools.",
      coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      status: "free",
      instructorName: "Emily Rodriguez",
      contactEmail: "emily@learnhub.com",
      whatsappNumber: "1234567890",
    });

    const [section1] = await db.insert(videoSectionsTable).values({ title: "Getting Started", sortOrder: 0, courseId: course1.id }).returning();
    const [section2] = await db.insert(videoSectionsTable).values({ title: "HTML Basics", sortOrder: 1, courseId: course1.id }).returning();

    await db.insert(videosTable).values([
      { title: "Course Introduction", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sortOrder: 0, sectionId: section1.id },
      { title: "Setting Up Your Environment", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sortOrder: 1, sectionId: section1.id },
      { title: "HTML Structure", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sortOrder: 0, sectionId: section2.id },
      { title: "Forms and Inputs", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sortOrder: 1, sectionId: section2.id },
    ]);

    const [cat1] = await db.insert(fileCategoriesTable).values({ name: "Lecture Notes", courseId: course1.id }).returning();
    await db.insert(filesTable).values([
      { name: "Week 1 - Introduction.pdf", url: "https://example.com/files/week1.pdf", categoryId: cat1.id },
      { name: "Week 2 - HTML Basics.pdf", url: "https://example.com/files/week2.pdf", categoryId: cat1.id },
    ]);

    await db.insert(interactiveSessionsTable).values([
      { title: "Live Q&A Session", link: "https://zoom.us/j/1234567890", scheduledAt: new Date("2026-05-01T14:00:00Z"), courseId: course1.id },
      { title: "Code Review Workshop", link: "https://meet.google.com/abc-defg-hij", scheduledAt: new Date("2026-05-08T14:00:00Z"), courseId: course1.id },
    ]);

    console.log("Courses seeded");
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
