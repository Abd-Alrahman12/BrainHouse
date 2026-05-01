import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable, devicesTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { signToken, requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, email, password: hashed }).returning();

  const token = signToken({ userId: user.id, role: user.role });
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
  const userAgent = req.headers["user-agent"] || "unknown";

  const allDevices = await db.select().from(devicesTable).where(eq(devicesTable.userId, user.id));
  const existingDevice = allDevices.find(d => d.ip === ip && d.userAgent === userAgent);

  if (existingDevice) {
    await db.update(devicesTable)
      .set({ lastActive: new Date(), token })
      .where(eq(devicesTable.id, existingDevice.id));
  } else {
    await db.insert(devicesTable).values({ userId: user.id, token, ip, userAgent });
  }

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, approved: user.approved, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
  const userAgent = req.headers["user-agent"] || "unknown";

  const allDevices = await db.select().from(devicesTable).where(eq(devicesTable.userId, user.id));
  const existingDevice = allDevices.find(d => d.ip === ip && d.userAgent === userAgent);

  if (existingDevice) {
    await db.update(devicesTable)
      .set({ lastActive: new Date(), token })
      .where(eq(devicesTable.id, existingDevice.id));
  } else {
    await db.insert(devicesTable).values({ userId: user.id, token, ip, userAgent });
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, approved: user.approved, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
  if (req.deviceToken) {
    await db.delete(devicesTable).where(eq(devicesTable.token, req.deviceToken));
  }
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    approved: user.approved,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
