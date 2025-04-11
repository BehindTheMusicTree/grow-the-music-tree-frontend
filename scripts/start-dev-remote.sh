#!/bin/bash

# Copy remote environment configuration
cp ./env/dev/available/.env.dev.api-remote ./env/to-load/.env.development

# Load port configuration
source ./env/dev/available/.env.port

# Start the development server with the configured port
next dev -p $PORT 