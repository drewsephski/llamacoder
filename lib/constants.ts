export const FREE_MODEL = "tencent/hy3-preview:free";

export const MODELS = [
  {
    label: "Free",
    value: "tencent/hy3-preview:free",
    free: true,
  },
  {
    label: "DeepSeek V4 Flash",
    value: "deepseek/deepseek-v4-flash",
    paid: true,
  },
  {
    label: "DeepSeek V4 Pro",
    value: "deepseek/deepseek-v4-pro",
    paid: true,
  },
  {
    label: "GPT 5.4",
    value: "openai/gpt-5.4",
    paid: true,
  },
  {
    label: "Claude Sonnet 4.5",
    value: "anthropic/claude-sonnet-4.5",
    paid: true,
  },
  {
    label: "Claude Opus 4.6",
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
