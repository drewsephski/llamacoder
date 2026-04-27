export const FREE_MODEL = "openrouter/free";

export const MODELS = [
  {
    label: "Free",
    value: "openrouter/free",
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
    label: "Llama 4 Scout",
    value: "meta-llama/llama-4-scout",
    paid: true,
  },
  {
    label: "Llama 4 Maverick",
    value: "meta-llama/llama-4-maverick",
    paid: true,
  },
  {
    label: "GPT 4O Mini",
    value: "openai/gpt-4o-mini",
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
    title: "Workout Timer",
    description:
      "Make an interval workout timer for HIIT training. Let me configure work and rest durations, number of rounds, and exercises. Show a large countdown display with color changes for work vs rest, and play a sound when switching.",
  },
  {
    title: "Calculator",
    description:
      "Make a beautiful scientific calculator with a history panel that shows past calculations. Support basic arithmetic, percentages, parentheses, and common functions like square root and exponents. Style it with a modern glassmorphism design.",
  },
];
