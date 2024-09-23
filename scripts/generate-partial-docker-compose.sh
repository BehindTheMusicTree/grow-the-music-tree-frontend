#!/bin/bash

log_with_script_suffixe() {
  	log "[Partial docker compose generator] $1"
}

SCRIPT_DIR=$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)/
source ${SCRIPT_DIR}utils.sh

REQUIRED_SCRIPT_VAR=(
	DOCKER_COMPOSE_PART_FILENAME
	SERVICE_NAME
	PROJECT_DIR
	DOCKERHUB_USERNAME
	IMAGE_REPO
	APP_VERSION
	CONTAINER_NAME
	APP_PORT
	ENV_FILENAME
)
for var in ${REQUIRED_SCRIPT_VAR[@]}; do
  	check_var_is_set $var
done

DOCKER_COMPOSE_PART_FILE="${SCRIPT_DIR}${DOCKER_COMPOSE_PART_FILENAME}"
log_with_script_suffixe "Generating partial docker-compose file $DOCKER_COMPOSE_PART_FILE"
cat << EOF > $DOCKER_COMPOSE_PART_FILE
$SERVICE_NAME:
	working_dir: $PROJECT_DIR
	image: $DOCKERHUB_USERNAME/$IMAGE_REPO:$APP_VERSION
	container_name: $CONTAINER_NAME
	expose:
	- $APP_PORT
	env_file: $ENV_FILENAME
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:$APP_PORT || exit 1"]
      interval: 15s
      timeout: 10s
      retries: 5
EOF
log_with_script_suffixe "Partial docker-compose file generated successfully."