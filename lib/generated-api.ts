import {
  findIntegrationProviderByUrl,
  type IntegrationPolicyStatus,
} from "@/features/integrations/registry";

export type ApiIntegrationIssue = {
  path?: string;
  message: string;
};

export type GeneratedIntegrationProvider = {
  id: string;
  name: string;
  policyStatus: IntegrationPolicyStatus;
  runtime: "browser" | "server";
  commercialUse: "allowed" | "restricted" | "review_required";
  docsUrl: string;
  matchedEndpoints: string[];
};

export type GeneratedApiIntegrationReport = {
  status: "not_detected" | "verified" | "setup_required" | "blocked";
  requestsDetected: number;
  endpoints: string[];
  environmentVariables: string[];
  providers: GeneratedIntegrationProvider[];
  policyWarnings: string[];
  issues: ApiIntegrationIssue[];
};

type SourceFile = { path: string; code: string };

const FETCH_PATTERN = /\bfetch\s*\(/g;
const URL_PATTERN = /https?:\/\/[^\s"'`)<>{]+/g;
const ENV_PATTERN = /\bimport\.meta\.env\.([A-Z][A-Z0-9_]*)\b/g;
const SECRET_NAME_PATTERN =
  /(?:SECRET|PRIVATE|SERVER|ADMIN|SERVICE_ROLE|PASSWORD)/i;
const HARDCODED_SECRET_PATTERN =
  /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret|password|private[_-]?key)\b\s*[:=]\s*["'`]([A-Za-z0-9_\-./+=]{12,})["'`]/gi;
const HARDCODED_AUTH_PATTERN =
  /\b(?:authorization|x-api-key|api-key)\b\s*[:=]\s*["'`](?:Bearer\s+)?([A-Za-z0-9_\-./+=]{12,})["'`]/gi;
const FORBIDDEN_BROWSER_HEADER_PATTERN =
  /["'`](?:User-Agent|Origin|Host|Referer|Cookie|Content-Length)["'`]\s*:/gi;

function unique(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function matches(code: string, pattern: RegExp) {
  pattern.lastIndex = 0;
  return pattern.test(code);
}

function collectMatches(code: string, pattern: RegExp, group = 0) {
  const values: string[] = [];
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) values.push(match[group]);
  return values;
}

export function analyzeGeneratedApiIntegration(
  files: SourceFile[],
): GeneratedApiIntegrationReport {
  const source = files.map((file) => file.code).join("\n");
  const requestsDetected = collectMatches(source, FETCH_PATTERN).length;
  const endpoints = unique(collectMatches(source, URL_PATTERN));
  const environmentVariables = unique(collectMatches(source, ENV_PATTERN, 1));
  const issues: ApiIntegrationIssue[] = [];
  const policyWarnings: string[] = [];
  const matchedProviders = new Map<string, GeneratedIntegrationProvider>();

  for (const endpoint of endpoints) {
    const provider = findIntegrationProviderByUrl(endpoint);
    if (!provider) continue;

    const existing = matchedProviders.get(provider.id);
    if (existing) {
      existing.matchedEndpoints = unique([
        ...existing.matchedEndpoints,
        endpoint,
      ]);
      continue;
    }

    matchedProviders.set(provider.id, {
      id: provider.id,
      name: provider.name,
      policyStatus: provider.policyStatus,
      runtime: provider.runtime,
      commercialUse: provider.commercialUse,
      docsUrl: provider.docsUrl,
      matchedEndpoints: [endpoint],
    });
  }

  for (const provider of matchedProviders.values()) {
    if (provider.policyStatus === "blocked") {
      issues.push({
        message: `${provider.name} is blocked by Squid's integration policy. Choose a compliant provider or a user-controlled deployment instead.`,
      });
      continue;
    }

    if (provider.policyStatus === "conditional") {
      policyWarnings.push(
        `${provider.name} requires setup or policy review before production use.`,
      );
    }
    if (provider.runtime === "server") {
      policyWarnings.push(
        `${provider.name} requires a server-side integration for reliable or authenticated use.`,
      );
    }
    if (provider.commercialUse !== "allowed") {
      policyWarnings.push(
        `${provider.name} commercial-use terms must be reviewed before deployment.`,
      );
    }
  }

  const providers = Array.from(matchedProviders.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const file of files) {
    if (!matches(file.code, FETCH_PATTERN)) continue;

    if (!/\bresponse\.ok\b|\b[a-zA-Z_$][\w$]*\.ok\b/.test(file.code)) {
      issues.push({
        path: file.path,
        message:
          "Live API requests must reject non-success HTTP responses before reading data.",
      });
    }
    if (!/\bAbortController\b/.test(file.code)) {
      issues.push({
        path: file.path,
        message:
          "Live API requests must use AbortController to enforce a timeout.",
      });
    }
    if (
      !/\b(?:retry|retries|attempt|MAX_RETRIES|RETRY_COUNT)\b/i.test(file.code)
    ) {
      issues.push({
        path: file.path,
        message: "Live API requests must include a bounded retry path.",
      });
    }
    if (
      !/\b(?:is[A-Z][A-Za-z0-9]*|validate[A-Z][A-Za-z0-9]*|safeParse|Array\.isArray)\b/.test(
        file.code,
      )
    ) {
      issues.push({
        path: file.path,
        message:
          "Live API responses must be validated at runtime before rendering.",
      });
    }
    if (matches(file.code, FORBIDDEN_BROWSER_HEADER_PATTERN)) {
      issues.push({
        path: file.path,
        message:
          "Browser fetch must not set forbidden request headers such as User-Agent, Origin, Host, Referer, Cookie, or Content-Length.",
      });
    }
  }

  for (const file of files) {
    for (const _value of collectMatches(
      file.code,
      HARDCODED_SECRET_PATTERN,
      1,
    )) {
      issues.push({
        path: file.path,
        message:
          "Hard-coded API credentials are forbidden in generated browser code.",
      });
    }
    for (const _value of collectMatches(file.code, HARDCODED_AUTH_PATTERN, 1)) {
      issues.push({
        path: file.path,
        message:
          "Secret-bearing authorization headers are forbidden in generated browser code.",
      });
    }
  }

  for (const variable of environmentVariables) {
    if (!variable.startsWith("VITE_")) {
      issues.push({
        message: `Browser environment variable ${variable} must use the VITE_ prefix.`,
      });
    }
    if (SECRET_NAME_PATTERN.test(variable)) {
      issues.push({
        message: `Environment variable ${variable} appears secret-bearing and cannot be exposed to the browser.`,
      });
    }
  }

  if (requestsDetected === 0) {
    return {
      status:
        issues.length > 0
          ? "blocked"
          : environmentVariables.length > 0 || policyWarnings.length > 0
            ? "setup_required"
            : "not_detected",
      requestsDetected,
      endpoints,
      environmentVariables,
      providers,
      policyWarnings: unique(policyWarnings),
      issues,
    };
  }

  return {
    status:
      issues.length > 0
        ? "blocked"
        : environmentVariables.length > 0 || policyWarnings.length > 0
          ? "setup_required"
          : "verified",
    requestsDetected,
    endpoints,
    environmentVariables,
    providers,
    policyWarnings: unique(policyWarnings),
    issues,
  };
}
