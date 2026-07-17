/**
 * Polar.sh checkout integration
 * Requires: POLAR_ACCESS_TOKEN env secret
 * Product ID is set via POLAR_PRODUCT_ID env var
 */

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;
const POLAR_PRODUCT_ID = process.env.POLAR_PRODUCT_ID ?? "0358546f-1871-4769-80e7-dfcb7cddd8ab";
const POLAR_API = "https://api.polar.sh";

export interface CreateCheckoutResult {
  url: string;
  id: string;
}

export async function createPolarCheckout(opts: {
  email: string;
  planId: string;
  metadata?: Record<string, string>;
}): Promise<CreateCheckoutResult> {
  if (!POLAR_ACCESS_TOKEN) {
    // Fallback placeholder URL when token not yet set
    const fallbackUrl = `https://buy.polar.sh/product/${POLAR_PRODUCT_ID}?customer_email=${encodeURIComponent(opts.email)}&metadata[planId]=${opts.planId}`;
    console.warn("[polar] POLAR_ACCESS_TOKEN not set — returning placeholder URL");
    return { url: fallbackUrl, id: "placeholder" };
  }

  const body: Record<string, unknown> = {
    product_id: POLAR_PRODUCT_ID,
    customer_email: opts.email,
    metadata: {
      planId: opts.planId,
      ...(opts.metadata ?? {}),
    },
  };

  // Polar requires trailing slash on /v1/checkouts/
  const res = await fetch(`${POLAR_API}/v1/checkouts/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${POLAR_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Polar.sh checkout error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { url: string; id: string };
  return { url: data.url, id: data.id };
}
