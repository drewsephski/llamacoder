import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authGetSessionMock } = vi.hoisted(() => ({
  authGetSessionMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: authGetSessionMock } },
}));

vi.mock("@/lib/billing", () => ({
  FREE_PROJECT_LIMIT: 3,
  hasModelPricing: (modelId: string) =>
    modelId === "google/gemini-3-flash-preview",
  getModelCreditHoldCost: () => 1,
  checkProjectCreationEligibility: vi.fn(),
}));

import { GET } from "@/app/api/user/can-create-project/route";

describe("can-create-project route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authGetSessionMock.mockResolvedValue(null);
  });

  it("returns 400 for unknown models", async () => {
    const response = await GET(
      new NextRequest(
        "https://example.com/api/user/can-create-project?model=not-a-real-model",
      ),
    );

    expect(response.status).toBe(400);
  });
});
