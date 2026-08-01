import { z } from "zod";

import { getMessageGeneratedFiles } from "@/features/generation/message-files";
import { runtimeVerificationReportSchema } from "@/features/generation/runtime-verification";
import type { ProjectMessage } from "@/features/projects/contracts";
import { buildGeneratedFilesQualityReport } from "@/lib/generated-files";

const passportCheckStatusSchema = z.enum([
  "passed",
  "review",
  "failed",
  "not_run",
  "not_applicable",
]);

const passportCheckSchema = z.object({
  id: z.enum(["source", "runtime", "export", "services"]),
  label: z.string(),
  status: passportCheckStatusSchema,
  summary: z.string(),
  checkedAt: z.string().datetime().nullable(),
  details: z.array(z.string()),
});

export const buildPassportSchema = z.object({
  schema: z.literal("squid.build-passport.v1"),
  generatedAt: z.string().datetime(),
  project: z.object({
    id: z.string(),
    messageId: z.string(),
    title: z.string(),
    prompt: z.string(),
    revisionCreatedAt: z.string().datetime(),
  }),
  overallStatus: z.enum(["verified", "review", "failed"]),
  checks: z.array(passportCheckSchema).length(4),
  evidence: z.object({
    generatedFiles: z.number().int().nonnegative(),
    sourceFiles: z.number().int().nonnegative(),
    resolvedImports: z.number().int().nonnegative(),
    diagnostics: z.number().int().nonnegative(),
    accessibilityWarnings: z.number().int().nonnegative(),
    clickableElements: z.number().int().nonnegative().nullable(),
    unnamedClickableElements: z.number().int().nonnegative().nullable(),
    horizontalOverflow: z.boolean().nullable(),
    exportedFiles: z.number().int().nonnegative().nullable(),
  }),
  limitations: z.array(z.string()),
});

export type BuildPassport = z.infer<typeof buildPassportSchema>;
export type BuildPassportCheck = z.infer<typeof passportCheckSchema>;

type PassportMessage = {
  id: string;
  content: string;
  files: ProjectMessage["files"];
  createdAt: Date;
  chat: {
    id: string;
    title: string;
    prompt: string;
  };
};

type RuntimeEvidence = {
  status: string;
  report: unknown;
  createdAt: Date;
} | null;

type ExportEvidence = {
  status: string;
  report: unknown;
  fileCount: number;
  createdAt: Date;
} | null;

const exportReportSchema = z.object({
  checks: z
    .array(
      z.object({
        name: z.string(),
        status: z.enum(["passed", "warning", "failed"]),
        message: z.string(),
      }),
    )
    .default([]),
});

export function buildBuildPassport({
  message,
  runtimeEvidence,
  exportEvidence,
  generatedAt = new Date(),
}: {
  message: PassportMessage;
  runtimeEvidence: RuntimeEvidence;
  exportEvidence: ExportEvidence;
  generatedAt?: Date;
}): BuildPassport {
  const files = getMessageGeneratedFiles(message);
  const quality = buildGeneratedFilesQualityReport(files);
  const runtime = runtimeVerificationReportSchema.safeParse(
    runtimeEvidence?.report,
  );
  const exportReport = exportReportSchema.safeParse(exportEvidence?.report);
  const warningCount =
    quality.diagnostics.length + quality.accessibilityWarnings.length;

  const sourceCheck: BuildPassportCheck = {
    id: "source",
    label: "Source integrity",
    status: quality.status === "passed" ? "passed" : "review",
    summary:
      quality.status === "passed"
        ? "Generated source passed Squid's static checks."
        : `${warningCount} source finding${warningCount === 1 ? "" : "s"} need review.`,
    checkedAt: quality.generatedAt,
    details: [
      `${quality.sourceFiles} source files inspected`,
      `${quality.importsResolved} internal imports resolved`,
      `${quality.diagnostics.length} diagnostics`,
      `${quality.accessibilityWarnings.length} accessibility warnings`,
    ],
  };

  const runtimeCheck = buildRuntimeCheck(runtimeEvidence, runtime);
  const exportCheck = buildExportCheck(exportEvidence, exportReport);
  const servicesCheck = buildServicesCheck(quality.apiIntegration);
  const checks = [sourceCheck, runtimeCheck, exportCheck, servicesCheck];
  const overallStatus = resolveOverallStatus(checks);

  return buildPassportSchema.parse({
    schema: "squid.build-passport.v1",
    generatedAt: generatedAt.toISOString(),
    project: {
      id: message.chat.id,
      messageId: message.id,
      title: message.chat.title,
      prompt: message.chat.prompt,
      revisionCreatedAt: message.createdAt.toISOString(),
    },
    overallStatus,
    checks,
    evidence: {
      generatedFiles: quality.filesGenerated,
      sourceFiles: quality.sourceFiles,
      resolvedImports: quality.importsResolved,
      diagnostics: quality.diagnostics.length,
      accessibilityWarnings: quality.accessibilityWarnings.length,
      clickableElements: runtime.success
        ? runtime.data.clickableElements
        : null,
      unnamedClickableElements: runtime.success
        ? runtime.data.unnamedClickableElements
        : null,
      horizontalOverflow: runtime.success
        ? runtime.data.horizontalOverflow
        : null,
      exportedFiles: exportEvidence?.fileCount ?? null,
    },
    limitations: buildLimitations({
      runtimeStatus: runtimeCheck.status,
      exportStatus: exportCheck.status,
      servicesStatus: servicesCheck.status,
    }),
  });
}

function buildRuntimeCheck(
  evidence: RuntimeEvidence,
  parsed: ReturnType<typeof runtimeVerificationReportSchema.safeParse>,
): BuildPassportCheck {
  if (!evidence || !parsed.success) {
    return {
      id: "runtime",
      label: "Preview runtime",
      status: "not_run",
      summary: "Runtime verification has not been recorded for this revision.",
      checkedAt: null,
      details: ["Open the project preview and run Test to add this evidence."],
    };
  }

  const report = parsed.data;
  const status =
    report.status === "passed"
      ? "passed"
      : report.status === "failed"
        ? "failed"
        : "review";

  return {
    id: "runtime",
    label: "Preview runtime",
    status,
    summary:
      status === "passed"
        ? `Preview passed at ${report.viewport.width}×${report.viewport.height}.`
        : status === "failed"
          ? "The recorded preview run failed."
          : "The preview ran, but findings still need review.",
    checkedAt: evidence.createdAt.toISOString(),
    details: [
      `${report.clickableElements} clickable elements inspected`,
      `${report.unnamedClickableElements} unnamed clickable elements`,
      report.horizontalOverflow
        ? "Horizontal overflow detected"
        : "No horizontal overflow detected",
      report.runtimeError
        ? "A preview runtime error was recorded"
        : "No preview runtime error recorded",
    ],
  };
}

function buildExportCheck(
  evidence: ExportEvidence,
  parsed: ReturnType<typeof exportReportSchema.safeParse>,
): BuildPassportCheck {
  if (!evidence) {
    return {
      id: "export",
      label: "Portable export",
      status: "not_run",
      summary: "A portable export has not been verified for this revision.",
      checkedAt: null,
      details: ["Create an export to verify the handoff bundle."],
    };
  }

  const status =
    evidence.status === "verified"
      ? "passed"
      : evidence.status === "failed"
        ? "failed"
        : "review";
  const reportDetails = parsed.success
    ? parsed.data.checks
        .filter((check) => check.status !== "passed")
        .slice(0, 3)
        .map((check) => `${check.name}: ${check.message}`)
    : [];

  return {
    id: "export",
    label: "Portable export",
    status,
    summary:
      status === "passed"
        ? `${evidence.fileCount} files were packaged and verified for handoff.`
        : status === "failed"
          ? "The latest handoff bundle failed verification."
          : "The latest handoff bundle contains warnings.",
    checkedAt: evidence.createdAt.toISOString(),
    details:
      reportDetails.length > 0
        ? reportDetails
        : [`${evidence.fileCount} files included in the export record`],
  };
}

function buildServicesCheck(apiIntegration: {
  status: "verified" | "setup_required" | "blocked" | "not_detected";
  requestsDetected: number;
  environmentVariables: string[];
  policyWarnings: string[];
}): BuildPassportCheck {
  if (apiIntegration.status === "not_detected") {
    return {
      id: "services",
      label: "External services",
      status: "not_applicable",
      summary: "No client API integration was detected in this revision.",
      checkedAt: null,
      details: [
        "Provider-side behavior was not required by the generated source.",
      ],
    };
  }

  const status =
    apiIntegration.status === "verified"
      ? "passed"
      : apiIntegration.status === "blocked"
        ? "failed"
        : "review";

  return {
    id: "services",
    label: "External services",
    status,
    summary:
      status === "passed"
        ? "Detected browser API usage passed Squid's static policy checks."
        : status === "failed"
          ? "Unsafe or incomplete client API code was detected."
          : "External service configuration is still required.",
    checkedAt: null,
    details: [
      `${apiIntegration.requestsDetected} client requests detected`,
      `${apiIntegration.environmentVariables.length} environment values required`,
      ...apiIntegration.policyWarnings.slice(0, 2),
    ],
  };
}

function resolveOverallStatus(checks: BuildPassportCheck[]) {
  if (checks.some((check) => check.status === "failed")) return "failed";
  if (
    checks.find((check) => check.id === "source")?.status === "passed" &&
    checks.find((check) => check.id === "runtime")?.status === "passed" &&
    checks.find((check) => check.id === "export")?.status === "passed" &&
    ["passed", "not_applicable"].includes(
      checks.find((check) => check.id === "services")?.status ?? "review",
    )
  ) {
    return "verified";
  }
  return "review";
}

function buildLimitations({
  runtimeStatus,
  exportStatus,
  servicesStatus,
}: {
  runtimeStatus: BuildPassportCheck["status"];
  exportStatus: BuildPassportCheck["status"];
  servicesStatus: BuildPassportCheck["status"];
}) {
  const limitations = [
    "This passport describes one immutable project revision; later edits require new evidence.",
    "Static and preview checks do not replace production monitoring, security review, or real-user testing.",
  ];
  if (runtimeStatus === "not_run") {
    limitations.push("No runtime verification was recorded for this revision.");
  }
  if (exportStatus === "not_run") {
    limitations.push("No portable export was verified for this revision.");
  }
  if (servicesStatus === "passed") {
    limitations.push(
      "Static API policy checks do not prove provider uptime, credentials, CORS, persistence, or authorization behavior.",
    );
  }
  return limitations;
}
