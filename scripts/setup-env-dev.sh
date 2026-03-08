#!/bin/bash

# Check if argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 [local|remote]"
    echo "  local  - Use local API configuration"
    echo "  remote - Use remote API configuration"
    exit 1
fi

API_TYPE=$1

# Validate argument
if [ "$API_TYPE" != "local" ] && [ "$API_TYPE" != "remote" ]; then
    echo "Error: Argument must be either 'local' or 'remote'"
    exit 1
fi

# Copy appropriate environment file
ENV_FILE="./env/development/available/.env.development.api-$API_TYPE"
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Required environment file not found: $ENV_FILE"
    echo "Please ensure the environment files are properly set up in env/development/available/"
    exit 1
fi

cp "$ENV_FILE" ./.env.development.local

if [ "$API_TYPE" == "local" ]; then
    echo "Using local API configuration"
else
    echo "Using remote API configuration"
fi

echo "Environment setup completed: .env.development.api-$API_TYPE → .env.development.local"
