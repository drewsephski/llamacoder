export type ShowcaseGame = {
  id: string;
  slug: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  accent: string;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  controls: readonly string[];
  files: Array<{ path: string; content: string }>;
};

export type ShowcaseGameSummary = Omit<
  ShowcaseGame,
  "prompt" | "controls" | "files"
>;
