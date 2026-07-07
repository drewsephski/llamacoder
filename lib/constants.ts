export const FREE_MODEL = "tencent/hy3-preview:free";

export const MODELS = [
  {
    label: "Starter",
    value: "tencent/hy3-preview:free",
    free: true,
  },
  {
    label: "Fast Builder",
    value: "deepseek/deepseek-v4-flash",
    paid: true,
  },
  {
    label: "Pro Builder",
    value: "deepseek/deepseek-v4-pro",
    paid: true,
  },
  {
    label: "Advanced Reasoning",
    value: "openai/gpt-5.4",
    paid: true,
  },
  {
    label: "Creative Builder",
    value: "anthropic/claude-sonnet-4.5",
    paid: true,
  },
  {
    label: "Expert Builder",
    value: "anthropic/claude-opus-4.6",
    paid: true,
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
