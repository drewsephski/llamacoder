import type {
  AgentAction,
  ClarificationRequest,
} from "@/features/generation/agent-contracts";
import type { AppSpec } from "@/features/generation/app-spec";
import { describePersistenceIntent } from "@/features/generation/persistence-intent";
import { buildSelectedApiPurposeStep } from "@/features/integrations/generation-contract";
import type { IntegrationProvider } from "@/features/integrations/registry";

function summarizePrompt(prompt: string) {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  if (!normalized) return "this app";
  return normalized.length <= 90
    ? `“${normalized}”`
    : `“${normalized.slice(0, 87).trimEnd()}...”`;
}

function buildPersistenceDecisionStep(
  spec: AppSpec,
): ClarificationRequest["steps"] {
  const intent = spec.dataPersistence;
  const hasAlreadySelectedPersistenceProvider = spec.integrations.some(
    (integration) => integration.providerId === "supabase",
  );
  const shouldAskPersistenceQuestion =
    !hasAlreadySelectedPersistenceProvider &&
    intent.detected &&
    intent.status === "not_prompted" &&
    intent.recommendation !== "prototype";

  if (!shouldAskPersistenceQuestion) {
    return [];
  }

  const appSummary = summarizePrompt(spec.overview.purpose || "this app");
  const shouldConnectLabel =
    intent.recommendation === "require_database"
      ? "Use real database (Recommended)"
      : "Use real database now (Recommended)";

  const schemaLine =
    intent.proposedSchema.length > 0
      ? `Proposed schema: ${intent.proposedSchema
          .map((entity) => entity.entity)
          .join(", ")}.`
      : "";

  return [
    {
      id: "data-persistence-connect",
      title: "How should records be persisted?",
      description:
        `We detected a recurring data record model for ${appSummary}. ${schemaLine} ${describePersistenceIntent(intent)} Choose the persistence strategy now.`.trim(),
      options: [
        {
          id: "connect-db-now",
          label: shouldConnectLabel,
          description:
            "Use a real backend store so records survive refreshes, support multiple users, and enable future query/edit/history patterns.",
        },
        {
          id: "prototype-local-only",
          label: "Prototype locally first",
          description:
            "Keep local state for v1, but keep a clear upgrade path to a real database in the plan.",
        },
        {
          id: "defer-db-planning",
          label: "Defer persistence design",
          description:
            "Do not add storage assumptions yet; keep the app shape and wire persistence later.",
        },
      ],
    },
  ];
}

export function buildPlanModeFallbackInterview({
  messageId,
  prompt,
  spec,
  providersNeedingPurpose,
}: {
  messageId: string;
  prompt: string;
  spec: AppSpec;
  providersNeedingPurpose: IntegrationProvider[];
}): AgentAction {
  const appSummary = summarizePrompt(prompt);
  const steps: ClarificationRequest["steps"] = [];
  steps.push(...buildPersistenceDecisionStep(spec));

  if (providersNeedingPurpose.length > 0) {
    steps.push(
      buildSelectedApiPurposeStep({
        prompt,
        providers: providersNeedingPurpose,
      }),
    );
  }

  steps.push(
    {
      id: "primary-outcome",
      title: "What must the first version accomplish?",
      description: `Choose the outcome that should drive scope for ${appSummary}.`,
      options: [
        {
          id: "complete-core-workflow",
          label: "Complete core workflow (Recommended)",
          description:
            "Prioritize one end-to-end job that works convincingly over a wider set of shallow features.",
        },
        {
          id: "polished-demo",
          label: "Polished demo",
          description:
            "Prioritize presentation and a strong happy path for showing the concept.",
        },
        {
          id: "broad-prototype",
          label: "Broad prototype",
          description:
            "Explore more capabilities now, accepting less depth in each workflow.",
        },
      ],
    },
    {
      id: "primary-audience",
      title: "Who is the primary user?",
      description:
        "This changes information density, onboarding, terminology, and the default workflow.",
      options: [
        {
          id: "focused-end-user",
          label: "Focused end user (Recommended)",
          description:
            "Optimize the product around the person directly completing its main job.",
        },
        {
          id: "internal-team",
          label: "Internal team",
          description:
            "Favor operational visibility, dense controls, and repeat use by trained users.",
        },
        {
          id: "broad-public",
          label: "Broad public",
          description:
            "Favor immediate comprehension, lightweight onboarding, and safer defaults.",
        },
      ],
    },
    {
      id: "data-and-accounts",
      title: "What data and account model should v1 use?",
      description:
        "This is the largest architecture boundary because it determines persistence, privacy, and backend setup.",
      options: [
        {
          id: "local-no-account",
          label: "Local, no account (Recommended)",
          description:
            "Ship a complete browser experience without pretending managed auth or persistence exists.",
        },
        {
          id: "personal-saved-data",
          label: "Personal saved data",
          description:
            "Design for sign-in and private persistence with an explicit portable backend blueprint.",
        },
        {
          id: "shared-collaboration",
          label: "Shared collaboration",
          description:
            "Plan roles, permissions, shared records, and conflict-safe updates from the start.",
        },
      ],
    },
    {
      id: "product-character",
      title: "What product character should lead the design?",
      description:
        "Choose a direction strong enough to shape hierarchy and interaction, not just colors.",
      options: [
        {
          id: "task-first-product",
          label: "Task-first product (Recommended)",
          description:
            "Use a focused application layout with clear status, actions, and working states.",
        },
        {
          id: "editorial-exploration",
          label: "Editorial exploration",
          description:
            "Use stronger storytelling, browsing, and visual pacing where discovery is central.",
        },
        {
          id: "expressive-showcase",
          label: "Expressive showcase",
          description:
            "Use a bolder signature visual when memorability matters more than dense utility.",
        },
      ],
    },
  );

  return {
    action: "interview",
    request: {
      id: `interview-${messageId}`,
      title: "Choose the decisions that will shape the build",
      deliveryContract: spec.deliveryContract,
      confirmedDecisions: spec.askedQuestionIds.length,
      remainingDecisions: Math.max(
        steps.length,
        spec.unresolvedDecisions.filter(
          (decision) => decision.impact === "high",
        ).length,
      ),
      steps: steps.slice(0, 5),
    },
  };
}
