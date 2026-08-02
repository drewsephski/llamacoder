import {
  isDesignPartnerNotificationConfigured,
  notifyDesignPartnerApplication,
} from "@/features/design-partners/server/notification";
import { isCronAuthorized } from "@/features/security/server/cron-auth";
import { getPrisma } from "@/lib/prisma";

const RETRYABLE_NOTIFICATION_STATES = [
  "pending",
  "failed",
  "disabled",
  "sending",
];

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const notificationConfigured = isDesignPartnerNotificationConfigured();
  if (!notificationConfigured) {
    return Response.json({ processed: 0, notificationConfigured });
  }

  const applications = await getPrisma().designPartnerApplication.findMany({
    where: {
      notificationStatus: { in: RETRYABLE_NOTIFICATION_STATES },
    },
    orderBy: { createdAt: "asc" },
    take: 25,
    select: { id: true },
  });
  const results = await Promise.all(
    applications.map(async ({ id }) => ({
      id,
      notification: await notifyDesignPartnerApplication(id),
    })),
  );

  return Response.json({
    processed: applications.length,
    notificationConfigured,
    results,
  });
}
