SCRPIT_DIR=$(dirname $0)/

cat << EOF > ${SCRPIT_DIR}$DOCKER_COMPOSE_PART_FILENAME
    umg:
    working_dir: /usr/src/app
    image: $DOCKERHUB_USERNAME/$IMAGE_REPO:$IMAGE_TAG
    container_name: $CONTAINER_NAME
    expose:
      - 5000
    networks:
      - bodzify-network
    env_file: $ENV_VARIABLES_FILENAME
EOF