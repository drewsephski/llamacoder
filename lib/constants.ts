export const FREE_MODEL = "deepseek/deepseek-v4-flash";
export const DEFAULT_MODEL = "z-ai/glm-5.3-flash";
export const GEMINI_MULTIMODAL_MODEL = "google/gemini-3.1-flash-lite";
export const GEMINI_3_5_FLASH_LITE_MODEL = "google/gemini-3.5-flash-lite";
export const GEMINI_3_8_FLASH_MODEL = "google/gemini-3.8-flash";
/** Removed from the picker; kept for legacy chat routing. */
export const LEGACY_GEMINI_3_5_FLASH_MODEL = "google/gemini-3.5-flash";
export const LEGACY_GEMINI_3_6_FLASH_MODEL = "google/gemini-3.6-flash";
export const LEGACY_GEMINI_3_7_FLASH_MODEL = "google/gemini-3.7-flash";
export const LEGACY_GROK_4_5_MODEL = "x-ai/grok-4.5";
export const LEGACY_DEEPSEEK_V4_PRO_MODEL = "deepseek/deepseek-v4-pro";
export const GPT_6_LUNA_MODEL = "openai/gpt-6-luna";
export const CLAUDE_HAIKU_5_5_MODEL = "anthropic/claude-haiku-5.5";
export const CLAUDE_OPUS_5_5_MODEL = "anthropic/claude-opus-5.5";
export const LEGACY_CLAUDE_SONNET_5_MODEL = "anthropic/claude-sonnet-5";
export const LEGACY_CLAUDE_OPUS_4_8_MODEL = "anthropic/claude-opus-4.8";
export const LEGACY_DEFAULT_MODEL = "google/gemini-3-flash-preview";
export const LEGACY_GEMINI_DEFAULT_MODEL = GEMINI_MULTIMODAL_MODEL;
export const LEGACY_FREE_MODEL = "tencent/hy3-preview:free";
export const LEGACY_SECONDARY_STARTER_MODEL = "minimax/minimax-m2.5";
export const LEGACY_MIMO_STARTER_MODEL = "xiaomi/mimo-v2.5";
export const LEGACY_KIMI_CODE_MODEL = "moonshotai/kimi-k2.7-code";
export const LEGACY_MINIMAX_M3_MODEL = "minimax/minimax-m3";
export const LEGACY_QWEN_MAX_MODEL = "qwen/qwen3.7-max";
export const LEGACY_GEMINI_PRO_MODEL = "google/gemini-3.1-pro-preview";
export const LEGACY_GPT_5_4_MODEL = "openai/gpt-5.4";
export const LEGACY_CLAUDE_OPUS_MODEL = "anthropic/claude-opus-4.6";
export const LEGACY_LAGUNA_MODEL = "poolside/laguna-xs-2.1";
export const LEGACY_GLM_5_2_MODEL = "z-ai/glm-5.2";
export const SECONDARY_STARTER_MODEL = "google/gemini-2.5-flash-lite";
export const SAFE_GPT_MODEL = "openai/gpt-4.1";

export const REASONING_EFFORTS = [
  "xhigh",
  "high",
  "medium",
  "low",
  "minimal",
] as const;

export type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

export type ModelReasoningCapability =
  | { supported: false; mandatory: false }
  | {
      supported: true;
      mandatory: boolean;
      /**
       * Product-level override for models where reasoning exists but the
       * Plan-mode toggle is not a meaningful user-facing choice.
       */
      planModeAvailable?: boolean;
      supportedEfforts?: readonly ReasoningEffort[];
      defaultEffort?: ReasoningEffort;
    };

export type ModelOption = {
  label: string;
  value: string;
  paid?: boolean;
  free?: boolean;
  featured?: boolean;
  summary: string;
  reasoning: ModelReasoningCapability;
  /**
   * Keeps slot rendering explicit when options expand in future.
   */
  group: "free" | "paid" | "premium";
};

export const MODELS: ModelOption[] = [
  {
    label: "GLM 5.3 Flash",
    value: DEFAULT_MODEL,
    free: true,
    featured: true,
    group: "free",
    summary:
      "Fast multimodal default for low-latency app generation and screenshots.",
    reasoning: {
      supported: true,
      mandatory: false,
      supportedEfforts: ["xhigh", "high"],
      defaultEffort: "high",
    },
  },
  {
    label: "DeepSeek V4 Flash",
    value: FREE_MODEL,
    free: true,
    group: "free",
    summary: "Fast free starter model for simple app generation.",
    reasoning: {
      supported: true,
      mandatory: false,
      supportedEfforts: ["xhigh", "high"],
      defaultEffort: "high",
    },
  },
  {
    label: "Gemini 3.5 Flash Lite",
    value: GEMINI_3_5_FLASH_LITE_MODEL,
    free: true,
    group: "free",
    summary: "Agentic Gemini Flash Lite for focused app generation.",
    reasoning: {
      supported: true,
      mandatory: true,
      supportedEfforts: ["high", "medium", "low", "minimal"],
      defaultEffort: "minimal",
    },
  },
  {
    label: "Gemini 3.8 Flash",
    value: GEMINI_3_8_FLASH_MODEL,
    paid: true,
    group: "paid",
    summary: "Newest Google Gemini Flash release on OpenRouter.",
    reasoning: {
      supported: true,
      mandatory: false,
      supportedEfforts: ["high", "medium", "low", "minimal"],
      defaultEffort: "medium",
    },
  },
  {
    label: "Claude Haiku 5.5",
    value: CLAUDE_HAIKU_5_5_MODEL,
    paid: true,
    group: "paid",
    summary: "Fast Claude model for responsive edits and lighter builds.",
    reasoning: {
      supported: true,
      mandatory: false,
      supportedEfforts: ["high", "medium", "low"],
      defaultEffort: "medium",
    },
  },
  {
    label: "GPT-6 Luna",
    value: GPT_6_LUNA_MODEL,
    paid: true,
    group: "paid",
    summary: "OpenAI Luna coding model for fast iterative app generation.",
    reasoning: {
      supported: true,
      mandatory: false,
      supportedEfforts: ["high", "medium", "low"],
      defaultEffort: "medium",
    },
  },
  {
    label: "Claude Opus 5.5",
    value: CLAUDE_OPUS_5_5_MODEL,
    paid: true,
    group: "premium",
    summary:
      "Top Claude option for complex multi-step coding and orchestration.",
    reasoning: {
      supported: true,
      mandatory: false,
      supportedEfforts: ["xhigh", "high", "medium", "low"],
      defaultEffort: "medium",
    },
  },
];

export function getModelReasoningCapability(
  model: string,
): ModelReasoningCapability {
  return (
    MODELS.find((option) => option.value === model)?.reasoning ?? {
      supported: false,
      mandatory: false,
    }
  );
}

export function isActiveModelId(model: string): boolean {
  return MODELS.some((option) => option.value === model);
}

export function isPlanModeAvailable(model: string): boolean {
  const capability = getModelReasoningCapability(model);

  return (
    capability.supported &&
    !capability.mandatory &&
    capability.planModeAvailable !== false
  );
}

export const SUGGESTED_PROMPTS = [
  {
    title: "Kanban Board",
    description:
      "Create a Kanban-style project board with columns for To Do, In Progress, and Done. Let users add, edit, and drag tasks between columns. Include task labels, due dates, and a clean minimal design.",
  },
  {
    title: "Landing Page",
    description:
      "Build a modern landing page for an AI startup with a bold hero section, an animated feature grid, a pricing table with three tiers, a testimonials carousel, and a waitlist signup form. Use smooth scroll animations and a sleek dark theme.",
  },
  {
    title: "Habit Tracker",
    description:
      "Build a daily habit tracker where I can add habits and check them off each day. Show a weekly streak view with a heatmap-style grid, track completion percentages, and celebrate streaks with animations.",
  },
];

export const ACCEPTED_SCREENSHOT_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MAX_SCREENSHOT_BYTES = 6 * 1024 * 1024;
export const MAX_SCREENSHOT_SIZE_MB = MAX_SCREENSHOT_BYTES / (1024 * 1024);
export const MAX_SCREENSHOT_DATA_URL_LENGTH =
  Math.ceil((MAX_SCREENSHOT_BYTES * 4) / 3) + 32;
