#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <production|preview> <full|app-version-only>" >&2
  echo "  Upserts Vercel project env via API. Requires VERCEL_TOKEN, VERCEL_PROJECT_ID." >&2
  echo "  full: all NEXT_PUBLIC_* mirrored from GitHub env (see docs/DEPLOYMENT.md)." >&2
  echo "  app-version-only: only NEXT_PUBLIC_APP_VERSION (needs package.json + GITHUB_SHA or git HEAD)." >&2
  exit 1
}

TARGET="${1:-}"
MODE="${2:-}"

if [[ "$TARGET" != "production" && "$TARGET" != "preview" ]]; then
  usage
fi

if [[ "$MODE" != "full" && "$MODE" != "app-version-only" ]]; then
  usage
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${VERCEL_TOKEN:?VERCEL_TOKEN is required}"
: "${VERCEL_PROJECT_ID:?VERCEL_PROJECT_ID is required}"

if [ "$TARGET" = "production" ]; then
  TARGET_JSON='["production"]'
else
  TARGET_JSON='["preview"]'
fi

SHORT_SHA="${GITHUB_SHA:-}"
if [ -n "$SHORT_SHA" ]; then
  SHORT_SHA="${SHORT_SHA:0:7}"
else
  SHORT_SHA="$(git rev-parse --short=7 HEAD 2>/dev/null || true)"
fi

sync_var() {
  local value="$1"
  local key="$2"
  [ -z "$value" ] && return 0
  echo "Syncing $key to $TARGET..."
  local body
  body=$(jq -n \
    --arg key "$key" \
    --arg value "$value" \
    --argjson target "$TARGET_JSON" \
    '{key: $key, value: $value, type: "plain", target: $target}')
  curl -sS -X POST "https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?upsert=true" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$body"
}

if [ "$MODE" = "app-version-only" ]; then
  [ -f package.json ] || { echo "::error::package.json not found at repo root" >&2; exit 1; }
  [ -n "$SHORT_SHA" ] || { echo "::error::GITHUB_SHA or git HEAD required for app version" >&2; exit 1; }
  PKG_VERSION=$(jq -r '.version' package.json)
  APP_VERSION="${PKG_VERSION}-dev+${SHORT_SHA}"
  sync_var "$APP_VERSION" "NEXT_PUBLIC_APP_VERSION"
  echo "App version sync done ($TARGET)."
  exit 0
fi

API_ROOT="${HTMT_API_ROOT_SEGMENT#/}"
API_ROOT="${API_ROOT%/}"

if [ "$TARGET" = "production" ]; then
  BACKEND_BASE_URL="https://${HTMT_API_SUBDOMAIN}.${DOMAIN_NAME}/${API_ROOT}/"
  APP_URL="https://${GTMT_FRONT_SUBDOMAIN}.${DOMAIN_NAME}"
else
  BACKEND_BASE_URL="https://staging.${HTMT_API_SUBDOMAIN}.${DOMAIN_NAME}/${API_ROOT}/"
  APP_URL="https://staging.${GTMT_FRONT_SUBDOMAIN}.${DOMAIN_NAME}"
fi

APP_URL_TRIM="${APP_URL%/}"
SPOTIFY_REDIRECT_URI="${APP_URL_TRIM}/${SPOTIFY_REDIRECT_RELATIVE_URI#/}"
GOOGLE_REDIRECT_URI="${APP_URL_TRIM}/${GOOGLE_REDIRECT_RELATIVE_URI#/}"
AUDIOMETA_URL="https://${AUDIOMETA_SUBDOMAIN}.${DOMAIN_NAME}"
PKG_VERSION=$(jq -r '.version' package.json)
APP_VERSION="${PKG_VERSION}-dev+${SHORT_SHA}"

sync_var "$CONTACT_EMAIL" "NEXT_PUBLIC_CONTACT_EMAIL"
sync_var "$BACKEND_BASE_URL" "NEXT_PUBLIC_BACKEND_BASE_URL"
sync_var "true" "NEXT_PUBLIC_SENTRY_IS_ACTIVE"
sync_var "https://accounts.spotify.com/authorize" "NEXT_PUBLIC_SPOTIFY_AUTH_URL"
sync_var "$SPOTIFY_CLIENT_ID" "NEXT_PUBLIC_SPOTIFY_CLIENT_ID"
sync_var "$SPOTIFY_REDIRECT_URI" "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI"
sync_var "$SPOTIFY_SCOPES" "NEXT_PUBLIC_SPOTIFY_SCOPES"
sync_var "$GOOGLE_CLIENT_ID" "NEXT_PUBLIC_GOOGLE_CLIENT_ID"
sync_var "$GOOGLE_REDIRECT_URI" "NEXT_PUBLIC_GOOGLE_REDIRECT_URI"
sync_var "$TRACK_UPLOAD_TIMEOUT_MS" "NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS"
sync_var "$AUDIOMETA_URL" "NEXT_PUBLIC_AUDIOMETA_URL"
sync_var "$APP_VERSION" "NEXT_PUBLIC_APP_VERSION"

echo "Full env sync done ($TARGET)."
