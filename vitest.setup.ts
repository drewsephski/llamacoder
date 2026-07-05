import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

process.env.BETTER_AUTH_SECRET ??= "test-better-auth-secret";
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??= "http://localhost:3000";
process.env.OPENROUTER_API_KEY ??= "test-openrouter-key";
process.env.STRIPE_SECRET_KEY ??= "sk_test_unit";
process.env.STRIPE_WEBHOOK_SECRET ??= "whsec_unit";
process.env.STRIPE_PRO_PRICE_ID ??= "price_pro";
process.env.STRIPE_PRO_PLUS_PRICE_ID ??= "price_pro_plus";
process.env.STRIPE_CREDITS_10_PRICE_ID ??= "price_credits_10";
process.env.STRIPE_CREDITS_25_PRICE_ID ??= "price_credits_25";
process.env.STRIPE_CREDITS_60_PRICE_ID ??= "price_credits_60";
