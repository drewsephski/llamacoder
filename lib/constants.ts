export const FREE_MODEL = "deepseek/deepseek-v4-flash";
export const LEGACY_FREE_MODEL = "tencent/hy3-preview:free";

type ModelOption = {
  label: string;
  value: string;
  paid?: boolean;
  free?: boolean;
  /**
   * Keeps slot rendering explicit when options expand in future.
   */
  group: "free" | "paid";
};

export const MODELS: ModelOption[] = [
  {
    label: "DeepSeek V4 Flash",
    value: FREE_MODEL,
    free: true,
    group: "free",
  },
  {
    label: "Gemini 3 Flash Preview",
    value: "google/gemini-3-flash-preview",
    paid: true,
    group: "paid",
  },
  {
    label: "Kimi K2.7 Code",
    value: "moonshotai/kimi-k2.7-code",
    paid: true,
    group: "paid",
  },
];

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
