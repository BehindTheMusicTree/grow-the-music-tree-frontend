#!/bin/bash

# Copy remote environment configuration
cp ./env/dev/available/.env.dev.api-remote ./.env.development

# Load port configuration
source ./env/dev/available/.env.port

# Start the development server with the configured port
npx next dev -p $PORT 