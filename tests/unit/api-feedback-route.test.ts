import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentSession: vi.fn(),
  consumeRateLimit: vi.fn(),
  submitResearchFeedback: vi.fn(),
  scheduleResearchFeedbackDelivery: vi.fn(),
}));

vi.mock("@/features/auth/server/session", () => ({
  getCurrentSession: mocks.getCurrentSession,
}));
vi.mock("@/features/security/server/rate-limit", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
}));
vi.mock("@/features/feedback/server/program", () => ({
  submitResearchFeedback: mocks.submitResearchFeedback,
}));
vi.mock("@/features/feedback/server/delivery", () => ({
  scheduleResearchFeedbackDelivery: mocks.scheduleResearchFeedbackDelivery,
}));

import { POST } from "@/app/api/feedback/route";

const validBody = {
  projectId: "project_1",
  buildGoal: "I was building a launch page for a new developer tool.",
  previousTools: "I previously used an IDE and a static site template.",
  frustration:
    "The first preview did not explain why one of the interactions failed.",
  betterThanExpected:
    "The generated visual hierarchy was much stronger than expected.",
  abandonmentPoint:
    "I nearly stopped after the second edit changed an unrelated section.",
  launchBlocker:
    "The export still needed a reliable mobile navigation interaction.",
  singleImprovement:
    "Make follow-up edits stay tightly scoped to the requested component.",
  paymentIntent: "maybe",
  monthlyPriceUsd: 20,
  followUpConsent: true,
  mediaUrl: "",
  honestyConfirmed: true,
};

function request(body: unknown = validBody) {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.consumeRateLimit.mockResolvedValue({ allowed: true, remaining: 2 });
    mocks.submitResearchFeedback.mockResolvedValue({
      success: true,
      submissionId: "feedback_1",
    });
  });

  it("requires authentication before parsing or rate limiting", async () => {
    mocks.getCurrentSession.mockResolvedValue(null);
    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(mocks.consumeRateLimit).not.toHaveBeenCalled();
    expect(mocks.submitResearchFeedback).not.toHaveBeenCalled();
  });

  it("rejects generic incomplete responses before persistence", async () => {
    const response = await POST(
      request({ ...validBody, launchBlocker: "bad" }),
    );
    const body = (await response.json()) as {
      issues?: Record<string, string[]>;
    };

    expect(response.status).toBe(400);
    expect(body.issues?.launchBlocker).toBeDefined();
    expect(mocks.submitResearchFeedback).not.toHaveBeenCalled();
  });

  it("queues valid feedback for manual review", async () => {
    const response = await POST(request());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      submissionId: "feedback_1",
      status: "pending",
    });
    expect(mocks.consumeRateLimit).toHaveBeenCalledWith({
      userId: "user_1",
      operation: "feedback",
      limit: 3,
      windowMs: 3_600_000,
    });
    expect(mocks.submitResearchFeedback).toHaveBeenCalledWith({
      userId: "user_1",
      input: expect.objectContaining({ projectId: "project_1" }),
    });
    expect(mocks.scheduleResearchFeedbackDelivery).toHaveBeenCalledWith(
      "feedback_1",
    );
  });

  it("keeps one-reward policy server-authoritative", async () => {
    mocks.submitResearchFeedback.mockResolvedValue({
      success: false,
      code: "ALREADY_SUBMITTED",
    });
    const response = await POST(request());

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      message: expect.stringContaining("already submitted"),
    });
  });
});
