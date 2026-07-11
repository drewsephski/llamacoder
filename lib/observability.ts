type OperationalEvent = {
  name: string;
  level: "info" | "warn" | "error";
  userId?: string;
  operation?: string;
  status?: string;
  error?: unknown;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

function serializeError(error: unknown) {
  if (!(error instanceof Error)) return undefined;
  return {
    name: error.name,
    message: error.message.slice(0, 2000),
  };
}

export function recordOperationalEvent(event: OperationalEvent) {
  const payload = JSON.stringify({
    type: "operational_event",
    timestamp: new Date().toISOString(),
    name: event.name,
    userId: event.userId,
    operation: event.operation,
    status: event.status,
    error: serializeError(event.error),
    metadata: event.metadata,
  });

  if (event.level === "error") console.error(payload);
  else if (event.level === "warn") console.warn(payload);
  else console.info(payload);
}
