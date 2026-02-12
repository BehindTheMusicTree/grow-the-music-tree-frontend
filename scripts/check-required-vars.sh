#!/bin/bash

missing=""

# Arguments should be pairs: name value name value ...
while [ $# -gt 0 ]; do
    name="$1"
    value="$2"
    if [ -z "$value" ]; then
        missing="$missing $name"
    fi
    shift 2
done

if [ -n "$missing" ]; then
    echo "Missing vars or secrets:$missing"
    exit 1
fi

echo "All required vars and secrets are set."