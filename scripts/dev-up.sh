#!/usr/bin/env bash
# Start the local grow-api (restoring prod data when its DB is empty) and the Next.js dev server.
#
#   dev-up.sh [--port <n>] [--restore|--no-restore]
#
# Without --port, picks the first free port in 3000-3009 (the range the dev Google OAuth client allows).
# --restore forces a fresh prod restore (wipes the local DB); --no-restore never restores.
# The API checkout is resolved as a sibling of the main checkout (works from any worktree);
# override with GROW_API_DIR.
#
# Prints key=value lines; the final line is always `status=ok`, `status=blocked reason=…`
# or `status=error reason=…`. The same lines are also written to .dev-up.status.
set -uo pipefail

repo_root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
exec > >(tee "$repo_root/.dev-up.status")

port=""
restore="auto"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port) port="${2:?--port requires a value}"; shift 2 ;;
    --restore) restore="force"; shift ;;
    --no-restore) restore="skip"; shift ;;
    *) echo "status=error reason=unknown-arg-$1"; exit 1 ;;
  esac
done

main_root="$(dirname "$(git -C "$repo_root" rev-parse --path-format=absolute --git-common-dir)")"
api_dir="${GROW_API_DIR:-$(dirname "$main_root")/grow-the-music-tree-api}"
echo "repo_root=$repo_root"
echo "api_dir=$api_dir"
if [[ ! -f "$api_dir/docker-compose.yml" ]]; then
  echo "status=error reason=api-repo-not-found"
  exit 1
fi

env_local="$repo_root/.env.local"
if [[ ! -f "$env_local" ]]; then
  if [[ -f "$main_root/.env.local" ]]; then
    cp "$main_root/.env.local" "$env_local"
    echo "bootstrapped_env_local=1"
  else
    echo "status=error reason=missing-env-local hint=cp-.env.example-.env.local"
    exit 1
  fi
fi

api_url="http://127.0.0.1:8001"
read_origin() { grep -E '^GROW_API_ORIGIN=' "$1" 2>/dev/null | tail -1 | cut -d= -f2- | sed -E 's/[[:space:]]+#.*//' | tr -d "\"' "; }
# Next.js precedence: shell env > .env.development.local > .env.local
origin="${GROW_API_ORIGIN:-$(read_origin "$repo_root/.env.development.local")}"
origin="${origin:-$(read_origin "$env_local")}"
origin="${origin%/}"
if [[ -n "$origin" && "$origin" != "$api_url" && "$origin" != "http://localhost:8001" ]]; then
  echo "status=blocked reason=api-origin-overridden origin=$origin"
  exit 1
fi

api_branch="$(git -C "$api_dir" rev-parse --abbrev-ref HEAD)"
echo "api_branch=$api_branch"
echo "api_commit=$(git -C "$api_dir" rev-parse --short HEAD)"
echo "api_dirty=$([[ -n "$(git -C "$api_dir" status --porcelain)" ]] && echo 1 || echo 0)"
api_behind="$(git -C "$api_dir" rev-list --count 'HEAD..@{u}' 2>/dev/null || echo 0)"
echo "api_behind_upstream=$api_behind"
if [[ "$api_branch" != "main" && "$api_branch" != "develop" ]] || (( api_behind > 0 )); then
  echo "api_warning=api-checkout-not-on-up-to-date-main-or-develop"
fi

compose=(docker compose --project-directory "$api_dir")
if ! "${compose[@]}" up -d --wait >/dev/null 2>&1 || ! curl -sf "$api_url/health/" >/dev/null; then
  echo "status=error reason=api-unhealthy log_tail=$("${compose[@]}" logs --tail 20 api 2>&1 | tr '\n' '|')"
  exit 1
fi
echo "api_health=ok"

count_genres() {
  local n
  # shellcheck disable=SC2016 # expanded inside the db container
  n="$("${compose[@]}" exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select count(*) from grow_genre"')" \
    && [[ "$n" =~ ^[0-9]+$ ]] && echo "$n"
}
genres="$(count_genres)" || { echo "status=error reason=genre-count-failed"; exit 1; }
restored=0
if [[ "$restore" == "force" || ( "$restore" == "auto" && "$genres" == "0" ) ]]; then
  if ! RCLONE_CONFIG="$HOME/.config/rclone/gtmt-backup.conf" R2_BACKUP_BUCKET_NAME=btmt-backups \
    "$api_dir/scripts/restore-prod-db.sh" >&2; then
    echo "status=error reason=restore-failed"
    exit 1
  fi
  restored=1
  genres="$(count_genres)" || { echo "status=error reason=genre-count-failed"; exit 1; }
fi
echo "restored=$restored"
echo "genres=$genres"

if ! grep -qE '^GOOGLE_OAUTH_CLIENT_ID=.+' "$api_dir/.env" 2>/dev/null \
  || ! grep -qE '^ADMIN_GOOGLE_SUB=.+' "$api_dir/.env" 2>/dev/null; then
  echo "signin=disabled hint=docs/frontend-auth.md#setup"
fi

port_in_use() { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }
if [[ -n "$port" ]]; then
  if port_in_use "$port"; then
    echo "status=blocked reason=port-in-use port=$port"
    exit 1
  fi
else
  for candidate in {3000..3009}; do
    port_in_use "$candidate" || { port="$candidate"; break; }
  done
  if [[ -z "$port" ]]; then
    echo "status=blocked reason=no-free-port-3000-3009"
    exit 1
  fi
fi

log_file="$repo_root/.dev-up.log"
nohup pnpm -C "$repo_root" dev --port "$port" >"$log_file" 2>&1 &
pid=$!
echo "pid=$pid"
web_url="http://localhost:$port"
deadline=$((SECONDS + 120))
until curl -sf -o /dev/null "$web_url"; do
  if ! kill -0 "$pid" 2>/dev/null || (( SECONDS > deadline )); then
    echo "status=error reason=web-not-ready log_tail=$(tail -n 20 "$log_file" | tr '\n' '|')"
    exit 1
  fi
  sleep 2
done

echo "log_file=$log_file"
echo "api_url=$api_url"
echo "web_url=$web_url"
echo "status=ok"
