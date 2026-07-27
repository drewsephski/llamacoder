import { z } from "zod";

export const authenticatedTasksBackendPlanSchema = z
  .object({
    version: z.literal(1),
    template: z.literal("authenticated_tasks"),
    summary: z.literal(
      "Create a tasks table protected by row-level security so signed-in users can access only their own tasks.",
    ),
    migrationChecksum: z.string().regex(/^[a-f0-9]{64}$/),
    destructive: z.literal(false),
  })
  .strict();

const postgresIdentifierSchema = z
  .string()
  .min(1)
  .max(48)
  .regex(/^[a-z][a-z0-9_]*$/)
  .refine(
    (identifier) =>
      ![
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
        "all",
        "alter",
        "and",
        "auth",
        "check",
        "constraint",
        "create",
        "default",
        "delete",
        "drop",
        "false",
        "foreign",
        "from",
        "grant",
        "group",
        "insert",
        "into",
        "not",
        "null",
        "order",
        "policy",
        "primary",
        "public",
        "references",
        "revoke",
        "select",
        "table",
        "true",
        "unique",
        "update",
        "user",
        "using",
        "where",
        "with",
      ].includes(identifier),
    "Identifier is reserved by the backend plan compiler.",
  );

export const supabaseBackendColumnSchema = z
  .object({
    name: postgresIdentifierSchema,
    type: z.enum([
      "text",
      "boolean",
      "integer",
      "bigint",
      "numeric",
      "timestamptz",
      "date",
      "jsonb",
      "uuid",
    ]),
    nullable: z.boolean().default(false),
    unique: z.boolean().default(false),
    maxLength: z.number().int().min(1).max(10_000).optional(),
    default: z
      .discriminatedUnion("kind", [
        z.object({ kind: z.literal("now") }).strict(),
        z.object({ kind: z.literal("boolean"), value: z.boolean() }).strict(),
        z
          .object({ kind: z.literal("number"), value: z.number().finite() })
          .strict(),
        z.object({ kind: z.literal("empty_object") }).strict(),
      ])
      .optional(),
  })
  .strict()
  .superRefine((column, context) => {
    if (column.maxLength !== undefined && column.type !== "text") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxLength"],
        message: "maxLength is supported only for text columns.",
      });
    }
    if (
      column.default &&
      !(
        (column.default.kind === "now" && column.type === "timestamptz") ||
        (column.default.kind === "boolean" && column.type === "boolean") ||
        (column.default.kind === "number" &&
          ["integer", "bigint", "numeric"].includes(column.type) &&
          (column.type === "numeric" ||
            Number.isSafeInteger(column.default.value))) ||
        (column.default.kind === "empty_object" && column.type === "jsonb")
      )
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["default"],
        message: "The default value is incompatible with the column type.",
      });
    }
  });

export type SupabaseBackendColumn = z.infer<typeof supabaseBackendColumnSchema>;

const backendEntityShape = {
  name: postgresIdentifierSchema,
  columns: z.array(supabaseBackendColumnSchema).min(1).max(16),
  indexes: z
    .array(
      z
        .object({
          columns: z.array(postgresIdentifierSchema).min(1).max(3),
          unique: z.boolean().default(false),
        })
        .strict(),
    )
    .max(8)
    .default([]),
};

function validateBackendEntity(
  entity: {
    name: string;
    columns: Array<{ name: string }>;
    indexes: Array<{ columns: string[] }>;
  },
  context: z.RefinementCtx,
) {
  const columnNames = new Set<string>();
  for (const [index, column] of entity.columns.entries()) {
    if (columnNames.has(column.name)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["columns", index, "name"],
        message: "Column names must be unique within an entity.",
      });
    }
    columnNames.add(column.name);
  }
  for (const [index, declaredIndex] of entity.indexes.entries()) {
    for (const column of declaredIndex.columns) {
      if (!columnNames.has(column)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["indexes", index, "columns"],
          message: `Index references unknown column ${column}.`,
        });
      }
    }
  }
}

const backendEntitySchema = z
  .object(backendEntityShape)
  .strict()
  .superRefine(validateBackendEntity);

const relatedBackendEntitySchema = z
  .object({
    ...backendEntityShape,
    relationships: z
      .array(
        z
          .object({
            column: postgresIdentifierSchema,
            targetEntity: postgresIdentifierSchema,
            onDelete: z.enum(["cascade", "restrict"]).default("cascade"),
          })
          .strict(),
      )
      .max(4)
      .default([]),
  })
  .strict()
  .superRefine(validateBackendEntity);

const customPlanBase = {
  version: z.literal(2),
  summary: z.string().trim().min(1).max(240),
  operations: z
    .array(z.enum(["select", "insert", "update", "delete"]))
    .min(1)
    .max(4)
    .refine((operations) => new Set(operations).size === operations.length, {
      message: "Operations must be unique.",
    }),
  migrationChecksum: z.string().regex(/^[a-f0-9]{64}$/),
  destructive: z.literal(false),
};

const ownerScopedCrudPlanSchema = z
  .object({
    ...customPlanBase,
    template: z.literal("owner_scoped_crud"),
    entity: backendEntitySchema,
  })
  .strict();

const publicReadOwnerWritePlanSchema = z
  .object({
    ...customPlanBase,
    template: z.literal("public_read_owner_write"),
    entity: backendEntitySchema,
  })
  .strict()
  .superRefine((plan, context) => {
    if (!plan.operations.includes("select")) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["operations"],
        message: "Public-read plans must include select.",
      });
    }
  });

const relatedOwnerScopedPlanSchema = z
  .object({
    ...customPlanBase,
    template: z.literal("related_owner_scoped"),
    entities: z.array(relatedBackendEntitySchema).min(2).max(4),
  })
  .strict()
  .superRefine((plan, context) => {
    const entityNames = new Set<string>();
    for (const [entityIndex, entity] of plan.entities.entries()) {
      if (entityNames.has(entity.name)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entities", entityIndex, "name"],
          message: "Entity names must be unique.",
        });
      }
      entityNames.add(entity.name);
    }
    for (const [entityIndex, entity] of plan.entities.entries()) {
      const columns = new Map(
        entity.columns.map((column) => [column.name, column]),
      );
      for (const [
        relationshipIndex,
        relationship,
      ] of entity.relationships.entries()) {
        const column = columns.get(relationship.column);
        if (!column || column.type !== "uuid") {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [
              "entities",
              entityIndex,
              "relationships",
              relationshipIndex,
              "column",
            ],
            message: "Relationship columns must exist and use the uuid type.",
          });
        }
        if (!entityNames.has(relationship.targetEntity)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [
              "entities",
              entityIndex,
              "relationships",
              relationshipIndex,
              "targetEntity",
            ],
            message: "Relationship targets must be part of the same plan.",
          });
        }
        if (relationship.targetEntity === entity.name) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [
              "entities",
              entityIndex,
              "relationships",
              relationshipIndex,
              "targetEntity",
            ],
            message:
              "Self-referential relationships are not supported in version 2.",
          });
        }
      }
    }
  });

export const supabaseBackendPlanSchema = z.union([
  authenticatedTasksBackendPlanSchema,
  ownerScopedCrudPlanSchema,
  publicReadOwnerWritePlanSchema,
  relatedOwnerScopedPlanSchema,
]);

export type SupabaseBackendPlan = z.infer<typeof supabaseBackendPlanSchema>;

export const AUTHENTICATED_TASKS_MIGRATION_CHECKSUM =
  "a8a8eb095fe82a3583589d8c5d43c54a35ad6d887be06e77c91ad2cfff5eba99";

export function getAuthenticatedTasksBackendPlan(): SupabaseBackendPlan {
  return {
    version: 1,
    template: "authenticated_tasks",
    summary:
      "Create a tasks table protected by row-level security so signed-in users can access only their own tasks.",
    migrationChecksum: AUTHENTICATED_TASKS_MIGRATION_CHECKSUM,
    destructive: false,
  };
}

export const supabaseBackendVerificationSchema = z
  .object({
    table: z.literal(true),
    columns: z.literal(true),
    rowLevelSecurity: z.literal(true),
    authenticatedGrants: z.literal(true),
    ownershipPolicies: z.literal(true),
    anonAccessRevoked: z.boolean(),
  })
  .strict();

export type SupabaseBackendVerification = z.infer<
  typeof supabaseBackendVerificationSchema
>;

const planState = { plan: supabaseBackendPlanSchema };

export const supabaseBackendStateSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("not_connected") }).strict(),
  z.object({ status: z.literal("provisioning") }).strict(),
  z
    .object({
      status: z.literal("approval_required"),
      ...planState,
    })
    .strict(),
  z
    .object({
      status: z.literal("applying"),
      ...planState,
    })
    .strict(),
  z
    .object({
      status: z.literal("verification_failed"),
      ...planState,
      message: z.string().trim().min(1).max(240),
    })
    .strict(),
  z
    .object({
      status: z.literal("reauthorization_required"),
      ...planState,
    })
    .strict(),
  z
    .object({
      status: z.literal("ready"),
      ...planState,
      verifiedAt: z.string().datetime(),
      verification: supabaseBackendVerificationSchema,
    })
    .strict(),
]);

export type SupabaseBackendState = z.infer<typeof supabaseBackendStateSchema>;

export const supabaseAuthModeSchema = z.enum([
  "prototype_instant_signup",
  "verified_email",
]);

export type SupabaseAuthMode = z.infer<typeof supabaseAuthModeSchema>;

export const DEFAULT_SUPABASE_AUTH_MODE =
  "prototype_instant_signup" as const satisfies SupabaseAuthMode;

export const supabaseAuthStateSchema = z
  .object({
    status: z.literal("ready"),
    mode: supabaseAuthModeSchema,
    configuredAt: z.string().datetime(),
  })
  .strict();

export type SupabaseAuthState = z.infer<typeof supabaseAuthStateSchema>;

export function readSupabaseAuthState(
  value: unknown,
): SupabaseAuthState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const config = value as Record<string, unknown>;
  const parsed = supabaseAuthStateSchema.safeParse(config.supabaseAuth);
  if (parsed.success) return parsed.data;

  // Preserve existing uncommitted prototype connections until their next
  // explicitly approved mode update migrates the persisted field.
  const legacy = config.supabasePrototypeAuth;
  const legacyParsed = z
    .object({
      status: z.literal("ready"),
      mode: z.literal("email_password_no_confirmation"),
      configuredAt: z.string().datetime(),
    })
    .passthrough()
    .safeParse(legacy);
  if (legacyParsed.success) {
    return {
      status: "ready",
      mode: "prototype_instant_signup",
      configuredAt: legacyParsed.data.configuredAt,
    };
  }
  return null;
}

export function readSupabaseBackendState(
  value: unknown,
): SupabaseBackendState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const parsed = supabaseBackendStateSchema.safeParse(
    (value as Record<string, unknown>).supabaseBackend,
  );
  return parsed.success ? parsed.data : null;
}

export function buildAuthenticatedTasksGenerationContext({
  authMode = null,
}: { authMode?: SupabaseAuthMode | null } = {}) {
  return [
    "=== VERIFIED SUPABASE BACKEND TEMPLATE ===",
    "The server verified authenticated_tasks version 1 for this project. Generate the real browser app against public.tasks; do not output SQL, migrations, policies, service-role keys, or Management API credentials.",
    'Import the protected browser client exactly as: import { supabase } from "@/lib/supabase";',
    "Implement email/password sign-up, login, logout, initial session restoration, and an auth-state listener whose subscription is unsubscribed during cleanup.",
    authMode === "prototype_instant_signup"
      ? "This project uses explicitly approved prototype/demo authentication with email confirmation disabled and reduced account-security guarantees. A successful signUp returns an authenticated session immediately: enter the signed-in app and do not show a check-your-email state. Never describe the app as production-ready solely because signup works. Reliable recovery email requires custom SMTP, and CAPTCHA is recommended before any public launch."
      : authMode === "verified_email"
        ? "This project uses the production-recommended verified-email mode. After signUp, keep the user in a confirmation-pending state and do not enter the signed-in app until Supabase returns an authenticated session after email confirmation. Clearly explain that reliable confirmation and recovery delivery requires custom SMTP."
        : "Supabase Auth mode has not been explicitly configured. Handle both an immediate session and a confirmation-required signup response honestly, and do not claim production readiness.",
    "Implement task list, create, edit title, toggle completed, and delete with explicit loading, empty, and actionable error states.",
    "Every rendered task must have a discoverable edit action that remains visibly available at rest on touch and keyboard layouts. In the non-editing task row, render a visible button whose accessible name includes Edit. Neither that button nor any ancestor may use hidden, invisible, sr-only, opacity-0, pointer-events-none, or hover-only reveal classes at any breakpoint. Editing must reveal a controlled title input prefilled with the current title plus clearly named Save and Cancel actions. Save must trim and validate the title, disable or explain itself while saving, surface an actionable error, and keep the edit open if saving fails; Cancel must restore the unchanged task without a request.",
    'Wire Save to supabase.from("tasks").update({ title: nextTitle, updated_at: new Date().toISOString() }).eq("id", task.id). Do not include completed, user_id, or a spread task object in the title update payload. Update local task state only after Supabase succeeds so completion is preserved, and rely on RLS rather than adding a user_id update or privileged authorization path.',
    'Wire the rendered Delete action to supabase.from("tasks").delete().eq("id", task.id), show deletion loading and error feedback, and remove the task from local state only after Supabase succeeds. A local onDelete callback by itself is not persistent deletion.',
    'Render logout as visible "Log out" text or an icon button with aria-label="Log out"; never use a Settings or Cog icon for logout. Every icon-only button must have a clear accessible name, a comfortably usable mobile touch target, and visible keyboard focus. Keep disabled and loading states understandable without relying on an icon alone.',
    "Before insert, obtain the authenticated session user and set user_id to that user id. Rely on verified RLS for row authorization and never use a privileged key.",
    "Set updated_at to a new ISO timestamp when editing a title or toggling completion.",
    "Use only public.tasks columns: id, user_id, title, completed, created_at, updated_at.",
    "Do not add social OAuth, password recovery, Storage, Edge Functions, or another database schema.",
    "=== END VERIFIED SUPABASE BACKEND TEMPLATE ===",
  ].join("\n");
}

export function buildSupabaseBackendGenerationContext({
  plan,
  authMode = null,
}: {
  plan: SupabaseBackendPlan;
  authMode?: SupabaseAuthMode | null;
}) {
  if (plan.template === "authenticated_tasks") {
    return buildAuthenticatedTasksGenerationContext({ authMode });
  }
  const entities = "entity" in plan ? [plan.entity] : plan.entities;
  const entityContract = entities
    .map((entity) => {
      const entityRelationships =
        plan.template === "related_owner_scoped"
          ? (plan.entities.find((candidate) => candidate.name === entity.name)
              ?.relationships ?? [])
          : [];
      const relationships = entityRelationships.length
        ? ` Relationships: ${entityRelationships
            .map(
              (relationship) =>
                `${relationship.column} -> ${relationship.targetEntity}.id`,
            )
            .join(", ")}.`
        : "";
      return `- public.${entity.name}: id, user_id, ${entity.columns
        .map((column) => column.name)
        .join(", ")}, created_at, updated_at.${relationships}`;
    })
    .join("\n");
  return [
    "=== VERIFIED SUPABASE BACKEND PLAN ===",
    `The server verified the ${plan.template} version ${plan.version} plan. Do not output SQL, migrations, policies, service-role keys, or Management API credentials.`,
    'Import the protected browser client exactly as: import { supabase } from "@/lib/supabase";',
    `Allowed operations: ${plan.operations.join(", ")}. Use no table or operation outside this contract.`,
    plan.template === "public_read_owner_write"
      ? "Rows are publicly readable, but every insert, update, and delete is restricted by RLS to the authenticated row owner."
      : "Every operation is restricted by RLS to the authenticated row owner.",
    "Obtain the authenticated user before inserts and set user_id to that user's id. Never update user_id and never use a privileged key.",
    entityContract,
    "Implement explicit loading, empty, validation, and actionable error states. Update local state only after Supabase succeeds.",
    "=== END VERIFIED SUPABASE BACKEND PLAN ===",
  ].join("\n");
}
