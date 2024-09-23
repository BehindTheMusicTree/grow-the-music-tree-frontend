#!/bin/bash

log_with_script_suffixe() {
  log "[Entrypoint] $1"
}

check_script_vars_are_set() {
    REQUIRED_NON_BOOL_VARS=(
        APP_PORT
        CONTACT_EMAIL
        API_BASE_URL
        API_UMG_USERNAME
        API_UMG_USER_PASSWORD
        SENTRY_IS_ACTIVE
        SENTRY_AUTH_TOKEN
        BUILD_COMPLETE_FILENAME
    )
    check_vars_are_set ${REQUIRED_NON_BOOL_VARS[@]} 2>&1
    if [ $? -ne 0 ]; then
        log_with_script_prefixe "ERROR: Failed to load environment variables." >&2
        exit 1
    fi
    export_value_removing_eventual_surrounding_quotes API_UMG_USER_PASSWORD 2>&1

    check_bool_vars_are_set "SENTRY_IS_ACTIVE" 2>&1
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

    VITE_ENV_FILE="${VITE_ENV_FILE_DIR}.env"
    log_with_script_suffixe "Generating the Vite env file $VITE_ENV_FILE ..."
    cat << EOF > $VITE_ENV_FILE
VITE_ENV=$ENV
VITE_CONTACT_EMAIL=$CONTACT_EMAIL
VITE_API_BASE_URL=$API_BASE_URL
VITE_API_UMG_USERNAME=$API_UMG_USERNAME
VITE_API_UMG_USER_PASSWORD='$API_UMG_USER_PASSWORD'
VITE_SENTRY_IS_ACTIVE=$SENTRY_IS_ACTIVE
EOF
    if [ $? -ne 0 ]; then
        log_with_script_suffixe "ERROR: Failed to generate the Vite env file." >&2
        exit 1
    fi
    log_with_script_suffixe "Vite env file generated successfully."

    log_with_script_suffixe "Building the application..."
    npm run build
    if [ $? -ne 0 ]; then
        log_with_script_suffixe "ERROR: Failed to build the application." >&2
        exit 1
    fi
    log_with_script_suffixe "Application built successfully."

    BUILD_COMPLETE_FILE="${PROJECT_DIR}${BUILD_COMPLETE_FILENAME}"
    log_with_script_suffixe "Creating the build complete file $BUILD_COMPLETE_FILE indicating that the build is done..."
    touch $BUILD_COMPLETE_FILE
    if [ $? -ne 0 ]; then
        log_with_script_suffixe "ERROR: Failed to create the build complete file." >&2
        exit 1
    fi
    log_with_script_suffixe "Build complete file created successfully."

    log_with_script_suffixe "Keeping the container running..."
    tail -f /dev/null
} 

main "$@" 2>&1
