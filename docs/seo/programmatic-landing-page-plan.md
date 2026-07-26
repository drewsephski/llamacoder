# Squid Agent organic search and programmatic landing-page plan

Updated: July 26, 2026

## Objective

Grow qualified, non-paid discovery for Squid Agent among people actively choosing an AI app builder or trying to build, verify, recover, and export a React application. The program must favor useful, source-grounded pages over large volumes of near-duplicate keyword pages.

## Research summary

Current search results and first-party competitor pages consistently organize demand around four intent groups:

1. Category: `AI app builder`, `AI React app builder`, `full-stack AI app builder`, and `no-code AI app builder`.
2. Deliverable and workflow: source-code export, screenshot or Figma to React, verification, version recovery, backend/database support, and deployment.
3. Alternative and comparison: Lovable, Bolt.new, v0, and Replit alternatives or head-to-head comparisons.
4. Job to be done: SaaS MVPs, internal tools, dashboards, CRMs, client portals, booking apps, marketplaces, portfolios, ecommerce, and landing pages.

The product's defensible angle is narrower than the generic “build anything instantly” claim: research and planning before generation, exportable React ownership, visible usage, runtime verification, repair, and recoverable checkpoints. Pages should lead with the searcher's job, then substantiate those differentiators with real product behavior.

Primary research references:

- [Replit AI app builder](https://replit.com/usecases/ai-app-builder)
- [Bolt.new AI app builder](https://bolt.new/use-cases/ai-app-builder)
- [Lovable for enterprises and internal tools](https://lovable.dev/enterprise-landing)
- [Lovable SaaS product guide](https://lovable.dev/guides/build-saas-product-without-coding)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

## Existing architecture to extend

`lib/marketing-pages.ts` is the single content registry for comparisons, guides, benchmarks, route metadata, structured data, internal links, and sitemap paths. Long-tail additions should extend that typed registry and the existing route templates instead of creating one-off page components.

`lib/public-pages.ts` owns metadata for complete public React examples. Example pages must stay linked from the homepage/gallery and should be framed as examples, not as unrelated companies.

Documentation remains under `/docs` on the primary domain. It should support product and workflow pages with implementation detail, while editorial pages should link back to the most relevant docs rather than duplicate them.

## Page families and rollout order

### Wave 1: strengthen proven high-intent pages

- `/compare/squid-vs-lovable`
- `/compare/squid-vs-bolt`
- `/compare/squid-vs-v0`
- `/blog/best-ai-builder-for-exportable-react-code`
- `/blog/screenshot-to-responsive-react`
- `/blog/ai-saas-mvp-builder`
- `/blog/ai-internal-tool-builder`
- `/blog/ai-dashboard-builder`

Add original evidence, product screenshots, reproducible prompts, real exported files, and direct links to the relevant docs. Refresh competitor claims only from current first-party documentation.

### Wave 2: audience pages

Create pages only where the workflow or acceptance criteria materially differ:

- AI app builder for startups and SaaS founders
- AI app builder for agencies
- AI app builder for product designers
- AI app builder for internal operations teams
- AI React app builder for developers who need source ownership

Each page needs a distinct problem definition, example build, acceptance checklist, relevant comparison, and a documented next step. Do not publish audience swaps that only change nouns.

### Wave 3: application-type pages

Candidate routes:

- `/use-cases/ai-admin-panel-builder`
- `/use-cases/ai-inventory-app-builder`
- `/use-cases/ai-customer-portal-builder`
- `/use-cases/ai-project-management-app-builder`
- `/use-cases/ai-ecommerce-app-builder`
- `/use-cases/ai-analytics-dashboard-builder`

Promote a candidate only when Squid has a working example or a reproducible generation/verification recipe for it. Every page must include the data model, states, permissions, responsive behavior, critical interactions, verification steps, and export handoff—not just a prompt.

### Wave 4: competitor-alternative expansion

Prioritize competitors that appear repeatedly in Search Console queries and that overlap with Squid's actual React workflow. Initial candidates are Replit, Base44, and other source-code-oriented AI builders. Every alternative page must:

- use current official sources;
- state where the competitor is the better fit;
- compare the same acceptance workflow;
- include `dateModified` and a visible review date;
- avoid unsupported pricing or capability claims;
- link to the main comparison hub and two adjacent comparisons.

## Required page contract

No generated page should ship unless it has:

- a unique title, description, canonical, H1, and search intent;
- substantial server-rendered content written for that intent;
- a real example, artifact, benchmark, or documented workflow;
- at least three contextual inbound links and three useful outbound internal links;
- breadcrumbs and matching `BreadcrumbList` data;
- applicable article, FAQ, or software structured data that exactly matches visible content;
- a unique social image title treatment;
- inclusion in one crawlable hub and the sitemap;
- an owner and review date;
- no indexable query-string or faceted duplicates.

If two candidates would answer the same query with substantially the same content, combine them into one stronger page and use sections or anchors for the variants.

## Internal-link model

Each page belongs to one primary cluster and may belong to one secondary cluster:

- Category hub → core product, docs, comparisons, and primary use cases.
- Comparison hub → competitor pages → evaluation/export/recovery guides.
- Guide hub → topic clusters → relevant docs and examples.
- Use-case hub → application pages → one working example and one comparison.
- Example/gallery pages → relevant use-case guide → builder CTA.

Automated tests should assert that every registered page belongs to a hub, has a unique canonical/title/description, and has at least the required internal links.

## Indexing and quality policy

- Index public marketing, documentation, legal/support, curated examples, the gallery collection, and editorially approved gallery showcases.
- Keep unreviewed user-generated gallery projects publicly shareable but `noindex`; promote a project only after its title, description, visible content, provenance, and internal links pass the public page contract.
- Keep authentication, dashboards, chats, checkout completion, isolated previews, internal QA, site-search results, and legacy share URLs out of the sitemap and marked `noindex`.
- Canonicalize filtered gallery/search URLs to the clean collection URL where they are crawlable.
- Add or remove editorially approved gallery projects through the curated registry so the sitemap updates with the next deployment/revalidation.
- Never use robots blocking as the only removal mechanism for a URL already indexed; allow recrawl long enough for `noindex` to be observed.

## Measurement and release gates

Before publishing a wave:

1. Run metadata/schema/heading regression tests and a production build.
2. Crawl all sitemap URLs and verify 200 status, self-canonical, one H1, unique title/description, OG/Twitter tags, and no accidental `noindex`.
3. Run mobile and desktop Lighthouse against the production build.
4. Validate representative structured data with Schema.org and Google's Rich Results Test where supported.
5. Inspect the rendered HTML with JavaScript disabled for the page's primary content and links.

After deployment, record Google Search Console impressions, clicks, CTR, average position, discovered/indexed URLs, and query/page pairs at 7, 28, and 90 days. Promote or consolidate pages based on qualified impressions and conversions, not URL count. A sitemap submission or successful crawl is not evidence of ranking improvement.

## Current Lighthouse comparison

Local production build, homepage, same machine and Lighthouse version. The mobile “after” result is the median of three runs because CPU-throttled Total Blocking Time varied materially; the original baseline was a single run.

| Profile | Phase  | Performance | Accessibility | Best practices | SEO |  FCP |  LCP |   TBT |   CLS | Transfer |
| ------- | ------ | ----------: | ------------: | -------------: | --: | ---: | ---: | ----: | ----: | -------: |
| Mobile  | Before |          55 |            94 |             92 | 100 | 4.6s | 9.3s | 313ms |     0 | 1,562KiB |
| Mobile  | After  |          48 |           100 |            100 | 100 | 3.4s | 5.8s | 940ms |     0 | 1,152KiB |
| Desktop | Before |          85 |            90 |             92 | 100 | 0.9s | 2.5s |  36ms | 0.004 | 1,912KiB |
| Desktop | After  |          88 |           100 |            100 | 100 | 0.8s | 1.5s |  60ms | 0.001 | 1,424KiB |

The implementation reduced homepage transfer size by about 26% on both profiles, eliminated measured layout shift on mobile, and improved paint timing. The composite mobile performance score did not improve because synthetic Total Blocking Time increased and remained highly variable across runs; treat homepage hydration splitting as an explicit follow-up rather than claiming a green Core Web Vitals result. Production field data from Search Console should decide its priority and provide the real-user baseline.
