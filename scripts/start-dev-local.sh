#!/bin/bash

# Start with base development environment
cp ./env/dev/available/.env.development ./.env.development

# Append Spotify client ID from local environment
echo "" >> ./.env.development
echo "# Spotify Client ID (copied from .env.development.local for client validation)" >> ./.env.development
grep "NEXT_PUBLIC_SPOTIFY_CLIENT_ID" ./env/dev/available/.env.development.local >> ./.env.development

# Append port configuration with line break
echo "" >> ./.env.development
echo "# Port configuration" >> ./.env.development
cat ./env/dev/available/.env.port >> ./.env.development

# Append local API configuration with line break
echo "" >> ./.env.development
echo "# API configuration" >> ./.env.development
cat ./env/dev/available/.env.development.api-local >> ./.env.development

# Copy local environment separately (contains all sensitive data)
cp ./env/dev/available/.env.development.local ./.env.development.local

# Load port configuration
source ./env/dev/available/.env.port

# Start the development server with the configured port
npx next dev -p $PORT 