import { describe, expect, it } from "vitest";

import {
  AUTHENTICATED_TASKS_MIGRATION_CHECKSUM,
  buildAuthenticatedTasksGenerationContext,
  getAuthenticatedTasksBackendPlan,
  supabaseBackendPlanSchema,
} from "@/features/integrations/supabase-backend";
import {
  AUTHENTICATED_TASKS_MIGRATION_SQL,
  AUTHENTICATED_TASKS_VERIFICATION_SQL,
  buildAuthenticatedTasksMigrationId,
  isAuthenticatedTasksBackendPlan,
  verifyAuthenticatedTasksResult,
} from "@/features/integrations/server/supabase-authenticated-tasks";

function successfulVerificationResult() {
  const own = "(( SELECT auth.uid() AS uid) = user_id)";
  return {
    result: [
      {
        verification: {
          tableComment: "squid:authenticated_tasks:v1",
          rlsEnabled: true,
          columns: [
            {
              name: "id",
              type: "uuid",
              nullable: "NO",
              default: "gen_random_uuid()",
            },
            { name: "user_id", type: "uuid", nullable: "NO", default: null },
            { name: "title", type: "text", nullable: "NO", default: null },
            {
              name: "completed",
              type: "boolean",
              nullable: "NO",
              default: "false",
            },
            {
              name: "created_at",
              type: "timestamp with time zone",
              nullable: "NO",
              default: "now()",
            },
            {
              name: "updated_at",
              type: "timestamp with time zone",
              nullable: "NO",
              default: "now()",
            },
          ],
          constraints: [
            {
              name: "tasks_pkey",
              type: "p",
              definition: "PRIMARY KEY (id)",
            },
            {
              name: "tasks_title_length",
              type: "c",
              definition:
                "CHECK (((char_length(title) >= 1) AND (char_length(title) <= 200)))",
            },
            {
              name: "tasks_user_id_fkey",
              type: "f",
              definition:
                "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
            },
          ],
          indexes: [
            {
              name: "tasks_pkey",
              definition:
                "CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id)",
            },
            {
              name: "tasks_user_id_idx",
              definition:
                "CREATE INDEX tasks_user_id_idx ON public.tasks USING btree (user_id)",
            },
          ],
          authenticatedGrants: ["DELETE", "INSERT", "SELECT", "UPDATE"],
          anonGrants: [],
          publicGrants: [],
          policies: [
            {
              name: "squid_tasks_delete_own",
              command: "DELETE",
              roles: ["authenticated"],
              using: own,
              withCheck: null,
            },
            {
              name: "squid_tasks_insert_own",
              command: "INSERT",
              roles: ["authenticated"],
              using: null,
              withCheck: own,
            },
            {
              name: "squid_tasks_select_own",
              command: "SELECT",
              roles: ["authenticated"],
              using: own,
              withCheck: null,
            },
            {
              name: "squid_tasks_update_own",
              command: "UPDATE",
              roles: ["authenticated"],
              using: own,
              withCheck: own,
            },
          ],
        },
      },
    ],
  };
}

describe("authenticated tasks Supabase backend template", () => {
  it("uses a strict deterministic plan and checksum", () => {
    const plan = getAuthenticatedTasksBackendPlan();
    expect(supabaseBackendPlanSchema.parse(plan)).toEqual(plan);
    expect(plan.migrationChecksum).toBe(AUTHENTICATED_TASKS_MIGRATION_CHECKSUM);
    expect(isAuthenticatedTasksBackendPlan(plan)).toBe(true);
    expect(
      isAuthenticatedTasksBackendPlan({ ...plan, destructive: true }),
    ).toBe(false);
    expect(
      buildAuthenticatedTasksMigrationId({
        squidProjectId: "project_1",
        supabaseProjectRef: "ref_1",
      }),
    ).toBe(
      buildAuthenticatedTasksMigrationId({
        squidProjectId: "project_1",
        supabaseProjectRef: "ref_1",
      }),
    );
  });

  it("contains only the trusted ownership template security behavior", () => {
    expect(AUTHENTICATED_TASKS_MIGRATION_SQL).toContain(
      "create table if not exists public.tasks",
    );
    expect(AUTHENTICATED_TASKS_MIGRATION_SQL).toContain(
      "references auth.users(id) on delete cascade",
    );
    expect(AUTHENTICATED_TASKS_MIGRATION_SQL).toContain(
      "alter table public.tasks enable row level security",
    );
    expect(AUTHENTICATED_TASKS_MIGRATION_SQL).toContain(
      "grant select, insert, update, delete on table public.tasks to authenticated",
    );
    expect(AUTHENTICATED_TASKS_MIGRATION_SQL).toContain(
      "revoke all on table public.tasks from public, anon, authenticated",
    );
    expect(
      AUTHENTICATED_TASKS_MIGRATION_SQL.match(/create policy/g),
    ).toHaveLength(4);
    expect(AUTHENTICATED_TASKS_MIGRATION_SQL).toMatch(
      /for update[\s\S]+using \(\(select auth\.uid\(\)\) = user_id\)[\s\S]+with check \(\(select auth\.uid\(\)\) = user_id\)/,
    );
    expect(AUTHENTICATED_TASKS_MIGRATION_SQL).not.toMatch(/grant .+ to anon/i);
    expect(AUTHENTICATED_TASKS_MIGRATION_SQL).toContain(
      "tasks_relation regclass := to_regclass('public.tasks')",
    );
    expect(AUTHENTICATED_TASKS_MIGRATION_SQL).toContain(
      "obj_description(tasks_relation::oid, 'pg_class')",
    );
    expect(AUTHENTICATED_TASKS_MIGRATION_SQL).not.toContain(
      "obj_description('public.tasks'::regclass",
    );
  });

  it("reads grants from the table ACL visible to the Management API role", () => {
    expect(AUTHENTICATED_TASKS_VERIFICATION_SQL).toContain("aclexplode(");
    expect(AUTHENTICATED_TASKS_VERIFICATION_SQL).toContain(
      "'authenticated'::regrole::oid",
    );
    expect(AUTHENTICATED_TASKS_VERIFICATION_SQL).toContain(
      "'anon'::regrole::oid",
    );
    expect(AUTHENTICATED_TASKS_VERIFICATION_SQL).toContain("a.grantee = 0");
    expect(AUTHENTICATED_TASKS_VERIFICATION_SQL).not.toContain(
      "information_schema.role_table_grants",
    );
  });

  it("verifies table, columns, grants, RLS, policies, and no anon access", () => {
    expect(
      verifyAuthenticatedTasksResult(successfulVerificationResult()),
    ).toEqual({
      table: true,
      columns: true,
      rowLevelSecurity: true,
      authenticatedGrants: true,
      ownershipPolicies: true,
      anonAccessRevoked: true,
    });
  });

  it("fails closed when any verification requirement is incomplete", () => {
    const result = successfulVerificationResult();
    (result.result[0].verification as { anonGrants: string[] }).anonGrants = [
      "SELECT",
    ];
    expect(() => verifyAuthenticatedTasksResult(result)).toThrow(
      "did not confirm the required table security",
    );

    expect(() => verifyAuthenticatedTasksResult({ result: [] })).toThrow(
      "incomplete backend verification result",
    );
  });

  it("fails closed when the ownership index or constraints drift", () => {
    const missingIndex = successfulVerificationResult();
    (
      missingIndex.result[0].verification as {
        indexes: Array<{ name: string }>;
      }
    ).indexes = [];
    expect(() => verifyAuthenticatedTasksResult(missingIndex)).toThrow(
      "did not confirm the required table security",
    );

    const changedForeignKey = successfulVerificationResult();
    const constraints = (
      changedForeignKey.result[0].verification as {
        constraints: Array<{ name: string; definition: string }>;
      }
    ).constraints;
    constraints.find(
      (constraint) => constraint.name === "tasks_user_id_fkey",
    )!.definition = "FOREIGN KEY (user_id) REFERENCES auth.users(id)";
    expect(() => verifyAuthenticatedTasksResult(changedForeignKey)).toThrow(
      "did not confirm the required table security",
    );
  });

  it("gives generation the protected client and exact auth/CRUD contract without SQL", () => {
    const context = buildAuthenticatedTasksGenerationContext({
      authMode: "prototype_instant_signup",
    });
    expect(context).toContain('import { supabase } from "@/lib/supabase";');
    expect(context).toContain("email/password sign-up, login, logout");
    expect(context).toContain("auth-state listener");
    expect(context).toContain("prototype/demo authentication");
    expect(context).toContain("authenticated session immediately");
    expect(context).toContain("Never describe the app as production-ready");
    expect(context).toContain(
      "task list, create, edit title, toggle completed, and delete",
    );
    expect(context).toContain("set user_id to that user id");
    expect(context).not.toContain("create table");
    expect(context).not.toMatch(/sb_secret_|service_role|management-token/i);
  });

  it("keeps verified-email signup in a confirmation-pending state", () => {
    const context = buildAuthenticatedTasksGenerationContext({
      authMode: "verified_email",
    });

    expect(context).toContain("production-recommended verified-email mode");
    expect(context).toContain("confirmation-pending state");
    expect(context).toContain("requires custom SMTP");
  });
});
