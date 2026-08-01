"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Database,
  ExternalLink,
  LockKeyhole,
  Plug,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AgentMessageMetadata,
  BackendSetupDecision,
  BackendSetupRequest,
} from "@/features/generation/agent-contracts";
import {
  chatSupabaseSetupActionResponseSchema,
  chatSupabaseSetupViewSchema,
  type ChatSupabaseSetupAction,
  type ChatSupabaseSetupView,
} from "@/features/integrations/chat-supabase-setup";
import { ProjectIntegrationsPanel } from "@/features/integrations/components/project-integrations-panel";
import { SupabaseAuthModeSelector } from "@/features/integrations/components/supabase-auth-mode-selector";
import {
  integrationActionResponseSchema,
  integrationResourcesResponseSchema,
} from "@/features/integrations/contracts";
import {
  DEFAULT_SUPABASE_AUTH_MODE,
  type SupabaseBackendPlan,
  type SupabaseAuthMode,
} from "@/features/integrations/supabase-backend";
import { fetchJson } from "@/features/shared/client/http";
import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
} from "@/components/reui/stepper";

function setupQueryKey(projectId: string, interactionId: string) {
  return ["chat-supabase-setup", projectId, interactionId] as const;
}

const autoResumedContinuations = new Set<string>();

function backendPlanDetails(plan: SupabaseBackendPlan | null | undefined) {
  if (!plan) return null;
  if (plan.template === "authenticated_tasks") {
    return {
      summary: plan.summary,
      tables: ["tasks"],
      access: "Signed-in users can access only their own rows.",
    };
  }
  const tables =
    "entity" in plan
      ? [plan.entity.name]
      : plan.entities.map((entity) => entity.name);
  const access =
    plan.template === "public_insert"
      ? "Anyone can submit new rows; stored submissions cannot be read from the public app."
      : plan.template === "public_read_owner_write"
        ? "Anyone can read rows; signed-in owners control writes."
        : "Signed-in users can access only their own rows.";
  return { summary: plan.summary, tables, access };
}

function SetupProgress({
  state,
  phase,
}: {
  state: ChatSupabaseSetupView["state"];
  phase?: string | null;
}) {
  const activeIndex =
    state === "runtime_ready" || state === "ready"
      ? 3
      : phase === "configuring_browser_access"
        ? 2
        : phase === "waiting_for_supabase"
          ? 1
          : 0;
  const steps = [
    { label: "Creating project" },
    { label: "Waiting for Supabase" },
    { label: "Connecting the preview" },
    { label: "Ready" },
  ];
  return (
    <Stepper
      value={activeIndex + 1}
      className="mt-3"
      aria-label="Setup progress"
      indicators={{ completed: <Check className="size-3" /> }}
    >
      <StepperNav>
        {steps.map((step, index) => {
          return (
            <StepperItem key={step.label} step={index + 1}>
              <div className="flex min-w-0 items-center gap-2">
                <StepperIndicator>{index + 1}</StepperIndicator>
                <StepperTitle className="hidden truncate text-xs font-normal text-muted-foreground sm:block sm:whitespace-normal">
                  {step.label}
                </StepperTitle>
              </div>
              {index < steps.length - 1 ? <StepperSeparator /> : null}
            </StepperItem>
          );
        })}
      </StepperNav>
    </Stepper>
  );
}

function TechnicalDetails({ request }: { request: BackendSetupRequest }) {
  const plan = backendPlanDetails(request.requirements.backendPlan);
  return (
    <details className="group mt-3 text-xs text-muted-foreground">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-sm font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        More details
        <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2 grid gap-1.5 rounded-lg border border-border/60 bg-muted/25 p-3 leading-5">
        {request.capabilities.map((capability) => (
          <span key={capability} className="flex items-start gap-2">
            <Check className="mt-1 size-3 shrink-0 text-blue-500" />
            {capability}
          </span>
        ))}
        {plan ? (
          <span>
            Database tables: {plan.tables.join(", ")}. {plan.access} Executable
            SQL stays on Squid&apos;s server.
          </span>
        ) : null}
      </div>
    </details>
  );
}

function ProjectSetupDialog({
  projectId,
  view,
  onAction,
  pending,
  projectCapacityReached = false,
}: {
  projectId: string;
  view: ChatSupabaseSetupView;
  onAction: (action: ChatSupabaseSetupAction) => void;
  pending: boolean;
  projectCapacityReached?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "create">("existing");
  const [organizationId, setOrganizationId] = useState("");
  const [projectRef, setProjectRef] = useState("");
  const [projectName, setProjectName] = useState("");
  const [region, setRegion] = useState<"americas" | "emea" | "apac">(
    "americas",
  );
  const organizationsQuery = useQuery({
    queryKey: ["chat-supabase-organizations", projectId, view.bindingId],
    enabled: open && Boolean(view.bindingId),
    queryFn: () =>
      fetchJson(
        `/api/projects/${projectId}/integrations/${view.bindingId}/resources?type=organizations`,
        integrationResourcesResponseSchema,
      ),
  });
  const projectsQuery = useQuery({
    queryKey: ["chat-supabase-projects", projectId, view.bindingId],
    enabled: open && Boolean(view.bindingId),
    queryFn: () =>
      fetchJson(
        `/api/projects/${projectId}/integrations/${view.bindingId}/resources?type=projects`,
        integrationResourcesResponseSchema,
      ),
  });
  const organizations = organizationsQuery.data?.resources ?? [];
  const projects = projectsQuery.data?.resources ?? [];
  const selectedOrganization = organizationId || organizations[0]?.id || "";
  const selectedProject = projectRef || projects[0]?.id || "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="w-full sm:w-auto">
          {projectCapacityReached
            ? "Choose existing project"
            : view.state === "timed_out" || view.state === "failed"
              ? "Open recovery options"
              : "Choose a Supabase project"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect a project</DialogTitle>
          <DialogDescription>
            Use a dedicated Supabase project for this generated app.
          </DialogDescription>
        </DialogHeader>
        {(view.state === "timed_out" || view.state === "failed") &&
        view.operation?.kind === "supabase_provision" &&
        !projectCapacityReached ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onAction({ action: "resume_project" })}
          >
            {pending ? (
              <CometSpinner className="size-4" aria-hidden="true" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            Resume incomplete project
          </Button>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "existing" ? "default" : "outline"}
            onClick={() => setMode("existing")}
          >
            Existing project
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "create" ? "default" : "outline"}
            onClick={() => setMode("create")}
          >
            New project
          </Button>
        </div>
        {mode === "existing" ? (
          <div className="grid gap-3">
            <Select value={selectedProject} onValueChange={setProjectRef}>
              <SelectTrigger aria-label="Supabase project">
                <SelectValue
                  placeholder={
                    projectsQuery.isLoading
                      ? "Loading projects…"
                      : "Choose a project"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              disabled={pending || !selectedProject}
              onClick={() =>
                onAction({
                  action: "bind_project",
                  projectRef: selectedProject,
                })
              }
            >
              {pending ? (
                <CometSpinner className="size-4" aria-hidden="true" />
              ) : null}
              Connect selected project
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <Select
              value={selectedOrganization}
              onValueChange={setOrganizationId}
            >
              <SelectTrigger aria-label="Supabase organization">
                <SelectValue
                  placeholder={
                    organizationsQuery.isLoading
                      ? "Loading organizations…"
                      : "Choose an organization"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((organization) => (
                  <SelectItem key={organization.id} value={organization.id}>
                    {organization.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Project name (optional)"
              aria-label="New Supabase project name"
              maxLength={120}
            />
            <details className="rounded-lg border border-border/60 px-3 py-2 text-sm">
              <summary className="cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Project location
              </summary>
              <div className="mt-3 grid gap-2">
                <p className="text-xs leading-5 text-muted-foreground">
                  Supabase will choose an available region within this area.
                  Americas is the default for this setup.
                </p>
                <Select
                  value={region}
                  onValueChange={(value) =>
                    setRegion(value as "americas" | "emea" | "apac")
                  }
                >
                  <SelectTrigger aria-label="Supabase project location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="americas">Americas</SelectItem>
                    <SelectItem value="emea">
                      Europe, Middle East, and Africa
                    </SelectItem>
                    <SelectItem value="apac">Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </details>
            <Button
              type="button"
              disabled={pending || !selectedOrganization}
              onClick={() =>
                onAction({
                  action: "create_project",
                  organizationId: selectedOrganization,
                  region,
                  ...(projectName.trim()
                    ? { projectName: projectName.trim() }
                    : {}),
                })
              }
            >
              {pending ? (
                <CometSpinner className="size-4" aria-hidden="true" />
              ) : null}
              Create project
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AuthModeStep({
  pending,
  onAction,
}: {
  pending: boolean;
  onAction: (action: ChatSupabaseSetupAction) => void;
}) {
  const [mode, setMode] = useState<SupabaseAuthMode>(
    DEFAULT_SUPABASE_AUTH_MODE,
  );
  return (
    <div className="mt-3 grid gap-3">
      <SupabaseAuthModeSelector
        value={mode}
        onChange={setMode}
        disabled={pending}
        compact
      />
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer rounded-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Security and launch details
        </summary>
        <p className="mt-2 leading-5">
          Instant signup reduces account-security guarantees. Reliable
          confirmation and password recovery need custom SMTP, and CAPTCHA is
          recommended before a public launch.
        </p>
      </details>
      <Button
        type="button"
        className="w-full sm:w-fit"
        disabled={pending}
        onClick={() =>
          onAction({
            action: "configure_auth_mode",
            mode,
            approval: { approved: true },
          })
        }
      >
        {pending ? (
          <CometSpinner className="size-4" aria-hidden="true" />
        ) : null}
        {mode === "verified_email"
          ? "Use verified email"
          : "Approve instant signup"}
      </Button>
    </div>
  );
}

export function ChatSupabaseSetupCard({
  projectId,
  request,
  response,
  onRespond,
}: {
  projectId: string;
  request: BackendSetupRequest;
  response?: Extract<
    AgentMessageMetadata,
    { kind: "agent_backend_setup_response" }
  >;
  onRespond: (
    request: BackendSetupRequest,
    decision: BackendSetupDecision,
  ) => void | Promise<void>;
}) {
  const queryClient = useQueryClient();
  const autoResumeStarted = useRef(false);
  const [authorizing, setAuthorizing] = useState(false);
  const queryKey = setupQueryKey(projectId, request.id);
  const setupQuery = useQuery({
    queryKey,
    enabled: !response,
    queryFn: ({ signal }) =>
      fetchJson(
        `/api/projects/${projectId}/supabase-setup/${encodeURIComponent(request.id)}`,
        chatSupabaseSetupViewSchema,
        { signal },
      ),
    refetchInterval: (query) =>
      query.state.data?.continuationStatus === "pending" ? 2_000 : false,
  });
  const view = setupQuery.data;
  const actionMutation = useMutation({
    mutationFn: (action: ChatSupabaseSetupAction) =>
      fetchJson(
        `/api/projects/${projectId}/supabase-setup/${encodeURIComponent(request.id)}`,
        chatSupabaseSetupActionResponseSchema,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        },
      ),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
    },
    onSuccess: async ({ view: nextView }) => {
      queryClient.setQueryData(queryKey, nextView);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey, refetchType: "none" }),
        queryClient.invalidateQueries({
          queryKey: ["project-integrations", projectId],
        }),
      ]);
    },
    onError: (error) =>
      toast.error("Supabase setup could not continue", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });
  const runningOperation =
    view?.operation?.status === "running" ? view.operation : null;
  const refreshOperationQuery = useQuery({
    queryKey: [
      "chat-supabase-operation",
      projectId,
      view?.bindingId,
      runningOperation?.id,
    ],
    enabled: Boolean(view?.bindingId && runningOperation),
    queryFn: () =>
      fetchJson(
        `/api/projects/${projectId}/integrations/${view?.bindingId}/actions?operationId=${encodeURIComponent(runningOperation?.id ?? "")}`,
        integrationActionResponseSchema,
      ),
    refetchInterval: 3_000,
  });

  useEffect(() => {
    if (refreshOperationQuery.data) {
      void queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, queryKey, refreshOperationQuery.data]);

  useEffect(() => {
    const continuationKey = `${projectId}:${request.continuation.id}`;
    if (
      response ||
      !view ||
      view.continuationStatus !== "pending" ||
      (view.state !== "ready" && view.state !== "runtime_ready") ||
      autoResumeStarted.current ||
      autoResumedContinuations.has(continuationKey)
    ) {
      return;
    }
    autoResumeStarted.current = true;
    autoResumedContinuations.add(continuationKey);
    void Promise.resolve(onRespond(request, "connect_supabase")).catch(() => {
      autoResumeStarted.current = false;
      autoResumedContinuations.delete(continuationKey);
    });
  }, [onRespond, projectId, request, response, view]);

  if (response) {
    const usesSupabase = response.decision === "connect_supabase";
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card/90 px-3 py-2.5 text-sm shadow-sm">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
          <Check className="size-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {usesSupabase ? "Building resumed" : "Prototype build selected"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {usesSupabase
              ? "Supabase is ready. Continuing your build with authentication and persistent data."
              : "The prototype will use browser-only data for now. You can connect a backend later."}
          </p>
        </div>
      </div>
    );
  }

  if (view && view.continuationStatus !== "pending") {
    const resumed = view.continuationStatus === "resumed";
    const uiOnly = view.continuationStatus === "ui_only";
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card/90 px-3 py-2.5 text-sm shadow-sm">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Check className="size-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {resumed
              ? "Building resumed"
              : uiOnly
                ? "Prototype build selected"
                : "Setup replaced by a newer request"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {resumed
              ? "Supabase is ready. Continuing your build with authentication and persistent data."
              : uiOnly
                ? "The prototype will use browser-only data for now. You can connect a backend later."
                : "This card is complete and cannot repeat provider actions."}
          </p>
        </div>
      </div>
    );
  }

  const state =
    authorizing && (!view || view.state === "connection_required")
      ? "authorizing"
      : view?.state;
  const projectCapacityReached = Boolean(
    state === "failed" &&
      view?.operation?.kind === "supabase_provision" &&
      view.operation.errorMessage?.includes("active-project limit"),
  );
  const isBusy =
    actionMutation.isPending ||
    state === "authorizing" ||
    state === "provisioning" ||
    state === "backend_applying" ||
    state === "backend_verifying";
  const startOAuth = () => {
    setAuthorizing(true);
    window.addEventListener("focus", () => setAuthorizing(false), {
      once: true,
    });
    const url = `/api/integrations/oauth/supabase/start?projectId=${encodeURIComponent(projectId)}&environment=development&interactionId=${encodeURIComponent(request.id)}`;
    const popup = window.open(
      "about:blank",
      "squid-supabase-oauth",
      "popup,width=720,height=760",
    );
    if (!popup) {
      window.location.assign(url);
      return;
    }
    popup.opener = null;
    popup.location.replace(url);
  };

  const statusLabel =
    state === "connection_required"
      ? "Prototype first"
      : state
        ? state.replaceAll("_", " ")
        : "Checking status";
  const connectionTitle =
    state === "ready" || state === "runtime_ready"
      ? "Supabase is ready"
      : state === "connection_required"
        ? "Start with the prototype"
        : request.title;
  const connectionMessage =
    state === "authorizing"
      ? "Finish authorizing Supabase in the secure window. This card will update automatically."
      : state === "connection_required"
        ? "Build the working interface with browser-local demo data now. Connect Supabase later when the idea is ready for persistent or multi-user data."
        : (view?.message ?? request.description);

  return (
    <section
      aria-labelledby={`${request.id}-title`}
      className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/15 px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          {isBusy ? (
            <CometSpinner
              className="size-2.5 text-blue-500"
              aria-hidden="true"
            />
          ) : (
            <span
              className="size-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
          )}
          Database
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          {statusLabel}
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/35 text-muted-foreground">
            {state === "authorization_required" ? (
              <LockKeyhole className="size-3.5" />
            ) : state === "failed" || state === "timed_out" ? (
              <AlertTriangle className="size-3.5" />
            ) : state === "ready" || state === "runtime_ready" ? (
              <ShieldCheck className="size-3.5" />
            ) : (
              <Database className="size-3.5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h3
              id={`${request.id}-title`}
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              {connectionTitle}
            </h3>
            <p
              className="mt-0.5 text-[13px] leading-[1.35rem] text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {connectionMessage}
            </p>
          </div>
        </div>

        {state === "provisioning" ||
        state === "runtime_ready" ||
        state === "ready" ? (
          <SetupProgress state={state} phase={view?.operation?.phase} />
        ) : null}

        {state === "connection_required" ? (
          <div className="mt-2.5 flex flex-col gap-1.5 sm:flex-row">
            <Button
              type="button"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => void onRespond(request, "build_ui_only")}
            >
              Build prototype now
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-muted-foreground sm:w-auto"
              onClick={startOAuth}
              aria-label="Set up Supabase"
            >
              <Plug className="size-3.5" aria-hidden="true" />
              Connect Supabase first
            </Button>
          </div>
        ) : state === "authorization_required" ? (
          <Button
            type="button"
            className="mt-3 w-full sm:w-auto"
            onClick={startOAuth}
          >
            Reconnect Supabase
          </Button>
        ) : state === "failed" &&
          view?.operation?.kind === "supabase_backend_migration" ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              disabled={actionMutation.isPending}
              title={
                actionMutation.isPending
                  ? "A backend setup action is already running"
                  : undefined
              }
              onClick={() =>
                actionMutation.mutate({
                  action: "approve_backend",
                  approval: { approved: true },
                })
              }
            >
              {actionMutation.isPending ? (
                <CometSpinner className="size-4" aria-hidden="true" />
              ) : (
                <RotateCcw className="size-4" />
              )}
              Retry backend setup
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => void onRespond(request, "build_ui_only")}
            >
              Continue as prototype
            </Button>
          </div>
        ) : state === "project_setup_required" ||
          state === "failed" ||
          state === "timed_out" ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <ProjectSetupDialog
              projectId={projectId}
              view={view!}
              pending={actionMutation.isPending}
              projectCapacityReached={projectCapacityReached}
              onAction={(action) => actionMutation.mutate(action)}
            />
            {projectCapacityReached ? (
              <Button asChild variant="outline">
                <Link
                  href="https://supabase.com/dashboard/projects"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Supabase dashboard
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
            {request.requirements.backendTemplate ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground sm:w-auto"
                onClick={() => void onRespond(request, "build_ui_only")}
              >
                Continue as prototype
              </Button>
            ) : null}
          </div>
        ) : state === "auth_mode_required" ? (
          <AuthModeStep
            pending={actionMutation.isPending}
            onAction={(action) => actionMutation.mutate(action)}
          />
        ) : state === "backend_approval_required" ? (
          <div className="mt-3 grid gap-2.5">
            <div className="rounded-lg border border-border/60 bg-muted/25 p-2.5 text-xs leading-5 text-muted-foreground">
              <p className="font-medium text-foreground">Backend setup</p>
              <p className="mt-1">{view?.backendPlan?.summary}</p>
              {backendPlanDetails(view?.backendPlan) ? (
                <p className="mt-1">
                  Tables:{" "}
                  {backendPlanDetails(view?.backendPlan)?.tables.join(", ")}.{" "}
                  {backendPlanDetails(view?.backendPlan)?.access}
                </p>
              ) : null}
              <details className="mt-2">
                <summary className="cursor-pointer rounded-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  View technical details
                </summary>
                <p className="mt-2">
                  Squid compiles a non-destructive typed plan, enables and
                  verifies row-level security, applies least-privilege Data API
                  grants, and checks the schema after creation. The browser
                  receives the plan summary and checksum, never executable SQL.
                </p>
              </details>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                disabled={actionMutation.isPending}
                onClick={() =>
                  actionMutation.mutate({
                    action: "approve_backend",
                    approval: { approved: true },
                  })
                }
              >
                {actionMutation.isPending ? (
                  <CometSpinner className="size-4" aria-hidden="true" />
                ) : null}
                Approve backend setup
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => void onRespond(request, "build_ui_only")}
              >
                Continue as prototype
              </Button>
            </div>
          </div>
        ) : state === "backend_applying" || state === "backend_verifying" ? (
          <div
            className="mt-3 grid gap-2 rounded-lg border border-border/60 bg-muted/25 p-2.5 text-xs"
            role="status"
          >
            {[
              "Creating database",
              "Applying access rules",
              "Verifying security",
            ].map((label, index) => {
              const active =
                state === "backend_verifying" ? index === 2 : index < 2;
              return (
                <span key={label} className="flex items-center gap-2">
                  {active ? (
                    <CometSpinner
                      className="size-3.5 text-blue-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="size-3.5 rounded-full border border-border" />
                  )}
                  {label}
                </span>
              );
            })}
          </div>
        ) : null}

        {state === "connection_required" ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <details className="group">
              <summary className="cursor-pointer rounded-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Why is this optional?
              </summary>
              <p className="mt-1.5 max-w-md leading-5">
                Prototypes keep demo data in this browser so you can validate
                the experience first. Supabase makes it persistent across
                sessions, users, and devices when you are ready.
              </p>
            </details>
            <ProjectIntegrationsPanel
              projectId={projectId}
              triggerPlacement="chat-advanced"
              initialProviderId="supabase"
            />
          </div>
        ) : (
          <>
            <TechnicalDetails request={request} />
            <div className="mt-2.5 flex justify-end">
              <ProjectIntegrationsPanel
                projectId={projectId}
                triggerPlacement="chat-advanced"
                initialProviderId="supabase"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
