# Contributing

Squid Agent uses Node 20.19 or newer and pnpm. Do not use npm, Yarn, or Bun in this repository.

## Local setup

1. Install the Node version declared in `package.json`.
2. Run `corepack enable` and `pnpm install`.
3. Copy the documented variables from `.env.example` into `.env`.
4. Run `pnpm dev`.

The application uses Next.js App Router, React, strict TypeScript, Prisma/Postgres, OpenRouter, TanStack Query, Tailwind, and Sandpack.

## Architecture

- `app/**` owns routes, metadata, request validation, authorization entry points, and composition.
- `features/**` owns product contracts, components, client hooks, server queries, and server actions.
- `components/ui/**` contains generic primitives; it must not import product features.
- `lib/**` contains infrastructure and shared generated-code, billing, provider, and storage logic.

New product behavior belongs in a feature module. Route files should remain small, and feature or shared modules must not import business logic from `app/**`.

## Implementation checklist

- Validate API, URL, FormData, storage, and Prisma JSON inputs at the boundary.
- Authenticate and authorize every server action and route; never treat an opaque ID as authorization.
- Preserve server/client boundaries and avoid broad client-only pages.
- Represent loading, empty, error, and retry states.
- Give icon-only controls accessible names and every button an explicit `type`.
- Avoid updating large component trees for every streamed token; batch transient updates and isolate expensive derived UI.
- Add observable behavior tests for changed flows.

## Verification

Run the quick quality gate before opening a pull request:

```bash
pnpm ship:quick
```

Run `pnpm test:e2e` for user-visible flows. Use `pnpm exec next build` for a safe production compile when needed; the repository's `pnpm build` script also performs `prisma db push` and should only be run when that database mutation is intended.
