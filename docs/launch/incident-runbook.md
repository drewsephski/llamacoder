# Launch incident runbook

## Triage

1. Check `/api/health`; if it fails, roll back the deployment or restore the runtime immediately.
2. Check `/api/ready`. Its response separates configuration, database, and expired-hold recovery failures.
3. Inspect recent `OperationalIncident` rows and the corresponding structured platform logs using the incident name and timestamp.
4. Check the ten-minute `production_synthetic_*` events to separate provider failures from application or database failures.

## Containment

- All generation: set `GENERATION_KILL_SWITCH=1` and redeploy.
- One provider: add its slug, such as `openai`, to `DISABLED_PROVIDERS` and redeploy.
- One model: add its full id to `DISABLED_MODELS` and redeploy.
- Billing/webhooks: disable affected checkout entry points at Stripe, preserve webhook retries, and do not manually grant credits until event idempotency is confirmed.
- Upload abuse: rotate S3 credentials, disable the bucket CORS write path, and keep the signing route unavailable until ownership/rate evidence is reviewed.

## Recovery

1. Fix or roll back the smallest responsible change.
2. Apply pending migrations before testing the app when schema drift is involved.
3. Confirm `/api/ready`, run the production synthetic manually with its bearer secret, then run the focused failure/recovery tests.
4. Re-enable one model/provider at a time and watch latency, generation failures, holds, and provider cost.
5. Resolve the persisted incident only after a successful real user-path check and write a short cause/prevention note.

## Alert names

- `generation_failed`
- `generation_latency_elevated`
- `stuck_credit_holds_detected`
- `stripe_webhook_failed`
- `github_webhook_failed`
- `readiness_database_failed`
- `production_synthetic_failed`
