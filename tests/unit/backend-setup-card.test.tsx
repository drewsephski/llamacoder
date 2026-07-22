// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BackendSetupCard } from "@/app/(main)/chats/[id]/agent-interactions";
import type { BackendSetupRequest } from "@/features/generation/agent-contracts";

vi.mock(
  "@/features/integrations/components/project-integrations-panel",
  () => ({
    ProjectIntegrationsPanel: () => (
      <button type="button">Open advanced setup</button>
    ),
  }),
);

const request: BackendSetupRequest = {
  id: "backend-setup-message_1",
  title: "Connect a backend before Squid builds",
  description:
    "This app needs accounts and saved data. Connect Supabase before code generation.",
  capabilities: [
    "Persistent data across refreshes and devices",
    "Browser-safe Supabase runtime configuration",
    "Server-approved database and security setup",
  ],
  requirements: {
    database: true,
    authentication: true,
    storage: false,
    realtime: false,
    privilegedServerLogic: false,
    backendTemplate: "authenticated_tasks",
  },
  continuation: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    originalMessageId: "message_1",
    originalUserRequest: "Build a private task manager",
    mode: "direct",
    status: "pending",
  },
};

function renderCard(
  props: Partial<React.ComponentProps<typeof BackendSetupCard>> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const onRespond = vi.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <BackendSetupCard
        projectId="project_1"
        request={request}
        onRespond={onRespond}
        {...props}
      />
    </QueryClientProvider>,
  );
  return onRespond;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("direct backend setup card", () => {
  it("offers focused setup actions instead of a question flow", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          interactionId: request.id,
          state: "connection_required",
          requirements: request.requirements,
          continuationStatus: "pending",
          bindingId: null,
          operation: null,
          authMode: null,
          backendPlan: null,
          message:
            "This app needs a backend to securely save data across devices.",
        }),
      ),
    );
    const onRespond = renderCard();

    expect(
      screen.getByRole("heading", {
        name: "Connect a backend before Squid builds",
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Set up Supabase" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Build UI only" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/choose the decisions/i)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Build UI only" }),
    );
    expect(onRespond).toHaveBeenCalledWith(request, "build_ui_only");
  });

  it("starts exactly one isolated OAuth popup without navigating the chat", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          interactionId: request.id,
          state: "connection_required",
          requirements: request.requirements,
          continuationStatus: "pending",
          bindingId: null,
          operation: null,
          authMode: null,
          backendPlan: null,
          message:
            "This app needs a backend to securely save data across devices.",
        }),
      ),
    );
    const replace = vi.fn();
    const popup = {
      opener: window,
      location: { replace },
    } as unknown as Window;
    const open = vi.spyOn(window, "open").mockReturnValue(popup);
    renderCard();

    await userEvent.click(
      await screen.findByRole("button", { name: "Set up Supabase" }),
    );

    expect(open).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(
      "about:blank",
      "squid-supabase-oauth",
      "popup,width=720,height=760",
    );
    expect(popup.opener).toBeNull();
    expect(replace).toHaveBeenCalledWith(
      expect.stringContaining(
        `interactionId=${encodeURIComponent(request.id)}`,
      ),
    );
  });

  it("summarizes the completed UI-only choice without refetching", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderCard({
      response: {
        kind: "agent_backend_setup_response",
        requestId: request.id,
        decision: "build_ui_only",
      },
    });

    expect(screen.getByText("UI-only build selected")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders provisioning progress in the original card", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          interactionId: request.id,
          state: "provisioning",
          requirements: request.requirements,
          continuationStatus: "pending",
          bindingId: "binding_1",
          operation: {
            id: "operation_1",
            kind: "supabase_provision",
            status: "running",
            phase: "waiting_for_supabase",
            errorMessage: null,
          },
          authMode: null,
          backendPlan: null,
          message: "Supabase is creating and connecting your project.",
        }),
      ),
    );
    renderCard();

    expect(await screen.findByText("Creating project")).toBeInTheDocument();
    expect(screen.getByText("Waiting for Supabase")).toBeInTheDocument();
    expect(screen.getByText("Connecting the preview")).toBeInTheDocument();
  });

  it("selects an Auth mode inline with explicit approval", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === "POST") {
          return Response.json({
            operation: {
              id: "operation_auth",
              projectIntegrationId: "binding_1",
              providerId: "supabase",
              kind: "supabase_configure_auth_mode",
              status: "succeeded",
              phase: "ready",
              externalId: "project-ref",
              url: null,
              commitSha: null,
              errorMessage: null,
              createdAt: new Date(0).toISOString(),
              completedAt: new Date(0).toISOString(),
            },
          });
        }
        return Response.json({
          interactionId: request.id,
          state: "auth_mode_required",
          requirements: request.requirements,
          continuationStatus: "pending",
          bindingId: "binding_1",
          operation: null,
          authMode: null,
          backendPlan: null,
          message: "Choose how new users should sign up.",
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    renderCard();

    expect(
      await screen.findByRole("radio", { name: /instant signup/i }),
    ).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Recommended for testing")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Approve instant signup" }),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/supabase-setup/"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            action: "configure_auth_mode",
            mode: "prototype_instant_signup",
            approval: { approved: true },
          }),
        }),
      ),
    );
  });

  it("automatically resumes a ready continuation exactly once", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          interactionId: request.id,
          state: "ready",
          requirements: request.requirements,
          continuationStatus: "pending",
          bindingId: "binding_1",
          operation: null,
          authMode: "verified_email",
          backendPlan: {
            version: 1,
            template: "authenticated_tasks",
            summary:
              "Create a tasks table protected by row-level security so signed-in users can access only their own tasks.",
            migrationChecksum:
              "a8a8eb095fe82a3583589d8c5d43c54a35ad6d887be06e77c91ad2cfff5eba99",
            destructive: false,
          },
          message:
            "Supabase is ready. Squid can now build authentication and persistent task data.",
        }),
      ),
    );
    const onRespond = renderCard();

    await waitFor(() =>
      expect(onRespond).toHaveBeenCalledWith(request, "connect_supabase"),
    );
    await new Promise((resolve) => window.setTimeout(resolve, 20));
    expect(onRespond).toHaveBeenCalledTimes(1);
  });

  it("keeps a superseded card non-actionable after refresh", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          interactionId: request.id,
          state: "connection_required",
          requirements: request.requirements,
          continuationStatus: "superseded",
          bindingId: null,
          operation: null,
          authMode: null,
          backendPlan: null,
          message:
            "This app needs a backend to securely save data across devices.",
        }),
      ),
    );
    renderCard();

    expect(
      await screen.findByText("Setup replaced by a newer request"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Set up Supabase" }),
    ).not.toBeInTheDocument();
  });
});
