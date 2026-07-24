"use client";

import { useState, useCallback, useEffect } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EnhancedPromptResult {
  enhanced: string;
  styling: string;
  components: string;
  interactions: string;
}

export interface PromptHistoryItem {
  id: string;
  originalPrompt: string;
  result: EnhancedPromptResult;
  timestamp: Date;
}

export interface UsePromptBuilderReturn {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  isLoading: boolean;
  result: EnhancedPromptResult | null;
  error: string | null;
  enhance: () => Promise<void>;
  refine: () => Promise<void>;
  history: PromptHistoryItem[];
  clearHistory: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "prompt-builder-history";
const MAX_HISTORY = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type ParsedSectionKey =
  | "enhanced"
  | "styling"
  | "components"
  | "interactions"
  | "responsive";

const SECTION_ALIASES: Array<{ key: ParsedSectionKey; pattern: RegExp }> = [
  { key: "enhanced", pattern: /enhanced\s+prompt/i },
  {
    key: "styling",
    pattern:
      /styling\s+breakdown|design\s+direction|typography\s+system|color\s+palette|spatial\s+composition|visual\s+texture/i,
  },
  { key: "components", pattern: /component\s+architecture/i },
  {
    key: "interactions",
    pattern: /interaction\s+design|interaction\s+inventory/i,
  },
  { key: "responsive", pattern: /responsive\s+strategy/i },
];

function resolveSectionKey(header: string): ParsedSectionKey | null {
  for (const alias of SECTION_ALIASES) {
    if (alias.pattern.test(header)) {
      return alias.key;
    }
  }
  return null;
}

/**
 * Parse the raw enhanced text from the API into structured sections.
 * The system prompt asks for:
 *   1. Enhanced Prompt
 *   2. Styling Breakdown (also accepts Design Direction / palette / type aliases)
 *   3. Component Architecture
 *   4. Interaction Design (also accepts Interaction Inventory)
 *   5. Responsive Strategy
 *
 * Mapped into the four-tab output shape (responsive folds into interactions when present).
 */
export function parseEnhancedText(raw: string): EnhancedPromptResult {
  const sectionRegex =
    /(?:^|\n)\s*(?:\d+\.\s*)?\*{0,2}(Enhanced Prompt|Styling Breakdown|Design Direction|Typography System|Color Palette|Spatial Composition|Visual Texture(?:\s*&\s*Atmosphere)?|Component Architecture|Interaction Design|Interaction Inventory|Responsive Strategy)\*{0,2}\s*:?\s*\n/gi;

  const matches = [...raw.matchAll(sectionRegex)];

  if (matches.length === 0) {
    return {
      enhanced: raw,
      styling: "",
      components: "",
      interactions: "",
    };
  }

  const buckets: Partial<Record<ParsedSectionKey, string[]>> = {};

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (!match || match.index === undefined) continue;

    const header = match[1] ?? "";
    const key = resolveSectionKey(header);
    if (!key) continue;

    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1]!.index! : raw.length;
    const body = raw.slice(start, end).trim();
    if (!body) continue;

    if (!buckets[key]) buckets[key] = [];
    buckets[key]!.push(body);
  }

  const joinBucket = (key: ParsedSectionKey): string =>
    (buckets[key] ?? []).join("\n\n").trim();

  const enhanced = joinBucket("enhanced");
  const styling = joinBucket("styling");
  const components = joinBucket("components");
  const interactionsCore = joinBucket("interactions");
  const responsive = joinBucket("responsive");

  const interactions = [interactionsCore, responsive]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  // Prefer structured tabs when we got at least Enhanced + one other section
  if (enhanced && (styling || components || interactions)) {
    return {
      enhanced,
      styling,
      components,
      interactions,
    };
  }

  // Partial parse: if only Enhanced was found, keep it; else fall back to raw
  if (enhanced) {
    return {
      enhanced,
      styling,
      components,
      interactions,
    };
  }

  return {
    enhanced: raw,
    styling: "",
    components: "",
    interactions: "",
  };
}

function loadHistory(): PromptHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Array<
      Omit<PromptHistoryItem, "timestamp"> & { timestamp: string }
    >;
    return parsed.map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch {
    return [];
  }
}

function saveHistory(history: PromptHistoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePromptBuilder(): UsePromptBuilderReturn {
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EnhancedPromptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const enhance = useCallback(async () => {
    const trimmed = userPrompt.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error || `Request failed with status ${response.status}`,
        );
      }

      const data = (await response.json()) as {
        enhanced?: string;
        error?: string;
      };

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.enhanced) {
        throw new Error("Empty response from the enhancement service.");
      }

      const parsed = parseEnhancedText(data.enhanced);
      setResult(parsed);

      // Add to history
      const newItem: PromptHistoryItem = {
        id: generateId(),
        originalPrompt: trimmed,
        result: parsed,
        timestamp: new Date(),
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
        saveHistory(updated);
        return updated;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userPrompt]);

  const refine = useCallback(async () => {
    if (!result?.enhanced) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Refine and improve this prompt. Be more specific, add missing details, and make it ready for code generation:\n\n${result.enhanced}`,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error || `Request failed with status ${response.status}`,
        );
      }

      const data = (await response.json()) as {
        enhanced?: string;
        error?: string;
      };

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.enhanced) {
        throw new Error("Empty response from the enhancement service.");
      }

      const parsed = parseEnhancedText(data.enhanced);
      setResult(parsed);

      // Add refined version to history
      const newItem: PromptHistoryItem = {
        id: generateId(),
        originalPrompt: `Refinement of: ${userPrompt.trim().slice(0, 80)}`,
        result: parsed,
        timestamp: new Date(),
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
        saveHistory(updated);
        return updated;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [result, userPrompt]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    userPrompt,
    setUserPrompt,
    isLoading,
    result,
    error,
    enhance,
    refine,
    history,
    clearHistory,
  };
}
