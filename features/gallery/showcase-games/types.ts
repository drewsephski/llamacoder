export type ShowcaseGame = {
  id: string;
  slug: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  accent: string;
  controls: readonly string[];
  files: Array<{ path: string; content: string }>;
};

export type ShowcaseGameSummary = Omit<
  ShowcaseGame,
  "prompt" | "controls" | "files"
>;
