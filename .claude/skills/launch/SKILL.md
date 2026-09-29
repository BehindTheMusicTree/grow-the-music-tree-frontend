---
name: launch
description: Use this skill when asked to run, start, dev-serve, or preview grow-the-music-tree-frontend, or to confirm a change works in the real app. Starts the local grow-api (restoring prod data into it when empty) and the Next.js dev server. Args - optional port, `restore` (force a fresh prod restore), `no-restore`.
---

# Launch grow-the-music-tree-frontend

Run from the repo root (any worktree):

```bash
./scripts/dev-up.sh [--port <n>] [--restore|--no-restore]
```

Map args: a port → `--port <n>` (omit it to get the first free port in 3000–3009), `restore` → `--restore`
(wipes the local DB), `no-restore` → `--no-restore`. The default restores prod data only when the local DB is empty.

Trust its `key=value` output and don't re-verify with `curl`/`lsof`:

- `status=ok` → give the user `web_url` (always `localhost`, never `127.0.0.1`, or Google sign-in fails).
- Surface `api_warning` (the API checkout isn't on an up-to-date `main`/`develop`, so migrations or endpoints may
  differ) and `signin=disabled` (see `docs/frontend-auth.md` → Setup).
- `reason=env-local-overrides-api-origin` → `.env.local` points `GROW_API_ORIGIN` elsewhere (e.g. staging). Ask
  whether to comment that line out, or to run plain `pnpm dev` against it deliberately.
- `reason=port-in-use` → rerun without `--port`, or with another port.
- Other `error` → relay the reason and `log_tail`.

## Troubleshooting

- Docker `input/output error` / `500 Internal Server Error` from the daemon → disk is full. Free space,
  then restart Docker Desktop.
