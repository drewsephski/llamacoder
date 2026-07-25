import "server-only";

import {
  catalogToPastMediaLibrary,
  HARDCODED_PAST_MEDIA_CATALOG,
  type PastMediaCatalogEntry,
} from "@/features/generation/past-media-catalog";
import {
  selectPastMediaCatalogForPrompt,
  shouldAttachPastMediaCatalog,
  type PastMediaLibrary,
} from "@/features/generation/past-media-urls";

export function getHardcodedPastMediaCatalog(): readonly PastMediaCatalogEntry[] {
  return HARDCODED_PAST_MEDIA_CATALOG;
}

export function getHardcodedPastMediaLibrary(): PastMediaLibrary {
  return catalogToPastMediaLibrary(HARDCODED_PAST_MEDIA_CATALOG);
}

export async function resolvePastMediaCatalogForPrompt(options: {
  prompt: string;
}): Promise<readonly PastMediaCatalogEntry[] | null> {
  if (!shouldAttachPastMediaCatalog(options.prompt)) {
    return null;
  }

  const selectedCatalog = selectPastMediaCatalogForPrompt(
    options.prompt,
    getHardcodedPastMediaCatalog(),
  );
  if (selectedCatalog.length === 0) {
    return null;
  }

  return selectedCatalog;
}

/** @deprecated Prefer resolvePastMediaCatalogForPrompt(). */
export async function resolvePastMediaLibraryForPrompt(options: {
  prompt: string;
}): Promise<PastMediaLibrary | null> {
  const catalog = await resolvePastMediaCatalogForPrompt(options);
  if (!catalog) return null;
  return catalogToPastMediaLibrary(catalog);
}
