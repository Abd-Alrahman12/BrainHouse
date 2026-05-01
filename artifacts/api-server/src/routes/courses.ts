import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, coursesTable, enrollmentsTable, videoSectionsTable, videosTable, fileCategoriesTable, filesTable, interactiveSessionsTable, videoProgressTable } from "@workspace/db";
import { GetCourseParams, ListCourseVideosParams, ListCourseFilesParams, ListCourseSessionsParams, GetCourseContactParams, MarkVideoWatchedParams, GetCourseProgressParams } from "@workspace/api-zod";
import { requireAuth, requireApproved } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/courses", async (_req, res): Promise<void> => {
  const courses = await db.select().from(coursesTable).orderBy(coursesTable.createdAt);
  res.json(courses.map((c) => ({
    id: c.id, title: c.title, description: c.description, coverImage: c.coverImage,
    status: c.status, createdAt: c.createdAt.toISOString(),
  })));
});

router.get("/courses/:id", async (req, res): Promise<void> => {
  const params = GetCourseParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, params.data.id));
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }

  let enrolled = false;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const { verifyToken } = await import("../middlewares/auth");
    const payload = verifyToken(header.slice(7));
    if (payload) {
      const enrollments = await db.select().from(enrollmentsTable).where(
        sql`${enrollmentsTable.userId} = ${payload.userId} AND ${enrollmentsTable.courseId} = ${course.id}`
      );
      enrolled = enrollments.length > 0;
    }
  }

  res.json({
    id: course.id, title: course.title, description: course.description,
    coverImage: course.coverImage, status: course.status, createdAt: course.createdAt.toISOString(),
    contactEmail: course.contactEmail, contactPhone: course.contactPhone,
    whatsappNumber: course.whatsappNumber, instructorName: course.instructorName,
    enrolled,
  });
});

router.get("/my-courses", requireApproved, async (req, res): Promise<void> => {
  const enrollments = await db.select().from(enrollmentsTable)
    .where(eq(enrollmentsTable.userId, req.user!.userId));

  const result = [];
  for (const enr of enrollments) {
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, enr.courseId));
    if (!course) continue;

    const sections = await db.select().from(videoSectionsTable).where(eq(videoSectionsTable.courseId, course.id));
    let totalVideos = 0;
    let watchedVideos = 0;
    for (const section of sections) {
      const vids = await db.select().from(videosTable).where(eq(videosTable.sectionId, section.id));
      totalVideos += vids.length;
      for (const v of vids) {
        const wp = await db.select().from(videoProgressTable).where(
          sql`${videoProgressTable.userId} = ${req.user!.userId} AND ${videoProgressTable.videoId} = ${v.id}`
        );
        if (wp.length > 0) watchedVideos++;
      }
    }

    const progress = totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0;
    result.push({
      id: course.id, title: course.title, description: course.description,
      coverImage: course.coverImage, status: course.status,
      progress, totalVideos, watchedVideos,
    });
  }

  res.json(result);
});

router.get("/courses/:courseId/videos", requireApproved, async (req, res): Promise<void> => {
  const params = ListCourseVideosParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const sections = await db.select().from(videoSectionsTable)
    .where(eq(videoSectionsTable.courseId, params.data.courseId))
    .orderBy(videoSectionsTable.sortOrder);

  const result = [];
  for (const section of sections) {
    const vids = await db.select().from(videosTable).where(eq(videosTable.sectionId, section.id)).orderBy(videosTable.sortOrder);
    const videosWithProgress = [];
    for (const v of vids) {
      const wp = await db.select().from(videoProgressTable).where(
        sql`${videoProgressTable.userId} = ${req.user!.userId} AND ${videoProgressTable.videoId} = ${v.id}`
      );
      videosWithProgress.push({ ...v, watched: wp.length > 0 });
    }
    result.push({ id: section.id, title: section.title, sortOrder: section.sortOrder, courseId: section.courseId, videos: videosWithProgress });
  }

  res.json(result);
});

router.get("/courses/:courseId/files", requireApproved, async (req, res): Promise<void> => {
  const params = ListCourseFilesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const categories = await db.select().from(fileCategoriesTable)
    .where(eq(fileCategoriesTable.courseId, params.data.courseId));

  const result = [];
  for (const cat of categories) {
    const catFiles = await db.select().from(filesTable).where(eq(filesTable.categoryId, cat.id));
    result.push({ id: cat.id, name: cat.name, courseId: cat.courseId, files: catFiles });
  }

  res.json(result);
});

router.get("/courses/:courseId/sessions", requireApproved, async (req, res): Promise<void> => {
  const params = ListCourseSessionsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const sessions = await db.select().from(interactiveSessionsTable)
    .where(eq(interactiveSessionsTable.courseId, params.data.courseId));

  res.json(sessions.map((s) => ({
    id: s.id, title: s.title, link: s.link,
    scheduledAt: s.scheduledAt?.toISOString() ?? null,
    courseId: s.courseId,
  })));
});

router.get("/courses/:courseId/contact", requireApproved, async (req, res): Promise<void> => {
  const params = GetCourseContactParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, params.data.courseId));
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }

  res.json({
    instructorName: course.instructorName,
    contactEmail: course.contactEmail,
    contactPhone: course.contactPhone,
    whatsappNumber: course.whatsappNumber,
  });
});

router.post("/progress/video/:videoId", requireApproved, async (req, res): Promise<void> => {
  const params = MarkVideoWatchedParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const existing = await db.select().from(videoProgressTable).where(
    sql`${videoProgressTable.userId} = ${req.user!.userId} AND ${videoProgressTable.videoId} = ${params.data.videoId}`
  );

  if (existing.length === 0) {
    await db.insert(videoProgressTable).values({
      userId: req.user!.userId,
      videoId: params.data.videoId,
    });
  }

  res.json({ message: "Video marked as watched" });
});

router.get("/progress/course/:courseId", requireApproved, async (req, res): Promise<void> => {
  const params = GetCourseProgressParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const sections = await db.select().from(videoSectionsTable).where(eq(videoSectionsTable.courseId, params.data.courseId));
  let totalVideos = 0;
  let watchedVideos = 0;
  const watchedVideoIds: number[] = [];

  for (const section of sections) {
    const vids = await db.select().from(videosTable).where(eq(videosTable.sectionId, section.id));
    totalVideos += vids.length;
    for (const v of vids) {
      const wp = await db.select().from(videoProgressTable).where(
        sql`${videoProgressTable.userId} = ${req.user!.userId} AND ${videoProgressTable.videoId} = ${v.id}`
      );
      if (wp.length > 0) {
        watchedVideos++;
        watchedVideoIds.push(v.id);
      }
    }
  }

  const progress = totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0;
  res.json({ courseId: params.data.courseId, totalVideos, watchedVideos, progress, watchedVideoIds });
});

export default router;
