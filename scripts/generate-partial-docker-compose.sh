#!/bin/bash

log_with_script_suffixe() {
  	log "[Partial docker compose generator] $1"
}

SCRIPT_DIR=$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)/
source ${SCRIPT_DIR}utils.sh

REQUIRED_SCRIPT_VAR=(
	DOCKER_COMPOSE_PARTIAL_FILENAME
	SERVICE_NAME
	PROJECT_DIR
	DOCKERHUB_USERNAME
	IMAGE_REPO
	APP_VERSION
	CONTAINER_NAME
	APP_PORT
	ENV_FILENAME
	BUILD_COMPLETE_FILENAME
)
for var in ${REQUIRED_SCRIPT_VAR[@]}; do
  	check_vars_are_set $var
done

DOCKER_COMPOSE_PARTIAL_FILE="${SCRIPT_DIR}${DOCKER_COMPOSE_PARTIAL_FILENAME}"
log_with_script_suffixe "Generating partial docker-compose file $DOCKER_COMPOSE_PARTIAL_FILE"
cat << EOF > $DOCKER_COMPOSE_PARTIAL_FILE
  $SERVICE_NAME:
    working_dir: $PROJECT_DIR
    image: $DOCKERHUB_USERNAME/$IMAGE_REPO:$APP_VERSION
    container_name: $CONTAINER_NAME
    volumes:
      - gtmt-front-build:${PROJECT_DIR}build/
    expose:
      - $APP_PORT
    env_file: $ENV_FILENAME
    healthcheck:
      test: ["CMD-SHELL", "test -f ${PROJECT_DIR}${BUILD_COMPLETE_FILENAME} || exit 1"]
      interval: 7s
      timeout: 10s
      retries: 5
EOF
log_with_script_suffixe "Partial docker-compose file generated successfully."