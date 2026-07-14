import "server-only";

import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));
const optionalSecret = z.string().min(16).optional().or(z.literal(""));

const productionEnvironmentSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  OPENROUTER_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(3),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  OPERATIONAL_ALERT_WEBHOOK_URL: z.string().url(),
  SYNTHETIC_MONITOR_SECRET: z.string().min(32),
  CRON_SECRET: z.string().min(32),
  GENERATION_KILL_SWITCH: z.enum(["0", "1"]).optional(),
  DISABLED_MODELS: z.string().optional(),
  DISABLED_PROVIDERS: z.string().optional(),
  GOOGLE_CLIENT_ID: optionalSecret,
  GOOGLE_CLIENT_SECRET: optionalSecret,
  HELICONE_API_KEY: z.string().optional(),
  INTEGRATION_ENCRYPTION_KEY: z.string().optional(),
  INTEGRATION_OAUTH_STATE_SECRET: z.string().optional(),
  S3_UPLOAD_REGION: z.string().optional(),
  S3_UPLOAD_BUCKET: z.string().optional(),
  S3_UPLOAD_SECRET: z.string().optional(),
  S3_UPLOAD_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_BETTER_AUTH_URL: optionalUrl,
});

export type EnvironmentValidation =
  | { valid: true; errors: [] }
  | { valid: false; errors: string[] };

function hasPartialGroup(
  environment: NodeJS.ProcessEnv,
  names: readonly string[],
) {
  const configured = names.filter((name) => Boolean(environment[name]?.trim()));
  return configured.length > 0 && configured.length < names.length;
}

export function validateProductionEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): EnvironmentValidation {
  const parsed = productionEnvironmentSchema.safeParse(environment);
  const errors = parsed.success
    ? []
    : parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`,
      );

  const conditionalGroups = [
    ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    [
      "S3_UPLOAD_REGION",
      "S3_UPLOAD_BUCKET",
      "S3_UPLOAD_SECRET",
      "S3_UPLOAD_KEY",
    ],
    ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"],
  ] as const;

  for (const group of conditionalGroups) {
    if (hasPartialGroup(environment, group)) {
      errors.push(`Configure all or none of: ${group.join(", ")}`);
    }
  }

  return errors.length === 0
    ? { valid: true, errors: [] }
    : { valid: false, errors };
}

export function assertProductionEnvironment() {
  if (process.env.NODE_ENV !== "production") return;

  const result = validateProductionEnvironment();
  if (!result.valid) {
    throw new Error(
      `Invalid production environment:\n- ${result.errors.join("\n- ")}`,
    );
  }
}
