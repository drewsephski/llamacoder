# Verified user-research operations

`ResearchFeedbackSubmission` is the canonical record for the feedback program.
Google Sheets is a readable mirror, not the source of truth: eligibility,
project evidence, review status, and credit grants remain connected in Squid.

## Daily review page

Set `FEEDBACK_ADMIN_EMAILS` to a comma-separated list of verified Squid account
emails, then open `/admin/feedback`. Non-allowlisted accounts receive a 404.

The page shows the pending queue, all answers, project and evidence links,
delivery state, category controls, reviewer notes, and the allowed reward for the
response track. Approving credits and updating the canonical review record occur
in one transaction. The CLI below remains available for recovery.

## Google Sheet mirror

1. Create a blank Google Spreadsheet.
2. In a Google Cloud project, enable the Google Sheets API and create a service
   account with a JSON key.
3. Share the spreadsheet with the service account email as an Editor.
4. Configure these server-only environment variables:

```bash
GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL=squid-feedback@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GOOGLE_SHEETS_SPREADSHEET_ID=the-id-between-d-and-edit-in-the-sheet-url
GOOGLE_SHEETS_TAB_NAME=Feedback
```

Squid creates the configured tab and header row when needed. Each submission is
keyed by its immutable submission ID. A retry updates that row rather than
creating a duplicate, including after approval or rejection.

Never expose the private key through a `NEXT_PUBLIC_` variable. Do not rename or
reorder the generated header row; use another tab for formulas, charts, or manual
notes.

## Email alerts

The app already uses Resend. Configure one or more notification inboxes:

```bash
FEEDBACK_NOTIFICATION_EMAILS=founder@example.com,research@example.com
```

New-submission emails use a Resend idempotency key and link directly to the
private review queue and the associated Squid project.

Sheet sync and email happen after the form response is returned, so an external
provider outage never discards or rejects the canonical submission. Failed and
disabled deliveries can be retried from `/admin/feedback`; a daily authorized
maintenance route also retries up to 25 outstanding deliveries.

## Review queue

List pending submissions:

```bash
pnpm feedback:review -- --list
```

Each submission includes the account, project, answers, optional evidence URL,
reward track, and the activity snapshot used to establish eligibility.

## Approve or reject

Approval accepts only the configured 15, 25, or 40 credit amounts. The review
and idempotent credit grant run in one database transaction.

```bash
pnpm feedback:review -- \
  --submission-id SUBMISSION_ID \
  --approve 15 \
  --category editing_difficulty \
  --note "Specific project evidence and a clear abandonment point."
```

Reject a copied, generic, unverifiable, or otherwise ineligible response without
granting credits:

```bash
pnpm feedback:review -- \
  --submission-id SUBMISSION_ID \
  --reject \
  --category unclear_product_value \
  --note "Generic answers without enough project-specific detail."
```

The allowed primary categories are:

- `generation_quality`
- `slow_or_failed_generation`
- `confusing_onboarding`
- `editing_difficulty`
- `preview_runtime_errors`
- `export_deployment_problems`
- `missing_integrations`
- `pricing_credit_confusion`
- `unclear_product_value`

## Find the repeated blocker

After roughly ten submissions, summarize reviewed categories, the pending queue,
payment intent, and average stated monthly price:

```bash
pnpm feedback:review -- --summary
```

Use the most common abandonment category to prioritize the next product fix.
Read the underlying answers before deciding; category counts are a routing aid,
not a substitute for qualitative analysis.

## Data handling

- Never make a reward conditional on positive or public feedback.
- Keep reviewer notes factual and avoid copying unnecessary personal data.
- Do not open optional evidence links unless needed for review.
- Do not publish screenshots, recordings, or quotes without separate approval.
