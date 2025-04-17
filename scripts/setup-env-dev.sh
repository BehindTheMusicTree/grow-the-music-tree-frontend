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
cp ./env/dev/available/.env.development.api-$API_TYPE ./.env.development.local

if [ "$API_TYPE" == "local" ]; then
    echo "Using local API configuration"
else
    echo "Using remote API configuration"
fi

# Source port configuration
source ./env/dev/available/.env.port

echo "Environment setup completed:"
echo "- Copied .env.development.api-$API_TYPE to .env.development.local"
echo "- Sourced port configuration from .env.port" 