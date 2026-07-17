import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db, alertsTable } from "@workspace/db";
import {
  CreateAlertBody,
  CreateAlertResponse,
  DeleteAlertParams,
  VerifyAlertParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/alerts", async (req, res): Promise<void> => {
  const parsed = CreateAlertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, productId, postalCode, radiusKm, chain, planId } = parsed.data;

  // Check for existing active alert
  const [existing] = await db
    .select()
    .from(alertsTable)
    .where(eq(alertsTable.email, email))
    .limit(1);

  if (existing && existing.status === "active") {
    res.status(409).json({ error: "Already subscribed with this email" });
    return;
  }

  const token = randomBytes(32).toString("hex");

  // Calculate expiry based on plan
  let expiresAt: Date | null = null;
  if (planId === "week") expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  else if (planId === "month") expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  else if (planId === "two-months") expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  const [alert] = await db
    .insert(alertsTable)
    .values({
      email,
      productId,
      status: "pending",
      postalCode: postalCode ?? null,
      radiusKm: radiusKm ?? null,
      chain: chain ?? null,
      planId: planId ?? null,
      token,
      expiresAt,
    })
    .returning();

  req.log.info({ alertId: alert.id, email }, "Alert subscription created");

  res.status(201).json(
    CreateAlertResponse.parse({
      ...alert,
      expiresAt: alert.expiresAt?.toISOString() ?? null,
      createdAt: alert.createdAt.toISOString(),
    })
  );
});

router.delete("/alerts/:token", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const params = DeleteAlertParams.safeParse({ token: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [alert] = await db
    .select()
    .from(alertsTable)
    .where(eq(alertsTable.token, params.data.token))
    .limit(1);

  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  await db
    .update(alertsTable)
    .set({ status: "cancelled" })
    .where(eq(alertsTable.token, params.data.token));

  res.json({ success: true });
});

router.get("/alerts/verify/:token", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const params = VerifyAlertParams.safeParse({ token: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [alert] = await db
    .select()
    .from(alertsTable)
    .where(eq(alertsTable.token, params.data.token))
    .limit(1);

  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  await db
    .update(alertsTable)
    .set({ status: "active" })
    .where(eq(alertsTable.token, params.data.token));

  res.json({ success: true, email: alert.email });
});

export default router;
