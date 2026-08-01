import { z } from "zod";

export const sourceAuditFindingSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(["passed", "review", "failed"]),
  summary: z.string(),
  details: z.array(z.string()),
});

export const sourceAuditReportSchema = z.object({
  schema: z.literal("squid.source-audit.v1"),
  auditedAt: z.string().datetime(),
  source: z.object({
    kind: z.enum(["zip", "github"]),
    label: z.string(),
  }),
  overallStatus: z.enum(["passed", "review", "failed"]),
  framework: z.string(),
  inventory: z.object({
    filesInspected: z.number().int().nonnegative(),
    sourceFiles: z.number().int().nonnegative(),
    totalBytes: z.number().int().nonnegative(),
  }),
  findings: z.array(sourceAuditFindingSchema),
  scope: z.array(z.string()),
});

export type SourceAuditReport = z.infer<typeof sourceAuditReportSchema>;

export type AuditableSourceFile = {
  path: string;
  content: string;
  bytes: number;
};
