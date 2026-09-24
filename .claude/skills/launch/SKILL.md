---
name: launch
description: Use this skill when asked to run, start, dev-serve, or preview grow-the-music-tree-frontend, or to confirm a change works in the real app. Covers required env setup and the companion TheMusicTreeAPI backend this app talks to.
---

# Launch grow-the-music-tree-frontend

This is a Next.js (App Router) frontend that requires an env file and a
running TheMusicTreeAPI backend (local or remote) before `next dev` will work
correctly — API calls fail without one.

## 1. Env setup (first run)

```bash
cp .env.example .env.local
```

Fill in the secrets listed there. Non-secret defaults (staging grow-api) are in the
committed `.env`. Missing/invalid vars stop `pnpm dev` with a message naming them.

## 2. Pick an API target

- **Staging** (default) — nothing to do.
- **Local API** — run TheMusicTreeAPI locally, then set
  `NEXT_PUBLIC_GROW_BACKEND_BASE_URL=http://127.0.0.1:8000/v1/` in `.env.local`.

## 3. Start the dev server

```bash
pnpm dev                 # port 3000
pnpm dev -- --port 3001  # another port
```

## 4. Verify

Open the printed `http://127.0.0.1:<port>` URL. If pages render but data is
missing/erroring, check `NEXT_PUBLIC_GROW_BACKEND_BASE_URL` in `.env.local`
(or that the local API is running) before debugging further.
