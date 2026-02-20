# syntax=docker/dockerfile:1
FROM node:20-alpine

RUN apk add --no-cache bash wget

ARG PROJECT_DIR
ARG APP_PORT

RUN for var in \
        PROJECT_DIR \
        APP_PORT; do \
    if [ -z "$(eval echo \$$var)" ]; then \
        echo "ERROR: The $var argument is not provided" >&2; \
        exit 1; \
    fi; \
done

ENV PROJECT_DIR=$PROJECT_DIR \
    NODE_ENV=test \
    APP_PORT=$APP_PORT \
    SENTRY_IS_ACTIVE=true

WORKDIR $PROJECT_DIR

COPY . .
RUN ls -la
RUN chmod +x ./scripts/* && ./scripts/install-dependencies.sh
RUN npm install -g npm@10.5.2

ENTRYPOINT ["./scripts/entrypoint.sh"]