import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  consumeRateLimit: vi.fn(),
  getIntegrationWorkspace: vi.fn(),
  createProjectIntegration: vi.fn(),
  testProjectIntegration: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("@/features/security/server/rate-limit", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
}));
vi.mock("@/features/integrations/server/service", () => {
  class IntegrationServiceError extends Error {
    constructor(
      public readonly code: string,
      message: string,
      public readonly status: number,
    ) {
      super(message);
    }
  }
  return {
    IntegrationServiceError,
    getIntegrationWorkspace: mocks.getIntegrationWorkspace,
    createProjectIntegration: mocks.createProjectIntegration,
    testProjectIntegration: mocks.testProjectIntegration,
  };
});

import { GET, POST } from "@/app/api/projects/[projectId]/integrations/route";

const context = { params: Promise.resolve({ projectId: "project_1" }) };

describe("project integrations route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consumeRateLimit.mockResolvedValue({ allowed: true, remaining: 29 });
  });

  it("requires authentication", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await GET(
      new Request(
        "http://localhost/api/projects/project_1/integrations",
      ) as never,
      context,
    );

    expect(response.status).toBe(401);
  });

  it("loads only the authenticated user's project workspace", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.getIntegrationWorkspace.mockResolvedValue({
      providers: [],
      integrations: [],
    });
    const response = await GET(
      new Request(
        "http://localhost/api/projects/project_1/integrations",
      ) as never,
      context,
    );

    expect(response.status).toBe(200);
    expect(mocks.getIntegrationWorkspace).toHaveBeenCalledWith({
      projectId: "project_1",
      userId: "user_1",
    });
  });

  it("validates and rate-limits connection creation", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "user_1" } });
    const invalidResponse = await POST(
      new Request("http://localhost/api/projects/project_1/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: "stripe" }),
      }) as never,
      context,
    );
    expect(invalidResponse.status).toBe(400);

    mocks.consumeRateLimit.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 12,
    });
    const limitedResponse = await POST(
      new Request("http://localhost/api/projects/project_1/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: "stripe",
          environment: "development",
        }),
      }) as never,
      context,
    );
    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.headers.get("Retry-After")).toBe("12");
  });

  it("runs a live contract check when a no-key API is selected", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.createProjectIntegration.mockResolvedValue({ id: "binding_1" });
    mocks.testProjectIntegration.mockResolvedValue({
      id: "binding_1",
      status: "ready",
    });

    const response = await POST(
      new Request("http://localhost/api/projects/project_1/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: "frankfurter",
          environment: "development",
        }),
      }) as never,
      context,
    );

    expect(response.status).toBe(201);
    expect(mocks.testProjectIntegration).toHaveBeenCalledWith({
      projectId: "project_1",
      bindingId: "binding_1",
      userId: "user_1",
    });
    await expect(response.json()).resolves.toMatchObject({
      integration: { status: "ready" },
    });
  });
});
