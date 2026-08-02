import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumeRateLimit: vi.fn(),
  submitDesignPartnerApplication: vi.fn(),
  scheduleDesignPartnerNotification: vi.fn(),
}));

vi.mock("@/features/security/server/rate-limit", () => ({
  consumeRateLimit: mocks.consumeRateLimit,
}));
vi.mock("@/features/design-partners/server/applications", () => ({
  submitDesignPartnerApplication: mocks.submitDesignPartnerApplication,
}));
vi.mock("@/features/design-partners/server/notification", () => ({
  scheduleDesignPartnerNotification: mocks.scheduleDesignPartnerNotification,
}));

import { POST } from "@/app/api/design-partners/route";

const validBody = {
  name: "Avery Morgan",
  email: "avery@example.com",
  role: "freelance_designer",
  companyName: "Morgan Product Studio",
  portfolioUrl: "https://example.com/work",
  projectSummary:
    "I need a reviewable React prototype for a client onboarding workflow before our next stakeholder session.",
  timeline: "this_month",
  preferredContact: "email",
  permissionToContact: true,
  website: "",
};

function request(body: unknown = validBody) {
  return new NextRequest("http://localhost/api/design-partners", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "203.0.113.10",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/design-partners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consumeRateLimit.mockResolvedValue({ allowed: true, remaining: 4 });
    mocks.submitDesignPartnerApplication.mockResolvedValue({
      id: "application_1",
      created: true,
    });
  });

  it("validates and schedules a new application notification", async () => {
    const response = await POST(request());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ status: "received" });
    expect(mocks.consumeRateLimit).toHaveBeenCalledWith({
      userId: "design-partner:203.0.113.10",
      operation: "design_partner",
      limit: 5,
      windowMs: 3_600_000,
    });
    expect(mocks.submitDesignPartnerApplication).toHaveBeenCalledOnce();
    expect(mocks.scheduleDesignPartnerNotification).toHaveBeenCalledWith(
      "application_1",
    );
  });

  it("does not notify again for a recent duplicate", async () => {
    mocks.submitDesignPartnerApplication.mockResolvedValue({
      id: "application_existing",
      created: false,
    });

    const response = await POST(request());

    expect(response.status).toBe(201);
    expect(mocks.scheduleDesignPartnerNotification).not.toHaveBeenCalled();
  });

  it("rejects incomplete applications", async () => {
    const response = await POST(
      request({ ...validBody, projectSummary: "Need an app." }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      message:
        "Some details need your attention. Review the fields marked below.",
      issues: {
        projectSummary: ["Add a little more detail, at least 40 characters."],
      },
    });
    expect(mocks.submitDesignPartnerApplication).not.toHaveBeenCalled();
  });

  it("returns a retry window when rate limited", async () => {
    mocks.consumeRateLimit.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 120,
    });

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("120");
  });
});
