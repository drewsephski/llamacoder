export const FREE_MODEL = "deepseek/deepseek-v4-flash";
export const DEFAULT_MODEL = "google/gemini-3-flash-preview";
export const LEGACY_FREE_MODEL = "tencent/hy3-preview:free";
export const LEGACY_SECONDARY_STARTER_MODEL = "minimax/minimax-m2.5";
export const LEGACY_MIMO_STARTER_MODEL = "xiaomi/mimo-v2.5";
export const LEGACY_KIMI_CODE_MODEL = "moonshotai/kimi-k2.7-code";
export const LEGACY_MINIMAX_M3_MODEL = "minimax/minimax-m3";
export const LEGACY_GEMINI_PRO_MODEL = "google/gemini-3.1-pro-preview";
export const LEGACY_QWEN_MAX_MODEL = "qwen/qwen3.7-max";
export const LEGACY_GPT_5_4_MODEL = "openai/gpt-5.4";
export const LEGACY_CLAUDE_OPUS_MODEL = "anthropic/claude-opus-4.6";
export const LEGACY_LAGUNA_MODEL = "poolside/laguna-xs-2.1";
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
    label: "Gemini 3 Flash Preview",
    value: DEFAULT_MODEL,
    free: true,
    group: "free",
    summary: "Fast multimodal starter model for screenshot-first app work.",
    reasoning: {
      supported: true,
      mandatory: false,
      supportedEfforts: ["high", "medium", "low", "minimal"],
      defaultEffort: "medium",
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
    label: "Gemini 2.5 Flash Lite",
    value: SECONDARY_STARTER_MODEL,
    group: "free",
    summary: "Fast low-cost Gemini starter model for app generation.",
    reasoning: { supported: true, mandatory: false },
  },
  {
    label: "GPT-4.1",
    value: SAFE_GPT_MODEL,
    paid: true,
    group: "paid",
    summary: "Strong non-thinking GPT coding model with a 1M-token context.",
    reasoning: { supported: false, mandatory: false },
  },
  {
    label: "Claude Opus 4.8",
    value: "anthropic/claude-opus-4.8",
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
  {
    label: "Claude Sonnet 5",
    value: "anthropic/claude-sonnet-5",
    paid: true,
    featured: false,
    group: "premium",
    summary: "Efficient Claude coding model with strong agentic performance.",
    reasoning: {
      supported: true,
      mandatory: false,
      supportedEfforts: ["xhigh", "high", "medium", "low"],
      defaultEffort: "medium",
    },
  },
  {
    label: "Grok 4.5",
    value: "x-ai/grok-4.5",
    paid: true,
    featured: false,
    group: "paid",
    summary: "xAI frontier model for complex coding and app generation.",
    reasoning: {
      supported: true,
      mandatory: true,
      supportedEfforts: ["high", "medium", "low"],
      defaultEffort: "high",
    },
  },
  {
    label: "DeepSeek V4 Pro",
    value: "deepseek/deepseek-v4-pro",
    paid: true,
    featured: false,
    group: "paid",
    summary: "Low-cost long-context reasoning and software engineering model.",
    reasoning: {
      supported: true,
      mandatory: false,
      supportedEfforts: ["xhigh", "high"],
      defaultEffort: "high",
    },
  },
  {
    label: "GLM 5.2",
    value: "z-ai/glm-5.2",
    paid: true,
    featured: false,
    group: "paid",
    summary: "Open-weight long-horizon coding and automation model.",
    reasoning: {
      supported: true,
      mandatory: false,
      supportedEfforts: ["xhigh", "high"],
      defaultEffort: "high",
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
  {
    title: "Expense Tracker",
    description:
      "Make a personal expense tracker where I can log expenses with categories like food, transport, and entertainment. Show a monthly breakdown with interactive pie and bar charts, and a running total.",
  },
  {
    title: "Calculator",
    description:
      "Make a beautiful scientific calculator with a history panel that shows past calculations. Support basic arithmetic, percentages, parentheses, and common functions like square root and exponents. Style it with a modern glassmorphism design.",
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
