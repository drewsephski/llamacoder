import type { NextRequest } from "next/server";

import { designPartnerApplicationSchema } from "@/features/design-partners/contracts";
import { submitDesignPartnerApplication } from "@/features/design-partners/server/applications";
import { scheduleDesignPartnerNotification } from "@/features/design-partners/server/notification";
import { consumeRateLimit } from "@/features/security/server/rate-limit";

export async function POST(request: NextRequest) {
  const subject =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";
  const rateLimit = await consumeRateLimit({
    userId: `design-partner:${subject}`,
    operation: "design_partner",
    limit: 5,
    windowMs: 60 * 60 * 1_000,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { message: "Too many applications. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const parsed = designPartnerApplicationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json(
      {
        message: "Check the highlighted fields and try again.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return Response.json({ status: "received" }, { status: 201 });
  }

  const application = await submitDesignPartnerApplication(parsed.data);
  if (application.created) {
    scheduleDesignPartnerNotification(application.id);
  }

  return Response.json({ status: "received" }, { status: 201 });
}
