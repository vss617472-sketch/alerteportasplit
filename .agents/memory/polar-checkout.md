---
name: Polar.sh checkout API
description: How to call the Polar.sh checkout creation API correctly in this project
---

# Polar.sh Checkout

**Rule:** Use `POST https://api.polar.sh/v1/checkouts/` (trailing slash required — without it you get a 307 redirect that curl/fetch may not follow correctly with POST body)

**Why:** `/v1/checkouts` (no slash) returns 307 to `/v1/checkouts/`. `/v1/checkouts/custom` is GET-only (returns 405).

**Body format:**
```json
{
  "product_id": "<POLAR_PRODUCT_ID>",
  "customer_email": "user@real-domain.com",
  "metadata": { "planId": "month" }
}
```

**How to apply:**
- Use `product_id` at top level (not `product_price_id`)
- Email must be a real domain (example.com is rejected by Polar's email validator)
- Returns `{ url: "https://polar.sh/checkout/polar_c_..." }` — redirect user here
- Product ID is stored in POLAR_PRODUCT_ID env var; token in POLAR_ACCESS_TOKEN secret
- Implementation: `artifacts/api-server/src/lib/polar.ts`

**Product details:**
- Product: "Midea PortaSplit Stock Tracker"
- Price type: seat_based one-time
- Price: €13.90/seat (1-10 seats)
