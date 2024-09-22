#!/bin/bash

log_with_script_suffixe() {
  log "[Entrypoint] $1"
}

check_script_vars_are_set() {
    REQUIRED_NON_BOOL_VARS=(
        "APP_PORT"
        "API_CONTACT_EMAIL"
        "API_BASE_URL"
        "API_UMG_USERNAME"
        "API_UMG_USER_PASSWORD"
        "SENTRY_IS_ACTIVE"
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
    SCRIPTS_DIR=${PROJECT_DIR}scripts/
    source ${SCRIPTS_DIR}utils.sh

    check_script_vars_are_set 2>&1

    bash ${SCRIPTS_DIR}generate-env-config.sh
    if [ $? -ne 0 ]; then
        log_with_script_suffixe "Failed to generate env-config.js file."
        exit 1
    fi

    exec serve -s build -l "$APP_PORT"
} 

main "$@" 2>&1
