import { z } from "zod";

export const appSpecStatusSchema = z.enum([
  "interviewing",
  "ready_for_plan",
  "awaiting_approval",
  "approved",
  "generating",
  "needs_clarification",
]);

export type AppSpecStatus = z.infer<typeof appSpecStatusSchema>;

export const unresolvedDecisionSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  question: z.string().min(1),
  impact: z.enum(["low", "medium", "high"]),
});

export type UnresolvedDecision = z.infer<typeof unresolvedDecisionSchema>;

export const userFlowSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  actors: z.array(z.string()).optional(),
});

export type UserFlow = z.infer<typeof userFlowSchema>;

export const dataEntitySchema = z.object({
  entity: z.string().min(1),
  purpose: z.string().min(1),
  fields: z.array(z.string()).optional(),
  relationships: z.array(z.string()).optional(),
});

export type DataEntity = z.infer<typeof dataEntitySchema>;

export const integrationSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().min(1),
  required: z.boolean().default(false),
});

export type Integration = z.infer<typeof integrationSchema>;

export const appSpecSchema = z.object({
  version: z.number().int().default(1),
  status: appSpecStatusSchema.default("interviewing"),

  overview: z
    .object({
      name: z.string().optional(),
      purpose: z.string().optional(),
      audience: z.array(z.string()).optional(),
      appType: z.string().optional(),
      platforms: z.array(z.string()).optional(),
    })
    .default({}),

  userFlows: z.array(userFlowSchema).default([]),

  features: z
    .object({
      mustHave: z.array(z.string()).default([]),
      niceToHave: z.array(z.string()).default([]),
      excluded: z.array(z.string()).optional(),
    })
    .default({ mustHave: [], niceToHave: [] }),

  architecture: z
    .object({
      frontend: z.string().optional(),
      backend: z.string().optional(),
      persistence: z.string().optional(),
      authentication: z.string().optional(),
      authorization: z.string().optional(),
      deployment: z.string().optional(),
    })
    .default({}),

  dataModel: z.array(dataEntitySchema).default([]),

  integrations: z.array(integrationSchema).default([]),

  design: z
    .object({
      visualDirection: z.string().optional(),
      colors: z.array(z.string()).optional(),
      typography: z.string().optional(),
      layout: z.string().optional(),
      responsiveStrategy: z.string().optional(),
      references: z.array(z.string()).optional(),
    })
    .default({}),

  constraints: z
    .object({
      performance: z.array(z.string()).optional(),
      security: z.array(z.string()).optional(),
      privacy: z.array(z.string()).optional(),
      budget: z.array(z.string()).optional(),
      timeline: z.string().optional(),
    })
    .default({}),

  edgeCases: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),

  unresolvedDecisions: z.array(unresolvedDecisionSchema).default([]),

  askedQuestionIds: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100).optional(),
});

export type AppSpec = z.infer<typeof appSpecSchema>;

export function createEmptyAppSpec(): AppSpec {
  return appSpecSchema.parse({
    status: "interviewing",
    version: 1,
  });
}

export function parseAppSpec(value: unknown): AppSpec | null {
  const result = appSpecSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function mergeSpecUpdate(
  spec: AppSpec,
  update: Partial<AppSpec> | null | undefined,
): AppSpec {
  if (!update) return spec;

  const merged: AppSpec = {
    ...spec,
    ...update,
    overview: { ...spec.overview, ...update.overview },
    features: { ...spec.features, ...update.features },
    architecture: { ...spec.architecture, ...update.architecture },
    design: { ...spec.design, ...update.design },
    constraints: { ...spec.constraints, ...update.constraints },
    userFlows: update.userFlows ?? spec.userFlows,
    dataModel: update.dataModel ?? spec.dataModel,
    integrations: update.integrations ?? spec.integrations,
    edgeCases: update.edgeCases ?? spec.edgeCases,
    acceptanceCriteria: update.acceptanceCriteria ?? spec.acceptanceCriteria,
    assumptions: update.assumptions ?? spec.assumptions,
    unresolvedDecisions: update.unresolvedDecisions ?? spec.unresolvedDecisions,
    askedQuestionIds: update.askedQuestionIds
      ? Array.from(
          new Set([...spec.askedQuestionIds, ...update.askedQuestionIds]),
        )
      : spec.askedQuestionIds,
    confidence: update.confidence ?? spec.confidence,
    status: update.status ?? spec.status,
    version: update.version ?? spec.version,
  };

  return merged;
}

export function serializeSpecForPrompt(
  spec: AppSpec,
  mode: "compact" | "full",
): string {
  const parts: string[] = [];

  parts.push(`[Workflow status: ${spec.status}]`);

  if (spec.overview.name) parts.push(`App: ${spec.overview.name}`);
  if (spec.overview.purpose) parts.push(`Purpose: ${spec.overview.purpose}`);
  if (spec.overview.appType) parts.push(`Type: ${spec.overview.appType}`);
  if (spec.overview.audience?.length)
    parts.push(`Audience: ${spec.overview.audience.join(", ")}`);
  if (spec.overview.platforms?.length)
    parts.push(`Platforms: ${spec.overview.platforms.join(", ")}`);

  if (spec.features.mustHave.length) {
    parts.push(`Must-have: ${spec.features.mustHave.join("; ")}`);
  }
  if (spec.features.niceToHave.length) {
    parts.push(`Nice-to-have: ${spec.features.niceToHave.join("; ")}`);
  }
  if (spec.features.excluded?.length) {
    parts.push(`Excluded: ${spec.features.excluded.join("; ")}`);
  }

  if (spec.architecture.frontend)
    parts.push(`Frontend: ${spec.architecture.frontend}`);
  if (spec.architecture.backend)
    parts.push(`Backend: ${spec.architecture.backend}`);
  if (spec.architecture.persistence)
    parts.push(`Persistence: ${spec.architecture.persistence}`);
  if (spec.architecture.authentication)
    parts.push(`Auth: ${spec.architecture.authentication}`);
  if (spec.architecture.authorization)
    parts.push(`Authz: ${spec.architecture.authorization}`);
  if (spec.architecture.deployment)
    parts.push(`Deploy: ${spec.architecture.deployment}`);

  if (spec.userFlows.length) {
    parts.push(
      `Flows: ${spec.userFlows
        .map((f) => `${f.name} - ${f.description}`)
        .join("; ")}`,
    );
  }

  if (spec.dataModel.length) {
    parts.push(
      `Data: ${spec.dataModel
        .map((e) => `${e.entity} (${e.purpose})`)
        .join("; ")}`,
    );
  }

  if (spec.integrations.length) {
    parts.push(
      `Integrations: ${spec.integrations
        .map((i) => `${i.name}${i.required ? " (required)" : ""}: ${i.purpose}`)
        .join("; ")}`,
    );
  }

  if (spec.design.visualDirection)
    parts.push(`Visual: ${spec.design.visualDirection}`);
  if (spec.design.colors?.length)
    parts.push(`Colors: ${spec.design.colors.join(", ")}`);
  if (spec.design.typography) parts.push(`Type: ${spec.design.typography}`);
  if (spec.design.layout) parts.push(`Layout: ${spec.design.layout}`);
  if (spec.design.responsiveStrategy)
    parts.push(`Responsive: ${spec.design.responsiveStrategy}`);

  if (spec.constraints.performance?.length)
    parts.push(`Perf: ${spec.constraints.performance.join("; ")}`);
  if (spec.constraints.security?.length)
    parts.push(`Security: ${spec.constraints.security.join("; ")}`);
  if (spec.constraints.privacy?.length)
    parts.push(`Privacy: ${spec.constraints.privacy.join("; ")}`);

  if (spec.edgeCases.length)
    parts.push(`Edge cases: ${spec.edgeCases.join("; ")}`);
  if (spec.acceptanceCriteria.length)
    parts.push(`Acceptance: ${spec.acceptanceCriteria.join("; ")}`);

  if (spec.assumptions.length) {
    parts.push(`Assumptions: ${spec.assumptions.join("; ")}`);
  }

  const highImpact = spec.unresolvedDecisions.filter(
    (d) => d.impact === "high",
  );
  if (highImpact.length) {
    parts.push(
      `UNRESOLVED HIGH-IMPACT: ${highImpact.map((d) => d.topic).join("; ")}`,
    );
  }

  if (spec.askedQuestionIds.length) {
    parts.push(`Asked question IDs: ${spec.askedQuestionIds.join(", ")}`);
  }

  if (mode === "full" && spec.unresolvedDecisions.length > highImpact.length) {
    const other = spec.unresolvedDecisions.filter((d) => d.impact !== "high");
    if (other.length) {
      parts.push(
        `Other unresolved: ${other
          .map((d) => `[${d.impact}] ${d.topic}`)
          .join("; ")}`,
      );
    }
  }

  if (spec.confidence !== undefined) {
    parts.push(`Confidence: ${spec.confidence}%`);
  }

  return parts.join("\n");
}

export function hasHighImpactUnresolved(spec: AppSpec): boolean {
  return spec.unresolvedDecisions.some((d) => d.impact === "high");
}

export function isReadyForPlan(spec: AppSpec): boolean {
  return (
    !hasHighImpactUnresolved(spec) &&
    (spec.confidence === undefined || spec.confidence >= 70) &&
    spec.status !== "awaiting_approval" &&
    spec.status !== "approved"
  );
}
