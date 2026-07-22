import { afterEach, describe, expect, it, vi } from "vitest";

import { providerFetch } from "@/features/integrations/server/provider-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("integration provider client", () => {
  it("does not expose raw Supabase error bodies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          {
            message:
              "management-token database-password refresh-token sb_secret_probe",
          },
          { status: 500 },
        ),
      ),
    );

    await expect(
      providerFetch(
        "supabase",
        "management-token",
        "https://api.supabase.com/v1/projects/project-ref",
      ),
    ).rejects.toMatchObject({
      code: "SUPABASE_REQUEST_FAILED",
      message: "Supabase: request failed with HTTP 500",
      status: 502,
    });
  });
});
