import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildOAuthAuthorizationUrl,
  exchangeOAuthCode,
  getOAuthProviderConfig,
} from "@/features/integrations/server/oauth-provider";
import {
  createOAuthState,
  createPkcePair,
  verifyOAuthState,
} from "@/features/integrations/server/oauth-state";

const originalEnv = {
  stateSecret: process.env.INTEGRATION_OAUTH_STATE_SECRET,
  githubId: process.env.GITHUB_OAUTH_CLIENT_ID,
  githubSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
  githubAppId: process.env.GITHUB_APP_ID,
  githubAppSlug: process.env.GITHUB_APP_SLUG,
  githubAppKey: process.env.GITHUB_APP_PRIVATE_KEY,
  vercelId: process.env.VERCEL_INTEGRATION_CLIENT_ID,
  vercelSecret: process.env.VERCEL_INTEGRATION_CLIENT_SECRET,
  vercelSlug: process.env.VERCEL_INTEGRATION_SLUG,
};

describe("integration OAuth", () => {
  beforeEach(() => {
    process.env.INTEGRATION_OAUTH_STATE_SECRET = Buffer.alloc(32, 9).toString(
      "base64",
    );
    process.env.GITHUB_OAUTH_CLIENT_ID = "github-client";
    process.env.GITHUB_OAUTH_CLIENT_SECRET = "github-secret";
    delete process.env.GITHUB_APP_ID;
    delete process.env.GITHUB_APP_SLUG;
    delete process.env.GITHUB_APP_PRIVATE_KEY;
    process.env.VERCEL_INTEGRATION_CLIENT_ID = "vercel-client";
    process.env.VERCEL_INTEGRATION_CLIENT_SECRET = "vercel-secret";
    process.env.VERCEL_INTEGRATION_SLUG = "squid-agent";
  });

  afterEach(() => {
    for (const [name, value] of [
      ["INTEGRATION_OAUTH_STATE_SECRET", originalEnv.stateSecret],
      ["GITHUB_OAUTH_CLIENT_ID", originalEnv.githubId],
      ["GITHUB_OAUTH_CLIENT_SECRET", originalEnv.githubSecret],
      ["GITHUB_APP_ID", originalEnv.githubAppId],
      ["GITHUB_APP_SLUG", originalEnv.githubAppSlug],
      ["GITHUB_APP_PRIVATE_KEY", originalEnv.githubAppKey],
      ["VERCEL_INTEGRATION_CLIENT_ID", originalEnv.vercelId],
      ["VERCEL_INTEGRATION_CLIENT_SECRET", originalEnv.vercelSecret],
      ["VERCEL_INTEGRATION_SLUG", originalEnv.vercelSlug],
    ] as const) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("signs state and rejects tampering", () => {
    const created = createOAuthState({
      userId: "user_1",
      projectId: "project_1",
      providerId: "github",
      environment: "development",
    });
    expect(verifyOAuthState(created.state)).toMatchObject({
      userId: "user_1",
      projectId: "project_1",
      providerId: "github",
      environment: "development",
      nonce: created.nonce,
    });
    expect(() => verifyOAuthState(`${created.state}tampered`)).toThrow(
      /signature/,
    );
  });

  it("creates an S256-compatible PKCE pair", () => {
    const pkce = createPkcePair();
    expect(pkce.verifier.length).toBeGreaterThanOrEqual(43);
    expect(pkce.challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(pkce.challenge).not.toBe(pkce.verifier);
  });

  it("builds GitHub authorization with signed state and PKCE", () => {
    const config = getOAuthProviderConfig("github");
    expect(config).not.toBeNull();
    const url = buildOAuthAuthorizationUrl({
      config: config!,
      state: "signed-state",
      codeChallenge: "challenge",
    });
    expect(url.origin).toBe("https://github.com");
    expect(url.searchParams.get("state")).toBe("signed-state");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("scope")).toContain("repo");
  });

  it("prefers repository-scoped GitHub App installation authorization", () => {
    process.env.GITHUB_APP_ID = "12345";
    process.env.GITHUB_APP_SLUG = "squid-agent";
    process.env.GITHUB_APP_PRIVATE_KEY = "configured-private-key";
    const config = getOAuthProviderConfig("github")!;
    const url = buildOAuthAuthorizationUrl({
      config,
      state: "signed-state",
    });
    expect(config.mode).toBe("github_app");
    expect(url.pathname).toBe("/apps/squid-agent/installations/new");
    expect(url.searchParams.get("state")).toBe("signed-state");
  });

  it("exchanges a GitHub code without exposing the result to the browser", async () => {
    const fetchMock = vi.fn(async (_input: unknown, init?: RequestInit) => {
      expect(init?.body).toContain('"code_verifier":"verifier"');
      return new Response(
        JSON.stringify({
          access_token: "github-access-token",
          scope: "read:user,repo",
          token_type: "bearer",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    const result = await exchangeOAuthCode({
      config: getOAuthProviderConfig("github")!,
      code: "temporary-code",
      codeVerifier: "verifier",
      fetchImpl: fetchMock as typeof fetch,
    });
    expect(result).toEqual({
      accessToken: "github-access-token",
      scopes: ["read:user", "repo"],
      metadata: {},
    });
  });

  it("uses Vercel's form-encoded token exchange", async () => {
    const fetchMock = vi.fn(async (_input: unknown, init?: RequestInit) => {
      expect(init?.body).toBeInstanceOf(URLSearchParams);
      expect((init?.body as URLSearchParams).get("client_secret")).toBe(
        "vercel-secret",
      );
      return new Response(
        JSON.stringify({
          access_token: "vercel-access-token",
          team_id: "team_1",
          user_id: "user_vercel",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    const result = await exchangeOAuthCode({
      config: getOAuthProviderConfig("vercel")!,
      code: "temporary-code",
      fetchImpl: fetchMock as typeof fetch,
    });
    expect(result.metadata).toEqual({
      teamId: "team_1",
      vercelUserId: "user_vercel",
    });
  });
});
