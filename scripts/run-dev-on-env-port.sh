#!/bin/bash

# Use PORT from .env.development.local (set by setup-env-dev.sh from your preset)
if [ ! -f ./.env.development.local ]; then
    echo "Error: .env.development.local not found. Run ./scripts/setup-env-dev.sh local (or remote) first."
    exit 1
fi
set -a
source ./.env.development.local
set +a
if [ -z "$PORT" ]; then
    echo "Error: PORT is not set in .env.development.local"
    exit 1
fi
echo "Using PORT=$PORT from .env.development.local"
npm run dev -- --port "$PORT"