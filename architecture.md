# Squid Agent architecture

Squid Agent is a Next.js App Router application with feature-owned business
logic. Route and page modules are delivery adapters: they parse input,
authenticate, delegate to a feature, and map the result to HTTP or UI.

## Ownership map

```text
app/
  (main)/                         route composition and compatibility facades
  api/                            parse, authenticate, delegate, respond

features/
  auth/                           session and ownership primitives
  billing/                        checkout contracts, hooks, and UI
  generation/                     agent, completion, repair, and telemetry logic
  marketing/                      public-site components and content
  projects/                       project contracts, queries, actions, and UI
  security/                       rate limiting and outbound URL policy
  shared/                         typed HTTP and error primitives
  user/                           user-facing query contracts and hooks

components/ui/                    product-agnostic UI primitives

lib/
  billing/                        credit grants, holds, pricing, fulfillment
  generated-files.ts              canonical generated-file parser/normalizer
  openrouter.ts                   provider construction and policy mapping
  prisma.ts                       lazy Prisma client access
```

## Dependency rules

- `app/**` may import from `features/**`, `components/**`, and `lib/**`.
- `features/**` must not import business logic from `app/**`.
- Feature server modules may depend on `lib/**` infrastructure but must own
  their feature policy and authorization decisions.
- `components/ui/**` remains product-agnostic and must not depend on features.
- Compatibility entrypoints such as `app/(main)/actions.ts` only re-export
  feature-owned actions; they do not contain business logic.
- External data is `unknown` until a Zod schema or canonical parser validates it.
- Prisma JSON is parsed through the owning feature contract or
  `lib/generated-files.ts`; callers do not cast JSON into application types.

## Runtime flows

### Create and generate

1. The homepage builder validates input and calls `/api/create-chat`.
2. The route authenticates, rate-limits, checks eligibility, and creates the
   chat plus initial messages.
3. The workspace calls the completion route with the persisted message ID.
4. Generation reserves a credit hold, applies model/research policy, records
   request telemetry, validates output, persists a version, and captures or
   releases the hold.

### Project mutations

Client component → feature server action → session/ownership check → Prisma
transaction → targeted cache/path invalidation → recoverable UI result.

### Billing

Checkout route → authenticated and rate-limited Stripe session → webhook or
return reconciliation → idempotent credit grant → grant-backed credit balance.

## Data and state

- Server components own initial read-heavy data where practical.
- TanStack Query owns mutable client-visible server state.
- Query keys and Zod response schemas live with their feature.
- Local React state is reserved for interaction state.
- High-frequency visual values use refs and CSS variables, not root state.

## Operational safeguards

- `pnpm build` is side-effect free with respect to the database.
- Deployments apply checked-in migrations explicitly with `pnpm db:deploy`.
- Expensive provider operations use persistent per-user rate-limit buckets.
- Remote screenshot URLs reject loopback, private, link-local, and resolved
  private addresses before a Browserbase session starts.
- AI provider requests and credit holds record structured telemetry.

## Verification

Run, in order:

```bash
pnpm validate:schema
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:e2e
pnpm build
```

Use `pnpm db:deploy` only in a deployment environment targeting the intended
database. Never add database mutation back to the normal build command.
