#!/bin/bash

# Copy local environment configuration
cp ./env/dev/available/.env.dev.api-local ./.env.development

# Load port configuration
source ./env/dev/available/.env.port

# Start the development server with the configured port
next dev -p $PORT 