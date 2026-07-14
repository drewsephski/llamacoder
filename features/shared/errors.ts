function getNestedErrorMessage(error: unknown, depth: number): string | null {
  if (depth > 3) return null;

  if (typeof error === "string") {
    return error.trim() || null;
  }

  if (!error || typeof error !== "object") return null;

  if ("message" in error && typeof error.message === "string") {
    const message = error.message.trim();
    if (message) return message;
  }

  if ("error" in error) {
    return getNestedErrorMessage(error.error, depth + 1);
  }

  return null;
}

export function getErrorMessage(error: unknown, fallback: string) {
  return getNestedErrorMessage(error, 0) ?? fallback;
}
