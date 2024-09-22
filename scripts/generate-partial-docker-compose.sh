#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")")" && pwd)/

required_vars=(
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
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "$var must be set." >&2
    exit 1
  fi
done

DOCKER_COMPOSE_PART_FILE="${SCRIPT_DIR}${DOCKER_COMPOSE_PART_FILENAME}"
echo "Generating partial docker-compose file $DOCKER_COMPOSE_PART_FILE"
cat << EOF > $DOCKER_COMPOSE_PART_FILE
  $SERVICE_NAME:
    working_dir: $PROJECT_DIR
    image: $DOCKERHUB_USERNAME/$IMAGE_REPO:$APP_VERSION
    container_name: $CONTAINER_NAME
    expose:
      - $APP_PORT
    env_file: $ENV_FILENAME
EOF