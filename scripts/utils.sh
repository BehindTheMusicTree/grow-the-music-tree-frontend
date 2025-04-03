#!/bin/bash

log_with_utils_prefixe () {
    log "[Utils] $1"
}

log() {
    if [ "$SCRIPTS_LOGS_WITH_TIMESTAMP" = true ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    else
        echo "$1"
    fi
}

check_vars_are_set() {
    local missing_vars=()
    for var_name in "$@"; do
        if [ -z "${!var_name}" ]; then
            log_with_utils_prefixe "ERROR: $var_name must be set." >&2
            exit 1
        fi
    done
}

check_bool_vars_are_set() {
    local invalid_vars=()
    check_vars_are_set "$@"
    for var_name in "$@"; do
        if [ "${!var_name}" != "true" ] && [ "${!var_name}" != "false" ]; then
            log_with_utils_prefixe "ERROR: $var_name is not a valid boolean (true/false)" >&2
            invalid_vars+=("$var_name")
        fi
    done

    if [ ${#invalid_vars[@]} -ne 0 ]; then
        log_with_utils_prefixe "ERROR: the following boolean variables are invalid: ${invalid_vars[*]}" >&2
        exit 1
    fi
}

export_value_removing_eventual_surrounding_quotes() {
    local VAR_NAME=$1
    local VAR_VALUE=${!VAR_NAME}
    VAR_VALUE=${VAR_VALUE#\'}
    VAR_VALUE=${VAR_VALUE%\'}
    export "$VAR_NAME=$VAR_VALUE"
}