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
ENV_FILE="./env/dev/available/.env.development.api-$API_TYPE"
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Required environment file not found: $ENV_FILE"
    echo "Please ensure the environment files are properly set up in env/dev/available/"
    exit 1
fi

cp "$ENV_FILE" ./.env.development.local

if [ "$API_TYPE" == "local" ]; then
    echo "Using local API configuration"
else
    echo "Using remote API configuration"
fi

# Source port configuration
PORT_FILE="./env/dev/available/.env.port"
if [ ! -f "$PORT_FILE" ]; then
    echo "Error: Port configuration file not found: $PORT_FILE"
    exit 1
fi

source "$PORT_FILE"

echo "Environment setup completed:"
echo "- Copied .env.development.api-$API_TYPE to .env.development.local"
echo "- Sourced port configuration from .env.port" 