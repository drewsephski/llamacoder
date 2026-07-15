import { describe, expect, it } from "vitest";

import { validateProductionEnvironment } from "@/lib/env";

function validEnvironment(): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://user:password@example.com/database",
    BETTER_AUTH_SECRET: "a".repeat(32),
    BETTER_AUTH_URL: "https://squidagent.app",
    NEXT_PUBLIC_APP_URL: "https://squidagent.app",
    OPENROUTER_API_KEY: "openrouter",
    EXA_API_KEY: "exa",
    RESEND_API_KEY: "resend",
    RESEND_FROM_EMAIL: "Squid Agent <hello@squidagent.app>",
    TURNSTILE_SECRET_KEY: "turnstile-secret",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "turnstile-site",
    OPERATIONAL_ALERT_WEBHOOK_URL: "https://alerts.example.com/squid",
    SYNTHETIC_MONITOR_SECRET: "s".repeat(32),
    CRON_SECRET: "c".repeat(32),
  };
}

describe("production environment validation", () => {
  it("accepts the minimum launch configuration", () => {
    const environment = validEnvironment();
    delete environment.RESEND_FROM_EMAIL;
    delete environment.TURNSTILE_SECRET_KEY;
    delete environment.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete environment.OPERATIONAL_ALERT_WEBHOOK_URL;

    expect(validateProductionEnvironment(environment)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("reports missing required configuration and partial provider groups", () => {
    const result = validateProductionEnvironment({
      ...validEnvironment(),
      OPENROUTER_API_KEY: "",
      S3_UPLOAD_BUCKET: "bucket",
    });
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.join("\n")).toContain("OPENROUTER_API_KEY");
    expect(result.errors.join("\n")).toContain("Configure all or none of");
  });

  it("rejects a partial Turnstile configuration", () => {
    const environment = validEnvironment();
    delete environment.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const result = validateProductionEnvironment(environment);

    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.join("\n")).toContain(
      "Configure all or none of: TURNSTILE_SECRET_KEY, NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    );
  });
});
