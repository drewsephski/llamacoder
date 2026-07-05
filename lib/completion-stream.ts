"use client";

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

  return response.body;
}
