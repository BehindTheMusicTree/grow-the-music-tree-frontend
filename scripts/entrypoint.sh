#!/bin/bash

log_with_script_suffixe() {
  log "[Entrypoint] $1"
}

check_script_vars_are_set() {
    REQUIRED_NON_BOOL_VARS=(
        APP_PORT
        APP_VERSION
        NEXT_PUBLIC_CONTACT_EMAIL
        NEXT_PUBLIC_BACKEND_BASE_URL
        NEXT_PUBLIC_SENTRY_IS_ACTIVE

        NEXT_PUBLIC_SPOTIFY_AUTH_URL
        NEXT_PUBLIC_SPOTIFY_CLIENT_ID
        NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
        NEXT_PUBLIC_SPOTIFY_SCOPES

        NEXT_PUBLIC_GOOGLE_CLIENT_ID
        NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    )
    check_vars_are_set ${REQUIRED_NON_BOOL_VARS[@]} 2>&1
    if [ $? -ne 0 ]; then
        log_with_script_prefixe "ERROR: Failed to load environment variables." >&2
        exit 1
    fi

    check_bool_vars_are_set "NEXT_PUBLIC_SENTRY_IS_ACTIVE" 2>&1
    if [ $? -ne 0 ]; then
        log_with_script_prefixe "ERROR: Failed to load boolean environment variables." >&2
        exit 1
    fi
}

main() {
    SCRIPTS_DIR=$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)/
    PROJECT_DIR=$(realpath "${SCRIPTS_DIR}..")/
    source ${SCRIPTS_DIR}utils.sh

    check_script_vars_are_set 2>&1

    # SENTRY_AUTH_TOKEN is not needed in the Vite env file.
    # Sentry simply reads it from the environment.

    NEXT_ENV_FILE="${NEXT_ENV_FILE_DIR}.env"
    log_with_script_suffixe "Generating Next.js env file $NEXT_ENV_FILE ..."
    cat << EOF > $NEXT_ENV_FILE
NODE_ENV=$ENV
APP_VERSION=$APP_VERSION
NEXT_PUBLIC_APP_VERSION=$APP_VERSION
NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL
NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL
NEXT_PUBLIC_SENTRY_IS_ACTIVE=$NEXT_PUBLIC_SENTRY_IS_ACTIVE
NEXT_PUBLIC_SPOTIFY_AUTH_URL=$NEXT_PUBLIC_SPOTIFY_AUTH_URL
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=$NEXT_PUBLIC_SPOTIFY_CLIENT_ID
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=$NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
NEXT_PUBLIC_SPOTIFY_SCOPES=$NEXT_PUBLIC_SPOTIFY_SCOPES
NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=$NEXT_PUBLIC_GOOGLE_REDIRECT_URI
EOF
    if [ $? -ne 0 ]; then
        log_with_script_suffixe "ERROR: Failed to generate the Vite env file." >&2
        exit 1
    fi
    log_with_script_suffixe "Next.js env file generated successfully."

    log_with_script_suffixe "Removing .next/ cache so NEXT_PUBLIC_* are re-inlined..."
    rm -rf .next/

    log_with_script_suffixe "Building the application..."
    npm run build
    if [ $? -ne 0 ]; then
        log_with_script_suffixe "ERROR: Failed to build the application." >&2
        exit 1
    fi
    log_with_script_suffixe "Application built successfully."

    log_with_script_suffixe "Starting Next.js server on port $APP_PORT..."
    exec env PORT=$APP_PORT npm run start
} 

main "$@" 2>&1
