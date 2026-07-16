import { echoChamber } from "@/features/gallery/showcase-games/echo-chamber";
import { orbitalSalvage } from "@/features/gallery/showcase-games/orbital-salvage";
import { runeCircuit } from "@/features/gallery/showcase-games/rune-circuit";
import type {
  ShowcaseGame,
  ShowcaseGameSummary,
} from "@/features/gallery/showcase-games/types";

export const showcaseGames: readonly ShowcaseGame[] = [
  orbitalSalvage,
  runeCircuit,
  echoChamber,
];

export function getShowcaseGame(slug: string) {
  return showcaseGames.find((game) => game.slug === slug) ?? null;
}

export function getShowcaseGameSummaries(query = "") {
  const normalizedQuery = query.trim().toLowerCase();

  return showcaseGames
    .filter((game) => {
      if (!normalizedQuery) return true;
      return [game.title, game.description, game.category].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    })
    .map<ShowcaseGameSummary>(
      ({ id, slug, title, description, category, accent, thumbnailUrl }) => ({
        id,
        slug,
        title,
        description,
        category,
        accent,
        thumbnailUrl,
      }),
    );
}
