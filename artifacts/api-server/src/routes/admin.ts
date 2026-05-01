import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  db, usersTable, coursesTable, enrollmentsTable,
  videoSectionsTable, videosTable, fileCategoriesTable,
  filesTable, interactiveSessionsTable, videoProgressTable, devicesTable,
} from "@workspace/db";
import {
  LoginBody, AdminApproveUserParams, AdminDenyUserParams,
  AdminCreateCourseBody, AdminUpdateCourseParams, AdminUpdateCourseBody,
  AdminDeleteCourseParams, AdminEnrollUserParams, AdminEnrollUserBody,
  AdminListEnrollmentsParams, AdminCreateSectionParams, AdminCreateSectionBody,
  AdminCreateVideoParams, AdminCreateVideoBody,
  AdminCreateFileCategoryParams, AdminCreateFileCategoryBody,
  AdminCreateFileParams, AdminCreateFileBody,
  AdminCreateSessionParams, AdminCreateSessionBody,
  AdminDeleteVideoParams, AdminDeleteSectionParams,
  AdminDeleteFileParams, AdminDeleteFileCategoryParams,
  AdminDeleteSessionParams,
} from "@workspace/api-zod";
import { signToken, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email));
  if (!user || user.role !== "admin" || !(await bcrypt.compare(parsed.data.password, user.password))) {
    res.status(401).json({ error: "Invalid admin credentials" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, approved: user.approved, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  const result = [];
  for (const u of users) {
    const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, u.id));
    const devices = await db.select().from(devicesTable).where(eq(devicesTable.userId, u.id));
    result.push({
      id: u.id, name: u.name, email: u.email, role: u.role,
      approved: u.approved, createdAt: u.createdAt.toISOString(),
      enrollmentCount: enrollments.length,
      deviceCount: devices.length,
    });
  }
  res.json(result);
});

router.patch("/admin/users/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminApproveUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [user] = await db.update(usersTable).set({ approved: true }).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, user.id));
  res.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
    approved: user.approved, createdAt: user.createdAt.toISOString(),
    enrollmentCount: enrollments.length,
  });
});

router.patch("/admin/users/:id/deny", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDenyUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [user] = await db.update(usersTable).set({ approved: false }).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, user.id));
  res.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
    approved: user.approved, createdAt: user.createdAt.toISOString(),
    enrollmentCount: enrollments.length,
  });
});

router.get("/admin/courses", requireAdmin, async (_req, res): Promise<void> => {
  const courses = await db.select().from(coursesTable).orderBy(coursesTable.createdAt);
  res.json(courses.map((c) => ({
    id: c.id, title: c.title, description: c.description, coverImage: c.coverImage,
    status: c.status, createdAt: c.createdAt.toISOString(),
  })));
});

router.post("/admin/courses", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateCourseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [course] = await db.insert(coursesTable).values(parsed.data).returning();
  res.status(201).json({
    id: course.id, title: course.title, description: course.description,
    coverImage: course.coverImage, status: course.status, createdAt: course.createdAt.toISOString(),
  });
});

router.patch("/admin/courses/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminUpdateCourseParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = AdminUpdateCourseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [course] = await db.update(coursesTable).set(parsed.data).where(eq(coursesTable.id, params.data.id)).returning();
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }

  res.json({
    id: course.id, title: course.title, description: course.description,
    coverImage: course.coverImage, status: course.status, createdAt: course.createdAt.toISOString(),
  });
});

router.delete("/admin/courses/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteCourseParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [course] = await db.delete(coursesTable).where(eq(coursesTable.id, params.data.id)).returning();
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }

  res.json({ message: "Course deleted" });
});

router.post("/admin/courses/:courseId/enroll", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminEnrollUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = AdminEnrollUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const existing = await db.select().from(enrollmentsTable).where(
    and(eq(enrollmentsTable.userId, parsed.data.userId), eq(enrollmentsTable.courseId, params.data.courseId))
  );
  if (existing.length > 0) {
    res.status(400).json({ error: "User already enrolled" });
    return;
  }

  await db.insert(enrollmentsTable).values({ userId: parsed.data.userId, courseId: params.data.courseId });
  res.status(201).json({ message: "User enrolled successfully" });
});

router.get("/admin/courses/:courseId/enrollments", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminListEnrollmentsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const enrollments = await db.select().from(enrollmentsTable)
    .where(eq(enrollmentsTable.courseId, params.data.courseId));

  const result = [];
  for (const enr of enrollments) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, enr.userId));
    if (!user) continue;

    const sections = await db.select().from(videoSectionsTable).where(eq(videoSectionsTable.courseId, params.data.courseId));
    let totalVideos = 0;
    let watchedVideos = 0;
    for (const section of sections) {
      const vids = await db.select().from(videosTable).where(eq(videosTable.sectionId, section.id));
      totalVideos += vids.length;
      for (const v of vids) {
        const wp = await db.select().from(videoProgressTable).where(
          and(eq(videoProgressTable.userId, user.id), eq(videoProgressTable.videoId, v.id))
        );
        if (wp.length > 0) watchedVideos++;
      }
    }
    const progress = totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0;

    result.push({
      userId: user.id, userName: user.name, userEmail: user.email,
      enrolledAt: enr.enrolledAt.toISOString(), progress,
    });
  }

  res.json(result);
});

router.delete("/admin/courses/:courseId/enrollments/:userId", requireAdmin, async (req, res): Promise<void> => {
  const courseId = Number(req.params.courseId);
  const userId = Number(req.params.userId);
  if (isNaN(courseId) || isNaN(userId)) { res.status(400).json({ error: "Invalid courseId or userId" }); return; }

  const sections = await db.select().from(videoSectionsTable).where(eq(videoSectionsTable.courseId, courseId));
  for (const section of sections) {
    const vids = await db.select().from(videosTable).where(eq(videosTable.sectionId, section.id));
    for (const v of vids) {
      await db.delete(videoProgressTable).where(
        and(eq(videoProgressTable.userId, userId), eq(videoProgressTable.videoId, v.id))
      );
    }
  }

  const [deleted] = await db.delete(enrollmentsTable).where(
    and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.courseId, courseId))
  ).returning();
  if (!deleted) { res.status(404).json({ error: "Enrollment not found" }); return; }
  res.json({ message: "User removed from course" });
});

router.post("/admin/courses/:courseId/sections", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminCreateSectionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = AdminCreateSectionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [section] = await db.insert(videoSectionsTable).values({
    title: parsed.data.title,
    sortOrder: parsed.data.sortOrder ?? 0,
    courseId: params.data.courseId,
  }).returning();

  res.status(201).json({ id: section.id, title: section.title, sortOrder: section.sortOrder, courseId: section.courseId, videos: [] });
});

router.post("/admin/sections/:sectionId/videos", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminCreateVideoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = AdminCreateVideoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [video] = await db.insert(videosTable).values({
    title: parsed.data.title,
    url: parsed.data.url,
    sortOrder: parsed.data.sortOrder ?? 0,
    sectionId: params.data.sectionId,
  }).returning();

  res.status(201).json(video);
});

router.post("/admin/courses/:courseId/file-categories", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminCreateFileCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = AdminCreateFileCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [cat] = await db.insert(fileCategoriesTable).values({
    name: parsed.data.name,
    courseId: params.data.courseId,
  }).returning();

  res.status(201).json({ id: cat.id, name: cat.name, courseId: cat.courseId, files: [] });
});

router.post("/admin/file-categories/:categoryId/files", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminCreateFileParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = AdminCreateFileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [file] = await db.insert(filesTable).values({
    name: parsed.data.name,
    url: parsed.data.url,
    categoryId: params.data.categoryId,
  }).returning();

  res.status(201).json(file);
});

router.post("/admin/courses/:courseId/sessions", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminCreateSessionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = AdminCreateSessionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [session] = await db.insert(interactiveSessionsTable).values({
    title: parsed.data.title,
    link: parsed.data.link,
    scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    courseId: params.data.courseId,
  }).returning();

  res.status(201).json({
    id: session.id, title: session.title, link: session.link,
    scheduledAt: session.scheduledAt?.toISOString() ?? null,
    courseId: session.courseId,
  });
});

router.delete("/admin/videos/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteVideoParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(videosTable).where(eq(videosTable.id, params.data.id));
  res.json({ message: "Video deleted" });
});

router.delete("/admin/sections/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteSectionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(videoSectionsTable).where(eq(videoSectionsTable.id, params.data.id));
  res.json({ message: "Section deleted" });
});

router.delete("/admin/files/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteFileParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(filesTable).where(eq(filesTable.id, params.data.id));
  res.json({ message: "File deleted" });
});

router.delete("/admin/file-categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteFileCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(fileCategoriesTable).where(eq(fileCategoriesTable.id, params.data.id));
  res.json({ message: "Category deleted" });
});

router.delete("/admin/sessions/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = AdminDeleteSessionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(interactiveSessionsTable).where(eq(interactiveSessionsTable.id, params.data.id));
  res.json({ message: "Session deleted" });
});

router.get("/admin/dashboard", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  const courses = await db.select().from(coursesTable);
  const enrollments = await db.select().from(enrollmentsTable);

  const totalUsers = users.filter(u => u.role !== "admin").length;
  const approvedUsers = users.filter(u => u.approved && u.role !== "admin").length;
  const pendingUsers = users.filter(u => !u.approved && u.role !== "admin").length;

  res.json({
    totalUsers,
    approvedUsers,
    pendingUsers,
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
  });
});

export default router;
