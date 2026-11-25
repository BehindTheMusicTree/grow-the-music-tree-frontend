---
name: launch
description: Use this skill when asked to run, start, dev-serve, or preview grow-the-music-tree-frontend, or to confirm a change works in the real app. Starts the Next.js dev server against read-only staging by default, or against the local grow-api (restoring prod data into it when empty) with `local`. Args - optional port, `local`, `restore` (force a fresh prod restore, implies local), `no-restore` (implies local).
---

# Launch grow-the-music-tree-frontend

Run from the repo root (any worktree):

```bash
./scripts/dev-up.sh [--port <n>] [--local [--restore|--no-restore]]
```

Map args: a port → `--port <n>` (omit it to get the first free port in 3000–3009), `local` → `--local`,
`restore` → `--local --restore` (wipes the local DB), `no-restore` → `--local --no-restore`. Without `--local` it
targets read-only staging (no local API, `signin=disabled`); use `--local` when the user needs admin sign-in or
writes. With `--local`, prod data is restored only when the local DB is empty.

Trust its `key=value` output and don't re-verify with `curl`/`lsof`. If the output is lost, read
`.dev-up.status` at the repo root, which holds the last run's lines:

- `status=ok` → give the user `web_url` (always `localhost`, never `127.0.0.1`, or Google sign-in fails).
- Surface `api_warning` (the API checkout isn't on an up-to-date `main`/`develop`, so migrations or endpoints may
  differ) and `signin=disabled` (see `docs/frontend-auth.md` → Setup).
- `ignored_origin_override=<origin>` → a `.env*` file points `GROW_API_ORIGIN` elsewhere; with `--local`, dev-up pinned
  the local API anyway. Mention it once.
- `reason=port-in-use` → rerun without `--port`, or with another port.
- Other `error` → relay the reason and `log_tail`.
- No `status=` line (in the output or `.dev-up.status`) → the run was cut off or is still going (e.g. waiting for
  the web server); don't report a URL from a bare `pid=`. Check `.dev-up.log`, then rerun.

## Troubleshooting

- Docker `input/output error` / `500 Internal Server Error` from the daemon → disk is full. Free space,
  then restart Docker Desktop.
