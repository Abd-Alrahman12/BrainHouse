import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, devicesTable } from "@workspace/db";
import { RemoveDeviceParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/devices", requireAuth, async (req, res): Promise<void> => {
  const devices = await db.select().from(devicesTable)
    .where(eq(devicesTable.userId, req.user!.userId))
    .orderBy(devicesTable.lastActive);

  res.json(devices.map((d) => ({
    id: d.id,
    ip: d.ip,
    userAgent: d.userAgent,
    lastActive: d.lastActive.toISOString(),
    current: d.token === req.deviceToken,
  })));
});

router.delete("/devices/:id", requireAuth, async (req, res): Promise<void> => {
  const params = RemoveDeviceParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, params.data.id));
  if (!device || device.userId !== req.user!.userId) {
    res.status(404).json({ error: "Device not found" });
    return;
  }

  await db.delete(devicesTable).where(eq(devicesTable.id, params.data.id));
  res.json({ message: "Device removed" });
});

export default router;
