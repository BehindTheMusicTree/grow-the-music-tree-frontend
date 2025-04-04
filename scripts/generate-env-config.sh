#!/bin/bash

log_with_script_suffixe() {
  log "[Env config generator] $1"
}

check_script_vars_are_set() {
    REQUIRED_ENV_VARS=(
        ENV
        CONTACT_EMAIL
        API_BASE_URL
        SENTRY_IS_ACTIVE
        SPOTIFY_CLIENT_ID
        SPOTIFY_REDIRECT_URI
        SPOTIFY_SCOPE
    )
    check_vars_are_set "${REQUIRED_ENV_VARS[@]}"
}


SCRIPTS_DIR=$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)/
source ${SCRIPTS_DIR}utils.sh
check_script_vars_are_set

# Define the path to the env-config.js file
ENV_CONFIG_FILE=./public/env-config.js

log_with_script_suffixe "Generating $ENV_CONFIG_FILE file..."
cat <<EOF > $ENV_CONFIG_FILE
window._env_ = {
  VITE_ENV: "${ENV}",
  VITE_CONTACT_EMAIL: "${CONTACT_EMAIL}",
  VITE_API_BASE_URL: "${API_BASE_URL}",
  VITE_SENTRY_IS_ACTIVE: "${SENTRY_IS_ACTIVE}",
  VITE_SPOTIFY_CLIENT_ID: "${SPOTIFY_CLIENT_ID}",
  VITE_SPOTIFY_REDIRECT_URI: "${SPOTIFY_REDIRECT_URI}",
  VITE_SPOTIFY_SCOPE: "${SPOTIFY_SCOPE}"
};
EOF