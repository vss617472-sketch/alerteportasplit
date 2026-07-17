import { Router, type IRouter } from "express";
import {
  ListPlansResponse,
  CreateCheckoutBody,
  CreateCheckoutResponse,
} from "@workspace/api-zod";

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
    polarProductId: null,
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
    polarProductId: null,
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
    polarProductId: null,
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

  // Polar.sh checkout — return placeholder URL for now
  // Replace with real Polar.sh checkout creation when keys are added
  const checkoutUrl = `https://buy.polar.sh/portasplit-alerts/${planId}?email=${encodeURIComponent(parsed.data.email)}`;

  res.json(CreateCheckoutResponse.parse({ checkoutUrl }));
});

export default router;
