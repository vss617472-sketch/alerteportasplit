import { Router, type IRouter } from "express";
import {
  ListPlansResponse,
  CreateCheckoutBody,
  CreateCheckoutResponse,
} from "@workspace/api-zod";
import { createPolarCheckout } from "../lib/polar.js";

const router: IRouter = Router();

const PLANS = [
  {
    id: "week",
    name: "1 Week",
    durationDays: 7,
    priceEur: 4.90,
    checkIntervalSeconds: 15,
    features: [
      "Alerts every 15 seconds",
      "All 11+ retail chains",
      "Email notification",
      "Location-based filtering",
    ],
    popular: false,
    polarProductId: "197b7170-185b-4fa9-89e1-659fd5828502",
    polarPriceId: "d41e5c07-05cc-4302-b796-fa6a6bd8d0f1",
  },
  {
    id: "month",
    name: "1 Month",
    durationDays: 30,
    priceEur: 9.90,
    checkIntervalSeconds: 15,
    features: [
      "Alerts every 15 seconds",
      "All 11+ retail chains",
      "Email notification",
      "Location-based filtering",
      "Reserved stock visibility",
    ],
    popular: true,
    polarProductId: "a076954a-18cc-4063-99b6-b5694a52807d",
    polarPriceId: "7697fca2-55dd-47aa-b435-d07c1e6fa1a6",
  },
  {
    id: "two-months",
    name: "2 Months",
    durationDays: 60,
    priceEur: 14.90,
    checkIntervalSeconds: 15,
    features: [
      "Alerts every 15 seconds",
      "All 11+ retail chains",
      "Email notification",
      "Location-based filtering",
      "Reserved stock visibility",
      "Priority alerts",
    ],
    popular: false,
    polarProductId: "aec4bb6f-a89b-4a32-8065-cb5041c4bccd",
    polarPriceId: "4fbdb18e-7538-4ca8-8a65-1402b4d26ecb",
  },
];

router.get("/plans", async (_req, res): Promise<void> => {
  res.json(ListPlansResponse.parse(PLANS));
});

router.post("/checkout", async (req, res): Promise<void> => {
  const parsed = CreateCheckoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { planId } = parsed.data;
  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  try {
    const checkout = await createPolarCheckout({
      email: parsed.data.email,
      planId,
      priceId: plan.polarPriceId,
      metadata: { planName: plan.name, priceEur: String(plan.priceEur) },
    });
    res.json(CreateCheckoutResponse.parse({ checkoutUrl: checkout.url }));
  } catch (err) {
    req.log.error({ err }, "Polar.sh checkout failed");
    res.status(502).json({ error: "Checkout unavailable — please try again" });
  }
});

export default router;
