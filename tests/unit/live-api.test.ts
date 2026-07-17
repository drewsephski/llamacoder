import { describe, expect, it } from "vitest";

import {
  buildLiveApiGenerationContract,
  detectLiveApiIntent,
} from "@/features/generation/live-api";

describe("live API intent", () => {
  it.each([
    "Show current UFC rankings",
    "Build a weather forecast app",
    "Load products from https://example.com/products.json",
  ])("detects safe live-data candidates: %s", (content) => {
    expect(detectLiveApiIntent(content)).toMatchObject({
      required: true,
      kind: "public_candidate",
    });
  });

  it.each([
    "Send this contact form by email",
    "Save user projects to a database",
    "Add Stripe checkout and webhooks",
  ])("routes secret or side-effect integrations to a server: %s", (content) => {
    const intent = detectLiveApiIntent(content);
    expect(intent).toMatchObject({ required: true, kind: "server_required" });
    expect(buildLiveApiGenerationContract(intent)).toContain(
      "server-side integration",
    );
  });

  it.each(["Build a calculator", "Make a portfolio", "Design a landing page"])(
    "does not invent an API requirement: %s",
    (content) => {
      expect(detectLiveApiIntent(content)).toEqual({
        required: false,
        kind: "none",
        reason: null,
      });
    },
  );

  it.each([
    "Build me a website like https://squidagent.app",
    "Recreate the design from https://example.com/landing-page",
    "Summarize https://example.com/company/about",
  ])("does not treat an ordinary webpage URL as a live API: %s", (content) => {
    expect(detectLiveApiIntent(content)).toEqual({
      required: false,
      kind: "none",
      reason: null,
    });
  });

  it.each([
    "Build a flight tracker using the API at https://developer.example.com/docs",
    "Fetch records from https://api.example.com/v2/records",
    "Load data from https://example.com/products.json",
  ])("still detects explicit or API-shaped URL integrations: %s", (content) => {
    expect(detectLiveApiIntent(content)).toMatchObject({
      required: true,
      kind: "public_candidate",
    });
  });

  it("does not treat product subject matter as requested webhook behavior", () => {
    const intent = detectLiveApiIntent(
      "Build a product landing page for Relay, a hosted webhook debugging tool that captures, inspects, replays, and shares webhook events.",
    );

    expect(intent).toEqual({
      required: false,
      kind: "none",
      reason: null,
    });
  });

  it.each([
    ["Add a webhook receiver to this landing page", "server_required"],
    ["Build a landing page and integrate Stripe checkout", "server_required"],
    ["Build a landing page that shows live weather data", "public_candidate"],
  ] as const)(
    "still detects concrete external behavior in presentational projects: %s",
    (content, kind) => {
      expect(detectLiveApiIntent(content)).toMatchObject({
        required: true,
        kind,
      });
    },
  );

  it("requires unit-safe live API generation", () => {
    const contract = buildLiveApiGenerationContract(
      detectLiveApiIntent("Build a live weather dashboard"),
    );
    expect(contract).toContain("normalize values explicitly");
    expect(contract).toContain("Celsius/Fahrenheit");
  });

  it("adds reviewed provider policy to the generation contract", () => {
    const contract = buildLiveApiGenerationContract(
      detectLiveApiIntent("Build a weather dashboard"),
      "Build a weather dashboard with Open-Meteo",
    );

    expect(contract).toContain("SQUID INTEGRATION REGISTRY");
    expect(contract).toContain("open-meteo");
    expect(contract).toContain("commercialUse=restricted");
  });

  it("prevents automatically generating a blocked provider", () => {
    const contract = buildLiveApiGenerationContract(
      detectLiveApiIntent("Use a maps API"),
      "Use https://nominatim.openstreetmap.org for place search",
    );

    expect(contract).toContain("nominatim-public");
    expect(contract).toContain("policy=blocked");
    expect(contract).toContain("do not generate the integration");
  });
});
