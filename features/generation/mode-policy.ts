import { randomUUID } from "node:crypto";

import type {
  AgentAction,
  ClarificationRequest,
  SupabaseSetupRequirements,
} from "@/features/generation/agent-contracts";
import type { AppSpec } from "@/features/generation/app-spec";
import { describePersistenceIntent } from "@/features/generation/persistence-intent";
import { buildSelectedApiPurposeStep } from "@/features/integrations/generation-contract";
import type { IntegrationProvider } from "@/features/integrations/registry";
import { createSupabaseBackendPlan } from "@/features/integrations/server/supabase-backend-plan";
import { getAuthenticatedTasksBackendPlan } from "@/features/integrations/supabase-backend";
import type { SupabaseBackendColumn } from "@/features/integrations/supabase-backend";

function summarizePrompt(prompt: string) {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  if (!normalized) return "this app";
  return normalized.length <= 90
    ? `“${normalized}”`
    : `“${normalized.slice(0, 87).trimEnd()}...”`;
}

export function shouldAskPersistenceQuestion(
  spec: AppSpec,
  options?: {
    force?: boolean;
    supabaseProvisioned?: boolean;
  },
): boolean {
  const intent = spec.dataPersistence;

  if (!intent.detected) {
    return false;
  }

  if (intent.status === "connect_declined") {
    return false;
  }

  if (intent.recommendation === "prototype") {
    return false;
  }

  if (options?.supabaseProvisioned === true) {
    return false;
  }

  if (options?.force) {
    return true;
  }

  if (
    intent.status === "connect_confirmed" &&
    options?.supabaseProvisioned === false
  ) {
    return true;
  }

  return intent.status === "not_prompted";
}

export function shouldRequireBackendSetupBeforeCodegen(
  spec: AppSpec,
  options?: {
    supabaseProvisioned?: boolean;
  },
): boolean {
  return shouldAskPersistenceQuestion(spec, {
    force:
      spec.dataPersistence.status === "connect_confirmed" &&
      options?.supabaseProvisioned === false,
    supabaseProvisioned: options?.supabaseProvisioned,
  });
}

export function buildPersistenceDecisionStep(
  spec: AppSpec,
  options?: { force?: boolean },
): ClarificationRequest["steps"] {
  const intent = spec.dataPersistence;
  const shouldAsk = shouldAskPersistenceQuestion(spec, options);
  if (!shouldAsk) {
    return [];
  }

  const appSummary = summarizePrompt(spec.overview.purpose || "this app");
  const wasExplicitlyRequested = intent.explicitlyRequested === true;
  const requiresDirectSupabaseAsk =
    wasExplicitlyRequested || intent.recommendation === "require_database";
  const shouldConnectLabel =
    intent.recommendation === "require_database"
      ? "Yes, connect Supabase now"
      : "Yes, use a real backend now";

  const schemaLine =
    intent.proposedSchema.length > 0
      ? `Proposed schema: ${intent.proposedSchema
          .map((entity) => entity.entity)
          .join(", ")}.`
      : "";
  const requestLine = wasExplicitlyRequested
    ? `You asked for a backend-capable build for ${appSummary}.`
    : `This app is likely to need persistence for ${appSummary}.`;

  return [
    {
      id: "data-persistence-connect",
      title: requiresDirectSupabaseAsk
        ? "Connect Supabase to continue"
        : "Backend needed for this request?",
      description: requiresDirectSupabaseAsk
        ? `${requestLine} ${schemaLine} ${describePersistenceIntent(intent)} Connect Supabase to keep persistence and auth in-scope.`.trim()
        : `This app appears to need persisted records for ${appSummary}. ${schemaLine} ${describePersistenceIntent(intent)} Choose the persistence strategy now.`.trim(),
      options: [
        {
          id: "connect-db-now",
          label: shouldConnectLabel,
          description: requiresDirectSupabaseAsk
            ? "Link Supabase and generate the project with live database-backed auth, storage, and project setup guidance."
            : "Use a real backend store so records survive refreshes, support multiple users, and enable future query/edit/history patterns.",
        },
        ...(!requiresDirectSupabaseAsk
          ? [
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
            ]
          : [
              {
                id: "prototype-local-only",
                label: "Build without backend for now",
                description:
                  "Generate a frontend-only MVP and add persistence later with the same prompt. You can connect Supabase in the next pass when you’re ready.",
              },
            ]),
      ],
    },
  ];
}

export function buildDirectBackendSetupRequest({
  messageId,
  prompt,
  spec,
}: {
  messageId: string;
  prompt?: string;
  spec: AppSpec;
}): AgentAction {
  const originalUserRequest = (
    prompt ||
    spec.overview.purpose ||
    "Build this app"
  )
    .trim()
    .slice(0, 8000);
  const appSummary = summarizePrompt(spec.overview.purpose || "this app");
  const entities = spec.dataPersistence.proposedSchema
    .map((entity) => entity.entity.trim())
    .filter(Boolean)
    .slice(0, 3);
  const dataDescription = entities.length
    ? ` The connected project will hold ${entities.join(", ")}.`
    : "";
  const requirements = classifySupabaseSetupRequirements({
    prompt: originalUserRequest,
    spec,
  });

  return {
    action: "request_backend_setup",
    request: {
      id: `backend-setup-${messageId}`,
      title: "Add a database",
      description:
        `This app needs saved data for ${appSummary}. Connect Supabase now, or continue with browser-only data.${dataDescription}`.trim(),
      capabilities: [
        "Persistent data across refreshes and devices",
        "Browser-safe Supabase runtime configuration",
        "Server-approved database and security setup",
      ],
      requirements,
      continuation: {
        id: randomUUID(),
        originalMessageId: messageId,
        originalUserRequest,
        mode: "direct",
        status: "pending",
      },
    },
  };
}

export function classifySupabaseSetupRequirements({
  prompt,
  spec,
}: {
  prompt: string;
  spec: AppSpec;
}): SupabaseSetupRequirements {
  const normalized = `${prompt} ${spec.overview.purpose ?? ""} ${spec.architecture.authentication ?? ""}`;
  const database =
    spec.dataPersistence.detected &&
    spec.dataPersistence.recommendation !== "prototype";
  const authentication =
    Boolean(spec.architecture.authentication?.trim()) ||
    /\b(?:auth|authentication|sign[ -]?(?:in|up)|log[ -]?in|accounts?|users?\s+can)\b/i.test(
      normalized,
    );
  const storage =
    /\b(?:supabase\s+storage|file uploads?|image uploads?|storage bucket)\b/i.test(
      normalized,
    );
  const realtime = /\b(?:realtime|real-time|live updates?|presence)\b/i.test(
    normalized,
  );
  const privilegedServerLogic =
    /\b(?:service[_ -]?role|webhooks?|admin operations?|privileged|server function|secret key)\b/i.test(
      normalized,
    );
  const hasTasksEntity = spec.dataPersistence.proposedSchema.some((entity) =>
    /\btasks?\b/i.test(entity.entity),
  );
  const isTaskApp = /\b(?:task manager|todo|to-do|tasks?)\b/i.test(normalized);
  const backendPlan =
    database && authentication
      ? hasTasksEntity || isTaskApp
        ? getAuthenticatedTasksBackendPlan()
        : buildBackendPlanFromAppSpec(spec)
      : null;

  return {
    database,
    authentication,
    storage,
    realtime,
    privilegedServerLogic,
    ...(backendPlan
      ? {
          backendTemplate: backendPlan.template,
          backendPlan,
        }
      : {}),
  };
}

const RESERVED_BACKEND_IDENTIFIERS = new Set([
  "id",
  "user_id",
  "created_at",
  "updated_at",
  "tableoid",
  "xmin",
  "cmin",
  "xmax",
  "cmax",
  "ctid",
]);

function backendIdentifier(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^[^a-z]+/, "")
    .slice(0, 48);
  const identifier = normalized || fallback;
  return RESERVED_BACKEND_IDENTIFIERS.has(identifier)
    ? `${identifier}_value`.slice(0, 48)
    : identifier;
}

function inferBackendColumn(
  field: string,
  index: number,
): SupabaseBackendColumn {
  const [rawName = "", rawDescription = ""] = field.split(/[:—-]/, 2);
  const name = backendIdentifier(rawName, `field_${index + 1}`);
  const description = `${field} ${rawDescription}`.toLowerCase();
  const type = /\b(?:boolean|bool|completed|enabled|active|published)\b/.test(
    description,
  )
    ? ("boolean" as const)
    : /\b(?:timestamp|datetime|date and time)\b/.test(description)
      ? ("timestamptz" as const)
      : /\bdate\b/.test(description)
        ? ("date" as const)
        : /\b(?:integer|count|quantity|position|rank)\b/.test(description)
          ? ("integer" as const)
          : /\b(?:number|decimal|price|amount|total)\b/.test(description)
            ? ("numeric" as const)
            : /\b(?:json|metadata|settings)\b/.test(description)
              ? ("jsonb" as const)
              : ("text" as const);
  return {
    name,
    type,
    nullable: false,
    unique: false,
    ...(type === "text" ? { maxLength: 2_000 } : {}),
  };
}

function buildBackendPlanFromAppSpec(spec: AppSpec) {
  const sourceEntities = spec.dataPersistence.proposedSchema.slice(0, 4);
  if (!sourceEntities.length) return null;
  const names = sourceEntities.map((entity, index) =>
    backendIdentifier(entity.entity, `entity_${index + 1}`),
  );
  if (new Set(names).size !== names.length) return null;
  const entities = sourceEntities.map((entity, entityIndex) => {
    const columns = (entity.fields?.length ? entity.fields : ["name: text"])
      .slice(0, 16)
      .map(inferBackendColumn);
    const uniqueColumns: SupabaseBackendColumn[] = Array.from(
      new Map(columns.map((column) => [column.name, column])).values(),
    );
    const relationships = (entity.relationships ?? []).flatMap(
      (relationship) => {
        const targetIndex = sourceEntities.findIndex(
          (target, index) =>
            index !== entityIndex &&
            relationship
              .toLowerCase()
              .includes(target.entity.trim().toLowerCase()),
        );
        if (targetIndex < 0) return [];
        const column = backendIdentifier(
          `${names[targetIndex]}_id`,
          "parent_id",
        );
        if (!uniqueColumns.some((candidate) => candidate.name === column)) {
          uniqueColumns.push({
            name: column,
            type: "uuid",
            nullable: false,
            unique: false,
          });
        }
        return [
          {
            column,
            targetEntity: names[targetIndex],
            onDelete: "cascade" as const,
          },
        ];
      },
    );
    return {
      name: names[entityIndex],
      columns: uniqueColumns,
      indexes: [],
      relationships,
    };
  });
  const hasRelationships = entities.some(
    (entity) => entity.relationships.length > 0,
  );
  const isPublicRead =
    /\b(?:public|published|catalog|directory|anyone can view)\b/i.test(
      `${spec.dataPersistence.useCase ?? ""} ${spec.overview.purpose ?? ""}`,
    );
  if (hasRelationships && entities.length > 1) {
    return createSupabaseBackendPlan({
      version: 2,
      template: "related_owner_scoped",
      summary: `Create ${entities.length} related, owner-scoped tables with authenticated CRUD access.`,
      operations: ["select", "insert", "update", "delete"],
      destructive: false,
      entities,
    });
  }
  const { relationships: _relationships, ...singleEntity } = entities[0];
  return createSupabaseBackendPlan({
    version: 2,
    template: isPublicRead ? "public_read_owner_write" : "owner_scoped_crud",
    summary: isPublicRead
      ? `Create public-read, owner-write storage for ${entities[0].name}.`
      : `Create owner-scoped authenticated CRUD storage for ${entities[0].name}.`,
    operations: ["select", "insert", "update", "delete"],
    destructive: false,
    entity: singleEntity,
  });
}

export function buildPlanModeFallbackInterview({
  messageId,
  prompt,
  spec,
  providersNeedingPurpose,
  options,
}: {
  messageId: string;
  prompt: string;
  spec: AppSpec;
  providersNeedingPurpose: IntegrationProvider[];
  options?: {
    force?: boolean;
  };
}): AgentAction {
  const appSummary = summarizePrompt(prompt);
  const steps: ClarificationRequest["steps"] = [];
  steps.push(...buildPersistenceDecisionStep(spec, options));

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
