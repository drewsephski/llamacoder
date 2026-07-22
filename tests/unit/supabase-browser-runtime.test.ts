import { describe, expect, it } from "vitest";

import {
  buildSupabaseBrowserRuntimeState,
  isBrowserSafeSupabaseKey,
  resolveSupabaseBrowserRuntimeForPreview,
  selectSupabaseBrowserKey,
  supabaseBrowserRuntimeConfigSchema,
} from "@/features/integrations/supabase-browser-runtime";

function legacyJwt(role: "anon" | "service_role") {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ role })}.signature`;
}

describe("Supabase browser runtime security", () => {
  it("does not inject a false not-connected runtime while the workspace is loading", () => {
    expect(
      resolveSupabaseBrowserRuntimeForPreview({
        runtime: undefined,
        generatedAppUsesSupabase: true,
        workspaceResolved: false,
      }),
    ).toBeUndefined();

    expect(
      resolveSupabaseBrowserRuntimeForPreview({
        runtime: undefined,
        generatedAppUsesSupabase: true,
        workspaceResolved: true,
      }),
    ).toEqual({ status: "not_connected" });

    const readyRuntime = {
      status: "ready" as const,
      config: {
        url: "https://project-ref.supabase.co",
        publishableKey: "sb_publishable_public",
      },
    };
    expect(
      resolveSupabaseBrowserRuntimeForPreview({
        runtime: readyRuntime,
        generatedAppUsesSupabase: true,
        workspaceResolved: false,
      }),
    ).toBe(readyRuntime);
  });

  it("accepts modern publishable keys and explicitly identified legacy anon keys", () => {
    expect(
      selectSupabaseBrowserKey([
        {
          type: "publishable",
          name: "web",
          api_key: "sb_publishable_browser-safe",
        },
      ]),
    ).toEqual({
      status: "selected",
      key: "sb_publishable_browser-safe",
      kind: "publishable",
    });

    const anonKey = legacyJwt("anon");
    expect(
      selectSupabaseBrowserKey([
        { type: "legacy", name: "anon", api_key: anonKey },
      ]),
    ).toEqual({
      status: "selected",
      key: anonKey,
      kind: "legacy_anon",
    });
  });

  it("prefers one modern publishable key over a legacy anon key", () => {
    expect(
      selectSupabaseBrowserKey([
        { type: "legacy", name: "anon", api_key: legacyJwt("anon") },
        {
          type: "publishable",
          name: "web",
          api_key: "sb_publishable_preferred",
        },
      ]),
    ).toMatchObject({
      status: "selected",
      key: "sb_publishable_preferred",
      kind: "publishable",
    });
  });

  it("rejects secret, service-role, unknown, and ambiguous key shapes", () => {
    expect(
      selectSupabaseBrowserKey([
        { type: "secret", name: "backend", api_key: "sb_secret_never-browser" },
      ]),
    ).toEqual({ status: "rejected" });
    expect(
      selectSupabaseBrowserKey([
        {
          type: "legacy",
          name: "service_role",
          api_key: legacyJwt("service_role"),
        },
      ]),
    ).toEqual({ status: "rejected" });
    expect(
      selectSupabaseBrowserKey([
        {
          type: "future_key_type",
          name: "unknown",
          api_key: "sb_publishable_shape-is-not-enough",
        },
      ]),
    ).toEqual({ status: "rejected" });
    expect(
      selectSupabaseBrowserKey([
        { type: "public", name: "anon-ish", api_key: "previous-fallback" },
      ]),
    ).toEqual({ status: "rejected" });
    expect(
      selectSupabaseBrowserKey([
        {
          type: "publishable",
          name: "one",
          api_key: "sb_publishable_one",
        },
        {
          type: "publishable",
          name: "two",
          api_key: "sb_publishable_two",
        },
      ]),
    ).toEqual({ status: "ambiguous" });

    expect(isBrowserSafeSupabaseKey("sb_secret_backend")).toBe(false);
    expect(isBrowserSafeSupabaseKey(legacyJwt("service_role"))).toBe(false);
  });

  it("creates an exact two-property DTO without serializing integration config", () => {
    const integrationConfig = {
      supabaseProjectUrl: "https://project-ref.supabase.co",
      supabasePublishableKey: "sb_publishable_public",
      managementAccessToken: "management-secret",
      refreshToken: "refresh-secret",
      databasePassword: "database-secret",
      serviceRoleKey: legacyJwt("service_role"),
      nested: { oauthClientSecret: "oauth-secret" },
    };
    const state = buildSupabaseBrowserRuntimeState({
      integrationConfig,
      hasProjectBinding: true,
      isProvisioning: false,
    });

    expect(state).toEqual({
      status: "ready",
      config: {
        url: "https://project-ref.supabase.co",
        publishableKey: "sb_publishable_public",
      },
    });
    if (state.status !== "ready") throw new Error("Expected ready runtime");
    expect(Object.keys(state.config)).toEqual(["url", "publishableKey"]);
    expect(JSON.stringify(state.config)).not.toMatch(
      /management-secret|refresh-secret|database-secret|oauth-secret|service_role/,
    );
  });

  it("distinguishes missing, provisioning, rejected-key, and invalid-URL states", () => {
    expect(
      buildSupabaseBrowserRuntimeState({
        integrationConfig: null,
        hasProjectBinding: false,
        isProvisioning: false,
      }),
    ).toEqual({ status: "not_connected" });
    expect(
      buildSupabaseBrowserRuntimeState({
        integrationConfig: { supabaseProjectRef: "project-ref" },
        hasProjectBinding: true,
        isProvisioning: true,
      }),
    ).toEqual({ status: "provisioning" });
    expect(
      buildSupabaseBrowserRuntimeState({
        integrationConfig: {
          supabaseProjectRef: "project-ref",
          supabaseProjectUrl: "https://project-ref.supabase.co",
        },
        hasProjectBinding: true,
        isProvisioning: false,
      }),
    ).toEqual({ status: "missing_browser_key" });
    expect(
      buildSupabaseBrowserRuntimeState({
        integrationConfig: {
          supabaseProjectRef: "project-ref",
          supabaseProjectUrl: "https://project-ref.supabase.co",
          supabasePublishableKey: "sb_secret_backend",
        },
        hasProjectBinding: true,
        isProvisioning: false,
      }),
    ).toEqual({ status: "invalid_browser_key" });
    expect(
      buildSupabaseBrowserRuntimeState({
        integrationConfig: {
          supabaseProjectRef: "project-ref",
          supabaseProjectUrl: "http://project-ref.supabase.co",
          supabasePublishableKey: "sb_publishable_public",
        },
        hasProjectBinding: true,
        isProvisioning: false,
      }),
    ).toEqual({ status: "invalid_project_url" });
  });

  it("rejects DTO properties beyond url and publishableKey", () => {
    expect(
      supabaseBrowserRuntimeConfigSchema.safeParse({
        url: "https://project-ref.supabase.co",
        publishableKey: "sb_publishable_public",
        serviceRoleKey: legacyJwt("service_role"),
      }).success,
    ).toBe(false);
  });
});
