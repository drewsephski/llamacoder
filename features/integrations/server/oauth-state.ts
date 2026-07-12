import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";

import { integrationEnvironmentSchema } from "@/features/integrations/contracts";

const oauthStateSchema = z.object({
  userId: z.string().min(1),
  projectId: z.string().min(1),
  providerId: z.enum(["github", "vercel"]),
  environment: integrationEnvironmentSchema,
  nonce: z.string().min(32),
  expiresAt: z.number().int(),
});

export type IntegrationOAuthState = z.infer<typeof oauthStateSchema>;

function getStateSecret() {
  const configured = process.env.INTEGRATION_OAUTH_STATE_SECRET?.trim();
  if (!configured) {
    throw new Error(
      "INTEGRATION_OAUTH_STATE_SECRET is required for integration OAuth.",
    );
  }
  const decoded = /^[a-f0-9]{64}$/i.test(configured)
    ? Buffer.from(configured, "hex")
    : Buffer.from(configured, "base64");
  if (decoded.length !== 32) {
    throw new Error(
      "INTEGRATION_OAUTH_STATE_SECRET must be a 32-byte base64 or 64-character hex value.",
    );
  }
  return decoded;
}

export function createOAuthState(
  input: Omit<IntegrationOAuthState, "nonce" | "expiresAt">,
) {
  const state = oauthStateSchema.parse({
    ...input,
    nonce: randomBytes(24).toString("base64url"),
    expiresAt: Date.now() + 10 * 60_000,
  });
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  const signature = createHmac("sha256", getStateSecret())
    .update(payload)
    .digest("base64url");
  return { state: `${payload}.${signature}`, nonce: state.nonce };
}

export function verifyOAuthState(value: string): IntegrationOAuthState {
  const [payload, suppliedSignature, ...rest] = value.split(".");
  if (!payload || !suppliedSignature || rest.length > 0) {
    throw new Error("Invalid OAuth state.");
  }
  const expectedSignature = createHmac("sha256", getStateSecret())
    .update(payload)
    .digest();
  const supplied = Buffer.from(suppliedSignature, "base64url");
  if (
    expectedSignature.length !== supplied.length ||
    !timingSafeEqual(expectedSignature, supplied)
  ) {
    throw new Error("Invalid OAuth state signature.");
  }
  const parsed = oauthStateSchema.parse(
    JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
  );
  if (parsed.expiresAt < Date.now()) {
    throw new Error("OAuth state has expired.");
  }
  return parsed;
}

export function createPkcePair() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function oauthCookieName(
  providerId: "github" | "vercel",
  kind: "nonce" | "verifier",
) {
  return `squid_${providerId}_oauth_${kind}`;
}
