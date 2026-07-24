import dedent from "dedent";

import type { PastMediaCatalogEntry } from "@/features/generation/past-media-catalog";

export interface PastMediaLibrary {
  images: string[];
  videos: string[];
}

export type { PastMediaCatalogEntry };

const MAX_IMAGES = 60;
const MAX_VIDEOS = 30;

const URL_PATTERN = /https?:\/\/[^\s"'<>)\]]+/gi;

const IMAGE_EXTENSION =
  /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(\?[^\s"'<>)\]]*)?$/i;
const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v|ogv|ogg)(\?[^\s"'<>)\]]*)?$/i;

const DESIGN_DIRECTION_PATTERN =
  /\b(video|background|hero|visual|design|palette|color|colour|theme|aesthetic|gradient|shader|animation|brand|logo|typography|font|dark mode|light mode|minimal|brutalist|editorial|luxury|portfolio|landing page|image|photo|screenshot|wallpaper|texture|motion|cinematic|atmospheric|vibe|look and feel|ui style)\b/i;

function normalizeMediaUrl(rawUrl: string) {
  return rawUrl.replace(/[),.;]+$/, "").trim();
}

function isReusableMediaUrl(url: string) {
  if (!url.startsWith("http")) return false;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url)) return false;
  return true;
}

function classifyMediaUrl(url: string): "image" | "video" | null {
  if (VIDEO_EXTENSION.test(url) || /[?&]format=(mp4|webm)/i.test(url)) {
    return "video";
  }
  if (IMAGE_EXTENSION.test(url)) {
    return "image";
  }
  return null;
}

export function extractMediaUrls(text: string): PastMediaLibrary {
  const images = new Set<string>();
  const videos = new Set<string>();

  for (const match of text.matchAll(URL_PATTERN)) {
    const url = normalizeMediaUrl(match[0]);
    if (!isReusableMediaUrl(url)) continue;

    const kind = classifyMediaUrl(url);
    if (kind === "image") images.add(url);
    if (kind === "video") videos.add(url);
  }

  return {
    images: [...images],
    videos: [...videos],
  };
}

export function mergePastMediaLibraries(
  libraries: PastMediaLibrary[],
): PastMediaLibrary {
  const images = new Set<string>();
  const videos = new Set<string>();

  for (const library of libraries) {
    for (const url of library.images) images.add(url);
    for (const url of library.videos) videos.add(url);
  }

  return {
    images: [...images].slice(0, MAX_IMAGES),
    videos: [...videos].slice(0, MAX_VIDEOS),
  };
}

export function isDesignBriefUnderspecified(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return true;
  if (DESIGN_DIRECTION_PATTERN.test(trimmed)) return false;

  const currentMedia = extractMediaUrls(trimmed);
  return currentMedia.images.length === 0 && currentMedia.videos.length === 0;
}

const PROMPT_STOP_WORDS = new Set([
  "about",
  "also",
  "app",
  "application",
  "build",
  "create",
  "for",
  "from",
  "make",
  "page",
  "that",
  "the",
  "this",
  "tool",
  "using",
  "with",
  "your",
]);

const PROMPT_SYNONYMS: Record<string, readonly string[]> = {
  aviation: ["jet", "jets", "flight", "flights", "airline", "aircraft"],
  travel: ["trip", "trips", "concierge", "itinerary"],
  membership: ["member", "members", "subscribe", "subscription"],
  writing: ["writer", "writers", "essay", "essays", "newsletter"],
  film: ["filmmaker", "filmmakers", "movie", "movies", "cinema"],
  automation: ["automate", "automated", "agent", "agents", "workflow"],
  wellness: ["coaching", "coach", "mindset", "habit", "habits"],
  course: ["certificate", "certificates", "training", "bootcamp", "learn"],
};

function tokenizePrompt(text: string) {
  return (text.toLowerCase().match(/\b[a-z0-9]{3,}\b/g) ?? []).filter(
    (token) => !PROMPT_STOP_WORDS.has(token),
  );
}

function promptMentionsToken(promptLower: string, token: string) {
  if (promptLower.includes(token)) return true;

  for (const synonym of PROMPT_SYNONYMS[token] ?? []) {
    if (promptLower.includes(synonym)) return true;
  }

  return false;
}

export function scorePastMediaCatalogEntry(
  prompt: string,
  entry: PastMediaCatalogEntry,
) {
  const promptLower = prompt.toLowerCase();
  const promptTokens = new Set(tokenizePrompt(prompt));
  let score = 0;

  for (const tag of entry.tags) {
    const normalizedTag = tag.toLowerCase();
    if (promptTokens.has(normalizedTag)) score += 4;
    if (promptMentionsToken(promptLower, normalizedTag)) score += 3;
  }

  for (const token of tokenizePrompt(
    `${entry.useWhen} ${entry.description} ${entry.mood}`,
  )) {
    if (promptTokens.has(token)) score += 1;
  }

  if (entry.kind === "video" && /hero/.test(entry.id)) {
    score += 1;
  }

  return score;
}

export function selectPastMediaCatalogForPrompt(
  prompt: string,
  catalog: readonly PastMediaCatalogEntry[],
) {
  if (catalog.length === 0) return [];

  const ranked = [...catalog]
    .map((entry) => ({
      entry,
      score: scorePastMediaCatalogEntry(prompt, entry),
    }))
    .sort(
      (left, right) =>
        right.score - left.score || left.entry.id.localeCompare(right.entry.id),
    );

  const selected: PastMediaCatalogEntry[] = [];
  const primaryVideo = ranked.find((item) => item.entry.kind === "video");
  if (primaryVideo) {
    selected.push(primaryVideo.entry);
  }

  for (const item of ranked) {
    if (item.entry.kind !== "image") continue;
    if (selected.some((entry) => entry.id === item.entry.id)) continue;
    if (item.score <= 0 && selected.length >= 1) continue;
    selected.push(item.entry);
    if (selected.length >= 3) break;
  }

  return selected.slice(0, 3);
}

function formatCatalogEntry(entry: PastMediaCatalogEntry) {
  return [
    `- ${entry.id} (${entry.kind})`,
    `  Description: ${entry.description}`,
    `  Mood: ${entry.mood}`,
    `  Tags: ${entry.tags.join(", ")}`,
    `  Use when: ${entry.useWhen}`,
    `  How to use: ${entry.howToUse}`,
    `  URL: ${entry.url}`,
  ].join("\n");
}

export function buildPastMediaCatalogPromptSection(
  catalog: readonly PastMediaCatalogEntry[] | null | undefined,
) {
  if (!catalog || catalog.length === 0) return "";

  const videos = catalog.filter((entry) => entry.kind === "video");
  const images = catalog.filter((entry) => entry.kind === "image");

  const videoLines =
    videos.length > 0
      ? videos.map(formatCatalogEntry).join("\n\n")
      : "- (none)";
  const imageLines =
    images.length > 0
      ? images.map(formatCatalogEntry).join("\n\n")
      : "- (none)";

  const primaryVideo = videos[0];
  const primaryVideoRule = primaryVideo
    ? dedent`
      REQUIRED PRIMARY VIDEO:
      - You MUST embed \`${primaryVideo.url}\` in a real \`<video autoPlay loop muted playsInline>\` element in the first viewport.
      - Reference it by catalog id \`${primaryVideo.id}\` in a code comment above the video element.
      - Do NOT substitute shaders, gradients, placeholder divs, or stock imagery for this primary video.
      - Architect/plan styling notes do NOT override this requirement — the user's original brief lacked media direction.
    `
    : "";

  return dedent`
    ## Past media catalog (ACTIVE — mandatory for this build)

    The user's original brief did not specify hero media. These ranked matches
    were selected from Squid's curated showcase library. Use them even if the
    implementation plan adds separate design direction.

    ${primaryVideoRule}

    ### Videos
    ${videoLines}

    ### Images
    ${imageLines}

    Rules:
    - Treat the first listed video as the primary hero/background asset unless the app is a pure dashboard with no top-of-page media surface.
    - Optional images may support feature cards or empty states — never replace the required primary video with placeholders.
    - Use exact catalog URLs in \`src\` attributes. No localhost, no invented CDN links, no dashed placeholder boxes for catalog assets.
    - Pick supporting images only when their tags match the subject; ignore unrelated decorative assets.
  `;
}

export function buildPastMediaPromptSection(
  library: PastMediaLibrary | null | undefined,
) {
  if (!library) return "";
  if (library.images.length === 0 && library.videos.length === 0) return "";

  const videoLines =
    library.videos.length > 0
      ? library.videos.map((url) => `- ${url}`).join("\n")
      : "- (none collected yet)";
  const imageLines =
    library.images.length > 0
      ? library.images.map((url) => `- ${url}`).join("\n")
      : "- (none collected yet)";

  return dedent`
    ## Past media library (reuse when the brief lacks visual direction)

    Videos:
    ${videoLines}

    Images:
    ${imageLines}
  `;
}
