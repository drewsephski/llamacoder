import { DEFAULT_ESTIMATED_INPUT_TOKENS } from "@/lib/billing/config";

export function optimizeMessagesForTokens(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
): { role: "system" | "user" | "assistant"; content: string }[] {
  const assistantIndices: number[] = [];
  for (
    let i = messages.length - 1;
    i >= 0 && assistantIndices.length < 2;
    i--
  ) {
    if (messages[i].role === "assistant") {
      assistantIndices.push(i);
    }
  }
  return messages.map((msg, index) => {
    if (msg.role === "assistant" && !assistantIndices.includes(index)) {
      const stripped = msg.content.replace(/```[\s\S]*?```/g, "").trim();
      return {
        ...msg,
        content: stripped || "[code omitted]",
      };
    }
    return msg;
  });
}

const MAX_INPUT_CHARACTERS = DEFAULT_ESTIMATED_INPUT_TOKENS * 3;

export function clampMessagesToBillingBudget(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
) {
  if (
    messages.reduce((total, message) => total + message.content.length, 0) <=
    MAX_INPUT_CHARACTERS
  ) {
    return messages;
  }

  const systemMessage = messages.find((message) => message.role === "system");
  const nonSystemMessages = messages.filter(
    (message) => message !== systemMessage,
  );
  const kept: typeof messages = [];
  let remaining = Math.max(
    0,
    MAX_INPUT_CHARACTERS - (systemMessage?.content.length ?? 0),
  );

  for (let index = nonSystemMessages.length - 1; index >= 0; index -= 1) {
    const message = nonSystemMessages[index];
    if (remaining <= 0) break;

    if (message.content.length <= remaining) {
      kept.unshift(message);
      remaining -= message.content.length;
      continue;
    }

    kept.unshift({
      ...message,
      content: `[Earlier context truncated]\n${message.content.slice(-remaining)}`,
    });
    remaining = 0;
  }

  return systemMessage ? [systemMessage, ...kept] : kept;
}

/** Minimum growth between partialText persistence writes during streaming. */
export const PARTIAL_TEXT_SNAPSHOT_INTERVAL_CHARS = 4_096;
