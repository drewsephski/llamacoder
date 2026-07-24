export type PromptTemplateFieldType = "text" | "url";

export type PromptTemplateField = {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: PromptTemplateFieldType;
  hint?: string;
};

export type PromptTemplate = {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  enablesWebResearch: boolean;
  fields: PromptTemplateField[];
  body: string;
};

export type PromptTemplateValues = Record<string, string>;

export const PORTFOLIO_PROMPT_TEMPLATE: PromptTemplate = {
  id: "portfolio",
  title: "Personal Portfolio",
  shortLabel: "Portfolio",
  description:
    "Research a real person online, read their existing site, then generate an editorial portfolio with their actual projects and bio.",
  enablesWebResearch: true,
  fields: [
    {
      id: "fullName",
      label: "Full name",
      placeholder: "Jane Doe",
      required: true,
      hint: "Used for web research and the site hero",
    },
    {
      id: "role",
      label: "Role or title",
      placeholder: "Product Designer",
      required: true,
    },
    {
      id: "portfolioUrl",
      label: "Current portfolio URL",
      placeholder: "https://janedoe.com",
      type: "url",
      hint: "We scrape this page for projects, bio, and links",
    },
    {
      id: "linkedinUrl",
      label: "LinkedIn profile",
      placeholder: "https://linkedin.com/in/janedoe",
      type: "url",
    },
    {
      id: "style",
      label: "Visual direction",
      placeholder: "Editorial, dark, kinetic type, recruiter-ready",
    },
  ],
  body: `Build a distinctive personal portfolio website for {fullName}, a {role}.

Before generating any UI, research their professional background on the web and read their existing portfolio at {portfolioUrl} using fetch_url. Also review their LinkedIn profile at {linkedinUrl} when available. Use their real projects, bio, skills, employers, and experience. Do not invent placeholder names, companies, or case studies.

Visual direction: {style}. Make it editorial and memorable for hiring managers, not a generic AI template. Include selected work, about, contact, and clear project detail sections grounded in the scraped content.`,
};

export const COMPANY_LANDING_PROMPT_TEMPLATE: PromptTemplate = {
  id: "company-landing",
  title: "Company Landing Page",
  shortLabel: "Company",
  description:
    "Research a real company and product site, then generate a marketing landing page grounded in their actual positioning and features.",
  enablesWebResearch: true,
  fields: [
    {
      id: "companyName",
      label: "Company name",
      placeholder: "Acme",
      required: true,
      hint: "Used for web research and brand voice",
    },
    {
      id: "productName",
      label: "Product name",
      placeholder: "Acme Cloud",
      required: true,
    },
    {
      id: "productUrl",
      label: "Product or company URL",
      placeholder: "https://acme.com",
      type: "url",
      hint: "We scrape this page for features, copy, and proof points",
    },
    {
      id: "audience",
      label: "Target audience",
      placeholder: "Startup CTOs evaluating infrastructure",
    },
    {
      id: "cta",
      label: "Primary CTA",
      placeholder: "Start free trial",
    },
    {
      id: "competitorUrls",
      label: "Competitor URLs",
      placeholder: "https://competitor.com",
      type: "url",
      hint: "Optional competitor page for positioning contrast",
    },
    {
      id: "style",
      label: "Visual direction",
      placeholder: "Crisp SaaS, charcoal, cyan accent, restrained motion",
    },
  ],
  body: `Build a product landing page for {companyName}'s {productName}.

Before generating any UI, research {companyName} on the web and read their product site at {productUrl} using fetch_url. Also review competitor pages at {competitorUrls} when available. Use their real product positioning, features, pricing cues, and proof points. Do not invent customers, metrics, awards, or capabilities.

Target audience: {audience}. Primary CTA: {cta}.
Visual direction: {style}. Make a distinctive marketing site with hero, product story, feature sections, social proof when verified, and a clear CTA — grounded in researched facts, not generic AI filler.`,
};

export const LIVE_API_DASHBOARD_PROMPT_TEMPLATE: PromptTemplate = {
  id: "live-api-dashboard",
  title: "Live API Dashboard",
  shortLabel: "Live API",
  description:
    "Read official API docs, verify the contract, then generate a dashboard that fetches real live data with honest loading and error states.",
  enablesWebResearch: true,
  fields: [
    {
      id: "appName",
      label: "App name",
      placeholder: "Orbit Monitor",
      required: true,
      hint: "Shown in the dashboard chrome",
    },
    {
      id: "docsUrl",
      label: "API docs URL",
      placeholder: "https://docs.example.com/api",
      type: "url",
      required: true,
      hint: "We fetch official docs for endpoints and auth",
    },
    {
      id: "dataFocus",
      label: "Data to display",
      placeholder: "current weather forecasts by city",
      required: true,
    },
    {
      id: "apiBaseUrl",
      label: "API base URL",
      placeholder: "https://api.example.com",
      type: "url",
    },
    {
      id: "authNote",
      label: "Auth notes",
      placeholder: "publishable key via VITE_API_KEY",
    },
    {
      id: "style",
      label: "Visual direction",
      placeholder: "Dense ops dashboard, monospace metrics, calm status colors",
    },
  ],
  body: `Build a live data dashboard called {appName} that displays {dataFocus} from a public API.

Before generating any UI, research the official API documentation on the web and read the docs at {docsUrl} using fetch_url. Confirm the base URL at {apiBaseUrl} when available. Auth notes: {authNote}. Verify endpoints, response shape, browser CORS support, rate limits, and unit semantics. Do not invent endpoints, mock live data, or hard-code sample responses as success.

Visual direction: {style}. Wire native fetch through a typed client with loading, empty, setup-required, and actionable error states. Include integrations.ts metadata for the verified API.`,
};

export const LOCAL_BUSINESS_PROMPT_TEMPLATE: PromptTemplate = {
  id: "local-business",
  title: "Local Business Site",
  shortLabel: "Local biz",
  description:
    "Research a real restaurant or local business online, then generate a site with verified hours, services, and location details.",
  enablesWebResearch: true,
  fields: [
    {
      id: "businessName",
      label: "Business name",
      placeholder: "Rivera Kitchen",
      required: true,
      hint: "Used for web research and the site hero",
    },
    {
      id: "city",
      label: "City",
      placeholder: "Austin, TX",
      required: true,
    },
    {
      id: "businessType",
      label: "Business type",
      placeholder: "neighborhood Mexican restaurant",
      required: true,
    },
    {
      id: "websiteUrl",
      label: "Current website URL",
      placeholder: "https://riverakitchen.com",
      type: "url",
      hint: "We scrape this page for menu, hours, and about copy",
    },
    {
      id: "listingUrl",
      label: "Maps or listing URL",
      placeholder: "https://maps.google.com/?cid=...",
      type: "url",
      hint: "Google Maps, Yelp, or similar listing page",
    },
    {
      id: "style",
      label: "Visual direction",
      placeholder: "Warm local hospitality, photo-led, easy mobile menus",
    },
  ],
  body: `Build a website for {businessName}, a {businessType} in {city}.

Before generating any UI, research {businessName} on the web and read their existing site at {websiteUrl} using fetch_url. Also review their listing page at {listingUrl} when available. Use real hours, menu or services, location details, and reviews when found. Do not invent awards, prices, phone numbers, or testimonials.

Visual direction: {style}. Make it welcoming and local with hero, about, menu or services, visit/hours, and contact sections grounded in scraped content.`,
};

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  PORTFOLIO_PROMPT_TEMPLATE,
  COMPANY_LANDING_PROMPT_TEMPLATE,
  LIVE_API_DASHBOARD_PROMPT_TEMPLATE,
  LOCAL_BUSINESS_PROMPT_TEMPLATE,
];

export function getPromptTemplate(id: string) {
  return PROMPT_TEMPLATES.find((template) => template.id === id) ?? null;
}

const PLACEHOLDER_PATTERN = /\{([a-zA-Z0-9_]+)\}/g;

export type PromptTemplateSegment =
  | { kind: "text"; value: string }
  | { kind: "field"; fieldId: string };

export function parsePromptTemplateBody(body: string): PromptTemplateSegment[] {
  const segments: PromptTemplateSegment[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(PLACEHOLDER_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({
        kind: "text",
        value: body.slice(lastIndex, index),
      });
    }
    segments.push({ kind: "field", fieldId: match[1] ?? "" });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < body.length) {
    segments.push({ kind: "text", value: body.slice(lastIndex) });
  }

  return segments;
}

function stripOptionalSentence(
  value: string,
  fieldId: string,
  fieldValue: string,
) {
  if (fieldValue.trim()) return value;

  const patterns: Record<string, RegExp[]> = {
    portfolioUrl: [
      /\s*and read their existing portfolio at \{portfolioUrl\} using fetch_url\.?/gi,
      /\s*at \{portfolioUrl\} using fetch_url\.?/gi,
    ],
    linkedinUrl: [
      /\s*Also review their LinkedIn profile at \{linkedinUrl\} when available\.?/gi,
      /\s*LinkedIn profile for additional context: \{linkedinUrl\}\.?/gi,
    ],
    productUrl: [
      /\s*and read their product site at \{productUrl\} using fetch_url\.?/gi,
      /\s*at \{productUrl\} using fetch_url\.?/gi,
    ],
    competitorUrls: [
      /\s*Also review competitor pages at \{competitorUrls\} when available\.?/gi,
    ],
    audience: [/\s*Target audience: \{audience\}\.?/gi],
    cta: [/\s*Primary CTA: \{cta\}\.?/gi],
    apiBaseUrl: [
      /\s*Confirm the base URL at \{apiBaseUrl\} when available\.?/gi,
    ],
    authNote: [/\s*Auth notes: \{authNote\}\.?/gi],
    websiteUrl: [
      /\s*and read their existing site at \{websiteUrl\} using fetch_url\.?/gi,
      /\s*at \{websiteUrl\} using fetch_url\.?/gi,
    ],
    listingUrl: [
      /\s*Also review their listing page at \{listingUrl\} when available\.?/gi,
    ],
    style: [/\s*Visual direction: \{style\}\.[^\n]*/gi, /\s*\{style\}\.?/g],
  };

  return (patterns[fieldId] ?? []).reduce(
    (current, pattern) => current.replace(pattern, ""),
    value,
  );
}

export function createEmptyTemplateValues(
  template: PromptTemplate,
): PromptTemplateValues {
  return Object.fromEntries(template.fields.map((field) => [field.id, ""]));
}

export function compilePromptTemplate(
  template: PromptTemplate,
  values: PromptTemplateValues,
): string {
  let compiled = template.body;

  for (const field of template.fields) {
    const token = `{${field.id}}`;
    const value = values[field.id]?.trim() ?? "";
    if (value) {
      compiled = compiled.split(token).join(value);
      continue;
    }
    compiled = stripOptionalSentence(compiled, field.id, value);
    compiled = compiled.split(token).join("");
  }

  return compiled
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export function getMissingRequiredTemplateFields(
  template: PromptTemplate,
  values: PromptTemplateValues,
) {
  return template.fields.filter(
    (field) => field.required && !(values[field.id]?.trim() ?? ""),
  );
}

export function isPromptTemplateReady(
  template: PromptTemplate,
  values: PromptTemplateValues,
) {
  return getMissingRequiredTemplateFields(template, values).length === 0;
}
