# Neon object storage

Gallery thumbnails and new screenshot attachments use Neon Object Storage on
the production branch of the `squidcoder` project. The existing AWS SDK speaks
Neon's S3-compatible API; an AWS account is no longer needed for these paths.

- Project: `hidden-poetry-08166122`, region `aws-us-east-1`.
- Production branch: `br-autumn-cloud-at0p28kt`.
- Endpoint: `https://br-autumn-cloud-at0p28kt.storage.c-9.us-east-1.aws.neon.tech`.
- `squid-gallery`: private. Images are served through `/api/gallery/:id/thumbnail`,
  which checks publication status and the captured revision. Vercel caches
  successful responses; storage failures use `no-store`.
- `squid-uploads`: public read, authenticated writes. The existing `/api/s3-upload`
  API signs PUT requests and returns the provider's `objectUrl`. CORS permits
  the production domains and `http://localhost:3000`; add specific development
  or preview origins before testing direct browser uploads elsewhere.

## Configuration

Set the following together in the deployment environment:

```dotenv
AWS_ENDPOINT_URL_S3=https://your-branch.storage.your-region.aws.neon.tech
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<Neon credential token_id>
AWS_SECRET_ACCESS_KEY=<Neon credential s3_secret_access_key>
NEON_GALLERY_BUCKET=squid-gallery
NEON_UPLOAD_BUCKET=squid-uploads
```

The credentials remain server-side. The client uses path-style addressing
(`forcePathStyle: true`). Every new object has a unique key, so cached versions
are immutable. Never configure a preview branch to write to the production
endpoint: use its own Neon branch endpoint and credential instead.

`S3_UPLOAD_BUCKET` and `S3_UPLOAD_REGION` are optional legacy URL identifiers.
They allow the thumbnail reader to recognize old database URLs **only after
the corresponding keys have been copied into Neon**. They never select an AWS
client or authenticate to AWS. `S3_UPLOAD_KEY` and `S3_UPLOAD_SECRET` are unused.
Migrated records use Neon URLs directly and need no legacy configuration.

## Recovering existing gallery images

AWS returned `AllAccessDisabled` for the original `llamacoder-uploads` objects
on October 28, 2026. The production proxy also logged an invalid AWS access key.
The gallery's published source remained available, allowing fresh screenshots
of the same published revisions without generating or editing project code.
Historical screenshot attachments referenced by AWS URLs are separate: changing
the upload provider does not recover those original files.

The migration script accepts a directory containing:

- `gallery-before.json`: an array of `{ "id": "...", "messageId": "..." }`
  records captured before taking screenshots.
- `<publication-id>.jpg`: a verified 1280 × 720 JPEG of that publication's
  `/gallery/<slug>/preview` iframe, captured after it reports ready. Wait for
  fonts/images before capturing; do not capture a loading or error overlay.

With the Neon variables and `DATABASE_URL` configured:

```sh
pnpm exec tsx scripts/migrate-gallery-storage.ts \
  --capture-dir /path/to/captures --backup-dir /path/to/backups

# After reviewing the dry run:
pnpm exec tsx scripts/migrate-gallery-storage.ts \
  --capture-dir /path/to/captures --backup-dir /path/to/backups --apply
```

The script backs up publication metadata before changes, uploads each JPEG,
downloads it for byte-for-byte verification, and only then updates that row.
Message IDs and the previous URL are checked again during the update to avoid
overwriting a concurrent republish. It never deletes AWS files, Neon objects,
projects, or database rows. Reruns skip records already pointing at Neon.

For release, stage a production build with `vercel deploy --prod --skip-domain`,
verify image delivery against that deployment, then promote the tested build.
Verify every published thumbnail returns `200` with JPEG bytes and confirm a
signed screenshot PUT followed by a public GET works, including CORS preflight.

Official references: [Neon storage](https://neon.com/docs/storage/overview),
[authentication](https://neon.com/docs/storage/authentication),
[S3 compatibility](https://neon.com/docs/storage/s3-compatibility).
