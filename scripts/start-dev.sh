#!/bin/bash

# Load port configuration
source ./env/dev/available/.env.port

# Start the development server with the configured port
next dev -p $PORT 