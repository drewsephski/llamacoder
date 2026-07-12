// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProjectIntegrationsPanel } from "@/features/integrations/components/project-integrations-panel";

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectIntegrationsPanel projectId="project_1" />
    </QueryClientProvider>,
  );
}

describe("project integrations panel", () => {
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
                  capabilities: ["payments", "subscriptions"],
                  auth: "secret",
                  runtime: "server",
                  policyStatus: "conditional",
                  commercialUse: "allowed",
                  docsUrl: "https://docs.stripe.com/",
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
});
