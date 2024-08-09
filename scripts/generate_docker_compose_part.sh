SCRPIT_DIR=$(dirname $0)/

cat << EOF > ${SCRPIT_DIR}$DOCKER_COMPOSE_PART_FILENAME
  umg:
    working_dir: /usr/src/app
    image: $DOCKERHUB_USERNAME/$IMAGE_REPO:$IMAGE_TAG
    container_name: $CONTAINER_NAME
    expose:
      - $APP_PORT
    networks:
      - $DOCKER_NETWORK_NAME
    env_file: $ENV_VARIABLES_FILENAME
EOF