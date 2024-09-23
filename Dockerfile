# syntax=docker/dockerfile:1
FROM node:20-alpine

RUN apk add --no-cache bash

ARG PROJECT_DIR
ARG APP_PORT
ARG BUILD_COMPLETE_FILENAME

RUN for var in \
        PROJECT_DIR \
        APP_PORT; do \
    if [ -z "$(eval echo \$$var)" ]; then \
        echo "ERROR: The $var argument is not provided" >&2; \
        exit 1; \
    fi; \
done

ENV PROJECT_DIR=$PROJECT_DIR \
    ENV=TEST \
    APP_PORT=$APP_PORT \
    SENTRY_IS_ACTIVE=true \
    VITE_ENV_FILE_DIR=${PROJECT_DIR}env/to-load/ \
    BUILD_COMPLETE_FILENAME=$BUILD_COMPLETE_FILENAME

WORKDIR $PROJECT_DIR

COPY . .
RUN ls -la
RUN chmod +x ./scripts/* && ./scripts/install-dependencies.sh
RUN npm install -g npm@10.5.2 && npm install -g serve && mkdir -p $VITE_ENV_FILE_DIR

ENTRYPOINT ["./scripts/entrypoint.sh"]