script_dir=$(dirname $0)/

required_vars=(
  DOCKER_COMPOSE_PART_FILENAME
  DOCKERHUB_USERNAME
  IMAGE_REPO
  IMAGE_TAG
  CONTAINER_NAME
  APP_PORT
  DOCKER_NETWORK_NAME
  ENV_FILENAME
)
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "$var must be set." >&2
    exit 1
  fi
done

cat << EOF > ${script_dir}$DOCKER_COMPOSE_PART_FILENAME
  umg:
    working_dir: /usr/src/app
    image: $DOCKERHUB_USERNAME/$IMAGE_REPO:$IMAGE_TAG
    container_name: $CONTAINER_NAME
    expose:
      - $APP_PORT
    networks:
      - $DOCKER_NETWORK_NAME
    env_file: $ENV_FILENAME
EOF