import "server-only";

import { z } from "zod";

import { domain } from "@/lib/domain";

export type OAuthProviderId = "github" | "vercel" | "supabase";

export type OAuthProviderConfig = {
  providerId: OAuthProviderId;
  mode: "oauth_app" | "github_app" | "vercel_integration";
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  slug?: string;
};

function requiredValue(name: string) {
  return process.env[name]?.trim() || null;
}

export function getOAuthProviderConfig(
  providerId: OAuthProviderId,
): OAuthProviderConfig | null {
  if (providerId === "github") {
    const appId = requiredValue("GITHUB_APP_ID");
    const slug = requiredValue("GITHUB_APP_SLUG");
    const privateKey = requiredValue("GITHUB_APP_PRIVATE_KEY");
    if (appId && slug && privateKey) {
      return {
        providerId,
        mode: "github_app",
        clientId: appId,
        clientSecret: privateKey,
        slug,
        callbackUrl: `${domain}/api/integrations/oauth/github/callback`,
      };
    }
    const clientId = requiredValue("GITHUB_OAUTH_CLIENT_ID");
    const clientSecret = requiredValue("GITHUB_OAUTH_CLIENT_SECRET");
    if (!clientId || !clientSecret) return null;
    return {
      providerId,
      mode: "oauth_app",
      clientId,
      clientSecret,
      callbackUrl: `${domain}/api/integrations/oauth/github/callback`,
    };
  }

  if (providerId === "supabase") {
    const clientId = requiredValue("SUPABASE_OAUTH_CLIENT_ID");
    const clientSecret = requiredValue("SUPABASE_OAUTH_CLIENT_SECRET");
    if (!clientId || !clientSecret) return null;
    return {
      providerId,
      mode: "oauth_app",
      clientId,
      clientSecret,
      callbackUrl: `${domain}/api/integrations/oauth/supabase/callback`,
    };
  }

  const clientId = requiredValue("VERCEL_INTEGRATION_CLIENT_ID");
  const clientSecret = requiredValue("VERCEL_INTEGRATION_CLIENT_SECRET");
  const slug = requiredValue("VERCEL_INTEGRATION_SLUG");
  if (!clientId || !clientSecret || !slug) return null;
  return {
    providerId,
    mode: "vercel_integration",
    clientId,
    clientSecret,
    slug,
    callbackUrl: `${domain}/api/integrations/oauth/vercel/callback`,
  };
}

export function isOAuthProviderId(value: string): value is OAuthProviderId {
  return value === "github" || value === "vercel" || value === "supabase";
}

export function buildOAuthAuthorizationUrl({
  config,
  state,
  codeChallenge,
}: {
  config: OAuthProviderConfig;
  state: string;
  codeChallenge?: string;
}) {
  if (config.providerId === "github") {
    if (config.mode === "github_app") {
      const url = new URL(
        `https://github.com/apps/${encodeURIComponent(config.slug!)}/installations/new`,
      );
      url.searchParams.set("state", state);
      return url;
    }
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", config.callbackUrl);
    url.searchParams.set("scope", "read:user repo");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    if (codeChallenge) {
      url.searchParams.set("code_challenge", codeChallenge);
      url.searchParams.set("code_challenge_method", "S256");
    }
    return url;
  }
  if (config.providerId === "supabase") {
    const url = new URL("https://api.supabase.com/v1/oauth/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", config.callbackUrl);
    url.searchParams.set("scope", "all");
    url.searchParams.set("state", state);
    if (codeChallenge) {
      url.searchParams.set("code_challenge", codeChallenge);
      url.searchParams.set("code_challenge_method", "S256");
    }
    return url;
  }

  const url = new URL(
    `https://vercel.com/integrations/${encodeURIComponent(config.slug!)}/new`,
  );
  url.searchParams.set("state", state);
  return url;
}

const githubTokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().optional(),
  scope: z.string().default(""),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

const vercelTokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().optional(),
  team_id: z.string().nullable().optional(),
  user_id: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

const supabaseTokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  refresh_token: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export async function exchangeOAuthCode({
  config,
  code,
  codeVerifier,
  fetchImpl = fetch,
}: {
  config: OAuthProviderConfig;
  code: string;
  codeVerifier?: string;
  fetchImpl?: typeof fetch;
}) {
  if (config.providerId === "github") {
    if (config.mode === "github_app") {
      throw new Error("GitHub App installations do not exchange OAuth codes.");
    }
    const response = await fetchImpl(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: config.callbackUrl,
          code_verifier: codeVerifier,
        }),
        cache: "no-store",
      },
    );
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error("GitHub token exchange failed.");
    const parsed = githubTokenSchema.safeParse(body);
    if (!parsed.success || parsed.data.error) {
      throw new Error(
        parsed.success && parsed.data.error_description
          ? parsed.data.error_description
          : "GitHub token exchange returned an invalid response.",
      );
    }
    return {
      accessToken: parsed.data.access_token,
      scopes: parsed.data.scope.split(",").filter(Boolean),
      metadata: {},
    };
  }
  if (config.providerId === "supabase") {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.callbackUrl,
      ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
    });
    const credentials = Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
    ).toString("base64");
    const response = await fetchImpl("https://api.supabase.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body,
      cache: "no-store",
    });
    const responseBody: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error("Supabase token exchange failed.");
    const parsed = supabaseTokenSchema.safeParse(responseBody);
    if (!parsed.success || parsed.data.error) {
      throw new Error(
        parsed.success && parsed.data.error_description
          ? parsed.data.error_description
          : "Supabase token exchange returned an invalid response.",
      );
    }
    return {
      accessToken: parsed.data.access_token,
      scopes: parsed.data.scope ? parsed.data.scope.split(",").filter(Boolean) : [],
      metadata: {
        ...(parsed.data.refresh_token
          ? { supabaseRefreshToken: parsed.data.refresh_token }
          : {}),
      },
    };
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.callbackUrl,
  });
  const response = await fetchImpl(
    "https://api.vercel.com/v2/oauth/access_token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    },
  );
  const responseBody: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error("Vercel token exchange failed.");
  const parsed = vercelTokenSchema.parse(responseBody);
  return {
    accessToken: parsed.access_token,
    scopes: [],
    metadata: {
      teamId: parsed.team_id ?? null,
      vercelUserId: parsed.user_id ?? null,
    },
  };
}

export function oauthProviderAvailability() {
  return {
    github: getOAuthProviderConfig("github") !== null,
    vercel: getOAuthProviderConfig("vercel") !== null,
    supabase: getOAuthProviderConfig("supabase") !== null,
  } as const;
}
