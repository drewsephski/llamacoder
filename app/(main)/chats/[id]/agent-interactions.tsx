"use client";

import {
  ArrowUpRight,
  Check,
  Globe2,
  LoaderCircle,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { QuestionFlow } from "@/components/tool-ui/question-flow";
import type {
  AgentMessageMetadata,
  ClarificationAnswers,
  ClarificationRequest,
  Plan,
  SearchRequest,
  SourceUrl,
} from "@/features/generation/agent-contracts";
import { getDeliveryContractLabel } from "@/features/generation/app-spec";
import type { ResearchActivity } from "@/features/generation/contracts";
export { ChatSupabaseSetupCard as BackendSetupCard } from "@/features/integrations/components/chat-supabase-setup-card";

export function ClarificationRequestCard({
  content,
  request,
  response,
  onComplete,
}: {
  content: string;
  request: ClarificationRequest;
  response?: Extract<
    AgentMessageMetadata,
    { kind: "agent_clarification_response" }
  >;
  onComplete: (
    request: ClarificationRequest,
    answers: ClarificationAnswers,
  ) => void | Promise<void>;
}) {
  if (response) {
    return (
      <QuestionFlow
        id={request.id}
        choice={{ title: "Requirements confirmed", summary: response.summary }}
        className="min-w-0 max-w-full"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <MessageResponse className="prose dark:prose-invert">
        {content}
      </MessageResponse>
      <QuestionFlow
        id={request.id}
        steps={request.steps}
        className="min-w-0 max-w-full"
        onComplete={(answers) => onComplete(request, answers)}
      />
    </div>
  );
}

export function SearchApprovalCard({
  request,
  response,
  onRespond,
}: {
  request: SearchRequest;
  response?: Extract<
    AgentMessageMetadata,
    { kind: "agent_search_approval_response" }
  >;
  onRespond: (
    request: SearchRequest,
    approved: boolean,
  ) => void | Promise<void>;
}) {
  const state = response
    ? response.approved
      ? "output-available"
      : "output-denied"
    : "approval-requested";
  const approval = response
    ? { id: request.id, approved: response.approved }
    : { id: request.id };

  return (
    <Confirmation
      approval={approval}
      state={state}
      className="max-w-md border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Search className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <ConfirmationTitle>
            <span className="font-medium text-foreground">
              Search the internet?
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {request.reason}
            </span>
            <span className="mt-2 block rounded-md bg-background/80 px-2.5 py-2 font-mono text-xs text-foreground">
              {request.query}
            </span>
          </ConfirmationTitle>
          <ConfirmationRequest>
            <ConfirmationActions className="mt-3 justify-start self-auto">
              <ConfirmationAction
                variant="default"
                onClick={() => onRespond(request, true)}
              >
                Allow search
              </ConfirmationAction>
              <ConfirmationAction
                variant="outline"
                onClick={() => onRespond(request, false)}
              >
                Not now
              </ConfirmationAction>
            </ConfirmationActions>
          </ConfirmationRequest>
          <ConfirmationAccepted>
            <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Search approved
            </p>
          </ConfirmationAccepted>
          <ConfirmationRejected>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Search declined
            </p>
          </ConfirmationRejected>
        </div>
      </div>
    </Confirmation>
  );
}

export function MessageSources({
  sources,
  defaultOpen = false,
}: {
  sources: SourceUrl[];
  defaultOpen?: boolean;
}) {
  if (sources.length === 0) return null;

  return (
    <Sources className="mb-0 text-muted-foreground" defaultOpen={defaultOpen}>
      <SourcesTrigger count={sources.length}>
        <span className="text-xs font-medium">
          {sources.length} {sources.length === 1 ? "source" : "sources"}
        </span>
      </SourcesTrigger>
      <SourcesContent className="w-full max-w-full gap-1.5">
        {sources.slice(0, 8).map((source) => {
          const label = source.title ?? new URL(source.url).hostname;
          const hostname = new URL(source.url).hostname.replace(/^www\./, "");
          return (
            <Source
              key={source.sourceId}
              href={source.url}
              title={label}
              className="group flex max-w-md items-center gap-2 overflow-hidden rounded-lg border border-border/50 bg-background/60 px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:border-blue-500/25 hover:bg-blue-500/[0.04] hover:text-foreground"
            >
              <Globe2 className="size-3.5 shrink-0 text-blue-500/70" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground/90">
                  {label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                  {hostname}
                </span>
              </span>
              <ArrowUpRight className="size-3.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-80" />
            </Source>
          );
        })}
      </SourcesContent>
    </Sources>
  );
}

export function ResearchActivityCard({
  activity,
  sources,
}: {
  activity: ResearchActivity;
  sources: SourceUrl[];
}) {
  const isSearching = activity.phase === "searching";
  const visibleSources = sources.slice(0, 6);

  return (
    <div
      className="overflow-hidden rounded-xl border border-border/70 bg-card/80 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="p-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            {isSearching ? (
              <>
                <LoaderCircle
                  className="relative size-3.5 animate-spin"
                  aria-hidden="true"
                />
              </>
            ) : (
              <Check className="size-3.5" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-semibold text-foreground">
              {activity.label}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Exa · {isSearching ? "Searching the web" : "Research complete"}
            </p>
          </div>
          <span
            className="flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-muted-foreground"
            aria-label={isSearching ? "Search in progress" : "Search complete"}
          >
            <span
              className={`size-1.5 rounded-full ${isSearching ? "animate-pulse bg-blue-500" : "bg-emerald-500"}`}
            />
            {isSearching ? "Live" : "Done"}
          </span>
        </div>

        <div
          className="mt-2.5 flex min-w-0 items-center gap-2 rounded-md bg-muted/55 px-2.5 py-2 text-[11px] text-muted-foreground"
          title={activity.query}
        >
          <Search className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{activity.query}</span>
        </div>

        <div className="mt-2">
          {visibleSources.length > 0 ? (
            <div className="grid overflow-hidden rounded-lg border border-border/60 sm:grid-cols-2">
              {visibleSources.map((source) => {
                const hostname = new URL(source.url).hostname.replace(
                  /^www\./,
                  "",
                );
                const label = source.title ?? hostname;

                return (
                  <Source
                    key={source.sourceId}
                    href={source.url}
                    title={label}
                    className="group -mb-px -mr-px flex min-w-0 items-center gap-2 border-b border-r border-border/60 bg-background/35 px-2.5 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-blue-500/10 text-[9px] font-semibold uppercase text-blue-600 dark:text-blue-400">
                      {hostname.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px]">
                      <span className="font-medium text-foreground/90">
                        {label}
                      </span>
                      <span className="text-muted-foreground">
                        {` · ${hostname}`}
                      </span>
                    </span>
                    <ArrowUpRight className="size-3 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground/70" />
                  </Source>
                );
              })}
            </div>
          ) : isSearching ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 px-2.5 py-2 text-[11px] text-muted-foreground">
              <span className="flex gap-1" aria-hidden="true">
                <span className="size-1 animate-pulse rounded-full bg-blue-500 [animation-delay:-240ms]" />
                <span className="size-1 animate-pulse rounded-full bg-blue-500 [animation-delay:-120ms]" />
                <span className="size-1 animate-pulse rounded-full bg-blue-500" />
              </span>
              Finding relevant sources…
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function InterviewRequestCard({
  content,
  request,
  response,
  onComplete,
}: {
  content: string;
  request: ClarificationRequest;
  response?: Extract<
    AgentMessageMetadata,
    { kind: "agent_interview_response" }
  >;
  onComplete: (
    request: ClarificationRequest,
    answers: ClarificationAnswers,
  ) => void | Promise<void>;
}) {
  if (response) {
    return (
      <QuestionFlow
        id={request.id}
        choice={{ title: "Requirements confirmed", summary: response.summary }}
        className="min-w-0 max-w-full"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <DeliveryScopeSummary
        deliveryContract={request.deliveryContract}
        confirmed={request.confirmedDecisions}
        remaining={request.remainingDecisions}
      />
      <MessageResponse className="prose dark:prose-invert">
        {content}
      </MessageResponse>
      <QuestionFlow
        id={request.id}
        steps={request.steps}
        className="min-w-0 max-w-full"
        onComplete={(answers) => onComplete(request, answers)}
      />
    </div>
  );
}

export function PlanRequestCard({
  request,
  response,
  onApprove,
  onRevision,
}: {
  request: Plan;
  response?: { approved: true } | { approved: false; note?: string };
  onApprove: () => void | Promise<void>;
  onRevision: () => void | Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/95 p-5 shadow-sm">
      <DeliveryScopeSummary
        deliveryContract={request.deliveryContract}
        confirmed={request.confirmedDecisions}
        remaining={request.remainingDecisions}
        className="mb-4"
      />
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-medium text-foreground">
            {request.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {request.overview}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {request.sections.map((section) => (
          <div
            key={section.id}
            className="rounded-lg border border-border/40 bg-muted/30 p-3.5"
          >
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </h4>
            <ul className="flex flex-col gap-1.5">
              {section.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/50" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {response ? (
        <div className="mt-5">
          {response.approved ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50/60 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
              <Check className="size-4" />
              <span>Plan approved — building your app.</span>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-50/60 p-3 text-sm text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">
              <p className="font-medium">Plan revision requested.</p>
              {response.note && (
                <p className="mt-1 text-muted-foreground">{response.note}</p>
              )}
              <p className="mt-1 text-muted-foreground">
                Chat below to refine, or ask for changes. A revised plan will
                appear here.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3">
          <Button
            type="button"
            className="flex-1 gap-2"
            onClick={() => void onApprove()}
          >
            <Check className="size-4" />
            Approve Plan &amp; Build
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void onRevision()}
          >
            Request changes
          </Button>
        </div>
      )}
    </div>
  );
}

function DeliveryScopeSummary({
  deliveryContract,
  confirmed,
  remaining,
  className = "",
}: {
  deliveryContract: Plan["deliveryContract"];
  confirmed: number;
  remaining: number;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/25 px-3 py-2 text-xs ${className}`}
    >
      <span className="font-semibold text-foreground">
        {getDeliveryContractLabel(deliveryContract)}
      </span>
      <span className="text-muted-foreground">
        {confirmed} decision{confirmed === 1 ? "" : "s"} confirmed · {remaining}{" "}
        remaining
      </span>
    </div>
  );
}
