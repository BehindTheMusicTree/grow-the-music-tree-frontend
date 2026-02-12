#!/bin/bash

missing=""

# Check each provided environment variable name
for var in "$@"; do
    if [ -z "${!var}" ]; then
        missing="$missing $var"
    fi
done

if [ -n "$missing" ]; then
    echo "Missing vars or secrets:$missing"
    exit 1
fi

echo "All required vars and secrets are set."