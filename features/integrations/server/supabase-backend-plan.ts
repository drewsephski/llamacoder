import "server-only";

import { createHash } from "node:crypto";
import { z } from "zod";

import {
  supabaseBackendPlanSchema,
  getAuthenticatedTasksBackendPlan,
  type SupabaseBackendPlan,
  type SupabaseBackendColumn,
  type SupabaseBackendVerification,
} from "@/features/integrations/supabase-backend";
import {
  getAuthorizedProjectIntegration,
  providerFetch,
} from "@/features/integrations/server/provider-client";
import { IntegrationServiceError } from "@/features/integrations/server/integration-error";

type CustomBackendPlan = Exclude<
  SupabaseBackendPlan,
  { template: "authenticated_tasks" }
>;
type BackendEntity = {
  name: string;
  columns: SupabaseBackendColumn[];
  indexes: Array<{ columns: string[]; unique: boolean }>;
  relationships?: Array<{
    column: string;
    targetEntity: string;
    onDelete: "cascade" | "restrict";
  }>;
};

const checksumPattern = /^[a-f0-9]{64}$/;

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function sqlName(...parts: string[]) {
  const joined = parts.join("_");
  if (joined.length <= 63) return joined;
  return `${joined.slice(0, 50)}_${sha256(joined).slice(0, 12)}`;
}

function entitiesForPlan(plan: CustomBackendPlan): BackendEntity[] {
  return "entity" in plan ? [plan.entity] : plan.entities;
}

function markerForPlan(plan: CustomBackendPlan) {
  const { migrationChecksum: _migrationChecksum, ...definition } = plan;
  return `squid:backend_plan:v2:${sha256(canonicalJson(definition)).slice(0, 24)}`;
}

function isPublicInsertPlan(plan: CustomBackendPlan) {
  return plan.template === "public_insert";
}

function compileDefault(column: BackendEntity["columns"][number]) {
  if (!column.default) return "";
  switch (column.default.kind) {
    case "now":
      return " default now()";
    case "boolean":
      return ` default ${column.default.value ? "true" : "false"}`;
    case "number":
      return ` default ${column.default.value}`;
    case "empty_object":
      return " default '{}'::jsonb";
  }
}

function compileColumn(
  entityName: string,
  column: BackendEntity["columns"][number],
) {
  const clauses = [column.name, column.type];
  if (!column.nullable) clauses.push("not null");
  const defaultSql = compileDefault(column).trim();
  if (defaultSql) clauses.push(defaultSql);
  if (column.unique) {
    clauses.push(
      `constraint ${sqlName(entityName, column.name, "unique")} unique`,
    );
  }
  if (column.maxLength !== undefined) {
    clauses.push(
      `constraint ${sqlName(entityName, column.name, "length")} check (char_length(${column.name}) between 1 and ${column.maxLength})`,
    );
  }
  return `  ${clauses.join(" ")}`;
}

function compilePolicies(plan: CustomBackendPlan, entity: BackendEntity) {
  const lines: string[] = [
    `alter table public.${entity.name} enable row level security;`,
    `alter table public.${entity.name} force row level security;`,
    `revoke all on table public.${entity.name} from public, anon, authenticated;`,
  ];
  const grants = plan.operations.join(", ");
  lines.push(
    `grant ${grants} on table public.${entity.name} to authenticated;`,
  );
  if (isPublicInsertPlan(plan)) {
    lines.push(`grant insert on table public.${entity.name} to anon;`);
  }
  if (plan.template === "public_read_owner_write") {
    lines.push(`grant select on table public.${entity.name} to anon;`);
  }
  for (const operation of plan.operations) {
    const policyName = sqlName(
      "squid",
      entity.name,
      operation,
      plan.template === "public_read_owner_write" && operation === "select"
        ? "public"
        : "own",
    );
    lines.push(
      `drop policy if exists "${policyName}" on public.${entity.name};`,
    );
    if (isPublicInsertPlan(plan)) {
      lines.push(
        `create policy "${policyName}" on public.${entity.name} for insert to anon, authenticated with check (id is not null);`,
      );
      continue;
    }
    if (plan.template === "public_read_owner_write" && operation === "select") {
      lines.push(
        `create policy "${policyName}" on public.${entity.name} for select to anon, authenticated using (true);`,
      );
      continue;
    }
    const ownership = "((select auth.uid()) = user_id)";
    if (operation === "insert") {
      lines.push(
        `create policy "${policyName}" on public.${entity.name} for insert to authenticated with check (${ownership});`,
      );
    } else if (operation === "update") {
      lines.push(
        `create policy "${policyName}" on public.${entity.name} for update to authenticated using (${ownership}) with check (${ownership});`,
      );
    } else {
      lines.push(
        `create policy "${policyName}" on public.${entity.name} for ${operation} to authenticated using (${ownership});`,
      );
    }
  }
  return lines.join("\n");
}

function compileCustomMigration(plan: CustomBackendPlan) {
  const entities = entitiesForPlan(plan);
  const marker = markerForPlan(plan);
  const tableSql = entities
    .map((entity) => {
      const columns = entity.columns
        .map((column) => compileColumn(entity.name, column))
        .join(",\n");
      return `do $$
declare
  managed_relation regclass := to_regclass('public.${entity.name}');
begin
  if managed_relation is not null
     and obj_description(managed_relation::oid, 'pg_class') is distinct from '${marker}' then
    raise exception 'public.${entity.name} already exists and is not managed by this approved Squid backend plan';
  end if;
end
$$;

create table if not exists public.${entity.name} (
  id uuid primary key default gen_random_uuid(),
${isPublicInsertPlan(plan) ? "" : "  user_id uuid not null references auth.users(id) on delete cascade,\n"}${columns},
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.${entity.name} is '${marker}';
${isPublicInsertPlan(plan) ? "" : `create index if not exists ${sqlName(entity.name, "user_id", "idx")} on public.${entity.name} (user_id);`}`;
    })
    .join("\n\n");
  const relationships =
    plan.template === "related_owner_scoped"
      ? plan.entities.flatMap((entity) =>
          entity.relationships.map((relationship) => {
            const constraint = sqlName(
              entity.name,
              relationship.column,
              "fkey",
            );
            return `do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = '${constraint}'
      and conrelid = 'public.${entity.name}'::regclass
  ) then
    alter table public.${entity.name}
      add constraint ${constraint}
      foreign key (${relationship.column}) references public.${relationship.targetEntity}(id)
      on delete ${relationship.onDelete};
  end if;
end
$$;
create index if not exists ${sqlName(entity.name, relationship.column, "idx")} on public.${entity.name} (${relationship.column});`;
          }),
        )
      : [];
  const indexes = entities.flatMap((entity) =>
    entity.indexes.map(
      (index) =>
        `create ${index.unique ? "unique " : ""}index if not exists ${sqlName(entity.name, ...index.columns, index.unique ? "uidx" : "idx")} on public.${entity.name} (${index.columns.join(", ")});`,
    ),
  );
  const policies = entities.map((entity) => compilePolicies(plan, entity));
  return [
    "begin;",
    `select pg_advisory_xact_lock(hashtextextended('squid:backend-plan:${marker}', 0));`,
    tableSql,
    ...relationships,
    ...indexes,
    ...policies,
    "commit;",
  ].join("\n\n");
}

export type CompiledSupabaseBackendPlan = {
  plan: CustomBackendPlan;
  migrationSql: string;
  verificationSql: string;
  migrationChecksum: string;
  destructive: false;
  tableNames: string[];
};

export function createSupabaseBackendPlan(
  definition: unknown,
): CustomBackendPlan {
  if (
    !definition ||
    typeof definition !== "object" ||
    Array.isArray(definition)
  ) {
    throw new Error("A typed backend plan definition is required.");
  }
  const provisional = supabaseBackendPlanSchema.parse({
    ...(definition as Record<string, unknown>),
    migrationChecksum: "0".repeat(64),
  });
  if (provisional.template === "authenticated_tasks") {
    throw new Error(
      "Use getAuthenticatedTasksBackendPlan for the legacy template.",
    );
  }
  const migrationChecksum = sha256(compileCustomMigration(provisional));
  return supabaseBackendPlanSchema.parse({
    ...provisional,
    migrationChecksum,
  }) as CustomBackendPlan;
}

export function compileSupabaseBackendPlan(
  value: unknown,
): CompiledSupabaseBackendPlan {
  const parsed = supabaseBackendPlanSchema.parse(value);
  if (parsed.template === "authenticated_tasks") {
    throw new IntegrationServiceError(
      "SUPABASE_BACKEND_PLAN_UNSUPPORTED",
      "The legacy backend template must use its compatibility compiler.",
      400,
    );
  }
  const migrationSql = compileCustomMigration(parsed);
  const migrationChecksum = sha256(migrationSql);
  if (
    !checksumPattern.test(parsed.migrationChecksum) ||
    parsed.migrationChecksum !== migrationChecksum
  ) {
    throw new IntegrationServiceError(
      "SUPABASE_BACKEND_CHECKSUM_MISMATCH",
      "The backend plan checksum does not match its deterministic migration.",
      400,
    );
  }
  const tableNames = entitiesForPlan(parsed).map((entity) => entity.name);
  return {
    plan: parsed,
    migrationSql,
    verificationSql: buildBackendPlanVerificationSql(tableNames),
    migrationChecksum,
    destructive: false,
    tableNames,
  };
}

export function isSupportedSupabaseBackendPlan(value: unknown) {
  const parsed = supabaseBackendPlanSchema.safeParse(value);
  if (!parsed.success) return false;
  if (parsed.data.template === "authenticated_tasks") {
    return (
      parsed.data.migrationChecksum ===
      getAuthenticatedTasksBackendPlan().migrationChecksum
    );
  }
  try {
    compileSupabaseBackendPlan(parsed.data);
    return true;
  } catch {
    return false;
  }
}

export function buildSupabaseBackendMigrationId(input: {
  squidProjectId: string;
  supabaseProjectRef: string;
  plan: CustomBackendPlan;
}) {
  return sha256(
    [
      input.squidProjectId,
      input.supabaseProjectRef,
      input.plan.template,
      input.plan.version,
      input.plan.migrationChecksum,
    ].join(":"),
  );
}

export function buildBackendPlanVerificationSql(tableNames: string[]) {
  const names = tableNames.map((name) => `'${name}'`).join(", ");
  return `select coalesce(json_agg(table_state order by table_state->>'name'), '[]'::json) as verification
from (
  select json_build_object(
    'name', c.relname,
    'tableComment', obj_description(c.oid, 'pg_class'),
    'rlsEnabled', c.relrowsecurity,
    'rlsForced', c.relforcerowsecurity,
    'columns', (select coalesce(json_agg(json_build_object('name', cols.column_name, 'type', cols.data_type, 'nullable', cols.is_nullable, 'default', cols.column_default) order by cols.ordinal_position), '[]'::json) from information_schema.columns cols where cols.table_schema = 'public' and cols.table_name = c.relname),
    'constraints', (select coalesce(json_agg(json_build_object('name', con.conname, 'type', con.contype, 'definition', pg_get_constraintdef(con.oid)) order by con.conname), '[]'::json) from pg_constraint con where con.conrelid = c.oid),
    'indexes', (select coalesce(json_agg(idx.indexdef order by idx.indexname), '[]'::json) from pg_indexes idx where idx.schemaname = 'public' and idx.tablename = c.relname),
    'policies', (select coalesce(json_agg(json_build_object('name', p.policyname, 'command', p.cmd, 'roles', p.roles, 'using', p.qual, 'withCheck', p.with_check) order by p.policyname), '[]'::json) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname),
    'authenticatedGrants', (select coalesce(json_agg(a.privilege_type order by a.privilege_type), '[]'::json) from aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a where a.grantee = 'authenticated'::regrole::oid),
    'anonGrants', (select coalesce(json_agg(a.privilege_type order by a.privilege_type), '[]'::json) from aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a where a.grantee = 'anon'::regrole::oid),
    'publicGrants', (select coalesce(json_agg(a.privilege_type order by a.privilege_type), '[]'::json) from aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a where a.grantee = 0)
  ) as table_state
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and c.relname in (${names})
) verified_tables;`;
}

const tableVerificationSchema = z
  .object({
    name: z.string(),
    tableComment: z.string().nullable(),
    rlsEnabled: z.boolean(),
    rlsForced: z.boolean(),
    columns: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        nullable: z.string(),
        default: z.string().nullable(),
      }),
    ),
    constraints: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        definition: z.string(),
      }),
    ),
    indexes: z.array(z.string()),
    policies: z.array(
      z.object({
        name: z.string(),
        command: z.string(),
        roles: z.array(z.string()),
        using: z.string().nullable(),
        withCheck: z.string().nullable(),
      }),
    ),
    authenticatedGrants: z.array(z.string()),
    anonGrants: z.array(z.string()),
    publicGrants: z.array(z.string()),
  })
  .passthrough();

function verificationRows(value: unknown) {
  const result =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>).result
      : null;
  const first = Array.isArray(result) ? result[0] : null;
  let verification =
    first && typeof first === "object" && !Array.isArray(first)
      ? (first as Record<string, unknown>).verification
      : null;
  if (typeof verification === "string") {
    try {
      verification = JSON.parse(verification) as unknown;
    } catch {
      verification = null;
    }
  }
  const parsed = z.array(tableVerificationSchema).safeParse(verification);
  return parsed.success ? parsed.data : null;
}

function normalizePolicy(value: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/::uuid/g, "")
    .replace(/[\s()]/g, "");
}

export function verifySupabaseBackendPlanResult(
  compiled: CompiledSupabaseBackendPlan,
  value: unknown,
): SupabaseBackendVerification {
  const rows = verificationRows(value);
  const entities = entitiesForPlan(compiled.plan);
  const marker = markerForPlan(compiled.plan);
  if (!rows || rows.length !== entities.length) {
    throw new IntegrationServiceError(
      "SUPABASE_BACKEND_VERIFICATION_FAILED",
      "Supabase returned an incomplete backend-plan verification result.",
      502,
    );
  }
  const byName = new Map(rows.map((row) => [row.name, row]));
  const expectedOperations = compiled.plan.operations.map((operation) =>
    operation.toUpperCase(),
  );
  const valid = entities.every((entity) => {
    const row = byName.get(entity.name);
    if (!row) return false;
    const expectedColumns = new Map<string, { type: string; nullable: string }>(
      [
        ["id", { type: "uuid", nullable: "NO" }],
        ...(isPublicInsertPlan(compiled.plan)
          ? []
          : ([["user_id", { type: "uuid", nullable: "NO" }]] as const)),
        ...entity.columns.map(
          (column) =>
            [
              column.name,
              {
                type:
                  column.type === "timestamptz"
                    ? "timestamp with time zone"
                    : column.type,
                nullable: column.nullable ? "YES" : "NO",
              },
            ] as const,
        ),
        ["created_at", { type: "timestamp with time zone", nullable: "NO" }],
        ["updated_at", { type: "timestamp with time zone", nullable: "NO" }],
      ],
    );
    const columnsValid =
      row.columns.length === expectedColumns.size &&
      row.columns.every((column) => {
        const expected = expectedColumns.get(column.name);
        return (
          expected?.type === column.type &&
          expected.nullable === column.nullable
        );
      });
    const ownerIndex =
      isPublicInsertPlan(compiled.plan) ||
      row.indexes.some((definition) =>
        new RegExp(`\\(user_id\\)\\s*$`, "i").test(definition.trim()),
      );
    const grants = [...row.authenticatedGrants].sort();
    const expectedGrants = [...expectedOperations].sort();
    const anonGrants =
      compiled.plan.template === "public_read_owner_write"
        ? ["SELECT"]
        : isPublicInsertPlan(compiled.plan)
          ? ["INSERT"]
          : [];
    const policiesValid = compiled.plan.operations.every((operation) => {
      const policy = row.policies.find(
        (candidate) => candidate.command.toLowerCase() === operation,
      );
      if (!policy) return false;
      if (isPublicInsertPlan(compiled.plan)) {
        return (
          policy.roles.includes("anon") &&
          policy.roles.includes("authenticated") &&
          normalizePolicy(policy.withCheck) === "idisnotnull"
        );
      }
      if (
        compiled.plan.template === "public_read_owner_write" &&
        operation === "select"
      ) {
        return (
          policy.roles.includes("anon") &&
          policy.roles.includes("authenticated") &&
          normalizePolicy(policy.using) === "true"
        );
      }
      const own = "selectauth.uid=user_id";
      return (
        policy.roles.length === 1 &&
        policy.roles[0] === "authenticated" &&
        (operation === "insert" || normalizePolicy(policy.using) === own) &&
        (!["insert", "update"].includes(operation) ||
          normalizePolicy(policy.withCheck) === own)
      );
    });
    const primaryKey = row.constraints.some(
      (constraint) =>
        constraint.type === "p" &&
        constraint.definition.toLowerCase() === "primary key (id)",
    );
    const ownerForeignKey =
      isPublicInsertPlan(compiled.plan) ||
      row.constraints.some(
        (constraint) =>
          constraint.type === "f" &&
          /foreign key \(user_id\) references auth\.users\(id\) on delete cascade/i.test(
            constraint.definition,
          ),
      );
    const relationshipsValid = (entity.relationships ?? []).every(
      (relationship) =>
        row.constraints.some(
          (constraint) =>
            constraint.type === "f" &&
            new RegExp(
              `foreign key \\(${relationship.column}\\) references ${relationship.targetEntity}\\(id\\) on delete ${relationship.onDelete}`,
              "i",
            ).test(constraint.definition),
        ) &&
        row.indexes.some((definition) =>
          new RegExp(`\\(${relationship.column}\\)\\s*$`, "i").test(
            definition.trim(),
          ),
        ),
    );
    return (
      row.tableComment === marker &&
      row.rlsEnabled &&
      row.rlsForced &&
      columnsValid &&
      primaryKey &&
      ownerForeignKey &&
      relationshipsValid &&
      ownerIndex &&
      JSON.stringify(grants) === JSON.stringify(expectedGrants) &&
      JSON.stringify(row.anonGrants) === JSON.stringify(anonGrants) &&
      row.publicGrants.length === 0 &&
      policiesValid
    );
  });
  if (!valid) {
    throw new IntegrationServiceError(
      "SUPABASE_BACKEND_VERIFICATION_FAILED",
      "Supabase backend-plan verification did not confirm the approved schema and security contract.",
      409,
    );
  }
  return {
    table: true,
    columns: true,
    rowLevelSecurity: true,
    authenticatedGrants: true,
    ownershipPolicies: true,
    anonAccessRevoked: !["public_read_owner_write", "public_insert"].includes(
      compiled.plan.template,
    ),
  };
}

export async function verifySupabaseBackendPlan(input: {
  projectId: string;
  bindingId: string;
  userId: string;
  projectRef: string;
  compiled: CompiledSupabaseBackendPlan;
}) {
  const authorized = await getAuthorizedProjectIntegration({
    ...input,
    expectedProvider: "supabase",
  });
  const response = await providerFetch(
    "supabase",
    authorized.providerAuthorization ?? authorized.accessToken,
    `https://api.supabase.com/v1/projects/${encodeURIComponent(input.projectRef)}/database/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: input.compiled.verificationSql,
        read_only: true,
      }),
    },
  );
  return verifySupabaseBackendPlanResult(input.compiled, response);
}

export function buildSupabaseBackendCanary(
  compiled: CompiledSupabaseBackendPlan,
) {
  return {
    version: 1 as const,
    tables: compiled.tableNames.map((table) => ({
      table,
      operations: compiled.plan.operations,
      isolation:
        compiled.plan.template === "public_insert"
          ? ("anonymous_insert_only" as const)
          : ("two_user_owner_rls" as const),
      publicRead: compiled.plan.template === "public_read_owner_write",
    })),
  };
}
