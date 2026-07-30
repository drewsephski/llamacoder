import dedent from "dedent";

import type { PastMediaCatalogEntry } from "@/features/generation/past-media-catalog";
import {
  hasCompleteAestheticDirection,
  hashBriefSeed,
} from "@/features/generation/style-packs";

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

/** @deprecated Use shouldAttachPastMediaCatalog — kept for test compatibility. */
export function isDesignBriefUnderspecified(prompt: string) {
  return shouldAttachPastMediaCatalog(prompt);
}

/**
 * Attach the CloudFront media catalog unless the user already supplied media URLs.
 * Visual keywords in the brief (landing page, minimal, dark mode, etc.) no longer
 * suppress the catalog — those briefs were falling back to generic yellow/black slop
 * instead of using curated showcase assets.
 */
export function shouldAttachPastMediaCatalog(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return true;

  const currentMedia = extractMediaUrls(trimmed);
  return currentMedia.images.length === 0 && currentMedia.videos.length === 0;
}

export function promptHasOwnMediaUrls(prompt: string) {
  const currentMedia = extractMediaUrls(prompt.trim());
  return currentMedia.images.length > 0 || currentMedia.videos.length > 0;
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
    selected.push(item.entry);
    if (selected.length >= 3) break;
  }

  // Always include at least one supporting image when the catalog has any.
  if (!selected.some((entry) => entry.kind === "image")) {
    const fallbackImage = ranked.find((item) => item.entry.kind === "image");
    if (fallbackImage) selected.push(fallbackImage.entry);
  }

  return selected.slice(0, 4);
}

export type VisualSignatureMode =
  | "catalogVideo"
  | "meshGradient"
  | "noisePattern"
  | "userSpecified";

/**
 * Pick exactly one hero signature treatment for this build.
 * Video, mesh gradient, and noise pattern share equal weight (~⅓ each)
 * when a catalog video exists; otherwise mesh vs noise split 50/50.
 * User-supplied media or explicit aesthetic direction always wins.
 */
export function selectVisualSignatureMode(
  brief: string,
  options?: { hasCatalogVideo?: boolean },
): VisualSignatureMode {
  const trimmed = brief.trim();

  if (
    promptHasOwnMediaUrls(trimmed) ||
    hasCompleteAestheticDirection(trimmed)
  ) {
    return "userSpecified";
  }

  const seed = hashBriefSeed(trimmed);
  const modes: VisualSignatureMode[] = options?.hasCatalogVideo
    ? ["catalogVideo", "meshGradient", "noisePattern"]
    : ["meshGradient", "noisePattern"];

  return modes[seed % modes.length] ?? "meshGradient";
}

const SIGNATURE_MODE_LABELS: Record<VisualSignatureMode, string> = {
  catalogVideo: "Catalog video (CloudFront)",
  meshGradient: "Mesh gradient shader",
  noisePattern: "Noisy pattern background",
  userSpecified: "User-specified design",
};

function buildCatalogVideoInstructions(
  primaryVideo: PastMediaCatalogEntry,
  images: PastMediaCatalogEntry[],
) {
  const imageHints =
    images.length > 0
      ? images
          .slice(0, 2)
          .map(
            (img) =>
              `- Optional supporting image \`${img.id}\`: \`${img.url}\` — ${img.howToUse}`,
          )
          .join("\n")
      : "";

  return dedent`
    ### Implement: catalog video
    - Embed \`${primaryVideo.url}\` in \`<video autoPlay loop muted playsInline />\` per: ${primaryVideo.howToUse}
    - Comment \`{/* visual-signature: ${primaryVideo.id} */}\` above the element.
    - Preserve the video's original color and contrast. Do not dim, tint, desaturate, or recolor the whole frame merely to force it into the page theme.
    - Derive typography and accent from the video's dominant color family, not a small incidental highlight. If the catalog metadata does not name a palette and you cannot inspect a frame, use neutral white/black controls instead of inventing a saturated accent.
    - For text legibility, try placement in clean negative space first, then a localized edge gradient or compact solid/translucent text panel. Use the weakest treatment that passes contrast. A uniform full-frame scrim is a last resort and requires a clear readability need.
    - Do NOT also add MeshGradient, DotOrbit, or a noise overlay as the hero signature.
    ${imageHints}
  `;
}

function buildMeshGradientInstructions() {
  return dedent`
    ### Implement: mesh gradient
    - Import one verified shader from \`@paper-design/shaders-react\` (for example \`MeshGradient\`, \`DotOrbit\`, \`NeuroNoise\`, \`Metaballs\`, \`Warp\`, \`Swirl\`, or \`Water\`) and keep it subordinate to readable content.
    - Use as the hero/first-viewport signature: full-bleed behind content with explicit width/height via style props and a tasteful \`colors\` array matched to the subject (not generic AI purple).
    - Layer readable content above with an intentional scrim or solid panel — never illegible text on raw shader.
    - Do NOT also embed a catalog video or noise layer as the hero signature for this build.
  `;
}

function buildNoisePatternInstructions() {
  return dedent`
    ### Implement: noisy pattern background
    - Use a fixed, \`pointer-events-none\` grain/noise layer on the hero or canvas — CSS \`background-image\` with an SVG feTurbulence data-URI, or a subtle repeating noise texture at low opacity (≈3–8%).
    - Pair with solid typography and one restrained accent; the texture adds tactility, not chaos.
    - Keep contrast readable; noise must not replace foreground hierarchy.
    - Do NOT also embed a catalog video or MeshGradient as the hero signature for this build.
  `;
}

function buildUserSpecifiedInstructions() {
  return dedent`
    ### Implement: user-specified design
    - Follow the user's stated palette, aesthetic, media URLs, and references — do not override with catalog video or default shaders.
    - Still avoid generic yellow/black CTA combos and placeholder dashed boxes when real assets were named.
  `;
}

/**
 * Directive: exactly ONE visual signature for the hero/first viewport.
 * Replaces the old media-first mandatory-video approach.
 */
export function buildVisualSignatureDirective(
  brief: string,
  catalog: readonly PastMediaCatalogEntry[] | null | undefined,
  mode: VisualSignatureMode,
) {
  const primaryVideo = catalog?.find((entry) => entry.kind === "video");
  const images = catalog?.filter((entry) => entry.kind === "image") ?? [];

  let implementation = buildUserSpecifiedInstructions();
  if (mode === "catalogVideo" && primaryVideo) {
    implementation = buildCatalogVideoInstructions(primaryVideo, images);
  } else if (mode === "meshGradient") {
    implementation = buildMeshGradientInstructions();
  } else if (mode === "noisePattern") {
    implementation = buildNoisePatternInstructions();
  } else if (mode === "catalogVideo" && !primaryVideo) {
    implementation = buildMeshGradientInstructions();
  }

  return dedent`
    ## Visual signature

    Recommended treatment: **${SIGNATURE_MODE_LABELS[mode]}** (\`${mode}\`).
    Apply it only to a marketing/showcase surface where it strengthens the
    subject. A product surface, focused utility, or strong typographic opening
    may skip cinematic treatment entirely.

    ${implementation}

    - **One signature only:** never stack video, shader, and noise.
    - **Media fidelity:** preserve source color; use placement or a localized,
      minimal scrim for contrast instead of blanket tinting.
    - Couple CTAs to the dominant media palette. If unknown, use a neutral,
      high-contrast pair rather than guessing a saturated accent.
    - Supporting catalog images are optional. Never invent fake proof or use a
      dashed placeholder when a relevant real asset is available.

  `;
}

/** @deprecated Use buildVisualSignatureDirective */
export function buildMediaFirstDesignDirective(
  catalog: readonly PastMediaCatalogEntry[],
) {
  return buildVisualSignatureDirective("", catalog, "catalogVideo");
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

  return dedent`
    ## Past media catalog (CloudFront — optional reference)

    Ranked showcase assets when the locked visual signature is \`catalogVideo\`,
    or when a section genuinely needs a real image/video. Not mandatory every build.

    If you use a catalog asset, preserve its native color balance. Do not apply a blanket tint, opacity reduction, or full-frame dark overlay as decoration. Solve text contrast with placement first, then a localized gradient or compact text panel. Match accents to the dominant media family; when the palette is unknown, keep controls neutral rather than inventing a warm or neon accent.

    ### Videos
    ${videoLines}

    ### Images
    ${imageLines}

    Use exact catalog URLs in \`src\` when embedding — no localhost, no invented links, no dashed placeholders.
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
