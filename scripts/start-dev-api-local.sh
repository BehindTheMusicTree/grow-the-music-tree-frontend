#!/bin/bash

cp ./env/dev/available/.env.development.api-local ./.env.development.local

source ./env/dev/available/.env.port

npx next dev -p $PORT 