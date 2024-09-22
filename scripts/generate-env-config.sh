#!/bin/bash

log_with_script_suffixe() {
  log "[Env config generator] $1"
}

check_script_vars_are_set() {
    REQUIRED_ENV_VARS=(
        ENV
        API_CONTACT_EMAIL
        API_BASE_URL
        API_UMG_USERNAME
        API_UMG_USER_PASSWORD
        SENTRY_IS_ACTIVE
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
  VITE_API_CONTACT_EMAIL: "${API_CONTACT_EMAIL}",
  VITE_API_BASE_URL: "${API_BASE_URL}",
  VITE_API_UMG_USERNAME: "${API_UMG_USERNAME}",
  VITE_API_UMG_USER_PASSWORD: "${API_UMG_USER_PASSWORD}",
  VITE_SENTRY_IS_ACTIVE: "${SENTRY_IS_ACTIVE}"
};
EOF
log_with_script_suffixe "Generated $ENV_CONFIG_FILE with the following content:"
cat $ENV_CONFIG_FILE