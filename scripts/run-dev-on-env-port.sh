#!/bin/bash

# Use PORT from .env.development.local (set by setup-env-dev.sh), default 3000
if [ -f .env.development.local ]; then
  PORT=$(grep -E '^PORT=' .env.development.local | cut -d= -f2-)
fi
PORT=${PORT:-3000}
echo "Starting dev server on port $PORT"
npm run dev -- --port "$PORT"