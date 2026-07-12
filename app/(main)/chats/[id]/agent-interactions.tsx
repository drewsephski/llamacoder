"use client";

import { Check, Search } from "lucide-react";

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

export function MessageSources({ sources }: { sources: SourceUrl[] }) {
  if (sources.length === 0) return null;

  return (
    <Sources className="mb-0 text-muted-foreground">
      <SourcesTrigger count={sources.length}>
        <span className="text-xs font-medium">
          {sources.length} {sources.length === 1 ? "source" : "sources"}
        </span>
      </SourcesTrigger>
      <SourcesContent className="max-w-full gap-1.5">
        {sources.slice(0, 8).map((source) => {
          const label = source.title ?? new URL(source.url).hostname;
          return (
            <Source
              key={source.sourceId}
              href={source.url}
              title={label}
              className="max-w-sm overflow-hidden rounded-md px-1 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-current opacity-60" />
              <span className="truncate">{label}</span>
            </Source>
          );
        })}
      </SourcesContent>
    </Sources>
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
