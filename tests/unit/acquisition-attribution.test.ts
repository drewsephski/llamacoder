import { describe, expect, it } from "vitest";

import {
  acquisitionChatFields,
  readAcquisitionAttribution,
} from "@/features/acquisition/contracts";

describe("acquisition attribution", () => {
  it("captures a bounded first-touch payload from campaign links", () => {
    const attribution = readAcquisitionAttribution({
      url: new URL(
        "https://www.squidagent.app/design-partners?utm_source=linkedin&utm_medium=founder_outreach&utm_campaign=design_partners_2026_08&utm_content=agency_owner",
      ),
      referrer: "https://www.linkedin.com/feed/",
    });

    expect(attribution).toEqual({
      source: "linkedin",
      medium: "founder_outreach",
      campaign: "design_partners_2026_08",
      content: "agency_owner",
      term: undefined,
      referrer: "https://www.linkedin.com/feed/",
      landingPath: "/design-partners",
    });
  });

  it("retains the existing internal source query contract", () => {
    expect(
      readAcquisitionAttribution({
        url: new URL("https://www.squidagent.app/?source=%2Fexample"),
      })?.source,
    ).toBe("/example");
  });

  it("maps attribution into persistence fields without inventing values", () => {
    expect(acquisitionChatFields({ source: "x", landingPath: "/" })).toEqual({
      acquisitionSource: "x",
      acquisitionMedium: undefined,
      acquisitionCampaign: undefined,
      acquisitionContent: undefined,
      acquisitionTerm: undefined,
      acquisitionReferrer: undefined,
      acquisitionLandingPath: "/",
    });
  });
});
