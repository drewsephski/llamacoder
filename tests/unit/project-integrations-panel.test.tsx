// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProjectIntegrationsPanel } from "@/features/integrations/components/project-integrations-panel";

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPanel(triggerPlacement?: "toolbar" | "composer") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectIntegrationsPanel
        projectId="project_1"
        triggerPlacement={triggerPlacement}
      />
    </QueryClientProvider>,
  );
}

describe("project integrations panel", () => {
  it("supports an API trigger inside the chat composer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              providers: [],
              integrations: [],
              recentOperations: [],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );

    renderPanel("composer");
    await userEvent.click(
      screen.getByRole("button", { name: "Choose APIs for this app" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Project integrations" }),
    ).toBeInTheDocument();
  });

  it("lets users search reviewed APIs and explains how the AI will use them", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              providers: [
                {
                  id: "frankfurter",
                  name: "Frankfurter",
                  category: "data",
                  description: "Daily central-bank exchange rates.",
                  capabilities: ["exchange rates", "currency conversion"],
                  auth: "none",
                  runtime: "browser",
                  policyStatus: "approved",
                  commercialUse: "review_required",
                  docsUrl: "https://frankfurter.dev/",
                  guidance: "Show the rate date and identify reference rates.",
                  attribution:
                    "Rates are sourced from central-bank reference data.",
                  limits: "Cache rates according to their update cadence.",
                  exampleEndpoint:
                    "https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR",
                  verifiedAt: "2026-07-13",
                  setup: "instant",
                  healthCheckAvailable: true,
                  credentialKind: null,
                  oauthAvailable: false,
                },
              ],
              integrations: [],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );

    renderPanel();
    await userEvent.click(
      screen.getByRole("button", { name: /integrations/i }),
    );
    const search = await screen.findByRole("textbox", { name: "Search APIs" });
    await userEvent.type(search, "currency");
    await userEvent.click(screen.getByRole("button", { name: /Frankfurter/i }));

    expect(screen.getByText("Works instantly")).toBeInTheDocument();
    expect(
      screen.getByText("Show the rate date and identify reference rates."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Use in this app" }),
    ).toBeEnabled();
    expect(
      screen.getByText(/Your choices become project context/),
    ).toBeInTheDocument();
  });

  it("shows environment isolation and connection readiness", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              providers: [
                {
                  id: "stripe",
                  name: "Stripe",
                  category: "commerce",
                  description: "Payments and subscriptions.",
                  capabilities: ["payments", "subscriptions"],
                  auth: "secret",
                  runtime: "server",
                  policyStatus: "conditional",
                  commercialUse: "allowed",
                  docsUrl: "https://docs.stripe.com/",
                  guidance: "Use server-created Checkout Sessions.",
                  attribution: null,
                  limits: "Plan limits apply.",
                  exampleEndpoint:
                    "https://api.stripe.com/v1/checkout/sessions",
                  verifiedAt: "2026-07-13",
                  setup: "api_key",
                  healthCheckAvailable: true,
                  credentialKind: "api_key",
                  oauthAvailable: false,
                },
              ],
              integrations: [
                {
                  id: "binding_1",
                  projectId: "project_1",
                  providerId: "stripe",
                  environment: "development",
                  status: "ready",
                  createdAt: "2026-07-11T00:00:00.000Z",
                  updatedAt: "2026-07-11T00:00:00.000Z",
                  connection: {
                    id: "connection_1",
                    displayName: "Stripe sandbox",
                    authType: "secret",
                    status: "ready",
                    hasCredential: true,
                    lastHealthStatus: "healthy",
                    lastHealthMessage:
                      "Provider accepted the configured credential.",
                    lastHealthCheckAt: "2026-07-11T00:00:00.000Z",
                  },
                },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );

    renderPanel();
    await userEvent.click(
      screen.getByRole("button", { name: /integrations/i }),
    );

    expect(
      await screen.findByText(
        "Production credentials stay separate from development.",
      ),
    ).toBeInTheDocument();
    expect(await screen.findByText("Stripe sandbox")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Test" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Configure" }),
    ).toBeInTheDocument();
  });

  it("keeps OAuth authorization available for an empty binding", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              providers: [
                {
                  id: "github",
                  name: "GitHub",
                  category: "developer",
                  description: "Repositories and source sync.",
                  capabilities: ["repositories"],
                  auth: "oauth",
                  runtime: "server",
                  policyStatus: "approved",
                  commercialUse: "allowed",
                  docsUrl: "https://docs.github.com/",
                  guidance: "Use a GitHub App for repository access.",
                  attribution: null,
                  limits: "Rate limits apply.",
                  exampleEndpoint: "https://api.github.com/user",
                  verifiedAt: "2026-07-13",
                  setup: "oauth",
                  healthCheckAvailable: true,
                  credentialKind: "access_token",
                  oauthAvailable: true,
                },
              ],
              integrations: [
                {
                  id: "binding_1",
                  projectId: "project_1",
                  providerId: "github",
                  environment: "development",
                  status: "authorization_required",
                  createdAt: "2026-07-12T00:00:00.000Z",
                  updatedAt: "2026-07-12T00:00:00.000Z",
                  connection: {
                    id: "connection_1",
                    displayName: "GitHub",
                    authType: "oauth",
                    status: "authorization_required",
                    hasCredential: false,
                    lastHealthStatus: null,
                    lastHealthMessage: null,
                    lastHealthCheckAt: null,
                  },
                },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );

    renderPanel();
    await userEvent.click(
      screen.getByRole("button", { name: /integrations/i }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Configure" }),
    );

    expect(
      screen.getByRole("link", { name: "Connect with GitHub" }),
    ).toHaveAttribute(
      "href",
      "/api/integrations/oauth/github/start?projectId=project_1&environment=development",
    );
  });
});
