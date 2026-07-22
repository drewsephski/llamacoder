import { describe, expect, it, vi } from "vitest";

import { requestSupabaseManagementCapabilities } from "@/features/integrations/server/provider-health";
import { supabaseManagementCapabilitiesSchema } from "@/features/integrations/supabase-management-capabilities";

function responseFetch(statusForUrl: (url: string) => number) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toBe("Bearer management-token");
    return new Response(null, { status: statusForUrl(String(input)) });
  });
}

describe("Supabase Management API capability checks", () => {
  it("verifies safe read capabilities without probing writes", async () => {
    const fetchMock = responseFetch(() => 200);

    const capabilities = await requestSupabaseManagementCapabilities({
      credential: "management-token",
      projectRef: "project-ref",
      fetchImpl: fetchMock as typeof fetch,
    });

    expect(capabilities).toMatchObject({
      projectsRead: "verified",
      projectsWrite: "unverified",
      secretsRead: "verified",
      databaseRead: "verified",
      databaseWrite: "unverified",
      projectRef: "project-ref",
      issue: null,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual(
      expect.arrayContaining([
        "https://api.supabase.com/v1/projects/project-ref",
        "https://api.supabase.com/v1/projects/project-ref/api-keys",
        "https://api.supabase.com/v1/projects/project-ref/types/typescript?included_schemas=public",
      ]),
    );
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("database/query"),
      ),
    ).toBe(false);
  });

  it.each([
    [401, "connection_expired"],
    [403, "insufficient_permissions"],
  ] as const)(
    "classifies HTTP %s as reauthorization required",
    async (status, issue) => {
      const capabilities = await requestSupabaseManagementCapabilities({
        credential: "management-token",
        projectRef: "project-ref",
        fetchImpl: responseFetch(() => status) as typeof fetch,
      });

      expect(capabilities).toMatchObject({
        projectsRead: "reauthorization_required",
        secretsRead: "reauthorization_required",
        databaseRead: "reauthorization_required",
        databaseWrite: "unverified",
        issue,
      });
    },
  );

  it("does not describe rate limits or provider failures as missing permissions", async () => {
    const capabilities = await requestSupabaseManagementCapabilities({
      credential: "management-token",
      projectRef: "project-ref",
      fetchImpl: responseFetch((url) =>
        url.endsWith("/project-ref") ? 429 : 503,
      ) as typeof fetch,
    });

    expect(capabilities).toMatchObject({
      projectsRead: "error",
      secretsRead: "error",
      databaseRead: "error",
      databaseWrite: "unverified",
      issue: "rate_limited",
    });
    expect(JSON.stringify(capabilities)).not.toContain("missing");
  });

  it("leaves project-specific capabilities unverified until a project is bound", async () => {
    const fetchMock = responseFetch(() => 200);
    const capabilities = await requestSupabaseManagementCapabilities({
      credential: "management-token",
      projectRef: null,
      fetchImpl: fetchMock as typeof fetch,
    });

    expect(capabilities).toMatchObject({
      projectsRead: "verified",
      projectsWrite: "unverified",
      secretsRead: "unverified",
      databaseRead: "unverified",
      databaseWrite: "unverified",
      projectRef: null,
      issue: null,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects raw credentials and provider payloads from the public capability DTO", () => {
    expect(
      supabaseManagementCapabilitiesSchema.safeParse({
        projectsRead: "verified",
        projectsWrite: "unverified",
        secretsRead: "verified",
        databaseRead: "verified",
        databaseWrite: "unverified",
        projectRef: "project-ref",
        checkedAt: "2026-07-21T00:00:00.000Z",
        issue: null,
        accessToken: "management-token",
        rawResponse: { api_key: "sb_secret_probe" },
      }).success,
    ).toBe(false);
  });
});
