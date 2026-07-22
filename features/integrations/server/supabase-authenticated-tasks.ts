import "server-only";

import { createHash } from "node:crypto";
import { z } from "zod";

import {
  AUTHENTICATED_TASKS_MIGRATION_CHECKSUM,
  getAuthenticatedTasksBackendPlan,
  supabaseBackendVerificationSchema,
  type SupabaseBackendVerification,
} from "@/features/integrations/supabase-backend";
import {
  getAuthorizedProjectIntegration,
  providerFetch,
} from "@/features/integrations/server/provider-client";
import { IntegrationServiceError } from "@/features/integrations/server/service";

const TEMPLATE_MARKER = "squid:authenticated_tasks:v1";

export const AUTHENTICATED_TASKS_MIGRATION_SQL = `
begin;

do $$
declare
  tasks_relation regclass := to_regclass('public.tasks');
begin
  if tasks_relation is not null
     and obj_description(tasks_relation::oid, 'pg_class') is distinct from '${TEMPLATE_MARKER}' then
    raise exception 'public.tasks already exists and is not managed by Squid authenticated_tasks v1';
  end if;
end
$$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null constraint tasks_title_length check (char_length(title) between 1 and 200),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tasks is '${TEMPLATE_MARKER}';
create index if not exists tasks_user_id_idx on public.tasks (user_id);

alter table public.tasks enable row level security;

revoke all on table public.tasks from public, anon, authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;

drop policy if exists "squid_tasks_select_own" on public.tasks;
create policy "squid_tasks_select_own"
  on public.tasks for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "squid_tasks_insert_own" on public.tasks;
create policy "squid_tasks_insert_own"
  on public.tasks for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "squid_tasks_update_own" on public.tasks;
create policy "squid_tasks_update_own"
  on public.tasks for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "squid_tasks_delete_own" on public.tasks;
create policy "squid_tasks_delete_own"
  on public.tasks for delete
  to authenticated
  using ((select auth.uid()) = user_id);

commit;
`.trim();

const computedMigrationChecksum = createHash("sha256")
  .update(AUTHENTICATED_TASKS_MIGRATION_SQL, "utf8")
  .digest("hex");

if (computedMigrationChecksum !== AUTHENTICATED_TASKS_MIGRATION_CHECKSUM) {
  throw new Error("The authenticated_tasks migration checksum is stale.");
}

export function isAuthenticatedTasksBackendPlan(value: unknown) {
  const expected = getAuthenticatedTasksBackendPlan();
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    JSON.stringify(value) === JSON.stringify(expected)
  );
}

export function buildAuthenticatedTasksMigrationId(input: {
  squidProjectId: string;
  supabaseProjectRef: string;
}) {
  return createHash("sha256")
    .update(
      [
        input.squidProjectId,
        input.supabaseProjectRef,
        "authenticated_tasks",
        "1",
        AUTHENTICATED_TASKS_MIGRATION_CHECKSUM,
      ].join(":"),
      "utf8",
    )
    .digest("hex");
}

export const AUTHENTICATED_TASKS_VERIFICATION_SQL = `
select json_build_object(
  'tableComment', obj_description(c.oid, 'pg_class'),
  'rlsEnabled', c.relrowsecurity,
  'columns', coalesce((
    select json_agg(json_build_object(
      'name', cols.column_name,
      'type', cols.data_type,
      'nullable', cols.is_nullable,
      'default', cols.column_default
    ) order by cols.ordinal_position)
    from information_schema.columns cols
    where cols.table_schema = 'public' and cols.table_name = 'tasks'
  ), '[]'::json),
  'constraints', coalesce((
    select json_agg(json_build_object(
      'name', con.conname,
      'type', con.contype,
      'definition', pg_get_constraintdef(con.oid)
    ) order by con.conname)
    from pg_constraint con
    where con.conrelid = c.oid
  ), '[]'::json),
  'indexes', coalesce((
    select json_agg(json_build_object(
      'name', idx.indexname,
      'definition', idx.indexdef
    ) order by idx.indexname)
    from pg_indexes idx
    where idx.schemaname = 'public' and idx.tablename = 'tasks'
  ), '[]'::json),
  'authenticatedGrants', coalesce((
    select json_agg(a.privilege_type order by a.privilege_type)
    from aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
    where a.grantee = 'authenticated'::regrole::oid
  ), '[]'::json),
  'anonGrants', coalesce((
    select json_agg(a.privilege_type order by a.privilege_type)
    from aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
    where a.grantee = 'anon'::regrole::oid
  ), '[]'::json),
  'publicGrants', coalesce((
    select json_agg(a.privilege_type order by a.privilege_type)
    from aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
    where a.grantee = 0
  ), '[]'::json),
  'policies', coalesce((
    select json_agg(json_build_object(
      'name', p.policyname,
      'command', p.cmd,
      'roles', p.roles,
      'using', p.qual,
      'withCheck', p.with_check
    ) order by p.policyname)
    from pg_policies p
    where p.schemaname = 'public' and p.tablename = 'tasks'
  ), '[]'::json)
) as verification
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'tasks' and c.relkind = 'r';
`.trim();

const verificationColumnSchema = z
  .object({
    name: z.string(),
    type: z.string(),
    nullable: z.string(),
    default: z.string().nullable(),
  })
  .passthrough();

const verificationConstraintSchema = z
  .object({
    name: z.string(),
    type: z.string(),
    definition: z.string(),
  })
  .passthrough();

const verificationIndexSchema = z
  .object({
    name: z.string(),
    definition: z.string(),
  })
  .passthrough();

const verificationPolicySchema = z
  .object({
    name: z.string(),
    command: z.string(),
    roles: z.array(z.string()),
    using: z.string().nullable(),
    withCheck: z.string().nullable(),
  })
  .passthrough();

const verificationPayloadSchema = z
  .object({
    tableComment: z.string().nullable(),
    rlsEnabled: z.boolean(),
    columns: z.array(verificationColumnSchema),
    constraints: z.array(verificationConstraintSchema),
    indexes: z.array(verificationIndexSchema),
    authenticatedGrants: z.array(z.string()),
    anonGrants: z.array(z.string()),
    publicGrants: z.array(z.string()),
    policies: z.array(verificationPolicySchema),
  })
  .passthrough();

function extractVerificationPayload(value: unknown) {
  const result =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>).result
      : value;
  const rows = Array.isArray(result) ? result : [];
  const first = rows[0];
  const candidate =
    first && typeof first === "object" && !Array.isArray(first)
      ? (first as Record<string, unknown>).verification
      : null;
  if (typeof candidate === "string") {
    try {
      return verificationPayloadSchema.parse(JSON.parse(candidate));
    } catch {
      return null;
    }
  }
  const parsed = verificationPayloadSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function normalizePolicyExpression(value: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/\bselect\s+auth\.uid\(\)\s+as\s+uid\b/g, "select auth.uid()")
    .replace(/::uuid/g, "")
    .replace(/[\s()]/g, "");
}

function isOwnershipExpression(value: string | null) {
  const normalized = normalizePolicyExpression(value);
  return (
    normalized === "selectauth.uid=user_id" ||
    normalized === "user_id=selectauth.uid"
  );
}

export function verifyAuthenticatedTasksResult(
  value: unknown,
): SupabaseBackendVerification {
  const payload = extractVerificationPayload(value);
  if (!payload) {
    throw new IntegrationServiceError(
      "SUPABASE_BACKEND_VERIFICATION_FAILED",
      "Supabase returned an incomplete backend verification result.",
      502,
    );
  }

  const expectedColumns = new Map<
    string,
    { type: string; nullable: string; defaultIncludes?: string }
  >([
    ["id", { type: "uuid", nullable: "NO", defaultIncludes: "gen_random_uuid()" }],
    ["user_id", { type: "uuid", nullable: "NO" }],
    ["title", { type: "text", nullable: "NO" }],
    ["completed", { type: "boolean", nullable: "NO", defaultIncludes: "false" }],
    [
      "created_at",
      {
        type: "timestamp with time zone",
        nullable: "NO",
        defaultIncludes: "now()",
      },
    ],
    [
      "updated_at",
      {
        type: "timestamp with time zone",
        nullable: "NO",
        defaultIncludes: "now()",
      },
    ],
  ]);
  const columnShape =
    payload.columns.length === expectedColumns.size &&
    payload.columns.every((column) => {
      const expected = expectedColumns.get(column.name);
      return Boolean(
        expected &&
          expected.type === column.type &&
          expected.nullable === column.nullable &&
          (expected.defaultIncludes
            ? column.default?.toLowerCase().includes(expected.defaultIncludes)
            : column.default === null),
      );
    });
  const constraintDefinitions = new Map(
    payload.constraints.map((constraint) => [
      constraint.name,
      constraint.definition.toLowerCase().replace(/\s+/g, " "),
    ]),
  );
  const primaryKey =
    payload.constraints.find(
      (constraint) =>
        constraint.name === "tasks_pkey" && constraint.type === "p",
    )?.definition.toLowerCase() === "primary key (id)";
  const userForeignKey = Boolean(
    payload.constraints.some(
      (constraint) =>
        constraint.name === "tasks_user_id_fkey" &&
        constraint.type === "f" &&
        /foreign key \(user_id\) references auth\.users\(id\) on delete cascade/i.test(
          constraint.definition,
        ),
    ),
  );
  const titleLength =
    constraintDefinitions.get("tasks_title_length")?.includes(
      "char_length(title) >= 1",
    ) === true &&
    constraintDefinitions.get("tasks_title_length")?.includes(
      "char_length(title) <= 200",
    ) === true;
  const userIndex = payload.indexes.some(
    (index) =>
      index.name === "tasks_user_id_idx" &&
      /\(user_id\)\s*$/i.test(index.definition.trim()),
  );
  const columns =
    columnShape && primaryKey && userForeignKey && titleLength && userIndex;
  const expectedGrants = ["DELETE", "INSERT", "SELECT", "UPDATE"];
  const authenticatedGrants =
    JSON.stringify(payload.authenticatedGrants) ===
    JSON.stringify(expectedGrants);
  const expectedPolicies = new Map<
    string,
    { command: string; using: boolean; withCheck: boolean }
  >([
    [
      "squid_tasks_select_own",
      { command: "SELECT", using: true, withCheck: false },
    ],
    [
      "squid_tasks_insert_own",
      { command: "INSERT", using: false, withCheck: true },
    ],
    [
      "squid_tasks_update_own",
      { command: "UPDATE", using: true, withCheck: true },
    ],
    [
      "squid_tasks_delete_own",
      { command: "DELETE", using: true, withCheck: false },
    ],
  ]);
  const ownershipPolicies =
    payload.policies.length === expectedPolicies.size &&
    payload.policies.every((policy) => {
      const expected = expectedPolicies.get(policy.name);
      return Boolean(
        expected &&
          policy.command.toUpperCase() === expected.command &&
          policy.roles.length === 1 &&
          policy.roles[0] === "authenticated" &&
          (expected.using
            ? isOwnershipExpression(policy.using)
            : policy.using === null) &&
          (expected.withCheck
            ? isOwnershipExpression(policy.withCheck)
            : policy.withCheck === null),
      );
    });

  const verification = {
    table: payload.tableComment === TEMPLATE_MARKER,
    columns,
    rowLevelSecurity: payload.rlsEnabled,
    authenticatedGrants,
    ownershipPolicies,
    anonAccessRevoked:
      payload.anonGrants.length === 0 && payload.publicGrants.length === 0,
  };
  const parsed = supabaseBackendVerificationSchema.safeParse(verification);
  if (!parsed.success) {
    throw new IntegrationServiceError(
      "SUPABASE_BACKEND_VERIFICATION_FAILED",
      "Supabase backend verification did not confirm the required table security.",
      409,
    );
  }
  return parsed.data;
}

export async function verifyAuthenticatedTasksBackend(input: {
  projectId: string;
  bindingId: string;
  userId: string;
  projectRef: string;
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
        query: AUTHENTICATED_TASKS_VERIFICATION_SQL,
        read_only: true,
      }),
    },
  );
  return verifyAuthenticatedTasksResult(response);
}
