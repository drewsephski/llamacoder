import { describe, expect, it } from "vitest";

import { designPartnerApplicationSchema } from "@/features/design-partners/contracts";

const validApplication = {
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

describe("design partner application schema", () => {
  it("accepts a specific, contactable application", () => {
    expect(
      designPartnerApplicationSchema.parse(validApplication),
    ).toMatchObject({ email: "avery@example.com", permissionToContact: true });
  });

  it("rejects vague project descriptions", () => {
    expect(
      designPartnerApplicationSchema.safeParse({
        ...validApplication,
        projectSummary: "Need an app.",
      }).success,
    ).toBe(false);
  });

  it("rejects submissions without contact permission", () => {
    expect(
      designPartnerApplicationSchema.safeParse({
        ...validApplication,
        permissionToContact: false,
      }).success,
    ).toBe(false);
  });
});
