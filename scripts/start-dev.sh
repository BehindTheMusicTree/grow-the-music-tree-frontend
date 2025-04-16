#!/bin/bash

# Load port configuration
source ./env/dev/available/.env.port

# Start the development server with the configured port
npx next dev -p $PORT 