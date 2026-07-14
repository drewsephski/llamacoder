# Squid Agent launch package

This folder is the operational and Product Hunt launch handoff. The codebase is launchable only after every deployment check below is green in the production environment.

## Required deployment sequence

1. Configure every required variable in `.env.example`, including Turnstile, alert delivery, `CRON_SECRET`, and the independent synthetic-monitor secret.
2. Apply committed migrations with `pnpm db:deploy`.
3. Deploy and confirm `GET /api/health` returns `200` and `GET /api/ready` returns `200`.
4. Confirm the Vercel cron invokes `/api/synthetic/launch` every ten minutes and a deliberate test failure reaches the alert receiver.
5. Run `pnpm ship:full` and the billable generation API contract with `RUN_LAUNCH_E2E=1 pnpm test:e2e tests/e2e/launch-flow.spec.ts` against a disposable database branch. This test seeds account verification and credits; it does not prove email delivery, Turnstile, or browser runtime verification.
6. Run the production-like browser smoke with a real throwaway inbox: sign up, complete Turnstile and email verification, confirm the five-credit grant, generate, run the actual preview test, reload, share, and export.
7. Exercise Stripe Checkout and both Stripe and GitHub webhook delivery from their provider dashboards.
8. Open `/launch` on desktop and mobile, play the full video, open `/example`, and download its source bundle.

## Launch assets

- Launch path: `/launch`
- Public no-signup workspace: `/example`
- 60.5-second workflow video: `public/product-hunt/squid-agent-launch-60s.mp4`
- Six-frame gallery plan: `product-hunt-gallery.md`
- Maker first comment: `maker-comment.md`
- Incident response: `incident-runbook.md`

## Launch gates

- No unverified email/password account receives starter credits.
- Upload signing is authenticated, persistently rate limited, MIME/size validated, presigned, and namespaced by user id.
- Dashboard status never equates generated code with runtime or export readiness.
- Generation can be stopped globally or by provider/model.
- Generation, webhook, latency, readiness, and stale-hold failures create persisted incidents and external alerts.
- The billable API contract proves project persistence, a completed charge, sharing, export verification, and ZIP delivery. Only the production-like browser smoke counts as email, bot-challenge, or runtime-preview evidence.
