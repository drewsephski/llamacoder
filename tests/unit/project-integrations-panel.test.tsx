// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProjectIntegrationsPanel } from "@/features/integrations/components/project-integrations-panel";
import { getAuthenticatedTasksBackendPlan } from "@/features/integrations/supabase-backend";

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPanel(
  triggerPlacement?: "toolbar" | "composer" | "backend-setup",
) {
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

  it("supports a focused Supabase trigger from the direct-build handoff", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          providers: [],
          integrations: [],
          recentOperations: [],
        }),
      ),
    );

    renderPanel("backend-setup");
    await userEvent.click(
      screen.getByRole("button", { name: "Set up Supabase" }),
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

  it("shows the current Supabase provisioning phase", async () => {
    const operation = {
      id: "operation_1",
      projectIntegrationId: "binding_1",
      providerId: "supabase",
      kind: "supabase_provision",
      status: "running",
      phase: "waiting_for_supabase",
      externalId: "project-ref",
      url: "https://project-ref.supabase.co",
      commitSha: null,
      errorMessage: null,
      createdAt: "2026-07-21T00:00:00.000Z",
      completedAt: null,
    };
    const workspace = {
      providers: [
        {
          id: "supabase",
          name: "Supabase",
          category: "backend",
          description: "Postgres, auth, and browser-safe data APIs.",
          capabilities: ["database"],
          auth: "oauth",
          runtime: "server",
          policyStatus: "conditional",
          commercialUse: "allowed",
          docsUrl: "https://supabase.com/docs",
          guidance: "Use browser-safe keys with RLS.",
          attribution: null,
          limits: "Provider limits apply.",
          exampleEndpoint: "https://api.supabase.com/v1/projects",
          verifiedAt: "2026-07-21",
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
          providerId: "supabase",
          environment: "development",
          status: "ready",
          config: {
            supabaseProjectRef: "project-ref",
            supabaseProjectUrl: "https://project-ref.supabase.co",
          },
          createdAt: "2026-07-21T00:00:00.000Z",
          updatedAt: "2026-07-21T00:00:00.000Z",
          connection: {
            id: "connection_1",
            displayName: "Supabase",
            authType: "oauth",
            status: "ready",
            hasCredential: true,
            lastHealthStatus: "healthy",
            lastHealthMessage: "Supabase connection is healthy.",
            lastHealthCheckAt: "2026-07-21T00:00:00.000Z",
          },
        },
      ],
      recentOperations: [operation],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        const body = url.includes("operationId=")
          ? { operation }
          : url.endsWith("/resources")
            ? { resources: [] }
            : workspace;
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    renderPanel();
    await userEvent.click(
      screen.getByRole("button", { name: /integrations/i }),
    );

    expect(
      (await screen.findAllByText("Waiting for Supabase")).length,
    ).toBeGreaterThan(0);
  });

  it("shows the constrained backend approval card and sends no SQL", async () => {
    const plan = getAuthenticatedTasksBackendPlan();
    const requests: Array<{ url: string; body: string | null }> = [];
    const workspace = {
      providers: [],
      integrations: [
        {
          id: "binding_1",
          projectId: "project_1",
          providerId: "supabase",
          environment: "development",
          status: "ready",
          config: {
            supabaseProjectRef: "project-ref",
            supabaseProjectUrl: "https://project-ref.supabase.co",
            supabasePublishableKey: "sb_publishable_project",
          },
          supabaseBackend: { status: "approval_required", plan },
          createdAt: "2026-07-21T00:00:00.000Z",
          updatedAt: "2026-07-21T00:00:00.000Z",
          connection: {
            id: "connection_1",
            displayName: "Supabase",
            authType: "oauth",
            status: "ready",
            hasCredential: true,
            lastHealthStatus: "healthy",
            lastHealthMessage: "Supabase connection is healthy.",
            lastHealthCheckAt: "2026-07-21T00:00:00.000Z",
          },
        },
      ],
      recentOperations: [],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        requests.push({
          url,
          body: typeof init?.body === "string" ? init.body : null,
        });
        const body =
          init?.method === "POST"
            ? {
                operation: {
                  id: "operation_1",
                  projectIntegrationId: "binding_1",
                  providerId: "supabase",
                  kind: "supabase_backend_migration",
                  status: "succeeded",
                  phase: "ready",
                  externalId: "migration-id",
                  url: null,
                  commitSha: null,
                  errorMessage: null,
                  createdAt: "2026-07-21T00:00:00.000Z",
                  completedAt: "2026-07-21T00:00:01.000Z",
                },
              }
            : url.endsWith("/resources")
              ? { resources: [] }
              : workspace;
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    renderPanel();
    await userEvent.click(
      screen.getByRole("button", { name: /integrations/i }),
    );

    expect(
      await screen.findByText("Backend approval required"),
    ).toBeInTheDocument();
    expect(screen.getByText("Creates the tasks table")).toBeInTheDocument();
    expect(screen.getByText("Enables row-level security")).toBeInTheDocument();
    expect(
      screen.getByText("Allows users to access only their own tasks"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Makes no destructive changes"),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Approve backend" }),
    );
    const approvalRequest = requests.find((request) =>
      request.body?.includes("supabase_apply_backend"),
    );
    expect(approvalRequest).toBeDefined();
    expect(JSON.parse(approvalRequest!.body!)).toEqual({
      action: "supabase_apply_backend",
      plan,
      approval: { approved: true },
    });
    expect(approvalRequest!.body).not.toMatch(
      /create table|management-token|service_role|sb_secret_/i,
    );
  });

  it("lets a connected account bind an existing Supabase project", async () => {
    const requests: Array<{ url: string; body: string | null }> = [];
    const workspace = {
      providers: [],
      integrations: [
        {
          id: "binding_1",
          projectId: "project_1",
          providerId: "supabase",
          environment: "development",
          status: "ready",
          config: {},
          createdAt: "2026-07-21T00:00:00.000Z",
          updatedAt: "2026-07-21T00:00:00.000Z",
          connection: {
            id: "connection_1",
            displayName: "Supabase",
            authType: "oauth",
            status: "ready",
            hasCredential: true,
            lastHealthStatus: "healthy",
            lastHealthMessage: "Supabase connection is healthy.",
            lastHealthCheckAt: "2026-07-21T00:00:00.000Z",
          },
        },
      ],
      recentOperations: [],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        requests.push({
          url,
          body: typeof init?.body === "string" ? init.body : null,
        });
        const body =
          init?.method === "POST"
            ? {
                operation: {
                  id: "operation_1",
                  projectIntegrationId: "binding_1",
                  providerId: "supabase",
                  kind: "supabase_bind_project",
                  status: "succeeded",
                  phase: "ready",
                  externalId: "existing-ref",
                  url: "https://existing-ref.supabase.co",
                  commitSha: null,
                  errorMessage: null,
                  createdAt: "2026-07-21T00:00:00.000Z",
                  completedAt: "2026-07-21T00:00:01.000Z",
                },
              }
            : url.includes("type=projects")
              ? {
                  resources: [
                    {
                      id: "existing-ref",
                      name: "Existing Tasks",
                      owner: "org_1",
                    },
                  ],
                }
              : url.includes("type=organizations")
                ? { resources: [{ id: "org_1", name: "Acme" }] }
                : workspace;
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );

    renderPanel();
    await userEvent.click(
      screen.getByRole("button", { name: /integrations/i }),
    );
    expect(await screen.findByText("Existing Tasks")).toBeInTheDocument();
    expect(
      screen.getByText(/Prototype\/demo — instant signup/),
    ).toBeInTheDocument();
    expect(screen.getByText("Recommended for testing")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Connect Supabase project" }),
    );

    const bindingRequest = requests.find((request) =>
      request.body?.includes("supabase_bind_project"),
    );
    expect(JSON.parse(bindingRequest!.body!)).toEqual({
      action: "supabase_bind_project",
      authMode: "prototype_instant_signup",
      authModeApproval: { approved: true },
      projectRef: "existing-ref",
    });
    expect(bindingRequest!.body).not.toMatch(
      /management-token|refresh-token|service_role|sb_secret_/i,
    );
  });
});
