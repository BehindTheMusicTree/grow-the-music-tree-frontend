# syntax=docker/dockerfile:1
FROM node:20-alpine AS build

RUN --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN

ARG PROJECT_DIR

RUN if [ -z "$PROJECT_DIR" ]; then \
    echo "ERROR: The PROJECT_DIR argument is not provided" >&2; \
    exit 1; \
fi

WORKDIR $PROJECT_DIR

COPY package*.json ./
COPY . .

RUN chmod +x ./scripts/* && ./scripts/install-dependencies.sh && npm run build

FROM node:20-alpine

RUN apk add --no-cache bash

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
    ENV=TEST \
    APP_PORT=$APP_PORT \
    SENTRY_IS_ACTIVE=true

WORKDIR $PROJECT_DIR

COPY ./scripts/* ./scripts/
RUN chmod +x ./scripts/* && ./scripts/install-dependencies.sh
COPY --from=build ${PROJECT_DIR}build ./build
RUN npm install -g npm@10.5.2 && npm install -g serve

# Set the entrypoint using shell form to allow environment variable expansion
ENTRYPOINT ["bash", "-c", "./scripts/entrypoint.sh"]
