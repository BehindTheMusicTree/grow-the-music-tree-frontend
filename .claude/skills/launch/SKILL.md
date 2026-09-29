---
name: launch
description: Use this skill when asked to run, start, dev-serve, or preview grow-the-music-tree-frontend, or to confirm a change works in the real app. Starts the local grow-api (restoring prod data into it when empty) and the Next.js dev server. Args - optional port, `restore` (force a fresh prod restore), `no-restore`.
---

# Launch grow-the-music-tree-frontend

Next.js frontend backed by a local grow-api (`../grow-the-music-tree-api`, `http://127.0.0.1:8001`,
the committed `.env` default).

## 1. Env (first run)

If `.env.local` is missing: `cp .env.example .env.local` and fill in the secrets it lists.
Missing/invalid vars stop `pnpm dev` with a message naming them.

## 2. Start the API

```bash
cd ../grow-the-music-tree-api && docker compose up -d --wait
curl -sf 127.0.0.1:8001/health/
```

## 3. Prod data

Restoring wipes the local DB (`pg_restore --clean`), so by default only restore when it's empty:

```bash
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select count(*) from grow_genre"'
```

- `0` (or arg `restore`) → restore; arg `no-restore` → skip.
- Restore (~5 MB download, restarts api/worker, applies the API branch's migrations):

  ```bash
  RCLONE_CONFIG=~/.config/rclone/gtmt-backup.conf R2_BACKUP_BUCKET_NAME=btmt-backups ./scripts/restore-prod-db.sh
  ```

  Needs `rclone` and that config (read-only R2 token) — see the API README if missing.

## 4. Start the web

Run in the background from the frontend root, default port 3000:

```bash
pnpm dev --port <port>
```

## 5. Verify

`curl 127.0.0.1:8001/health/` and `curl localhost:<port>` both return 200. Open
`http://localhost:<port>` — never `127.0.0.1`, or Google sign-in fails with `redirect_uri_mismatch`.

## Troubleshooting

- Docker `input/output error` / `500 Internal Server Error` from the daemon → disk is full. Free space,
  then restart Docker Desktop.
