/**
 * Polar.sh checkout integration
 * Product ID: 0358546f-1871-4769-80e7-dfcb7cddd8ab
 */

// Agar Vercel mein token nahi hai, tab bhi yeh direct live page par le jayega
const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;

// Aap ka Live Product ID yahan pakka kar diya hai (Test mode khatam)
const POLAR_PRODUCT_ID = "0358546f-1871-4769-80e7-dfcb7cddd8ab";
const POLAR_API = "https://api.polar.sh";

export interface CreateCheckoutResult {
  url: string;
  id: string;
}

export async function createPolarCheckout(opts: {
  email: string;
  planId: string;
  priceId?: string;
  metadata?: Record<string, string>;
}): Promise<CreateCheckoutResult> {
  
  // ✅ FIX 1: Replit ko hamesha ke liye nikal diya, ab sirf Vercel ka live link chalega
  const APP_URL = "https://alerteportasplit.vercel.app";
  const SUCCESS_URL = `${APP_URL}/?paid=true`;

  if (!POLAR_ACCESS_TOKEN) {
    // ✅ FIX 2: Direct link mein bhi success_url daal diya taake wapas Vercel par aaye
    const fallbackUrl = `https://buy.polar.sh/product/${POLAR_PRODUCT_ID}?customer_email=${encodeURIComponent(opts.email)}&success_url=${encodeURIComponent(SUCCESS_URL)}`;
    console.warn("[polar] POLAR_ACCESS_TOKEN not set — returning placeholder URL");
    return { url: fallbackUrl, id: "placeholder" };
  }

  const body: Record<string, unknown> = {
    product_price_id: opts.priceId || POLAR_PRODUCT_ID,
    customer_email: opts.email,
    success_url: SUCCESS_URL,
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
