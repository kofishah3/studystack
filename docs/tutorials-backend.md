# Tutorials Backend

Reference for the tutorials feature's storage, upload, deletion, and retention plumbing. Cross-links the four moving pieces so you don't have to grep for them.

## Pieces

| Concern | Entry point | Notes |
|---|---|---|
| Storage abstraction | [src/lib/storage/index.ts](../src/lib/storage/index.ts) | `StorageDriver` interface; `getStorage()` returns the active driver based on `STORAGE_BACKEND`. |
| Local driver | [src/lib/storage/local.ts](../src/lib/storage/local.ts) | Filesystem-backed. Default for dev. |
| Supabase driver | [src/lib/storage/supabase.ts](../src/lib/storage/supabase.ts) | Private bucket + signed URLs. Production. |
| Supabase client | [src/lib/supabase.ts](../src/lib/supabase.ts) | Lazy service-role client, server-only. |
| Upload (streamed) | [src/app/api/tutorial/[tutorialId]/upload/route.ts](../src/app/api/tutorial/[tutorialId]/upload/route.ts) | busboy → `putStream`, no full-file buffer. |
| Material DELETE | [src/app/api/tutorial/[tutorialId]/materials/[materialId]/route.ts](../src/app/api/tutorial/[tutorialId]/materials/[materialId]/route.ts) | DB-first, storage cleanup best-effort. |
| Purge logic | [src/lib/cron/purge-tutorials.ts](../src/lib/cron/purge-tutorials.ts) | `runTutorialPurge()` — sweeps soft-deleted tutorials past `RETENTION_DAYS`. |
| Cron HTTP trigger | [src/app/api/cron/purge-tutorials/route.ts](../src/app/api/cron/purge-tutorials/route.ts) | Auth-gated by `CRON_SECRET`. Manual / external scheduler. |
| Embedded cron | [server.ts](../server.ts) | Daily 03:00 in-process via `node-cron`. Skipped when `NODE_ENV=test`. |

## Environment

| Var | Required when | Purpose |
|---|---|---|
| `STORAGE_BACKEND` | always | `local` (default) \| `supabase` \| `s3` (stub). |
| `SUPABASE_URL` | `STORAGE_BACKEND=supabase` | Project URL from Supabase dashboard → Settings → API. |
| `SUPABASE_SERVICE_ROLE_KEY` | `STORAGE_BACKEND=supabase` | **Server-only.** Service-role key, not anon. Never ship to client. |
| `SUPABASE_STORAGE_BUCKET` | `STORAGE_BACKEND=supabase` | Bucket name. Defaults to `tutorial-materials`. |
| `CRON_SECRET` | only for HTTP trigger | Bearer secret for `POST /api/cron/purge-tutorials`. Embedded cron does not use it. |

See [.env.example](../.env.example) for the canonical list.

## Supabase bucket setup (manual)

The code side is already wired (`getStorage()` switch, typed errors, env vars in `.env.example`).
These steps must be done in the Supabase dashboard — they can't be scripted from the repo:

1. Create a **private** bucket named `tutorial-materials` (or whatever `SUPABASE_STORAGE_BUCKET`
   is set to). Keep it private — public buckets bypass the signed-URL access model.
2. Set the bucket's file-size limit to **50 MB** to match `MAX_VIDEO_BYTES`.
3. Restrict allowed MIME types to the union of `DOCUMENT_MIMES` + `VIDEO_MIMES` from
   [src/lib/validation/tutorial.ts](../src/lib/validation/tutorial.ts).
4. No storage RLS policies are required: the server uses the **service-role key**, which bypasses
   RLS. Access control is the private bucket + short-lived signed URLs.
5. In `.env.local`, set `STORAGE_BACKEND=supabase`, `SUPABASE_URL`, and
   `SUPABASE_SERVICE_ROLE_KEY` (from dashboard → Settings → API).
6. Smoke-test with the `/tutorialTest` harness: create a tutorial, upload a file, confirm the
   object appears in the bucket and the returned signed URL resolves.

## Storage backend switching

Keys are scheme-stable (`tutorials/<tutorialId>/<uuid>-<filename>`), so flipping `STORAGE_BACKEND` does not require a migration — but existing objects only live in the backend that wrote them. To migrate, copy objects out of the old backend into the new one preserving keys, then flip the env.

## Upload flow

1. Client `PUT`s multipart to `/api/tutorial/[tutorialId]/upload`.
2. Route bridges Web `ReadableStream` → Node `Readable` via `Readable.fromWeb`.
3. busboy parses; on the `file` event, MIME is validated against `DOCUMENT_MIMES` / `VIDEO_MIMES` from [src/lib/validation/tutorial.ts](../src/lib/validation/tutorial.ts) before any bytes are written.
4. Per-MIME size limit enforced via a Transform passthrough that destroys the stream when bytes exceed `MAX_MATERIAL_BYTES` (docs) or `MAX_VIDEO_BYTES` (videos). busboy's own `fileSize` acts as the upper bound.
5. Stream piped directly to `storage.putStream(...)` — no intermediate buffer. RSS stays flat regardless of file size.
6. True uploaded byte count goes into `tutorial_materials.size_bytes` (not the client-declared size).
7. On insert failure, compensating cleanup deletes the just-uploaded object with the `[Orphan Cleanup]` log tag.

## Video strategy

Prefer `embedded_video_url` over uploaded video files. The whitelist in
[src/lib/validation/tutorial.ts](../src/lib/validation/tutorial.ts) (`validateVideoUrl`) accepts
YouTube / Vimeo / Loom links — no storage cost, no size ceiling, and the host does the
transcoding.

Uploaded video files remain supported as a fallback but are capped at `MAX_VIDEO_BYTES = 50 MB`
to stay under the Supabase free-tier per-object limit. If you need larger video, use an embed.

## Deletion flow

`DELETE /api/tutorial/[tutorialId]/materials/[materialId]` is **DB-first, storage best-effort**:

- DB row is removed first. If storage delete fails afterward, it's logged as `[Orphan Cleanup]` and swept by the next purge cron run.
- Inverting the order risks a successful storage delete with a still-referenced row, which would 200 the client but break their next signed-URL fetch.

Soft-delete of the parent tutorial (`DELETE /api/tutorial/[tutorialId]`) sets `deleted_at`; objects survive until the cron sweeps them.

## Retention / cron

- `RETENTION_DAYS = 30` in [src/lib/cron/purge-tutorials.ts](../src/lib/cron/purge-tutorials.ts).
- Embedded scheduler in [server.ts](../server.ts) fires daily at 03:00 server time, calls `runTutorialPurge()` directly — no HTTP, no secret.
- HTTP trigger remains as a manual / external-scheduler hook. Auth: `Authorization: Bearer $CRON_SECRET`.
- Storage deletes are per-key with try/catch — one failed delete does not abort the sweep. The DB hard-delete runs after storage cleanup.

## Multi-instance deploys

Embedded cron runs in every instance. If you scale beyond one, gate registration on a single-instance env (e.g. `CRON_ENABLED=true`) or disable embedded cron entirely and drive the HTTP endpoint from an external scheduler. Don't run the embedded cron on N instances — you'll get N concurrent purge sweeps fighting over the same rows.

## Adding a backend

1. Implement [src/lib/storage/index.ts](../src/lib/storage/index.ts) `StorageDriver` — `put`, `putStream`, `getUrl`, `delete`. `delete` must be idempotent (missing-object is not an error).
2. Wire it into the `getStorage()` switch in the same file.
3. Add an `.env.example` block documenting required env.
4. Verify both `local` parity and the new backend with the smoke tests in §Verification of the original plan.

## Related docs

- [error-handling.md](./error-handling.md) — `AppError` hierarchy, `errorToResponse`, the `[Orphan Cleanup]` convention.
- [database-queries-and-transactions.md](./database-queries-and-transactions.md) — `q()` / `tx()` patterns used by `runTutorialPurge` and the material/tutorial queries.
