import { describe, expect, it } from "vitest";

import {
  supabaseBackendPlanSchema,
  type SupabaseBackendPlan,
} from "@/features/integrations/supabase-backend";
import {
  buildSupabaseBackendCanary,
  compileSupabaseBackendPlan,
  createSupabaseBackendPlan,
  isSupportedSupabaseBackendPlan,
  verifySupabaseBackendPlanResult,
} from "@/features/integrations/server/supabase-backend-plan";
import { appSpecSchema } from "@/features/generation/app-spec";
import { classifySupabaseSetupRequirements } from "@/features/generation/mode-policy";
import { validateSupabaseBackendGeneratedApp } from "@/lib/generated-api";

type OwnerPlan = Extract<
  SupabaseBackendPlan,
  { template: "owner_scoped_crud" }
>;

function ownerPlan(): OwnerPlan {
  return createSupabaseBackendPlan({
    version: 2,
    template: "owner_scoped_crud",
    summary: "Create private notes for each signed-in user.",
    operations: ["select", "insert", "update", "delete"],
    destructive: false,
    entity: {
      name: "notes",
      columns: [
        {
          name: "title",
          type: "text",
          nullable: false,
          unique: false,
          maxLength: 200,
        },
        {
          name: "pinned",
          type: "boolean",
          nullable: false,
          unique: false,
          default: { kind: "boolean", value: false },
        },
      ],
      indexes: [{ columns: ["pinned"], unique: false }],
    },
  }) as OwnerPlan;
}

function verificationResult(
  compiled: ReturnType<typeof compileSupabaseBackendPlan>,
) {
  const marker = compiled.migrationSql.match(
    /comment on table public\.[a-z0-9_]+ is '([^']+)'/,
  )?.[1];
  if (!marker) throw new Error("Migration marker missing from test fixture.");
  const entities =
    "entity" in compiled.plan ? [compiled.plan.entity] : compiled.plan.entities;
  return {
    result: [
      {
        verification: entities.map((entity) => {
          const relationships =
            compiled.plan.template === "related_owner_scoped"
              ? (compiled.plan.entities.find(
                  (candidate) => candidate.name === entity.name,
                )?.relationships ?? [])
              : [];
          return {
            name: entity.name,
            tableComment: marker,
            rlsEnabled: true,
            rlsForced: true,
            columns: [
              { name: "id", type: "uuid", nullable: "NO", default: null },
              ...(compiled.plan.template === "public_insert"
                ? []
                : [
                    {
                      name: "user_id",
                      type: "uuid",
                      nullable: "NO",
                      default: null,
                    },
                  ]),
              ...entity.columns.map((column) => ({
                name: column.name,
                type:
                  column.type === "timestamptz"
                    ? "timestamp with time zone"
                    : column.type,
                nullable: column.nullable ? "YES" : "NO",
                default: null,
              })),
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
                name: `${entity.name}_pkey`,
                type: "p",
                definition: "PRIMARY KEY (id)",
              },
              ...(compiled.plan.template === "public_insert"
                ? []
                : [
                    {
                      name: `${entity.name}_user_id_fkey`,
                      type: "f",
                      definition:
                        "FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE",
                    },
                  ]),
              ...relationships.map((relationship) => ({
                name: `${entity.name}_${relationship.column}_fkey`,
                type: "f",
                definition: `FOREIGN KEY (${relationship.column}) REFERENCES ${relationship.targetEntity}(id) ON DELETE ${relationship.onDelete.toUpperCase()}`,
              })),
            ],
            indexes: [
              ...(compiled.plan.template === "public_insert"
                ? []
                : [
                    `CREATE INDEX ${entity.name}_user_id_idx ON public.${entity.name} USING btree (user_id)`,
                  ]),
              ...relationships.map(
                (relationship) =>
                  `CREATE INDEX ${entity.name}_${relationship.column}_idx ON public.${entity.name} USING btree (${relationship.column})`,
              ),
            ],
            policies: compiled.plan.operations.map((operation) => {
              const publicRead =
                compiled.plan.template === "public_read_owner_write" &&
                operation === "select";
              const publicInsert = compiled.plan.template === "public_insert";
              return {
                name: `policy_${operation}`,
                command: operation.toUpperCase(),
                roles:
                  publicRead || publicInsert
                    ? ["anon", "authenticated"]
                    : ["authenticated"],
                using:
                  operation === "insert"
                    ? null
                    : publicRead
                      ? "true"
                      : "((SELECT auth.uid()) = user_id)",
                withCheck: ["insert", "update"].includes(operation)
                  ? publicInsert
                    ? "id IS NOT NULL"
                    : "((SELECT auth.uid()) = user_id)"
                  : null,
              };
            }),
            authenticatedGrants: compiled.plan.operations
              .map((operation) => operation.toUpperCase())
              .sort(),
            anonGrants:
              compiled.plan.template === "public_read_owner_write"
                ? ["SELECT"]
                : compiled.plan.template === "public_insert"
                  ? ["INSERT"]
                  : [],
            publicGrants: [],
          };
        }),
      },
    ],
  };
}

describe("typed Supabase backend plans", () => {
  it("derives a checksum-valid typed plan from the AppSpec setup flow", () => {
    const spec = appSpecSchema.parse({
      architecture: { authentication: "Email/password accounts" },
      overview: { purpose: "A public project directory" },
      dataPersistence: {
        detected: true,
        confidence: 98,
        recommendation: "require_database",
        explicitlyRequested: true,
        status: "connect_confirmed",
        useCase: "Anyone can view published projects",
        proposedSchema: [
          {
            entity: "projects",
            purpose: "Published work",
            fields: ["name: text", "published: boolean"],
          },
        ],
      },
    });
    const requirements = classifySupabaseSetupRequirements({
      prompt: "Build a public directory with user accounts",
      spec,
    });
    expect(requirements.backendTemplate).toBe("public_read_owner_write");
    expect(requirements.backendPlan).toBeDefined();
    expect(isSupportedSupabaseBackendPlan(requirements.backendPlan)).toBe(true);
    expect(
      compileSupabaseBackendPlan(requirements.backendPlan).migrationSql,
    ).toContain("grant select on table public.projects to anon");
  });

  it("deterministically compiles bounded owner CRUD without accepting SQL", () => {
    const plan = ownerPlan();
    const compiled = compileSupabaseBackendPlan(plan);
    expect(
      createSupabaseBackendPlan({ ...plan, migrationChecksum: undefined }),
    ).toEqual(plan);
    expect(compiled.migrationChecksum).toBe(plan.migrationChecksum);
    expect(compiled.destructive).toBe(false);
    expect(compiled.migrationSql).toContain("pg_advisory_xact_lock");
    expect(compiled.migrationSql).toContain(
      "alter table public.notes force row level security",
    );
    expect(compiled.migrationSql).toContain(
      "create index if not exists notes_user_id_idx",
    );
    expect(compiled.migrationSql).toContain("((select auth.uid()) = user_id)");
    expect(compiled.migrationSql).not.toMatch(/grant .+ to anon/i);
    expect(
      supabaseBackendPlanSchema.safeParse({ ...plan, sql: "drop table users" })
        .success,
    ).toBe(false);
  });

  it("creates an insert-only public backend for forms without accounts", () => {
    const spec = appSpecSchema.parse({
      overview: { purpose: "A contact form" },
      dataPersistence: {
        detected: true,
        confidence: 99,
        recommendation: "require_database",
        explicitlyRequested: true,
        status: "connect_confirmed",
        useCase: "Collect contact requests",
        proposedSchema: [
          {
            entity: "contact_requests",
            purpose: "Contact form submissions",
            fields: ["email: text", "message: text"],
          },
        ],
      },
    });
    const requirements = classifySupabaseSetupRequirements({
      prompt: "Build a public contact form",
      spec,
    });
    expect(requirements.authentication).toBe(false);
    expect(requirements.backendTemplate).toBe("public_insert");
    const compiled = compileSupabaseBackendPlan(requirements.backendPlan);
    expect(compiled.migrationSql).toContain(
      "grant insert on table public.contact_requests to anon",
    );
    expect(compiled.migrationSql).not.toContain("user_id uuid");
    expect(compiled.migrationSql).not.toMatch(/grant select/i);
    expect(
      verifySupabaseBackendPlanResult(compiled, verificationResult(compiled)),
    ).toMatchObject({ anonAccessRevoked: false, rowLevelSecurity: true });
    expect(buildSupabaseBackendCanary(compiled).tables[0]).toMatchObject({
      isolation: "anonymous_insert_only",
      operations: ["insert"],
    });
    expect(
      validateSupabaseBackendGeneratedApp(
        [
          {
            path: "App.tsx",
            code: `import { supabase } from "@/lib/supabase";
              await supabase.from("contact_requests").insert({ email, message });`,
          },
        ],
        compiled.plan,
      ),
    ).toEqual([]);
    expect(
      validateSupabaseBackendGeneratedApp(
        [
          {
            path: "App.tsx",
            code: `await supabase.from("contact_requests").select();`,
          },
        ],
        compiled.plan,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining("insert") }),
        expect.objectContaining({
          message: expect.stringContaining("cannot select"),
        }),
      ]),
    );
  });

  it("rejects identifiers, incompatible defaults, unknown indexes, and checksum drift", () => {
    const base = ownerPlan();
    expect(
      supabaseBackendPlanSchema.safeParse({
        ...base,
        entity: { ...base.entity, name: 'notes"; drop table auth.users; --' },
      }).success,
    ).toBe(false);
    expect(
      supabaseBackendPlanSchema.safeParse({
        ...base,
        entity: {
          ...base.entity,
          columns: [
            {
              name: "enabled",
              type: "boolean",
              nullable: false,
              unique: false,
              default: { kind: "now" },
            },
          ],
          indexes: [{ columns: ["missing"], unique: false }],
        },
      }).success,
    ).toBe(false);
    expect(() =>
      compileSupabaseBackendPlan({
        ...base,
        migrationChecksum: "f".repeat(64),
      }),
    ).toThrow("checksum does not match");
    expect(isSupportedSupabaseBackendPlan({ ...base, destructive: true })).toBe(
      false,
    );
  });

  it("grants anonymous SELECT only for public-read owner-write plans", () => {
    const plan = createSupabaseBackendPlan({
      ...ownerPlan(),
      migrationChecksum: undefined,
      template: "public_read_owner_write",
      summary: "Create a public catalog with owner-only writes.",
    });
    const compiled = compileSupabaseBackendPlan(plan);
    expect(compiled.migrationSql).toContain(
      "grant select on table public.notes to anon",
    );
    expect(compiled.migrationSql).toMatch(
      /for select to anon, authenticated using \(true\)/,
    );
    expect(compiled.migrationSql).not.toMatch(
      /for (?:insert|update|delete) to anon/,
    );
    expect(
      verifySupabaseBackendPlanResult(compiled, verificationResult(compiled)),
    ).toMatchObject({ anonAccessRevoked: false, ownershipPolicies: true });
  });

  it("compiles related owner-scoped entities with idempotent FKs and indexes", () => {
    const plan = createSupabaseBackendPlan({
      version: 2,
      template: "related_owner_scoped",
      summary: "Create projects with related issues.",
      operations: ["select", "insert", "update", "delete"],
      destructive: false,
      entities: [
        {
          name: "projects",
          columns: [
            { name: "name", type: "text", nullable: false, unique: false },
          ],
          indexes: [],
          relationships: [],
        },
        {
          name: "issues",
          columns: [
            {
              name: "project_id",
              type: "uuid",
              nullable: false,
              unique: false,
            },
            { name: "title", type: "text", nullable: false, unique: false },
          ],
          indexes: [],
          relationships: [
            {
              column: "project_id",
              targetEntity: "projects",
              onDelete: "cascade",
            },
          ],
        },
      ],
    });
    const compiled = compileSupabaseBackendPlan(plan);
    expect(compiled.migrationSql).toContain("select 1 from pg_constraint");
    expect(compiled.migrationSql).toContain(
      "foreign key (project_id) references public.projects(id)",
    );
    expect(compiled.migrationSql).toContain(
      "create index if not exists issues_project_id_idx",
    );
    expect(buildSupabaseBackendCanary(compiled).tables).toHaveLength(2);
    expect(
      verifySupabaseBackendPlanResult(compiled, verificationResult(compiled)),
    ).toMatchObject({ table: true, rowLevelSecurity: true });
  });

  it("fails verification closed on RLS, policy, grant, or table drift", () => {
    const compiled = compileSupabaseBackendPlan(ownerPlan());
    const result = verificationResult(compiled);
    result.result[0].verification[0].rlsForced = false;
    expect(() => verifySupabaseBackendPlanResult(compiled, result)).toThrow(
      "did not confirm the approved schema and security contract",
    );
    expect(() =>
      verifySupabaseBackendPlanResult(compiled, { result: [] }),
    ).toThrow("incomplete backend-plan verification result");
  });
});
