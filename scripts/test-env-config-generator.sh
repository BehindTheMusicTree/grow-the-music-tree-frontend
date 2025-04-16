#!/bin/bash

log_with_script_suffixe() {
  log "[Env config generator tester] $1"
}

SCRIPTS_DIR=$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)/
PROJECT_DIR=$(realpath "${SCRIPTS_DIR}..")/
source ${SCRIPTS_DIR}utils.sh

log_with_script_suffixe "Testing env-config.js file generation..."
 
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [ -z "$key" ]; then continue; fi
    export "$key=$value"
    echo "$key=$value"
done < "${PROJECT_DIR}env/dev/template/.env.config-generation-tester"

bash ${SCRIPTS_DIR}generate-env-config.sh