import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.E2E_PORT || "3100";
const localBaseURL = `http://localhost:${e2ePort}`;
const baseURL = process.env.E2E_BASE_URL || localBaseURL;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: [
          `BETTER_AUTH_URL=${localBaseURL}`,
          `NEXT_PUBLIC_APP_URL=${localBaseURL}`,
          `NEXT_PUBLIC_BETTER_AUTH_URL=${localBaseURL}`,
          `BETTER_AUTH_TRUSTED_ORIGINS=${localBaseURL}`,
          `NEXT_PUBLIC_BETTER_AUTH_TRUSTED_ORIGINS=${localBaseURL}`,
          "E2E_SKIP_EMAIL_DELIVERY=1",
          "NEXT_DIST_DIR=.next-e2e",
          `pnpm dev --port ${e2ePort}`,
        ].join(" "),
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
