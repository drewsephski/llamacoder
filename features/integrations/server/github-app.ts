import "server-only";

import { createSign } from "node:crypto";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().min(1) });

function createGitHubAppJwt() {
  const appId = process.env.GITHUB_APP_ID?.trim();
  const configuredKey = process.env.GITHUB_APP_PRIVATE_KEY?.trim();
  if (!appId || !configuredKey) {
    throw new Error("GitHub App credentials are not configured.");
  }
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: appId }),
  ).toString("base64url");
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${signer.sign(configuredKey.replace(/\\n/g, "\n"), "base64url")}`;
}

export async function createGitHubInstallationToken(
  installationId: string,
  fetchImpl: typeof fetch = fetch,
) {
  const response = await fetchImpl(
    `https://api.github.com/app/installations/${encodeURIComponent(installationId)}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${createGitHubAppJwt()}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error("GitHub App installation authorization failed.");
  return tokenSchema.parse(body).token;
}
