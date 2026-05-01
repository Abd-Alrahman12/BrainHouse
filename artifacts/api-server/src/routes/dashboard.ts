import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, enrollmentsTable, coursesTable, videoSectionsTable, videosTable, videoProgressTable } from "@workspace/db";
import { requireApproved as requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const enrollments = await db.select().from(enrollmentsTable)
    .where(eq(enrollmentsTable.userId, req.user!.userId));

  let totalProgress = 0;
  let totalVideosWatched = 0;
  const recentCourses = [];

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
    totalVideosWatched += watchedVideos;

    recentCourses.push({
      id: course.id, title: course.title, description: course.description,
      coverImage: course.coverImage, status: course.status,
      progress, totalVideos, watchedVideos,
    });
  }

  totalProgress = recentCourses.length > 0
    ? recentCourses.reduce((sum, c) => sum + c.progress, 0) / recentCourses.length
    : 0;

  res.json({
    enrolledCourses: enrollments.length,
    totalProgress,
    totalVideosWatched,
    recentCourses: recentCourses.slice(0, 5),
  });
});

export default router;
