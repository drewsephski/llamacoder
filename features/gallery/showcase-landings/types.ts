export type ShowcaseLanding = {
  id: string;
  slug: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  accent: string;
  thumbnailUrl: string;
  highlights: readonly string[];
  files: Array<{ path: string; content: string }>;
};

export type ShowcaseLandingSummary = Omit<
  ShowcaseLanding,
  "prompt" | "highlights" | "files"
>;
