# Public API Catalog Candidate Comparison

Research date: July 14, 2026  
Implementation status: All ten candidates were added to the reviewed catalog on July 14, 2026; higher-risk providers remain conditional and carry provider-specific generation constraints.  
Use case: Expand Squid Agent's reviewed API catalog with useful, browser-safe public data providers that generated React apps can use without pretending to know an API contract.  
Budget: Prefer free, no-key APIs for the first batch.  
Current catalog baseline: REST Countries, Frankfurter, Hacker News, Octagon, National Weather Service, Open-Meteo, GitHub, CoinGecko, Supabase, Stripe, Resend, Vercel, and blocked public Nominatim.

## Executive Recommendation

- Best first batch: USGS Earthquakes, Art Institute of Chicago, OpenFEMA, Open Library, and Federal Register.
- Best visual API: Art Institute of Chicago. It offers first-class search, field projection, IIIF images, explicit CORS support, and clear public-domain filtering.
- Best low-risk live-data API: USGS Earthquakes. Its bounded GeoJSON feeds are designed for applications, update every minute, and USGS-produced data is generally public domain.
- Best breadth after batch one: The Met Collection and World Bank Indicators.
- Highest-risk candidates: GBIF and openFDA, because per-record licensing or medical-use disclaimers require more generation policy than a normal read-only data provider.

The first batch deliberately spans five distinct app categories instead of adding several overlapping museum or government APIs at once.

## Evaluation Method

Weights were adjusted for Squid's catalog rather than a purchasing decision:

- Generated-app usefulness: 40%
- Free/no-key usability and quota fit: 25%
- Browser integration quality: 20%
- Licensing, safety, and operational risk: 15%

On July 14, 2026, each candidate endpoint below returned HTTP 200 to a live request with an `Origin` header. All ten returned `Access-Control-Allow-Origin: *`. Scores still penalize undocumented CORS, restrictive intended-use language, low quotas, fan-out, ambiguous licensing, or domain-specific disclaimers.

## Comparison Table

| Candidate | Best generated apps | Auth / browser | Limits and rights | Policy | Score |
| --- | --- | --- | --- | --- | ---: |
| Art Institute of Chicago | Art explorers, virtual galleries, collection search | No key; documented CORS | 60 requests/minute anonymously; most API data CC0, descriptions CC BY; filter images to `is_public_domain=true` | Approved with attribution/rights guidance | 9.5/10 |
| USGS Earthquakes | Live maps, hazard dashboards, seismic timelines | No key; live CORS check passed | Summary feeds update every minute; USGS-produced data generally public domain | Approved | 9.4/10 |
| The Met Collection | Gallery search, art history, exhibit builders | No key; live CORS check passed | 80 requests/second; Open Access data and eligible images are CC0 | Approved | 9.2/10 |
| OpenFEMA | Disaster declarations, recovery dashboards, regional timelines | No registration; live CORS check passed | Read-only public government datasets; query and schema are dataset/version specific | Approved with source/date caveat | 9.0/10 |
| Federal Register | Regulation trackers, agency feeds, policy timelines | No key; documented browser use; live CORS check passed | Public API; web rendition is informational and not the official legal edition | Approved with legal-status warning | 8.8/10 |
| World Bank Indicators | GDP, population, development and country comparison dashboards | No key; live CORS check passed | Open datasets are generally CC BY 4.0; individual datasets can differ | Approved for reviewed indicator datasets | 8.5/10 |
| Open Library | Book search, reading lists, cover browsers | No key; live CORS check passed | 1 request/second anonymous, 3 identified; not intended as high-traffic commercial infrastructure | Conditional | 8.3/10 |
| Open Food Facts | Barcode lookup, nutrition comparisons, pantry apps | No key for reads; live CORS check passed | 15 product reads/minute/IP, 10 searches/minute/IP; ODbL data and CC BY-SA images; crowdsourced accuracy | Conditional | 7.8/10 |
| GBIF | Species explorers, sighting maps, biodiversity dashboards | Most GET requests need no auth; live CORS check passed | Dynamic rate limiting; each occurrence and image can carry its own license, including noncommercial terms | Conditional | 7.6/10 |
| openFDA | Recall search, label reference, regulatory data explorers | No-key calls currently work; live CORS check passed | 1,000 requests/day/IP without a key; mostly CC0, but medical decisions disclaimer is mandatory | Conditional | 7.4/10 |

User-review sentiment was not weighted. For public infrastructure APIs, current official documentation, live response behavior, data rights, and operational constraints are more decision-relevant than generic review-site sentiment.

## Batch One: Code-Ready Catalog Contracts

### 1. USGS Earthquakes

- Provider ID: `usgs-earthquakes`
- Category: `data`
- Base URL: `https://earthquake.usgs.gov`
- Example/health endpoint: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson`
- Suggested capabilities: `earthquakes`, `seismic activity`, `hazard maps`, `event timelines`
- Suggested policy: `approved`, `auth: none`, `runtime: browser`, `commercialUse: allowed`
- Health guard: object has `type === "FeatureCollection"`, numeric `metadata.generated`, numeric `metadata.count`, and `features` is an array whose items contain string `id`, point `geometry.coordinates`, numeric-or-null `properties.mag`, string `properties.place`, and numeric `properties.time`.
- Generation guidance: Prefer bounded summary feeds for current dashboards. Use the FDSN query endpoint only for explicit historical or geographic searches, cap results, and treat automatic events as preliminary. Display USGS as the source and the feed generation time.
- Important implementation detail: GeoJSON coordinates are `[longitude, latitude, depthKm]`, not latitude-first.

### 2. Art Institute of Chicago

- Provider ID: `art-institute-chicago`
- Category: `data`
- Base URL: `https://api.artic.edu/api/v1`
- Example/health endpoint: `https://api.artic.edu/api/v1/artworks/search?q=cats&query[term][is_public_domain]=true&limit=1&fields=id,title,image_id,is_public_domain`
- Suggested capabilities: `artwork search`, `artists`, `museum collections`, `public-domain images`
- Suggested policy: `approved`, `auth: none`, `runtime: browser`, `commercialUse: review_required`
- Health guard: object contains `data` array and `config.iiif_url`; the first result has numeric `id`, string `title`, string `image_id`, and `is_public_domain === true`.
- Generation guidance: Request only needed fields. For reusable images, filter `is_public_domain=true`, then build image URLs from the response's `config.iiif_url` plus `{image_id}/full/843,/0/default.jpg`. Do not assume every artwork has an image or that every image is public domain.
- Important implementation detail: Anonymous access is limited to 60 requests/minute. An optional browser-safe `AIC-User-Agent` header can identify the project.

### 3. OpenFEMA

- Provider ID: `openfema`
- Category: `data`
- Base URL: `https://www.fema.gov/api/open/v2`
- Example/health endpoint: `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$top=1&$orderby=declarationDate%20desc`
- Suggested capabilities: `disaster declarations`, `emergency management`, `public assistance`, `hazard mitigation`
- Suggested policy: `approved`, `auth: none`, `runtime: browser`, `commercialUse: allowed`
- Health guard: object contains `metadata.version === "v2"` and `DisasterDeclarationsSummaries` array; records contain numeric `disasterNumber`, string `state`, string `declarationDate`, string `incidentType`, string `declarationTitle`, and nullable `incidentEndDate`.
- Generation guidance: Use `$select`, `$filter`, `$orderby`, `$top`, and `$skip` to keep payloads bounded. Treat declaration and program flags as administrative records, not real-time safety instructions. Show `lastRefresh` and link back to FEMA.
- Important implementation detail: The current working dataset endpoint is v2. The older v1 endpoint returned HTTP 404 in live validation.

### 4. Open Library

- Provider ID: `open-library`
- Category: `data`
- Base URL: `https://openlibrary.org`
- Example/health endpoint: `https://openlibrary.org/search.json?q=the%20hobbit&limit=1&fields=key,title,author_name,cover_i`
- Suggested capabilities: `book search`, `authors`, `editions`, `book covers`
- Suggested policy: `conditional`, `auth: none`, `runtime: browser`, `commercialUse: review_required`
- Health guard: object contains numeric `numFound` and `docs` array; results contain string `key`, string `title`, optional string-array `author_name`, and optional numeric `cover_i`.
- Generation guidance: Use `search.json` with a small `limit` and explicit `fields`; do not issue one detail request per visible result. Build cover URLs from `cover_i` and tolerate missing covers. Cache searches and debounce user input.
- Important implementation detail: Open Library explicitly prioritizes low-volume, human-facing book discovery and says the API is not intended as a high-traffic commercial backend. Anonymous requests are limited to 1/second.

### 5. Federal Register

- Provider ID: `federal-register`
- Category: `data`
- Base URL: `https://www.federalregister.gov/api/v1`
- Example/health endpoint: `https://www.federalregister.gov/api/v1/documents.json?per_page=1&order=newest`
- Suggested capabilities: `federal regulations`, `agency notices`, `executive orders`, `public inspection documents`
- Suggested policy: `approved`, `auth: none`, `runtime: browser`, `commercialUse: allowed`
- Health guard: object contains numeric `count`, numeric `total_pages`, and `results` array; records contain string `document_number`, string `title`, string `type`, string `publication_date`, string `html_url`, and nullable/string `pdf_url`.
- Generation guidance: Treat FederalRegister.gov as a discovery and informational interface. Link every item to `html_url` and, when present, the official `pdf_url` on govinfo.gov. Never describe the API rendition as official legal notice or provide legal advice.
- Important implementation detail: Use the `www.federalregister.gov` API host. A live request to `api.federalregister.gov` was redirected to an unblock page rather than returning API JSON.

## Batch Two

### The Met Collection

The Met is legally cleaner than most media APIs: no key, a documented 80 requests/second limit, CC0 Open Access data, and eligible public-domain images. Its main cost is search fan-out: `/search` returns object IDs and each visible object requires `/objects/{id}`. The generated client must slice IDs before bounded-concurrency detail requests and filter on `isPublicDomain` and non-empty `primaryImageSmall`.

Suggested health endpoint: `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=sunflowers`.

### World Bank Indicators

This is the best chart/dashboard addition. It supports country, indicator, date range, recent-value, paging, and JSON output without a key. The generated client must validate the unusual two-element response: metadata at index 0 and records at index 1. It should show the indicator name, observation year, source/update date, and missing values honestly. Limit the catalog entry to World Bank Open Data indicators unless the dataset's license has been reviewed.

Suggested health endpoint: `https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.CD?format=json&per_page=1`.

## Conditional Providers

### Open Food Facts

Good product value, but generated apps must respect very low read/search limits, request only explicit fields, disclose crowdsourced-data limitations, and preserve ODbL/CC BY-SA obligations. It is a good conditional provider after the first batch, especially for barcode-driven lookups rather than search-as-you-type.

### GBIF

Technically excellent, but a single catalog-level commercial-use flag cannot fully describe it. Occurrence records expose their own `license`, `datasetKey`, `publishingOrgKey`, and media rights. A safe adapter should retain those fields, filter or visibly label noncommercial media, and preserve attribution links. This likely deserves provider-specific output metadata before approval.

### openFDA

The API is useful and mostly CC0, but every generated experience needs a prominent warning that results are unvalidated and must not guide medical care. The official authentication page also says a key is required while documenting and currently permitting a no-key tier of 1,000 requests/day/IP. Cataloging it as an instant provider would need explicit quota and medical-safety policy.

## Implementation Pattern

Each batch-one provider follows the Octagon pattern:

1. Add one registry object in `features/integrations/registry.ts`.
2. Add a read-only live health check and defensive payload guard in `features/integrations/server/provider-health.ts`.
3. Add registry lookup, URL matching, policy guidance, and health-check tests.
4. Add one catalog search/selection assertion for the provider's main user language.

The first batch should remain a targeted registry expansion; no new abstraction is necessary. The five providers can share the existing `auth: none`, `runtime: browser`, and health-check machinery.

## Sources

### Art Institute of Chicago

- API documentation, authentication, limits, CORS, IIIF, and licensing: https://api.artic.edu/docs/

### USGS Earthquakes

- GeoJSON feed format and update cadence: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
- FDSN event query documentation: https://earthquake.usgs.gov/fdsnws/event/1/
- USGS copyrights and public-domain policy: https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits

### The Met Collection

- API endpoints, rights, authentication, and rate limit: https://metmuseum.github.io/
- API terms: https://www.metmuseum.org/policies/terms-and-conditions

### OpenFEMA

- OpenFEMA overview and no-registration API policy: https://www.fema.gov/about/reports-and-data/openfema
- Disaster Declarations Summaries dataset: https://www.fema.gov/about/openfema/data-sets/disaster-declarations-summaries-v2

### Federal Register

- API documentation and no-key browser access: https://www.federalregister.gov/developers/documentation/api/v1

### Open Library

- API usage guidelines and rate limits: https://openlibrary.org/developers/api
- Search API: https://openlibrary.org/dev/docs/api/search
- Covers API: https://openlibrary.org/dev/docs/api/covers

### World Bank

- Indicators API query structure: https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures
- Data access and licensing: https://datacatalog.worldbank.org/public-licenses

### Open Food Facts

- API overview, current v3 guidance, rate limits, and licensing: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/

### GBIF

- API reference, authentication, and rate limits: https://techdocs.gbif.org/en/openapi/
- Occurrence search contract: https://techdocs.gbif.org/en/openapi/v1/occurrence
- Terms and per-dataset licensing: https://www.gbif.org/terms
- Media licensing caveat: https://training.gbif.org/en/data-use/gbif-mediated-data-principles

### openFDA

- API overview: https://open.fda.gov/apis/
- Authentication and no-key/key limits: https://open.fda.gov/apis/authentication/
- Terms and CC0 policy: https://open.fda.gov/terms
