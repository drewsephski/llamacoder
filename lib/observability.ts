import { getErrorMessage } from "@/features/shared/errors";

export type OperationalEvent = {
  name: string;
  level: "info" | "warn" | "error";
  userId?: string;
  operation?: string;
  status?: string;
  error?: unknown;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

function serializeError(error: unknown) {
  if (error === undefined || error === null) return undefined;

  const errorName =
    error &&
    typeof error === "object" &&
    "name" in error &&
    typeof error.name === "string"
      ? error.name
      : "ProviderError";
  const message = getErrorMessage(error, "Unknown operational error");

  return {
    name: errorName,
    message: message.slice(0, 2000),
  };
}

export function recordOperationalEvent(event: OperationalEvent) {
  const serializedError = serializeError(event.error);
  const metadata = event.metadata
    ? Object.fromEntries(
        Object.entries(event.metadata).filter(
          ([, value]) => value !== undefined,
        ),
      )
    : undefined;
  const eventBody = {
    type: "operational_event",
    timestamp: new Date().toISOString(),
    name: event.name,
    userId: event.userId,
    operation: event.operation,
    status: event.status,
    error: serializedError,
    metadata,
  };
  const payload = JSON.stringify(eventBody);

  if (event.level === "error") console.error(payload);
  else if (event.level === "warn") console.warn(payload);
  else console.info(payload);

  if (event.level === "info") return Promise.resolve();

  const persistence = import("@/lib/prisma")
    .then(({ getPrisma }) =>
      getPrisma().operationalIncident.create({
        data: {
          name: event.name,
          level: event.level,
          operation: event.operation,
          status: event.status,
          userId: event.userId,
          errorName: serializedError?.name,
          errorMessage: serializedError?.message,
          metadata,
        },
      }),
    )
    .catch((error) => {
      console.error(
        "[observability] Incident persistence failed",
        serializeError(error),
      );
    });

  const alertWebhook = process.env.OPERATIONAL_ALERT_WEBHOOK_URL?.trim();
  if (!alertWebhook) return persistence.then(() => undefined);

  const delivery = fetch(alertWebhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `[Squid Agent] ${event.level.toUpperCase()}: ${event.name}`,
      event: eventBody,
    }),
    signal: AbortSignal.timeout(5_000),
  })
    .then((response) => {
      if (!response.ok) {
        console.error(
          `[observability] Alert delivery failed with ${response.status}`,
        );
      }
    })
    .catch((error) => {
      console.error(
        "[observability] Alert delivery failed",
        serializeError(error),
      );
    });

  return Promise.all([persistence, delivery]).then(() => undefined);
}
