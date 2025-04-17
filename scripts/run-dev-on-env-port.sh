#!/bin/bash

# Source port configuration
source ./env/dev/available/.env.port
if [ -z "$PORT" ]; then
    echo "Error: PORT is not set in .env.port"
    exit 1
fi
echo "Sourced port configuration from .env.port: $PORT"

# Run the development server
npm run dev -- --port $PORT