# Squid Agent

Squid Agent turns prompts, screenshots, and website references into exportable React applications. Generated source stays inspectable and portable, credit costs are visible, quality checks are surfaced, and project versions remain reversible.

## Stack

- Next.js App Router and React
- strict TypeScript, Zod, Tailwind CSS, and shadcn/ui
- Prisma with Postgres/Neon
- OpenRouter through the Vercel AI SDK
- TanStack Query for mutable client-visible server state
- Sandpack for generated-app previews
- Vitest and Playwright

## Run locally

Use Node 20.19 or newer and pnpm:

```bash
corepack enable
pnpm install
pnpm dev
```

Create `.env` from `.env.example` before starting. Provider, database, authentication, billing, storage, and email features require their corresponding variables.

## Quality gates

```bash
pnpm validate:schema
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:e2e
```

`pnpm build` generates the Prisma client and runs the Next.js production build. Apply committed database migrations separately with `pnpm db:deploy`; the build does not mutate the database schema.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for architecture and contribution conventions.
