import { z } from "zod";

export const runtimeVerificationReportSchema = z.object({
  messageId: z.string().min(1),
  status: z.enum(["passed", "review", "failed"]),
  viewport: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  clickableElements: z.number().int().nonnegative(),
  unnamedClickableElements: z.number().int().nonnegative(),
  horizontalOverflow: z.boolean(),
  runtimeError: z.string().nullable(),
  checkedAt: z.string().datetime(),
});

export type RuntimeVerificationReport = z.infer<
  typeof runtimeVerificationReportSchema
>;
