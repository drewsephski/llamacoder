import { z } from "zod";

import type { ForSaleProduct } from "@/features/for-sale/types";

const responseSchema = z.object({ url: z.string().url() });

export async function beginForSaleCheckout(product: ForSaleProduct) {
  const response = await fetch("/api/stripe/page-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productKey: product.key }),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof payload?.error === "string" ? payload.error : "Checkout failed",
    );
  }

  return responseSchema.parse(payload);
}
