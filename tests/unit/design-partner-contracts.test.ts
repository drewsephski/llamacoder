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

  it("returns helpful messages for an empty application", () => {
    const result = designPartnerApplicationSchema.safeParse({
      name: "",
      email: "",
      role: "",
      companyName: "",
      portfolioUrl: "",
      projectSummary: "",
      timeline: "",
      preferredContact: "",
      permissionToContact: false,
      website: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.flatten().fieldErrors).toMatchObject({
      name: ["Name must be at least 2 characters."],
      email: ["Enter a valid email address."],
      role: ["Choose your role."],
      projectSummary: ["Add a little more detail, at least 40 characters."],
      timeline: ["Choose the project timing."],
      preferredContact: ["Choose how you would like us to reply."],
      permissionToContact: [
        "Confirm that we may contact you about this application.",
      ],
    });
  });
});
