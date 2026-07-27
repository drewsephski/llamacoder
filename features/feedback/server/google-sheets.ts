import "server-only";

import { createSign } from "node:crypto";

import type { ResearchFeedbackActivityEvidence } from "@/features/feedback/contracts";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const GOOGLE_SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const REQUEST_TIMEOUT_MS = 10_000;

export const RESEARCH_FEEDBACK_SHEET_HEADERS = [
  "Submission ID",
  "Submitted at",
  "Account email",
  "User ID",
  "Project",
  "Project URL",
  "Reward track",
  "Generated versions",
  "Previewed",
  "Edited",
  "Exported",
  "Build goal",
  "Previous tools",
  "Most frustrating",
  "Better than expected",
  "Closest to abandoning",
  "Launch blocker",
  "Single improvement",
  "Would pay",
  "Monthly price USD",
  "Follow-up consent",
  "Evidence URL",
  "Status",
  "Primary category",
  "Reward credits",
  "Reviewed by",
  "Review notes",
  "Reviewed at",
  "Last synced at",
] as const;

type GoogleSheetsConfig = {
  serviceAccountEmail: string;
  privateKey: string;
  spreadsheetId: string;
  tabName: string;
};

export type ResearchFeedbackMirrorRecord = {
  id: string;
  userId: string;
  accountEmail: string;
  projectId: string;
  projectTitle: string;
  buildGoal: string;
  previousTools: string;
  frustration: string;
  betterThanExpected: string;
  abandonmentPoint: string;
  launchBlocker: string;
  singleImprovement: string;
  paymentIntent: string;
  monthlyPriceUsd: number;
  followUpConsent: boolean;
  mediaUrl: string | null;
  rewardTrack: string;
  activityEvidence: ResearchFeedbackActivityEvidence;
  status: string;
  primaryCategory: string | null;
  rewardAmount: number | null;
  reviewedByEmail: string | null;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
};

let cachedToken: { value: string; expiresAt: number } | undefined;

function readGoogleSheetsConfig(
  environment: NodeJS.ProcessEnv = process.env,
): GoogleSheetsConfig | null {
  const values = {
    serviceAccountEmail:
      environment.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL?.trim() ?? "",
    privateKey: environment.GOOGLE_SHEETS_PRIVATE_KEY?.trim() ?? "",
    spreadsheetId: environment.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() ?? "",
  };
  const configured = Object.values(values).filter(Boolean).length;
  if (configured === 0) return null;
  if (configured !== Object.keys(values).length) {
    throw new Error(
      "Configure GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, and GOOGLE_SHEETS_SPREADSHEET_ID together.",
    );
  }

  return {
    ...values,
    privateKey: values.privateKey.replace(/\\n/g, "\n"),
    tabName: environment.GOOGLE_SHEETS_TAB_NAME?.trim() || "Feedback",
  };
}

export function isGoogleSheetsFeedbackSyncConfigured(
  environment: NodeJS.ProcessEnv = process.env,
) {
  try {
    return readGoogleSheetsConfig(environment) !== null;
  } catch {
    return false;
  }
}

function encodeJwtPart(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

async function getGoogleAccessToken(config: GoogleSheetsConfig) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const now = Math.floor(Date.now() / 1_000);
  const unsignedToken = `${encodeJwtPart({ alg: "RS256", typ: "JWT" })}.${encodeJwtPart(
    {
      iss: config.serviceAccountEmail,
      scope: GOOGLE_SHEETS_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3_600,
    },
  )}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const assertion = `${unsignedToken}.${signer.sign(config.privateKey, "base64url")}`;
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const payload = (await response.json().catch(() => null)) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  } | null;
  if (!response.ok || !payload?.access_token) {
    throw new Error(
      payload?.error_description ||
        `Google OAuth rejected the service account (${response.status}).`,
    );
  }

  cachedToken = {
    value: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3_600) * 1_000,
  };
  return cachedToken.value;
}

async function googleSheetsRequest<T>(
  config: GoogleSheetsConfig,
  path: string,
  init?: RequestInit,
) {
  const accessToken = await getGoogleAccessToken(config);
  const response = await fetch(
    `${GOOGLE_SHEETS_API}/${config.spreadsheetId}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );
  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: { message?: string } })
    | null;
  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        `Google Sheets request failed (${response.status}).`,
    );
  }
  return payload as T;
}

function quoteTabName(tabName: string) {
  return `'${tabName.replaceAll("'", "''")}'`;
}

function columnName(index: number) {
  let value = index;
  let result = "";
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }
  return result;
}

function rangePath(range: string) {
  return `/values/${encodeURIComponent(range)}`;
}

async function ensureFeedbackTab(config: GoogleSheetsConfig) {
  const metadata = await googleSheetsRequest<{
    sheets?: Array<{ properties?: { title?: string } }>;
  }>(config, "?fields=sheets.properties.title");
  const exists = metadata.sheets?.some(
    (sheet) => sheet.properties?.title === config.tabName,
  );
  if (!exists) {
    await googleSheetsRequest(config, ":batchUpdate", {
      method: "POST",
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: config.tabName } } }],
      }),
    });
  }

  const endColumn = columnName(RESEARCH_FEEDBACK_SHEET_HEADERS.length);
  const headerRange = `${quoteTabName(config.tabName)}!A1:${endColumn}1`;
  const current = await googleSheetsRequest<{ values?: string[][] }>(
    config,
    rangePath(headerRange),
  );
  const currentHeaders = current.values?.[0] ?? [];
  if (currentHeaders.length === 0) {
    await googleSheetsRequest(
      config,
      `${rangePath(headerRange)}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: JSON.stringify({
          values: [[...RESEARCH_FEEDBACK_SHEET_HEADERS]],
        }),
      },
    );
    return;
  }
  if (
    currentHeaders.length !== RESEARCH_FEEDBACK_SHEET_HEADERS.length ||
    currentHeaders.some(
      (header, index) => header !== RESEARCH_FEEDBACK_SHEET_HEADERS[index],
    )
  ) {
    throw new Error(
      `The ${config.tabName} tab header row does not match Squid's feedback schema. Use a blank tab or restore the documented headers.`,
    );
  }
}

export function buildResearchFeedbackSheetRow(
  submission: ResearchFeedbackMirrorRecord,
  appUrl: string,
  syncedAt = new Date(),
) {
  const evidence = submission.activityEvidence;
  const yesNo = (value: boolean) => (value ? "Yes" : "No");
  return [
    submission.id,
    submission.createdAt.toISOString(),
    submission.accountEmail,
    submission.userId,
    submission.projectTitle,
    `${appUrl.replace(/\/$/, "")}/chats/${submission.projectId}`,
    submission.rewardTrack,
    evidence.generatedVersions,
    yesNo(evidence.previewed),
    yesNo(evidence.edited),
    yesNo(evidence.exported),
    submission.buildGoal,
    submission.previousTools,
    submission.frustration,
    submission.betterThanExpected,
    submission.abandonmentPoint,
    submission.launchBlocker,
    submission.singleImprovement,
    submission.paymentIntent,
    submission.monthlyPriceUsd,
    yesNo(submission.followUpConsent),
    submission.mediaUrl ?? "",
    submission.status,
    submission.primaryCategory ?? "",
    submission.rewardAmount ?? "",
    submission.reviewedByEmail ?? "",
    submission.reviewNotes ?? "",
    submission.reviewedAt?.toISOString() ?? "",
    syncedAt.toISOString(),
  ];
}

export async function upsertResearchFeedbackSheetRow(
  submission: ResearchFeedbackMirrorRecord,
) {
  const config = readGoogleSheetsConfig();
  if (!config) return { status: "disabled" as const };

  await ensureFeedbackTab(config);
  const idsRange = `${quoteTabName(config.tabName)}!A2:A`;
  const ids = await googleSheetsRequest<{ values?: string[][] }>(
    config,
    rangePath(idsRange),
  );
  const existingIndex = ids.values?.findIndex(
    (row) => row[0] === submission.id,
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const row = buildResearchFeedbackSheetRow(submission, appUrl);
  const endColumn = columnName(RESEARCH_FEEDBACK_SHEET_HEADERS.length);

  if (existingIndex !== undefined && existingIndex >= 0) {
    const rowNumber = existingIndex + 2;
    const range = `${quoteTabName(config.tabName)}!A${rowNumber}:${endColumn}${rowNumber}`;
    await googleSheetsRequest(
      config,
      `${rangePath(range)}?valueInputOption=RAW`,
      { method: "PUT", body: JSON.stringify({ values: [row] }) },
    );
  } else {
    const range = `${quoteTabName(config.tabName)}!A:${endColumn}`;
    await googleSheetsRequest(
      config,
      `${rangePath(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      { method: "POST", body: JSON.stringify({ values: [row] }) },
    );
  }

  return { status: "synced" as const };
}
