#!/bin/bash
set -e
if [ -z "$1" ]; then
  echo "Usage: $0 [local|remote]"
  exit 1
fi
bash "$(dirname "$0")/setup-env-dev.sh" "$1"
PORT=3000
if [ -f .env.development.local ]; then
  val=$(grep -m1 -E '^PORT=' .env.development.local 2>/dev/null | cut -d= -f2- | tr -d '[:space:]')
  if [ -n "$val" ] && [ "$val" -eq "$val" ] 2>/dev/null && [ "$val" -gt 0 ]; then
    PORT=$val
  fi
fi
exec npx next dev --turbo --hostname 127.0.0.1 --port "$PORT"
