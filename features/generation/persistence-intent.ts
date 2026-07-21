import {
  dataPersistenceIntentSchema,
  type DataPersistenceIntent,
  type DataEntity,
} from "@/features/generation/app-spec";

type CanonicalUseCase = {
  id: string;
  label: string;
  intentReasons: RegExp[];
  lifecycleSignals: RegExp[];
  schema: DataEntity[];
};

const CANONICAL_USE_CASES: CanonicalUseCase[] = [
  {
    id: "crm-sales",
    label: "CRM / sales pipeline",
    intentReasons: [
      /\bcrm\b/i,
      /\bsales\b/i,
      /\bleads?\b/i,
      /\bdeals?\b/i,
      /\bpipeline\b/i,
      /\bcontacts?\b/i,
      /\bcompanies?\b/i,
    ],
    lifecycleSignals: [
      /\bfollow[- ]up\b/i,
      /\bstage/i,
      /\bassigned\b/i,
      /\bowner\b/i,
      /\bclose\b/i,
      /\bqualified\b/i,
      /\bstatus\b/i,
      /\bwon\b/i,
      /\blost\b/i,
    ],
    schema: [
      {
        entity: "contacts",
        purpose: "Store customers or prospects that appear across the app",
        fields: [
          "id",
          "full_name",
          "email",
          "company",
          "phone",
          "created_at",
          "owner_id",
        ],
        relationships: ["has_many_deals", "has_many_activities"],
      },
      {
        entity: "deals",
        purpose: "Track opportunities and movement through process stages",
        fields: [
          "id",
          "contact_id",
          "name",
          "stage",
          "value",
          "expected_close_date",
          "status",
          "created_at",
          "updated_at",
        ],
        relationships: ["belongs_to_contact", "has_many_activities"],
      },
      {
        entity: "deal_activities",
        purpose: "Store timeline events and audit activity",
        fields: [
          "id",
          "entity_type",
          "entity_id",
          "actor_name",
          "event_type",
          "notes",
          "occurred_at",
          "created_at",
        ],
      },
    ],
  },
  {
    id: "support",
    label: "Support tickets & service log",
    intentReasons: [
      /\bticket\b/i,
      /\bissue\b/i,
      /\bsupport\b/i,
      /\bcustomer support\b/i,
      /\bhelpdesk\b/i,
      /\bcase\b/i,
    ],
    lifecycleSignals: [
      /\bassign/i,
      /\bresolved/i,
      /\bescalat/i,
      /\bpriority/i,
      /\bstatus update/i,
      /\breply/i,
      /\breply\b/,
    ],
    schema: [
      {
        entity: "customers",
        purpose: "Store users whose requests need follow-up",
        fields: ["id", "name", "email", "phone", "created_at", "status"],
      },
      {
        entity: "support_tickets",
        purpose: "Track each support request through resolution",
        fields: [
          "id",
          "customer_id",
          "subject",
          "priority",
          "status",
          "assignee_id",
          "created_at",
          "resolved_at",
          "last_updated_at",
        ],
        relationships: ["belongs_to_customer", "has_many_ticket_messages"],
      },
      {
        entity: "ticket_messages",
        purpose: "Store ticket history and commentary",
        fields: [
          "id",
          "ticket_id",
          "author_id",
          "message",
          "message_type",
          "created_at",
        ],
      },
    ],
  },
  {
    id: "project-tracker",
    label: "Project tracker",
    intentReasons: [
      /\bproject\b/i,
      /\broadmap\b/i,
      /\bsprint\b/i,
      /\btask tracker\b/i,
      /\bworkload\b/i,
      /\bteam\b/i,
      /\bkanban\b/i,
    ],
    lifecycleSignals: [
      /\bassign\b/i,
      /\bdue date\b/i,
      /\bcomplete\b/i,
      /\bblocked\b/i,
      /\bbacklog\b/i,
      /\bpriority\b/i,
      /\bcomment\b/i,
    ],
    schema: [
      {
        entity: "projects",
        purpose: "Store a shared work container",
        fields: [
          "id",
          "name",
          "description",
          "status",
          "owner_id",
          "created_at",
        ],
      },
      {
        entity: "tasks",
        purpose: "Track concrete team work with ownership and lifecycle",
        fields: [
          "id",
          "project_id",
          "title",
          "description",
          "assignee_id",
          "status",
          "priority",
          "due_at",
          "created_at",
          "updated_at",
        ],
        relationships: ["belongs_to_project", "has_many_task_comments"],
      },
      {
        entity: "task_comments",
        purpose: "Keep notes and context over task life",
        fields: ["id", "task_id", "author_id", "message", "created_at"],
      },
    ],
  },
  {
    id: "cms",
    label: "Simple CMS",
    intentReasons: [
      /\bcontent\b/i,
      /\bblog\b/i,
      /\bpost\b/i,
      /\barticle\b/i,
      /\bpage\b/i,
      /\bpublisher\b/i,
      /\bnews\b/i,
    ],
    lifecycleSignals: [
      /\bpublish\b/i,
      /\bunpublish\b/i,
      /\brevision\b/i,
      /\bcategory\b/i,
      /\beditor\b/i,
    ],
    schema: [
      {
        entity: "authors",
        purpose: "Store creators and publishing ownership",
        fields: ["id", "name", "email", "bio", "role", "created_at"],
      },
      {
        entity: "articles",
        purpose: "Store versioned content for public and private use",
        fields: [
          "id",
          "author_id",
          "title",
          "slug",
          "body",
          "status",
          "published_at",
          "updated_at",
        ],
        relationships: ["belongs_to_author"],
      },
      {
        entity: "article_sections",
        purpose: "Model reusable blocks and structured editing",
        fields: ["id", "article_id", "kind", "payload", "sort_order"],
      },
    ],
  },
  {
    id: "inventory",
    label: "Inventory & order tracking",
    intentReasons: [
      /\binventory\b/i,
      /\bstock\b/i,
      /\border\b/i,
      /\bproduct\b/i,
      /\bsku\b/i,
      /\bsupplier\b/i,
      /\bwarehouse\b/i,
    ],
    lifecycleSignals: [
      /\bquantity\b/i,
      /\breceipt\b/i,
      /\bfulfill/i,
      /\bshipment/i,
      /\bcancel/i,
      /\bbackorder/i,
    ],
    schema: [
      {
        entity: "products",
        purpose: "Track catalog entries and stock metadata",
        fields: [
          "id",
          "name",
          "sku",
          "category",
          "unit_price",
          "created_at",
          "updated_at",
        ],
      },
      {
        entity: "stock_locations",
        purpose: "Represent inventory capacity per location",
        fields: [
          "id",
          "product_id",
          "location_name",
          "quantity_available",
          "reorder_point",
        ],
        relationships: [
          "belongs_to_product",
          "has_many_inventory_transactions",
        ],
      },
      {
        entity: "orders",
        purpose: "Store customer demand and fulfillment checkpoints",
        fields: [
          "id",
          "customer_name",
          "status",
          "subtotal",
          "total",
          "ordered_at",
          "shipped_at",
        ],
      },
    ],
  },
];

const NEGATIVE_DECLINE_PATTERNS = [
  /\blocal only\b/i,
  /\bno backend\b/i,
  /\bprototype\b/i,
  /\btemporary\b/i,
  /\bjust a demo\b/i,
  /\bmock(bed)? data\b/i,
  /\bno persistence\b/i,
  /\bdon't need real data\b/i,
];

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function scoreUseCase(input: string, candidate: CanonicalUseCase) {
  let score = 0;
  let reasons: string[] = [];

  for (const pattern of candidate.intentReasons) {
    if (pattern.test(input)) {
      score += 26;
      reasons.push(`intent pattern matched: ${pattern.source}`);
    }
  }

  for (const pattern of candidate.lifecycleSignals) {
    if (pattern.test(input)) {
      score += 12;
      reasons.push(`lifecycle signal matched: ${pattern.source}`);
    }
  }

  if (/\b(track|manage|log|history|timeline|status|stage)\b/i.test(input)) {
    score += 16;
  }

  const uniqueReasons = Array.from(new Set(reasons));
  return { score, reasons: uniqueReasons };
}

function clampScore(score: number) {
  if (score < 0) return 0;
  return Math.min(100, Math.floor(score));
}

function mergeReasons(reasons: string[]) {
  return reasons.slice(0, 3).join("; ");
}

export function detectPersistenceIntentFromText(
  value: string,
): DataPersistenceIntent {
  const normalized = normalize(value);
  if (!normalized) {
    return dataPersistenceIntentSchema.parse({
      detected: false,
      confidence: 0,
      recommendation: "prototype",
      useCase: undefined,
      reason: "No user intent content available for persistence detection.",
      status: "not_prompted",
      proposedSchema: [],
    });
  }

  const best = CANONICAL_USE_CASES.reduce<{
    id: string;
    label: string;
    score: number;
    reasons: string[];
    schema: DataEntity[];
  }>(
    (bestScore, candidate) => {
      const scored = scoreUseCase(normalized, candidate);
      if (scored.score > bestScore.score) {
        return {
          id: candidate.id,
          label: candidate.label,
          score: scored.score,
          reasons: scored.reasons,
          schema: candidate.schema,
        };
      }
      return bestScore;
    },
    {
      id: "generic",
      label: "Record tracking",
      score: 0,
      reasons: [],
      schema: [],
    },
  );

  const detected = best.score >= 58;
  const hasLifecycleSignal =
    /\b(track|status|assign|move|close|resolve|publish|task|order|stage)\b/i.test(
      normalized,
    );
  const negativeDecline = NEGATIVE_DECLINE_PATTERNS.some((pattern) =>
    pattern.test(normalized),
  );
  const recommendation =
    negativeDecline ||
    /\bno(?:-| )db\b/i.test(normalized) ||
    /\bno\s+database\b/i.test(normalized)
      ? "prototype"
      : best.score >= 84
        ? "require_database"
        : best.score >= 58
          ? "suggest_database"
          : "prototype";

  const confidence = clampScore(
    best.score + (hasLifecycleSignal ? 12 : 0) + (negativeDecline ? -25 : 0),
  );

  const shouldPersist = detected && recommendation !== "prototype";
  const useCase = shouldPersist
    ? best.label
    : best.score >= 45
      ? "Workflow data tracking"
      : "Prototype data";

  return dataPersistenceIntentSchema.parse({
    detected: shouldPersist,
    confidence,
    recommendation,
    useCase,
    reason:
      shouldPersist && best.reasons.length
        ? mergeReasons(best.reasons)
        : hasLifecycleSignal
          ? "Lifecycle verbs and state terms were present, but intent confidence is below the persistence threshold."
          : "The request reads like a static or one-off UI/task surface.",
    status: "not_prompted",
    proposedSchema: shouldPersist ? best.schema : [],
  });
}

export function detectPersistenceIntentFromMessages(
  messages: Array<{ content: string }>,
) {
  if (messages.length === 0) {
    return detectPersistenceIntentFromText("");
  }
  const combined = messages
    .slice(-6)
    .map((message) => normalize(message.content))
    .filter(Boolean)
    .join("\n");
  return detectPersistenceIntentFromText(combined);
}

export function describePersistenceIntent(intent: DataPersistenceIntent) {
  const proposedSchema = intent.proposedSchema
    .map(
      (entity) =>
        `${entity.entity} (${entity.fields?.join(", ") ?? "fields pending"})`,
    )
    .join(", ");
  const decisionLine =
    intent.recommendation === "prototype"
      ? "Prototype-first approach is currently recommended."
      : intent.recommendation === "require_database"
        ? "Persistent storage is strongly recommended."
        : "Persistent storage is recommended.";

  return `Detected persistence need: ${intent.detected ? "Yes" : "No"}.
Confidence: ${intent.confidence} / 100.
Use case: ${intent.useCase ?? "Unknown"}.
Decision: ${decisionLine}
Reason: ${intent.reason ?? "No specific rationale found."}
Proposed schema: ${proposedSchema || "not yet available."}`;
}
