---
name: launch
description: Use this skill when asked to run, start, dev-serve, or preview grow-the-music-tree-frontend, or to confirm a change works in the real app. Covers required env setup and the companion TheMusicTreeAPI backend this app talks to.
---

# Launch grow-the-music-tree-frontend

This is a Next.js (App Router) frontend that requires an env file and a
running TheMusicTreeAPI backend (local or remote) before `next dev` will work
correctly — API calls fail without one.

## 1. Env setup (first run, or after pulling env template changes)

Copy templates from `env/development/example/` into `env/development/available/`
if not already present (see `env/development/example/` for the list — one file
per preset, e.g. `.env.development.api-local.example` → `.env.development.api-local`).

Then verify:

```bash
npm run verify-env
```

## 2. Pick an API target

- **Local API** — requires `TheMusicTreeAPI` (bodzify-api-django) checked out
  and running locally first (see that repo's own launch instructions).
- **Remote API** — no local backend needed; uses a hosted `NEXT_PUBLIC_BACKEND_BASE_URL`.

## 3. Start the dev server

Prefer the wrapper scripts — they copy the right env preset to
`.env.development.local` and pick a port from it automatically:

```bash
pnpm dev:local   # bash scripts/run-dev.sh local  — needs the local API running
pnpm dev:remote  # bash scripts/run-dev.sh remote — no local API needed
```

Plain `pnpm dev` also works but skips the env-preset copy step — only use it
if `.env.development.local` is already in place from a previous run.

Default port is 3000 unless `PORT=` is set in the active env file.

## 4. Verify

Open the printed `http://127.0.0.1:<port>` URL. If pages render but data is
missing/erroring, the API target is almost certainly wrong or the local API
isn't running — check `.env.development.local`'s `NEXT_PUBLIC_BACKEND_BASE_URL`
before debugging further.
