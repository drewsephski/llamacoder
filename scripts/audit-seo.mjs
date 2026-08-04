import { JSDOM } from "jsdom";

const auditBaseUrl = process.env.SEO_AUDIT_BASE_URL ?? "http://localhost:3017";
const canonicalBaseUrl =
  process.env.SEO_AUDIT_CANONICAL_URL ?? "https://www.squidagent.app";
const concurrency = 6;
const minMetaDescriptionLength = 110;
const minBodyWordCount = 50;

async function fetchPage(pathname) {
  const response = await fetch(`${auditBaseUrl}${pathname}`, {
    headers: { "user-agent": "Googlebot" },
    signal: AbortSignal.timeout(30_000),
  });
  const html = await response.text();
  const document = new JSDOM(html).window.document;
  const schemaTypes = [];
  const schemaValidationIssues = [];
  let invalidSchema = false;

  for (const script of document.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    try {
      const value = JSON.parse(script.textContent || "null");
      const items = Array.isArray(value)
        ? value
        : (value?.["@graph"] ?? [value]);
      for (const item of items) {
        const types = Array.isArray(item?.["@type"])
          ? item["@type"]
          : [item?.["@type"]];
        schemaTypes.push(...types.filter(Boolean));
        if (
          item &&
          typeof item === "object" &&
          types.includes("SoftwareApplication") &&
          "brand" in item
        ) {
          schemaValidationIssues.push(
            "SoftwareApplication contains unsupported brand property",
          );
        }
        if (
          item &&
          typeof item === "object" &&
          types.includes("Article") &&
          "reviewedBy" in item
        ) {
          schemaValidationIssues.push(
            "Article contains unsupported reviewedBy property",
          );
        }
      }
    } catch {
      invalidSchema = true;
    }
  }

  return {
    status: response.status,
    title: document.querySelector("title")?.textContent?.trim() ?? "",
    description:
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
        ?.trim() ?? "",
    canonical:
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
      "",
    robots:
      document.querySelector('meta[name="robots"]')?.getAttribute("content") ??
      "",
    h1Count: document.querySelectorAll("h1").length,
    headingLevels: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
      (heading) => Number(heading.tagName.slice(1)),
    ),
    schemaTypes,
    invalidSchema,
    schemaValidationIssues,
    links: [...document.querySelectorAll("a[href]")]
      .map((anchor) => anchor.getAttribute("href"))
      .filter(Boolean),
    bodyWordCount:
      document.body.textContent
        ?.replaceAll(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean).length ?? 0,
    imagesMissingAlt: [
      ...document.querySelectorAll('img:not([aria-hidden="true"])'),
    ].filter((image) => !image.getAttribute("alt")?.trim()).length,
    social: {
      ogTitle: document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content"),
      ogDescription: document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content"),
      ogImage: document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content"),
      ogUrl: document
        .querySelector('meta[property="og:url"]')
        ?.getAttribute("content"),
      ogType: document
        .querySelector('meta[property="og:type"]')
        ?.getAttribute("content"),
      twitterCard: document
        .querySelector('meta[name="twitter:card"]')
        ?.getAttribute("content"),
      twitterTitle: document
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute("content"),
      twitterDescription: document
        .querySelector('meta[name="twitter:description"]')
        ?.getAttribute("content"),
      twitterImage: document
        .querySelector('meta[name="twitter:image"]')
        ?.getAttribute("content"),
    },
  };
}

const sitemapResponse = await fetch(`${auditBaseUrl}/sitemap.xml`, {
  headers: { "user-agent": "Googlebot" },
  signal: AbortSignal.timeout(30_000),
});
const sitemapXml = await sitemapResponse.text();
const canonicalUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
const results = [];

for (let index = 0; index < canonicalUrls.length; index += concurrency) {
  const batch = canonicalUrls.slice(index, index + concurrency);
  results.push(
    ...(await Promise.all(
      batch.map(async (canonicalUrl) => {
        const pathname = new URL(canonicalUrl).pathname;
        try {
          return { canonicalUrl, pathname, ...(await fetchPage(pathname)) };
        } catch (error) {
          return { canonicalUrl, pathname, error: String(error) };
        }
      }),
    )),
  );
}

const issues = [];
const titles = new Map();
const descriptions = new Map();
const internalDestinations = new Set();
const incomingLinks = new Map(
  canonicalUrls.map((url) => [new URL(url).pathname, 0]),
);

for (const result of results) {
  if (result.error) {
    issues.push(`${result.pathname}: ${result.error}`);
    continue;
  }

  if (result.status !== 200) {
    issues.push(`${result.pathname}: returned HTTP ${result.status}`);
  }
  if (!result.title || result.title.length > 60) {
    issues.push(`${result.pathname}: title length is ${result.title.length}`);
  }
  if (
    result.description.length < minMetaDescriptionLength ||
    result.description.length > 160
  ) {
    issues.push(
      `${result.pathname}: description length is ${result.description.length}`,
    );
  }

  const expectedCanonical = `${canonicalBaseUrl}${
    result.pathname === "/" ? "" : result.pathname
  }`;
  if (result.canonical !== expectedCanonical) {
    issues.push(`${result.pathname}: canonical is ${result.canonical}`);
  }
  if (/noindex/i.test(result.robots)) {
    issues.push(`${result.pathname}: sitemap URL is noindex`);
  }
  if (result.h1Count !== 1) {
    issues.push(`${result.pathname}: has ${result.h1Count} h1 elements`);
  }
  if (
    result.headingLevels.some(
      (level, index) =>
        index > 0 && level > result.headingLevels[index - 1] + 1,
    )
  ) {
    issues.push(`${result.pathname}: heading hierarchy skips a level`);
  }
  if (result.invalidSchema) {
    issues.push(`${result.pathname}: contains invalid JSON-LD`);
  }
  for (const schemaIssue of result.schemaValidationIssues) {
    issues.push(`${result.pathname}: ${schemaIssue}`);
  }
  if (
    !result.schemaTypes.includes("Organization") ||
    !result.schemaTypes.includes("WebSite")
  ) {
    issues.push(`${result.pathname}: is missing sitewide entity schema`);
  }
  if (Object.values(result.social).some((value) => !value)) {
    issues.push(`${result.pathname}: has incomplete OG or Twitter metadata`);
  }
  if (result.bodyWordCount < minBodyWordCount) {
    issues.push(
      `${result.pathname}: rendered body has only ${result.bodyWordCount} words`,
    );
  }
  if (result.links.length === 0) {
    issues.push(`${result.pathname}: has no outgoing links`);
  }
  if (result.imagesMissingAlt > 0) {
    issues.push(
      `${result.pathname}: has ${result.imagesMissingAlt} non-decorative images without alt text`,
    );
  }

  if (titles.has(result.title)) {
    issues.push(
      `${result.pathname}: duplicates title from ${titles.get(result.title)}`,
    );
  } else {
    titles.set(result.title, result.pathname);
  }
  if (descriptions.has(result.description)) {
    issues.push(
      `${result.pathname}: duplicates description from ${descriptions.get(result.description)}`,
    );
  } else {
    descriptions.set(result.description, result.pathname);
  }

  for (const href of result.links) {
    try {
      const linkedUrl = new URL(href, canonicalBaseUrl);
      if (
        linkedUrl.origin === canonicalBaseUrl &&
        linkedUrl.pathname !== result.pathname &&
        incomingLinks.has(linkedUrl.pathname)
      ) {
        incomingLinks.set(
          linkedUrl.pathname,
          incomingLinks.get(linkedUrl.pathname) + 1,
        );
      }
      if (
        linkedUrl.origin === canonicalBaseUrl &&
        linkedUrl.pathname !== result.pathname
      ) {
        internalDestinations.add(`${linkedUrl.pathname}${linkedUrl.search}`);
      }
    } catch {
      // Ignore malformed third-party hrefs here; application linting owns them.
    }
  }
}

const redirectingDestinations = [];
const destinationPaths = [...internalDestinations];
for (let index = 0; index < destinationPaths.length; index += concurrency) {
  const batch = destinationPaths.slice(index, index + concurrency);
  redirectingDestinations.push(
    ...(await Promise.all(
      batch.map(async (destination) => {
        const response = await fetch(`${auditBaseUrl}${destination}`, {
          headers: { "user-agent": "Googlebot" },
          redirect: "manual",
          signal: AbortSignal.timeout(30_000),
        });
        return response.status >= 300 && response.status < 400
          ? { destination, status: response.status }
          : null;
      }),
    )),
  );
}

for (const redirect of redirectingDestinations.filter(Boolean)) {
  issues.push(
    `${redirect.destination}: internal link destination returns HTTP ${redirect.status}`,
  );
}

for (const [pathname, incomingCount] of incomingLinks) {
  if (pathname !== "/" && incomingCount === 0) {
    issues.push(`${pathname}: is orphaned from other sitemap pages`);
  }
}

const completedResults = results.filter((result) => !result.error);
console.log(
  JSON.stringify(
    {
      sitemapStatus: sitemapResponse.status,
      pages: results.length,
      uniqueTitles: titles.size,
      uniqueDescriptions: descriptions.size,
      maxTitleLength: Math.max(
        0,
        ...completedResults.map((result) => result.title.length),
      ),
      maxDescriptionLength: Math.max(
        0,
        ...completedResults.map((result) => result.description.length),
      ),
      issues: issues.length,
    },
    null,
    2,
  ),
);

if (issues.length > 0) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
}
