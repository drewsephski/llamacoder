import { DEFAULT_ESTIMATED_INPUT_TOKENS } from "@/lib/billing/config";

export type TextMessagePart = { type: "text"; text: string };
export type ImageMessagePart = { type: "image"; image: string };
export type MessageContent = string | Array<TextMessagePart | ImageMessagePart>;

export type BillingBudgetMessage = {
  role: "system" | "user" | "assistant";
  content: MessageContent;
};

/** Rough character budget for an inline screenshot (image tokens are billed separately). */
const IMAGE_CONTENT_CHAR_BUDGET = 12_000;

export function getMessageTextContent(content: MessageContent): string {
  if (typeof content === "string") return content;
  return content
    .filter((part): part is TextMessagePart => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

export function getMessageContentLength(content: MessageContent): number {
  if (typeof content === "string") return content.length;
  return content.reduce((total, part) => {
    if (part.type === "text") return total + part.text.length;
    return total + IMAGE_CONTENT_CHAR_BUDGET;
  }, 0);
}

export function messageIncludesImage(content: MessageContent): boolean {
  return (
    typeof content !== "string" && content.some((part) => part.type === "image")
  );
}

export function appendTextToMessageContent(
  content: MessageContent,
  appendix: string,
): MessageContent {
  if (typeof content === "string") {
    return `${content}${appendix}`;
  }

  const parts = [...content];
  const textPartIndex = parts.findLastIndex((part) => part.type === "text");
  if (textPartIndex === -1) {
    return [{ type: "text", text: appendix.trimStart() }, ...parts];
  }

  const textPart = parts[textPartIndex];
  if (textPart?.type === "text") {
    parts[textPartIndex] = { type: "text", text: textPart.text + appendix };
  }
  return parts;
}

export function optimizeMessagesForTokens(
  messages: BillingBudgetMessage[],
): BillingBudgetMessage[] {
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
      if (typeof msg.content !== "string") return msg;
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

export function clampMessagesToBillingBudget(messages: BillingBudgetMessage[]) {
  if (
    messages.reduce(
      (total, message) => total + getMessageContentLength(message.content),
      0,
    ) <= MAX_INPUT_CHARACTERS
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
    MAX_INPUT_CHARACTERS -
      (systemMessage ? getMessageContentLength(systemMessage.content) : 0),
  );

  for (let index = nonSystemMessages.length - 1; index >= 0; index -= 1) {
    const message = nonSystemMessages[index];
    if (remaining <= 0) break;

    const messageLength = getMessageContentLength(message.content);
    if (messageLength <= remaining) {
      kept.unshift(message);
      remaining -= messageLength;
      continue;
    }

    if (typeof message.content === "string") {
      kept.unshift({
        ...message,
        content: `[Earlier context truncated]\n${message.content.slice(-remaining)}`,
      });
    } else {
      kept.unshift(message);
    }
    remaining = 0;
  }

  return systemMessage ? [systemMessage, ...kept] : kept;
}

/** Minimum growth between partialText persistence writes during streaming. */
export const PARTIAL_TEXT_SNAPSHOT_INTERVAL_CHARS = 4_096;
