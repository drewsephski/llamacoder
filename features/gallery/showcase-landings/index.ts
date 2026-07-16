import { cinderStudio } from "@/features/gallery/showcase-landings/cinder-studio";
import { relay } from "@/features/gallery/showcase-landings/relay";
import { smallHours } from "@/features/gallery/showcase-landings/small-hours";
import type {
  ShowcaseLanding,
  ShowcaseLandingSummary,
} from "@/features/gallery/showcase-landings/types";

export const showcaseLandings: readonly ShowcaseLanding[] = [
  cinderStudio,
  relay,
  smallHours,
];

export function getShowcaseLanding(slug: string) {
  return showcaseLandings.find((landing) => landing.slug === slug) ?? null;
}

export function getShowcaseLandingSummaries(query = "") {
  const normalizedQuery = query.trim().toLowerCase();

  return showcaseLandings
    .filter((landing) => {
      if (!normalizedQuery) return true;
      return [landing.title, landing.description, landing.category].some(
        (value) => value.toLowerCase().includes(normalizedQuery),
      );
    })
    .map<ShowcaseLandingSummary>(
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
