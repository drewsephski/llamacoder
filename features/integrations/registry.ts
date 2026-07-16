export type IntegrationPolicyStatus = "approved" | "conditional" | "blocked";

export type IntegrationCategory =
  | "data"
  | "developer"
  | "backend"
  | "commerce"
  | "communication"
  | "deployment";

export type IntegrationProvider = {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  capabilities: string[];
  keywords: string[];
  hosts: string[];
  docsUrl: string;
  baseUrl: string;
  auth: "none" | "publishable_key" | "secret" | "oauth";
  runtime: "browser" | "server";
  requiredSecrets: string[];
  corsCompatible: boolean | null;
  policyStatus: IntegrationPolicyStatus;
  commercialUse: "allowed" | "restricted" | "review_required";
  attribution: string | null;
  limits: string | null;
  guidance: string;
  exampleEndpoint: string | null;
  implementationGuidance: string;
  verifiedAt: string;
};

const providers = [
  {
    id: "rest-countries",
    name: "REST Countries",
    category: "data",
    description: "Search normalized country, geography, and flag data.",
    capabilities: ["country search", "country metadata", "flags"],
    keywords: ["rest countries", "country explorer", "countries api"],
    hosts: ["api.restcountries.com", "restcountries.com"],
    docsUrl: "https://restcountries.com/docs",
    baseUrl: "https://api.restcountries.com/countries/v5",
    auth: "secret",
    runtime: "server",
    requiredSecrets: ["REST_COUNTRIES_API_KEY"],
    corsCompatible: false,
    policyStatus: "conditional",
    commercialUse: "review_required",
    attribution: null,
    limits:
      "Version 5 is authenticated and plan limits apply. Cache stable country metadata and request only the fields the app uses.",
    guidance:
      "Use the current v5 API from a server adapter. Do not generate legacy v3.1 endpoints or expose the bearer token in browser code.",
    exampleEndpoint:
      "https://api.restcountries.com/countries/v5?limit=25&q=canada",
    implementationGuidance:
      "Send the provider key as a Bearer token from the server, honor pagination, and derive response guards from the v5 schema instead of reusing legacy v3.1 field names.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "frankfurter",
    name: "Frankfurter",
    category: "data",
    description: "Daily central-bank exchange rates with no API key.",
    capabilities: ["exchange rates", "currency conversion"],
    keywords: ["frankfurter", "exchange rate", "currency converter"],
    hosts: ["api.frankfurter.dev"],
    docsUrl: "https://frankfurter.dev/",
    baseUrl: "https://api.frankfurter.dev/v2",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "review_required",
    attribution: "Rates are sourced from central-bank reference data.",
    limits: "Cache rates according to their published update cadence.",
    guidance:
      "Show the rate date and make clear that reference rates are not live trading quotes.",
    exampleEndpoint:
      "https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR,GBP",
    implementationGuidance:
      "Use the v2 /rates endpoint. It returns an array of {date, base, quote, rate}; filter by base and quotes, and compute conversions locally because there is no conversion endpoint.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "hacker-news",
    name: "Hacker News API",
    category: "data",
    description: "Official Hacker News stories, comments, and profiles.",
    capabilities: ["technology news", "stories", "comments", "user profiles"],
    keywords: ["hacker news", "startup news", "technology news"],
    hosts: ["hacker-news.firebaseio.com"],
    docsUrl: "https://github.com/HackerNews/API",
    baseUrl: "https://hacker-news.firebaseio.com/v0",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "review_required",
    attribution:
      "Identify Hacker News as the source and link story titles to the source URL.",
    limits: "Bound fan-out when resolving item IDs and cache item responses.",
    guidance:
      "Fetch a bounded list of item IDs, then resolve only the items visible in the interface.",
    exampleEndpoint: "https://hacker-news.firebaseio.com/v0/topstories.json",
    implementationGuidance:
      "Fetch a bounded slice of story IDs, resolve /v0/item/{id}.json with bounded concurrency, and handle null, deleted, or dead items before rendering.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "octagon",
    name: "UFC API",
    category: "data",
    description:
      "MMA rankings, weight divisions, fighter profiles, and career records.",
    capabilities: [
      "MMA rankings",
      "fighter profiles",
      "weight divisions",
      "fighter records",
    ],
    keywords: [
      "octagon api",
      "mma rankings",
      "mma fighter rankings",
      "ufc rankings",
      "fighter stats",
      "fighter profiles",
    ],
    hosts: ["api.octagon-api.com", "octagon-api.com"],
    docsUrl: "https://www.octagon-api.com/api-documentation",
    baseUrl: "https://api.octagon-api.com",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "review_required",
    attribution:
      "Identify Octagon API as the data source and do not imply official UFC affiliation.",
    limits:
      "No public rate limit or availability SLA is documented. Cache responses, bound fighter-detail fan-out, and tolerate missing or changing fighter IDs.",
    guidance:
      "Treat rankings and profiles as third-party MMA data rather than an official or real-time UFC feed. Confirm image and data usage rights before commercial publication.",
    exampleEndpoint: "https://api.octagon-api.com/rankings",
    implementationGuidance:
      "Use /rankings for division and rank lists, /division/{divisionId} for a focused division, and /fighter/{fighterId} for details. Discover IDs from live ranking responses instead of hard-coding documentation examples. Validate rankings as arrays of {id, categoryName, champion, fighters}; fighter measurements and records are strings, and detail endpoints may return 404 when a fighter leaves the dataset.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "art-institute-chicago",
    name: "Art Institute of Chicago",
    category: "data",
    description:
      "Search museum artworks, artists, exhibitions, and public-domain images.",
    capabilities: [
      "artwork search",
      "museum collections",
      "artists",
      "public-domain images",
    ],
    keywords: [
      "art institute of chicago",
      "artic api",
      "chicago art museum",
      "public domain art",
      "artwork explorer",
    ],
    hosts: ["api.artic.edu", "www.artic.edu"],
    docsUrl: "https://api.artic.edu/docs/",
    baseUrl: "https://api.artic.edu/api/v1",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "review_required",
    attribution:
      "Preserve the API response's license text and identify the Art Institute of Chicago as the source.",
    limits:
      "Anonymous access is limited to 60 requests per minute. Request only needed fields, cache results, and avoid deep pagination or bulk scraping.",
    guidance:
      "Use public-domain artwork records for reusable image experiences. Do not assume an artwork has an image or that every served image is public domain.",
    exampleEndpoint:
      "https://api.artic.edu/api/v1/artworks/search?q=cats&query%5Bterm%5D%5Bis_public_domain%5D=true&limit=1&fields=id,title,image_id,is_public_domain",
    implementationGuidance:
      "Use /artworks/search with explicit fields and query[term][is_public_domain]=true when displaying reusable images. Build IIIF URLs from config.iiif_url and image_id using /full/843,/0/default.jpg; never hard-code the IIIF host or render a missing image_id.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "usgs-earthquakes",
    name: "USGS Earthquakes",
    category: "data",
    description:
      "Live and historical earthquake locations, magnitudes, alerts, and event details.",
    capabilities: [
      "earthquakes",
      "seismic activity",
      "hazard maps",
      "event timelines",
    ],
    keywords: [
      "usgs earthquake",
      "earthquake tracker",
      "earthquake map",
      "seismic activity",
      "seismic events",
    ],
    hosts: ["earthquake.usgs.gov"],
    docsUrl:
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php",
    baseUrl: "https://earthquake.usgs.gov",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "allowed",
    attribution: "Identify the U.S. Geological Survey as the data source.",
    limits:
      "Prefer the bounded real-time summary feeds for current dashboards. Cap FDSN catalog queries at a user-visible scope and avoid repeatedly downloading unchanged feeds.",
    guidance:
      "Treat automatic earthquake solutions as preliminary and show the feed generation time. Do not present the data as emergency instructions or a guaranteed warning service.",
    exampleEndpoint:
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
    implementationGuidance:
      "Validate the response as a GeoJSON FeatureCollection. Read coordinates as [longitude, latitude, depthKm], not latitude-first, and tolerate null magnitudes or alert fields. For current maps use bounded summary feeds; use /fdsnws/event/1/query only for explicit historical or geographic searches.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "met-museum",
    name: "The Met Collection",
    category: "data",
    description:
      "Search The Met's collection metadata and eligible public-domain artwork images.",
    capabilities: [
      "artwork search",
      "art history",
      "museum departments",
      "public-domain images",
    ],
    keywords: [
      "met museum",
      "met collection api",
      "metropolitan museum of art",
      "the met collection",
      "museum exhibit builder",
    ],
    hosts: ["collectionapi.metmuseum.org", "images.metmuseum.org"],
    docsUrl: "https://metmuseum.github.io/",
    baseUrl: "https://collectionapi.metmuseum.org/public/collection/v1",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "allowed",
    attribution:
      "Identify The Metropolitan Museum of Art as the source and link to each object's objectURL.",
    limits:
      "The documented limit is 80 requests per second. Search returns IDs, so bound detail-request fan-out and cache object responses.",
    guidance:
      "Use only records with isPublicDomain=true and a non-empty primaryImage or primaryImageSmall when the app needs reusable artwork imagery.",
    exampleEndpoint:
      "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=sunflowers",
    implementationGuidance:
      "Call /search to discover objectIDs, slice the list before resolving /objects/{objectId} with bounded concurrency, and discard missing or non-public-domain images. Preserve objectURL, creditLine, and rightsAndReproduction instead of implying every result is unrestricted.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "openfema",
    name: "OpenFEMA",
    category: "data",
    description:
      "FEMA disaster declarations, assistance programs, mitigation, and recovery data.",
    capabilities: [
      "disaster declarations",
      "emergency management",
      "public assistance",
      "hazard mitigation",
    ],
    keywords: [
      "openfema",
      "open fema",
      "fema disaster",
      "disaster declarations",
      "emergency declarations",
    ],
    hosts: ["www.fema.gov"],
    docsUrl: "https://www.fema.gov/about/openfema/api",
    baseUrl: "https://www.fema.gov/api/open/v2",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "allowed",
    attribution:
      "Identify FEMA and the specific OpenFEMA dataset as the source and display the record's lastRefresh value.",
    limits:
      "Use $select, $filter, $orderby, $top, and $skip to keep responses bounded. Dataset schemas and versions can change independently.",
    guidance:
      "Treat program flags and declarations as administrative records, not real-time emergency instructions, benefit eligibility decisions, or a complete account of current conditions.",
    exampleEndpoint:
      "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$top=1&$orderby=declarationDate%20desc",
    implementationGuidance:
      "Use the v2 DisasterDeclarationsSummaries dataset with bounded OData-style query parameters. Validate its named response array, tolerate nullable incidentEndDate and filing dates, and surface lastRefresh. Do not generate the retired v1 endpoint.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "federal-register",
    name: "Federal Register",
    category: "data",
    description:
      "Federal rules, proposed rules, notices, executive orders, and agency documents.",
    capabilities: [
      "federal regulations",
      "agency notices",
      "executive orders",
      "policy timelines",
    ],
    keywords: [
      "federal register",
      "federal regulations",
      "executive order tracker",
      "agency notices",
      "proposed rules",
    ],
    hosts: ["federalregister.gov"],
    docsUrl:
      "https://www.federalregister.gov/developers/documentation/api/v1",
    baseUrl: "https://www.federalregister.gov/api/v1",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "allowed",
    attribution:
      "Identify FederalRegister.gov as the discovery source and link to the official govinfo.gov PDF when available.",
    limits:
      "Use bounded pages and date or agency filters. FederalRegister.gov may throttle abusive traffic even though no public fixed quota is documented.",
    guidance:
      "FederalRegister.gov is an informational rendition, not the official legal edition. Never describe API results as legal notice or provide legal advice from them.",
    exampleEndpoint:
      "https://www.federalregister.gov/api/v1/documents.json?per_page=1&order=newest",
    implementationGuidance:
      "Use the www.federalregister.gov host, request bounded pages, and preserve html_url plus pdf_url. Use publication_date and document_number as source metadata, tolerate a null pdf_url, and direct users to the official PDF for authoritative text.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "world-bank",
    name: "World Bank Indicators",
    category: "data",
    description:
      "Country-level economic, population, development, and sustainability indicators.",
    capabilities: [
      "economic indicators",
      "country comparisons",
      "development data",
      "time-series charts",
    ],
    keywords: [
      "world bank indicators",
      "world bank data",
      "development indicators",
      "gdp dashboard",
      "global development data",
    ],
    hosts: ["api.worldbank.org"],
    docsUrl:
      "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    baseUrl: "https://api.worldbank.org/v2",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "review_required",
    attribution:
      "Attribute the World Bank and preserve the indicator, source, observation year, and applicable dataset license.",
    limits:
      "Use paging, date ranges, mrv, and explicit indicators to bound results. Dataset licenses can differ even though World Bank-produced open data is generally CC BY 4.0.",
    guidance:
      "Use reviewed World Bank Open Data indicators only. Show the observation year and last-updated metadata, and never present missing or older observations as current values.",
    exampleEndpoint:
      "https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.CD?format=json&per_page=1",
    implementationGuidance:
      "Always request format=json and validate the unusual two-element array: paging metadata at index 0 and records at index 1. Treat record.value as nullable, preserve indicator.id and countryiso3code, and use date or mrv instead of downloading an unbounded history.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "open-library",
    name: "Open Library",
    category: "data",
    description: "Search books, authors, editions, subjects, and cover images.",
    capabilities: ["book search", "authors", "editions", "book covers"],
    keywords: [
      "open library",
      "openlibrary",
      "book search api",
      "reading list api",
      "book cover api",
    ],
    hosts: ["openlibrary.org"],
    docsUrl: "https://openlibrary.org/developers/api",
    baseUrl: "https://openlibrary.org",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "conditional",
    commercialUse: "review_required",
    attribution:
      "Identify Open Library and the Internet Archive as the source and link books to their Open Library work page.",
    limits:
      "Anonymous requests are limited to 1 per second. Identified requests receive 3 per second. The API is intended for low-volume human-facing discovery, not high-traffic commercial infrastructure.",
    guidance:
      "Use for low-volume book discovery and prototypes. Cache responses, debounce searches, and do not turn Open Library into the app's bulk or high-traffic backend.",
    exampleEndpoint:
      "https://openlibrary.org/search.json?q=the%20hobbit&limit=1&fields=key,title,author_name,cover_i",
    implementationGuidance:
      "Use /search.json with a small limit and explicit fields instead of resolving each result separately. Build cover URLs from cover_i through covers.openlibrary.org, tolerate missing authors and covers, and link the work key back to openlibrary.org.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "open-food-facts",
    name: "Open Food Facts",
    category: "data",
    description:
      "Crowdsourced food products, ingredients, nutrition, labels, and barcode lookup.",
    capabilities: [
      "barcode lookup",
      "nutrition data",
      "food ingredients",
      "product images",
    ],
    keywords: [
      "open food facts",
      "openfoodfacts",
      "barcode nutrition",
      "food product lookup",
      "nutrition scanner",
    ],
    hosts: ["openfoodfacts.org"],
    docsUrl:
      "https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/",
    baseUrl: "https://world.openfoodfacts.org/api/v3",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "conditional",
    commercialUse: "review_required",
    attribution:
      "Attribute Open Food Facts, preserve ODbL database terms, and credit product images under their applicable CC BY-SA and third-party rights.",
    limits:
      "Product reads are limited to 15 requests per minute per IP and searches to 10 per minute per IP. Do not implement search-as-you-type or bulk retrieval.",
    guidance:
      "Treat product data as crowdsourced and potentially incomplete or inaccurate. Do not present nutrition scores as medical advice, and confirm license compliance before commercial publication.",
    exampleEndpoint:
      "https://world.openfoodfacts.org/api/v3/product/3017620422003.json?fields=code,product_name,nutriscore_grade,image_front_small_url",
    implementationGuidance:
      "Use the current v3 product-by-barcode endpoint with explicit fields. Validate result.id or status before reading product, tolerate missing nutrition and image fields, debounce barcode requests, and use an explicit submit action for any search endpoint.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "gbif",
    name: "GBIF",
    category: "data",
    description:
      "Global biodiversity species, taxonomy, occurrence, location, and media records.",
    capabilities: [
      "species search",
      "biodiversity records",
      "wildlife sightings",
      "occurrence maps",
    ],
    keywords: [
      "gbif",
      "biodiversity api",
      "species occurrence",
      "wildlife sightings",
      "species map",
    ],
    hosts: ["api.gbif.org"],
    docsUrl: "https://techdocs.gbif.org/en/openapi/",
    baseUrl: "https://api.gbif.org/v1",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "conditional",
    commercialUse: "review_required",
    attribution:
      "Retain each record's dataset, publisher, license, rights holder, and references so the app can provide record-level attribution.",
    limits:
      "Search rate limits vary with server load and may return HTTP 429. Occurrence pages are capped at 300 records and deep paging at 100,000; use downloads for bulk research.",
    guidance:
      "Occurrence and media licenses vary by publisher and can prohibit commercial use. Filter or visibly label records by license and never assume an image inherits the dataset license.",
    exampleEndpoint:
      "https://api.gbif.org/v1/occurrence/search?scientificName=Panthera%20leo&mediaType=StillImage&limit=1",
    implementationGuidance:
      "Use /occurrence/search with a small limit and explicit taxonomic or geographic filters. Preserve key, datasetKey, publishingOrgKey, license, rightsHolder, references, and media metadata; tolerate coordinates, media, and common names being absent.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "openfda",
    name: "openFDA",
    category: "data",
    description:
      "Public FDA drug, device, food, recall, adverse-event, and label datasets.",
    capabilities: [
      "drug labels",
      "product recalls",
      "adverse events",
      "medical device data",
    ],
    keywords: [
      "openfda",
      "open fda",
      "fda recall",
      "drug label api",
      "medical device recall",
    ],
    hosts: ["api.fda.gov", "open.fda.gov"],
    docsUrl: "https://open.fda.gov/apis/",
    baseUrl: "https://api.fda.gov",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "conditional",
    commercialUse: "review_required",
    attribution: "Identify the U.S. Food and Drug Administration as the source.",
    limits:
      "The no-key tier permits 240 requests per minute and 1,000 requests per day per IP. An API key raises the daily quota but should not be embedded in browser code.",
    guidance:
      "Every openFDA experience must prominently state that results are unvalidated and must not be used to make medical-care decisions. Do not infer causation from adverse-event data.",
    exampleEndpoint:
      "https://api.fda.gov/drug/label.json?search=openfda.brand_name:advil&limit=1",
    implementationGuidance:
      "Use one documented dataset endpoint at a time, URL-encode search expressions, cap limit and paging, and handle HTTP 404 as no matching records. Preserve meta.disclaimer, meta.last_updated, terms, and license in the UI or source details.",
    verifiedAt: "2026-07-14",
  },
  {
    id: "weather-gov",
    name: "National Weather Service",
    category: "data",
    description: "Official U.S. forecasts, alerts, and observations.",
    capabilities: [
      "United States weather",
      "forecasts",
      "weather alerts",
      "observations",
    ],
    keywords: [
      "national weather service",
      "nws api",
      "weather.gov",
      "api.weather.gov",
    ],
    hosts: ["api.weather.gov"],
    docsUrl: "https://www.weather.gov/documentation/services-web-api",
    baseUrl: "https://api.weather.gov",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "approved",
    commercialUse: "allowed",
    attribution: "Identify the National Weather Service as the data source.",
    limits:
      "Reasonable unpublished rate limits apply. Honor cache headers and retry short-lived rate limits with bounded backoff.",
    guidance:
      "Use only for U.S. locations. Resolve coordinates through /points and follow the returned forecast or forecastHourly URL; never hard-code a forecast office or grid coordinate.",
    exampleEndpoint: "https://api.weather.gov/points/41.8781,-87.6298",
    implementationGuidance:
      "Round WGS84 coordinates to at most four decimal places, fetch /points/{lat},{lon}, validate properties.forecast or properties.forecastHourly, then fetch that returned URL. Cache the point mapping but refresh it periodically. Browsers supply User-Agent automatically; server adapters must send an identifying User-Agent and contact.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "open-meteo",
    name: "Open-Meteo",
    category: "data",
    description: "Forecast, geocoding, and air-quality data for prototypes.",
    capabilities: ["weather", "forecast", "geocoding", "air quality"],
    keywords: ["open meteo", "open-meteo", "open meteo weather"],
    hosts: [
      "api.open-meteo.com",
      "geocoding-api.open-meteo.com",
      "customer-api.open-meteo.com",
    ],
    docsUrl: "https://open-meteo.com/en/docs",
    baseUrl: "https://api.open-meteo.com/v1",
    auth: "none",
    runtime: "browser",
    requiredSecrets: [],
    corsCompatible: true,
    policyStatus: "conditional",
    commercialUse: "restricted",
    attribution:
      "Open-Meteo data requires attribution under its data licenses.",
    limits:
      "The free endpoint is limited and intended for non-commercial use; commercial apps require the customer API and an API key.",
    guidance:
      "Use the free endpoint only for a confirmed non-commercial prototype. For a commercial app, mark setup required and use the customer endpoint through an appropriate credential boundary.",
    exampleEndpoint:
      "https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current=temperature_2m,wind_speed_10m&timezone=auto",
    implementationGuidance:
      "Request explicit current/hourly/daily variables and timezone=auto. Read unit labels from current_units, hourly_units, or daily_units instead of assuming Celsius, km/h, or local time.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "github",
    name: "GitHub API",
    category: "developer",
    description: "Connect repositories, issues, contributors, and source sync.",
    capabilities: ["repositories", "contributors", "issues", "source sync"],
    keywords: ["github", "repository viewer", "repo viewer", "contributors"],
    hosts: ["api.github.com"],
    docsUrl: "https://docs.github.com/en/rest",
    baseUrl: "https://api.github.com",
    auth: "oauth",
    runtime: "server",
    requiredSecrets: ["GITHUB_APP_ID", "GITHUB_APP_PRIVATE_KEY"],
    corsCompatible: true,
    policyStatus: "conditional",
    commercialUse: "allowed",
    attribution: null,
    limits:
      "Unauthenticated REST access is heavily rate-limited; production apps should use a GitHub App or user-authorized token.",
    guidance:
      "Public read-only demos may use unauthenticated requests sparingly. Repository writes and reliable production access require a server-side GitHub App integration.",
    exampleEndpoint: "https://api.github.com/user",
    implementationGuidance:
      "Use a GitHub App installation token for repository operations, send Accept: application/vnd.github+json and X-GitHub-Api-Version: 2026-03-10, and request only the repository permissions the workflow needs.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "coingecko",
    name: "CoinGecko API",
    category: "data",
    description: "Cryptocurrency prices and market data from CoinGecko.",
    capabilities: ["cryptocurrency prices", "market data"],
    keywords: ["coingecko", "crypto price", "crypto tracker", "cryptocurrency"],
    hosts: ["api.coingecko.com", "pro-api.coingecko.com"],
    docsUrl: "https://docs.coingecko.com/",
    baseUrl: "https://api.coingecko.com/api/v3",
    auth: "secret",
    runtime: "server",
    requiredSecrets: ["COINGECKO_API_KEY"],
    corsCompatible: null,
    policyStatus: "conditional",
    commercialUse: "review_required",
    attribution: null,
    limits: "Plan-specific rate limits apply.",
    guidance:
      "Keep API keys in a server runtime. Do not place Demo or Pro keys in generated browser code.",
    exampleEndpoint:
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
    implementationGuidance:
      "For Demo keys use api.coingecko.com with x-cg-demo-api-key; for Pro keys use pro-api.coingecko.com with x-cg-pro-api-key. Keep either key server-side and preserve the requested asset IDs and quote currencies.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "nominatim-public",
    name: "Public Nominatim",
    category: "data",
    description:
      "Public OpenStreetMap geocoding service with strict usage rules.",
    capabilities: ["geocoding", "reverse geocoding", "place search"],
    keywords: ["nominatim", "openstreetmap geocoding", "osm geocoding"],
    hosts: ["nominatim.openstreetmap.org"],
    docsUrl: "https://operations.osmfoundation.org/policies/nominatim/",
    baseUrl: "https://nominatim.openstreetmap.org",
    auth: "none",
    runtime: "server",
    requiredSecrets: [],
    corsCompatible: null,
    policyStatus: "blocked",
    commercialUse: "restricted",
    attribution: "OpenStreetMap attribution is required.",
    limits:
      "The public service has strict usage, caching, and identification requirements.",
    guidance:
      "Do not automatically generate the public Nominatim service into Squid apps. Require the user to choose a compliant commercial provider or a self-hosted Nominatim instance.",
    exampleEndpoint: null,
    implementationGuidance:
      "Do not emit code for the public service. It is explicitly prohibited as a generic geocoder in no-code, low-code, and vibe-coding platforms; use a compliant provider or self-hosted instance instead.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "backend",
    description:
      "Authentication, Postgres data, storage, and server functions.",
    capabilities: ["authentication", "database", "storage", "server functions"],
    keywords: [
      "supabase",
      "database",
      "authentication",
      "user accounts",
      "persistence",
    ],
    hosts: ["supabase.co"],
    docsUrl: "https://supabase.com/docs",
    baseUrl: "https://api.supabase.com/v1",
    auth: "oauth",
    runtime: "server",
    requiredSecrets: [],
    corsCompatible: null,
    policyStatus: "conditional",
    commercialUse: "allowed",
    attribution: null,
    limits: "Project and API limits depend on the connected Supabase plan.",
    guidance:
      "Provisioning, privileged database operations, migrations, and service-role access must stay server-side. Only publishable project values may reach the browser.",
    exampleEndpoint: "https://api.supabase.com/v1/projects",
    implementationGuidance:
      "Use the Management API only from Squid's server with OAuth or a PAT. Generated clients may expose only the project URL and sb_publishable_* key, must rely on Row Level Security, and must never expose sb_secret_* or legacy service_role values.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "commerce",
    description: "Checkout, subscriptions, billing, and verified webhooks.",
    capabilities: ["payments", "checkout", "subscriptions", "webhooks"],
    keywords: ["stripe", "payment", "checkout", "subscription", "billing"],
    hosts: ["api.stripe.com"],
    docsUrl: "https://docs.stripe.com/",
    baseUrl: "https://api.stripe.com/v1",
    auth: "secret",
    runtime: "server",
    requiredSecrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    corsCompatible: false,
    policyStatus: "conditional",
    commercialUse: "allowed",
    attribution: null,
    limits:
      "Provider account, regional availability, and API rate limits apply.",
    guidance:
      "Use server-created Checkout Sessions, validate webhook signatures, and never expose a secret key in generated source.",
    exampleEndpoint: "https://api.stripe.com/v1/checkout/sessions",
    implementationGuidance:
      "Create a new Checkout Session on the server for each payment attempt, redirect or initialize Stripe.js from the returned session data, use idempotency for side effects, and verify Stripe-Signature against the raw webhook body before fulfillment.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "resend",
    name: "Resend",
    category: "communication",
    description: "Transactional email with domain and webhook support.",
    capabilities: ["transactional email", "email webhooks"],
    keywords: ["resend", "send email", "transactional email", "contact form"],
    hosts: ["api.resend.com"],
    docsUrl: "https://resend.com/docs",
    baseUrl: "https://api.resend.com",
    auth: "secret",
    runtime: "server",
    requiredSecrets: ["RESEND_API_KEY"],
    corsCompatible: false,
    policyStatus: "conditional",
    commercialUse: "allowed",
    attribution: null,
    limits: "Sending and domain limits depend on the connected Resend plan.",
    guidance:
      "Send mail from a server runtime with a sending-only key and render an honest setup state until the sending domain is verified.",
    exampleEndpoint: "https://api.resend.com/emails",
    implementationGuidance:
      "POST email from the server with Bearer auth, an identifying User-Agent, and an Idempotency-Key for retryable sends. Require a verified sending domain and never report success before Resend returns an email id.",
    verifiedAt: "2026-07-13",
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "deployment",
    description:
      "Preview deployments, projects, domains, and environment values.",
    capabilities: [
      "deployments",
      "preview environments",
      "domains",
      "environment variables",
    ],
    keywords: [
      "vercel",
      "deploy",
      "deployment",
      "preview deployment",
      "custom domain",
    ],
    hosts: ["api.vercel.com"],
    docsUrl: "https://vercel.com/docs/rest-api",
    baseUrl: "https://api.vercel.com",
    auth: "oauth",
    runtime: "server",
    requiredSecrets: [],
    corsCompatible: false,
    policyStatus: "conditional",
    commercialUse: "allowed",
    attribution: null,
    limits: "Deployment and team limits depend on the connected Vercel plan.",
    guidance:
      "Create deployments and environment variables through a server-side Vercel integration with explicit user authorization.",
    exampleEndpoint: "https://api.vercel.com/v2/user",
    implementationGuidance:
      "Use a server-held OAuth or access token, include teamId for team-owned resources, poll deployment state to a terminal result, and never return environment-variable values to the browser.",
    verifiedAt: "2026-07-13",
  },
] as const satisfies readonly IntegrationProvider[];

export const integrationRegistry: readonly IntegrationProvider[] = providers;

export function getIntegrationProvider(id: string) {
  return integrationRegistry.find((provider) => provider.id === id) ?? null;
}

export function findIntegrationProviders(content: string) {
  const normalized = content.toLowerCase();
  return integrationRegistry.filter(
    (provider) =>
      provider.keywords.some((keyword) => normalized.includes(keyword)) ||
      provider.hosts.some((host) => normalized.includes(host)),
  );
}

export function findIntegrationProviderByUrl(value: string) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return (
      integrationRegistry.find((provider) =>
        provider.hosts.some(
          (host) => hostname === host || hostname.endsWith(`.${host}`),
        ),
      ) ?? null
    );
  } catch {
    return null;
  }
}

export function buildIntegrationRegistryGuidance(content: string) {
  const matches = findIntegrationProviders(content);
  if (matches.length === 0) return "";

  return [
    "",
    "=== SQUID INTEGRATION REGISTRY ===",
    "Apply these reviewed provider policies. They override generic API suggestions:",
    ...matches.map((provider) => formatIntegrationProviderForPrompt(provider)),
    "For a blocked provider, do not generate the integration. Present a setup-required state and a compliant alternative instead.",
    "Record the registry provider id in integrations.ts as providerId.",
    "=== END SQUID INTEGRATION REGISTRY ===",
  ].join("\n");
}

export function buildIntegrationProviderGuidance(providerIds: string[]) {
  const requested = new Set(providerIds);
  const matches = integrationRegistry.filter((provider) =>
    requested.has(provider.id),
  );
  if (matches.length === 0) return "";

  return [
    "=== SELECTED API IMPLEMENTATION GUIDANCE ===",
    "MANDATORY PROVIDER CONTRACT: every provider listed below is an explicit user requirement, not a suggestion.",
    "Use every selected provider in the app plan and generated implementation. Do not omit it, replace it with another provider, or fall back to mock/static data.",
    "For capabilities and current values supplied by a selected provider, call that provider at runtime and treat its response as the product data source. Do not use web search, model memory, or copied search-result values in its place.",
    "Use web research only as a supplement when explicitly requested, when required context is outside the selected provider's capabilities, or when this reviewed contract is missing or ambiguous. Research must never silently replace the selected provider.",
    "For each selected provider, carry its exact providerId into the app specification and integrations.ts, implement its reviewed client or server adapter, and connect it to a user-visible app flow.",
    "Use only the exact base URL, example endpoint, endpoint paths, methods, and response behavior stated in the reviewed contract below. Never invent a route, API version, parameter, field, or auth header. If the reviewed contract does not establish something required, keep an explicit setup-required boundary instead of guessing.",
    "If credentials, authorization, or a server runtime are unavailable, keep the selected provider in the implementation and render an honest setup-required state. Never simulate success or substitute a different API.",
    "If a selected provider cannot safely satisfy the request, surface the conflict explicitly instead of generating an app that silently ignores the selection.",
    ...matches.map(formatIntegrationProviderForPrompt),
    "Before finishing, verify that every selected providerId appears in integrations.ts, its adapter is used by the app, and every emitted provider URL stays within the reviewed base URL or an explicitly documented alternate host. Missing any selected provider is a failed generation; inventing an endpoint is also a failed generation.",
    "=== END SELECTED API IMPLEMENTATION GUIDANCE ===",
  ].join("\n");
}

function formatIntegrationProviderForPrompt(provider: IntegrationProvider) {
  return `- ${provider.name} [${provider.id}]: policy=${provider.policyStatus}; auth=${provider.auth}; runtime=${provider.runtime}; commercialUse=${provider.commercialUse}; docs=${provider.docsUrl}; base=${provider.baseUrl}${provider.exampleEndpoint ? `; example=${provider.exampleEndpoint}` : ""}. ${provider.guidance} Implementation: ${provider.implementationGuidance}${provider.attribution ? ` Attribution: ${provider.attribution}` : ""}${provider.limits ? ` Limits: ${provider.limits}` : ""}`;
}
