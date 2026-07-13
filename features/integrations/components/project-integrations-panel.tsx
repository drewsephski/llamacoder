"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  KeyRound,
  Loader2,
  Plug,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
import { ProviderCatalog } from "@/features/integrations/components/provider-catalog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  integrationMutationResponseSchema,
  integrationActionResponseSchema,
  integrationResourcesResponseSchema,
  integrationWorkspaceSchema,
  type IntegrationEnvironment,
  type ProjectIntegrationView,
} from "@/features/integrations/contracts";
import { fetchJson } from "@/features/shared/client/http";

const deleteResponseSchema = z.object({ ok: z.literal(true) });

function integrationQueryKey(projectId: string) {
  return ["project-integrations", projectId] as const;
}

function statusPresentation(status: ProjectIntegrationView["status"]) {
  if (status === "ready") {
    return {
      label: "Connected",
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      icon: CheckCircle2,
    };
  }
  if (status === "blocked") {
    return {
      label: "Blocked",
      className: "bg-destructive/10 text-destructive",
      icon: AlertTriangle,
    };
  }
  if (status === "needs_attention") {
    return {
      label: "Needs attention",
      className: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
      icon: AlertTriangle,
    };
  }
  if (status === "configured") {
    return {
      label: "Test required",
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      icon: ShieldCheck,
    };
  }
  return {
    label: "Setup required",
    className: "bg-muted text-muted-foreground",
    icon: KeyRound,
  };
}

function ProviderActions({
  projectId,
  messageId,
  integration,
}: {
  projectId: string;
  messageId: string;
  integration: ProjectIntegrationView;
}) {
  const queryClient = useQueryClient();
  const [resourceId, setResourceId] = useState("");
  const resourcesQuery = useQuery({
    queryKey: ["integration-resources", projectId, integration.id],
    queryFn: () =>
      fetchJson(
        `/api/projects/${projectId}/integrations/${integration.id}/resources`,
        integrationResourcesResponseSchema,
      ),
  });
  const resources = resourcesQuery.data?.resources ?? [];
  const selectedResource =
    resourceId ||
    (typeof integration.config?.repository === "string"
      ? integration.config.repository
      : typeof integration.config?.projectId === "string"
        ? integration.config.projectId
        : "");
  const actionMutation = useMutation({
    mutationFn: () =>
      fetchJson(
        `/api/projects/${projectId}/integrations/${integration.id}/actions`,
        integrationActionResponseSchema,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            integration.providerId === "github"
              ? {
                  action: "github_publish",
                  messageId,
                  repository: selectedResource,
                  branch: "squid/generated",
                }
              : {
                  action: "vercel_deploy",
                  messageId,
                  ...(selectedResource ? { projectId: selectedResource } : {}),
                  target:
                    integration.environment === "production"
                      ? "production"
                      : "preview",
                },
          ),
        },
      ),
    onSuccess: async ({ operation }) => {
      await queryClient.invalidateQueries({
        queryKey: integrationQueryKey(projectId),
      });
      toast.success(
        integration.providerId === "github"
          ? "Published to GitHub"
          : "Deployment started",
        operation.url ? { description: operation.url } : undefined,
      );
    },
    onError: (error) =>
      toast.error("Provider action failed", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });
  const canRun =
    !actionMutation.isPending &&
    !resourcesQuery.isLoading &&
    (integration.providerId === "vercel" || Boolean(selectedResource));

  return (
    <div className="mt-3 grid gap-2 border-t border-border/60 pt-3 sm:grid-cols-[1fr_auto]">
      <Select value={selectedResource} onValueChange={setResourceId}>
        <SelectTrigger className="h-9">
          <SelectValue
            placeholder={
              resourcesQuery.isLoading
                ? "Loading targets..."
                : integration.providerId === "github"
                  ? "Choose repository"
                  : "New Vercel project"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {resources.map((resource) => (
            <SelectItem key={resource.id} value={resource.id}>
              {resource.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        size="sm"
        disabled={!canRun}
        onClick={() => actionMutation.mutate()}
      >
        {actionMutation.isPending ? (
          <Loader2 className="animate-spin" />
        ) : integration.providerId === "github" ? (
          <GitBranch />
        ) : (
          <Rocket />
        )}
        {integration.providerId === "github"
          ? "Publish version"
          : integration.environment === "production"
            ? "Deploy production"
            : "Deploy preview"}
      </Button>
      {resourcesQuery.isError && (
        <p className="text-xs text-destructive sm:col-span-2">
          Could not load provider targets. Test or reconnect the integration.
        </p>
      )}
    </div>
  );
}

function OperationStatusRefresher({
  projectId,
  bindingId,
  operationId,
}: {
  projectId: string;
  bindingId: string;
  operationId: string;
}) {
  const queryClient = useQueryClient();
  const refreshQuery = useQuery({
    queryKey: ["integration-operation", operationId],
    queryFn: () =>
      fetchJson(
        `/api/projects/${projectId}/integrations/${bindingId}/actions?operationId=${encodeURIComponent(operationId)}`,
        integrationActionResponseSchema,
      ),
    refetchInterval: (query) =>
      query.state.data?.operation.status === "running" ? 3_000 : false,
  });
  const refreshedStatus = refreshQuery.data?.operation.status;
  useEffect(() => {
    if (refreshedStatus && refreshedStatus !== "running") {
      void queryClient.invalidateQueries({
        queryKey: integrationQueryKey(projectId),
      });
    }
  }, [projectId, queryClient, refreshedStatus]);
  return null;
}

export function ProjectIntegrationsPanel({
  projectId,
  messageId,
  triggerPlacement = "toolbar",
}: {
  projectId: string;
  messageId?: string;
  triggerPlacement?: "toolbar" | "composer";
}) {
  const [open, setOpen] = useState(false);
  const [environment, setEnvironment] =
    useState<IntegrationEnvironment>("development");
  const [providerId, setProviderId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [credential, setCredential] = useState("");
  const [editingBindingId, setEditingBindingId] = useState<string | null>(null);
  const [disconnectBindingId, setDisconnectBindingId] = useState<string | null>(
    null,
  );
  const queryClient = useQueryClient();
  const queryKey = integrationQueryKey(projectId);

  useEffect(() => {
    const url = new URL(window.location.href);
    const result = url.searchParams.get("integration");
    const error = url.searchParams.get("integration_error");
    if (!result && !error) return;

    const openTimer = window.setTimeout(() => setOpen(true), 0);
    if (result === "connected") {
      toast.success("Integration connected", {
        description: "The provider accepted the connection.",
      });
    } else if (result === "attention") {
      toast.error("Integration needs attention", {
        description:
          "Authorization completed, but the provider health check failed.",
      });
    } else if (error === "denied") {
      toast.error("Authorization was cancelled");
    } else {
      toast.error("Integration authorization failed", {
        description: "Try connecting again or use manual token setup.",
      });
    }
    url.searchParams.delete("integration");
    url.searchParams.delete("integration_error");
    window.history.replaceState({}, "", url);
    return () => window.clearTimeout(openTimer);
  }, []);
  const workspaceQuery = useQuery({
    queryKey,
    enabled: open,
    queryFn: () =>
      fetchJson(
        `/api/projects/${projectId}/integrations`,
        integrationWorkspaceSchema,
      ),
  });
  const workspace = workspaceQuery.data;
  const selectedProvider = workspace?.providers.find(
    (provider) => provider.id === providerId,
  );
  const selectedBinding = workspace?.integrations.find(
    (integration) => integration.id === editingBindingId,
  );
  const visibleIntegrations = useMemo(
    () =>
      workspace?.integrations.filter(
        (integration) => integration.environment === environment,
      ) ?? [],
    [environment, workspace?.integrations],
  );
  const availableProviders = useMemo(
    () =>
      workspace?.providers.filter(
        (provider) =>
          !workspace.integrations.some(
            (integration) =>
              integration.providerId === provider.id &&
              integration.environment === environment &&
              integration.id !== editingBindingId,
          ),
      ) ?? [],
    [editingBindingId, environment, workspace],
  );

  function resetForm() {
    setProviderId("");
    setDisplayName("");
    setCredential("");
    setEditingBindingId(null);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProvider) throw new Error("Choose an integration provider.");
      const credentialInput = credential.trim()
        ? {
            kind: selectedProvider.credentialKind!,
            value: credential.trim(),
          }
        : undefined;
      const body = JSON.stringify({
        ...(!editingBindingId
          ? { providerId: selectedProvider.id, environment }
          : {}),
        ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
        ...(credentialInput ? { credential: credentialInput } : {}),
      });
      return fetchJson(
        editingBindingId
          ? `/api/projects/${projectId}/integrations/${editingBindingId}`
          : `/api/projects/${projectId}/integrations`,
        integrationMutationResponseSchema,
        {
          method: editingBindingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
      );
    },
    onSuccess: async ({ integration }) => {
      await queryClient.invalidateQueries({ queryKey });
      toast.success(
        editingBindingId ? "Integration updated" : "Integration added",
        {
          description:
            integration.status === "ready"
              ? "The connection is ready for this project."
              : "Run a connection test before using it in production.",
        },
      );
      resetForm();
    },
    onError: (error) =>
      toast.error("Could not save integration", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  const testMutation = useMutation({
    mutationFn: (bindingId: string) =>
      fetchJson(
        `/api/projects/${projectId}/integrations/${bindingId}/test`,
        integrationMutationResponseSchema,
        { method: "POST" },
      ),
    onSuccess: async ({ integration }) => {
      await queryClient.invalidateQueries({ queryKey });
      const healthy = integration.connection.lastHealthStatus === "healthy";
      toast[healthy ? "success" : "error"](
        healthy ? "Connection verified" : "Connection needs attention",
        { description: integration.connection.lastHealthMessage ?? undefined },
      );
    },
    onError: (error) =>
      toast.error("Connection test failed", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  const disconnectMutation = useMutation({
    mutationFn: (bindingId: string) =>
      fetchJson(
        `/api/projects/${projectId}/integrations/${bindingId}`,
        deleteResponseSchema,
        { method: "DELETE" },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      setDisconnectBindingId(null);
      resetForm();
      toast.success("Integration disconnected");
    },
    onError: (error) =>
      toast.error("Could not disconnect integration", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  function beginConfigure(integration: ProjectIntegrationView) {
    setEditingBindingId(integration.id);
    setProviderId(integration.providerId);
    setDisplayName(integration.connection.displayName);
    setCredential("");
    setDisconnectBindingId(null);
  }

  const requiresCredential = selectedProvider?.credentialKind != null;
  const canAuthorizeWithOAuth =
    selectedProvider?.auth === "oauth" &&
    (!editingBindingId || selectedBinding?.status === "authorization_required");
  const canSave =
    !!selectedProvider &&
    selectedProvider.policyStatus !== "blocked" &&
    !saveMutation.isPending &&
    (!requiresCredential ||
      !!credential.trim() ||
      !!selectedBinding?.connection.hasCredential ||
      selectedProvider.auth === "oauth");

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetForm();
          setDisconnectBindingId(null);
        }
      }}
    >
      <DialogTrigger asChild>
        {triggerPlacement === "composer" ? (
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Choose APIs for this app"
          >
            <Plug className="size-3.5" /> APIs
          </button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            aria-label="Project integrations"
          >
            <Plug className="size-3.5" />
            <span className="hidden lg:inline">Integrations</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="size-5 text-primary" /> Project integrations
          </DialogTitle>
          <DialogDescription>
            Choose the APIs this app should use. Squid gives the AI their
            reviewed implementation rules; credentials stay encrypted and are
            never included in generated source or exports.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-border p-1">
              {(["development", "production"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setEnvironment(value);
                    resetForm();
                    setDisconnectBindingId(null);
                  }}
                  className={`min-h-9 rounded-md px-3 text-xs font-semibold capitalize transition-colors ${
                    environment === value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Production credentials stay separate from development.
            </p>
          </div>

          {workspaceQuery.isLoading ? (
            <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading
              integrations
            </div>
          ) : workspaceQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-destructive">
                Integrations could not be loaded
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => workspaceQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : (
            <>
              <section aria-labelledby="connected-integrations">
                <h3
                  id="connected-integrations"
                  className="text-sm font-semibold"
                >
                  {environment === "development" ? "Development" : "Production"}
                </h3>
                {visibleIntegrations.length === 0 ? (
                  <div className="mt-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No services are connected to this environment yet.
                  </div>
                ) : (
                  <div className="mt-2 grid gap-2">
                    {visibleIntegrations.map((integration) => {
                      const provider = workspace?.providers.find(
                        (candidate) => candidate.id === integration.providerId,
                      );
                      const presentation = statusPresentation(
                        integration.status,
                      );
                      const StatusIcon = presentation.icon;
                      const confirmingDisconnect =
                        disconnectBindingId === integration.id;
                      return (
                        <div
                          key={integration.id}
                          className="rounded-lg border border-border/70 bg-muted/20 p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold">
                                  {integration.connection.displayName}
                                </p>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${presentation.className}`}
                                >
                                  <StatusIcon className="size-3" />
                                  {presentation.label}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {provider?.name ?? integration.providerId}
                                {integration.connection.lastHealthCheckAt
                                  ? ` · checked ${new Date(integration.connection.lastHealthCheckAt).toLocaleString()}`
                                  : " · not tested"}
                              </p>
                              {integration.connection.lastHealthMessage && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {integration.connection.lastHealthMessage}
                                </p>
                              )}
                            </div>
                            {confirmingDisconnect ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-destructive">
                                  Disconnect from this project?
                                </span>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  disabled={disconnectMutation.isPending}
                                  onClick={() =>
                                    disconnectMutation.mutate(integration.id)
                                  }
                                >
                                  Disconnect
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDisconnectBindingId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={testMutation.isPending}
                                  onClick={() =>
                                    testMutation.mutate(integration.id)
                                  }
                                >
                                  <RefreshCw
                                    className={
                                      testMutation.isPending &&
                                      testMutation.variables === integration.id
                                        ? "animate-spin"
                                        : ""
                                    }
                                  />
                                  Test
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => beginConfigure(integration)}
                                >
                                  Configure
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  aria-label={`Disconnect ${integration.connection.displayName}`}
                                  onClick={() =>
                                    setDisconnectBindingId(integration.id)
                                  }
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            )}
                          </div>
                          {messageId &&
                            integration.status === "ready" &&
                            (integration.providerId === "github" ||
                              integration.providerId === "vercel") && (
                              <ProviderActions
                                projectId={projectId}
                                messageId={messageId}
                                integration={integration}
                              />
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {workspace?.recentOperations.length ? (
                <section aria-labelledby="recent-provider-operations">
                  <h3
                    id="recent-provider-operations"
                    className="text-sm font-semibold"
                  >
                    Recent publishes and deployments
                  </h3>
                  <div className="mt-2 grid gap-2">
                    {workspace.recentOperations.slice(0, 5).map((operation) => (
                      <div
                        key={operation.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2 text-xs"
                      >
                        {operation.status === "running" && (
                          <OperationStatusRefresher
                            projectId={projectId}
                            bindingId={operation.projectIntegrationId}
                            operationId={operation.id}
                          />
                        )}
                        <span>
                          {operation.kind === "github_publish"
                            ? "GitHub publish"
                            : "Vercel deployment"}{" "}
                          · {operation.status}
                          {operation.commitSha
                            ? ` · ${operation.commitSha.slice(0, 7)}`
                            : ""}
                        </span>
                        {operation.url && (
                          <a
                            href={operation.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            Open <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section
                aria-labelledby="configure-integration"
                className="rounded-lg border border-border/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      id="configure-integration"
                      className="text-sm font-semibold"
                    >
                      {editingBindingId
                        ? "Update connection"
                        : "Choose APIs for this app"}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your choices become project context for planning, code
                      generation, and runtime checks.
                    </p>
                  </div>
                  {editingBindingId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                    >
                      Cancel edit
                    </Button>
                  )}
                </div>

                {!editingBindingId && (
                  <ProviderCatalog
                    providers={availableProviders}
                    selectedProviderId={providerId}
                    onSelect={(nextProviderId) => {
                      setProviderId(nextProviderId);
                      setDisplayName("");
                      setCredential("");
                    }}
                  />
                )}

                {selectedProvider && selectedProvider.setup !== "instant" && (
                  <label className="mt-4 grid gap-1.5 text-xs font-medium sm:max-w-sm">
                    Connection name <span className="sr-only">(optional)</span>
                    <Input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder={selectedProvider.name}
                      autoComplete="off"
                    />
                    <span className="font-normal text-muted-foreground">
                      Optional label to distinguish accounts or environments.
                    </span>
                  </label>
                )}

                {selectedProvider && (
                  <div className="mt-3 rounded-md border border-border/60 bg-muted/30 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium">
                        {selectedProvider.setup === "instant"
                          ? "No key needed"
                          : selectedProvider.setup === "oauth"
                            ? "Account authorization"
                            : "API key required"}{" "}
                        · {selectedProvider.runtime} runtime
                      </p>
                      <a
                        href={selectedProvider.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Official docs <ExternalLink className="size-3" />
                      </a>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {selectedProvider.guidance}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {selectedProvider.capabilities.join(" · ")}
                    </p>
                    {selectedProvider.exampleEndpoint && (
                      <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
                        {selectedProvider.exampleEndpoint}
                      </p>
                    )}
                    {(selectedProvider.attribution ||
                      selectedProvider.limits) && (
                      <div className="mt-3 grid gap-1 border-t border-border/60 pt-2 text-[11px] leading-5 text-muted-foreground">
                        {selectedProvider.attribution && (
                          <p>Attribution: {selectedProvider.attribution}</p>
                        )}
                        {selectedProvider.limits && (
                          <p>Usage: {selectedProvider.limits}</p>
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Reviewed {selectedProvider.verifiedAt}
                    </p>
                  </div>
                )}

                {requiresCredential && (
                  <label className="mt-3 grid gap-1.5 text-xs font-medium">
                    {selectedProvider?.credentialKind === "api_key"
                      ? "API key"
                      : "Access token"}
                    <Input
                      type="password"
                      value={credential}
                      onChange={(event) => setCredential(event.target.value)}
                      placeholder={
                        selectedBinding?.connection.hasCredential
                          ? "Leave blank to keep the existing credential"
                          : "Stored encrypted and never exported"
                      }
                      autoComplete="new-password"
                    />
                    {selectedProvider?.auth === "oauth" && (
                      <span className="font-normal text-muted-foreground">
                        Manual token setup is supported now. One-click OAuth can
                        replace it without changing the project binding.
                      </span>
                    )}
                  </label>
                )}

                {canAuthorizeWithOAuth && (
                  <div className="mt-3 rounded-md border border-blue-500/20 bg-blue-500/5 p-3">
                    <p className="text-xs font-semibold">
                      One-click authorization
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Squid stores the resulting token in the encrypted vault
                      and immediately verifies it with the provider.
                    </p>
                    {selectedProvider.oauthAvailable ? (
                      <Button asChild size="sm" className="mt-3">
                        <a
                          href={`/api/integrations/oauth/${selectedProvider.id}/start?projectId=${encodeURIComponent(projectId)}&environment=${environment}`}
                        >
                          Connect with {selectedProvider.name}
                        </a>
                      </Button>
                    ) : (
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                        OAuth credentials are not configured in this Squid
                        environment. Manual access-token setup remains
                        available.
                      </p>
                    )}
                  </div>
                )}

                {(!canAuthorizeWithOAuth ||
                  !selectedProvider?.oauthAvailable ||
                  !!credential.trim() ||
                  !!editingBindingId) && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      disabled={!canSave}
                      onClick={() => saveMutation.mutate()}
                    >
                      {saveMutation.isPending && (
                        <Loader2 className="animate-spin" />
                      )}
                      {editingBindingId
                        ? "Save changes"
                        : selectedProvider?.setup === "instant"
                          ? "Use in this app"
                          : selectedProvider?.setup === "api_key"
                            ? "Add API"
                            : "Save connection"}
                    </Button>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
