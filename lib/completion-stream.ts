"use client";

export type CompletionStream = ReadableStream<Uint8Array> & {
  creditHoldId?: string;
};

export async function fetchCompletionStream({
  messageId,
  model,
}: {
  messageId: string;
  model: string;
}) {
  const response = await fetch("/api/get-next-completion-stream-promise", {
    method: "POST",
    body: JSON.stringify({
      messageId,
      model,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Failed to start generation");
  }

  if (!response.body) {
    throw new Error("Generation did not return a response body");
  }

  const body = response.body as CompletionStream;
  body.creditHoldId = response.headers.get("x-credit-hold-id") || undefined;

  return body;
}
