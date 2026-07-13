import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthorized: vi.fn(),
  providerFetch: vi.fn(),
}));

vi.mock("@/features/integrations/server/provider-client", () => ({
  getAuthorizedProjectIntegration: mocks.getAuthorized,
  providerFetch: mocks.providerFetch,
}));

import { publishGitHubBundle } from "@/features/integrations/server/github";
import { deployVercelBundle } from "@/features/integrations/server/vercel";
import { buildExportBundle } from "@/lib/export-bundle";

const bundle = buildExportBundle([
  {
    path: "App.tsx",
    language: "tsx",
    code: "export default function App() { return <main>Hello</main>; }",
  },
]);

describe("integration provider actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthorized.mockResolvedValue({
      accessToken: "provider-token",
      metadata: { teamId: "team_1" },
    });
  });

  it("publishes a verified bundle to a non-force GitHub branch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = String(input);
        if (url.includes("heads/main")) {
          return Response.json({ object: { sha: "parent-sha" } });
        }
        return new Response(null, { status: 404 });
      }),
    );
    let blobCount = 0;
    mocks.providerFetch.mockImplementation(
      async (
        _provider: string,
        _token: string,
        url: string,
        init?: RequestInit,
      ) => {
        if (!init?.method && /\/repos\/owner\/repo$/.test(url)) {
          return { default_branch: "main" };
        }
        if (!init?.method && url.includes("/git/commits/parent-sha")) {
          return { tree: { sha: "base-tree" } };
        }
        if (url.endsWith("/git/blobs")) return { sha: `blob-${++blobCount}` };
        if (url.endsWith("/git/trees")) return { sha: "tree-sha" };
        if (url.endsWith("/git/commits")) return { sha: "commit-sha" };
        if (url.endsWith("/git/refs"))
          return { ref: "refs/heads/squid/generated" };
        throw new Error(`Unexpected GitHub request: ${url}`);
      },
    );

    const result = await publishGitHubBundle({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
      repository: "owner/repo",
      branch: "squid/generated",
      bundle,
    });

    expect(result.commitSha).toBe("commit-sha");
    const refRequest = mocks.providerFetch.mock.calls.find((call) =>
      String(call[2]).endsWith("/git/refs"),
    );
    expect(JSON.parse(String(refRequest?.[3]?.body))).toEqual({
      ref: "refs/heads/squid/generated",
      sha: "commit-sha",
    });
  });

  it("creates a team-scoped Vercel deployment from the export bundle", async () => {
    mocks.providerFetch.mockImplementation(
      async (_provider: string, _token: string, url: string) =>
        url.includes("/v13/deployments")
          ? {
              id: "dpl_1",
              url: "preview.example.vercel.app",
              readyState: "QUEUED",
            }
          : {},
    );
    const result = await deployVercelBundle({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
      vercelProjectId: "prj_1",
      target: "preview",
      bundle,
    });

    expect(result.externalId).toBe("dpl_1");
    const deploymentCall = mocks.providerFetch.mock.calls.find((call) =>
      String(call[2]).includes("/v13/deployments"),
    )!;
    expect(String(deploymentCall[2])).toContain("teamId=team_1");
    const requestBody = JSON.parse(String(deploymentCall[3].body));
    expect(requestBody.project).toBe("prj_1");
    expect(requestBody.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ file: "App.tsx", sha: expect.any(String) }),
      ]),
    );
    expect(
      mocks.providerFetch.mock.calls.some((call) =>
        String(call[2]).includes("/v2/now/files"),
      ),
    ).toBe(true);
  });
});
