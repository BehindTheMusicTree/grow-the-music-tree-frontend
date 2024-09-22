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

RUN npm install -g npm@10.5.2 && \
    npm cache verify && \
    npm cache clean --force && \
    npm install is-fullwidth-code-point@3.0.0 && \
    npm install

COPY . .

RUN npm run build

FROM node:20-alpine

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
    VITE_ENV=TEST \
    APP_PORT=$APP_PORT \
    VITE_SENTRY_ACTIVE=true

WORKDIR $PROJECT_DIR

COPY ./scripts/install-dependencies.sh ./scripts/
RUN chmod +x ./scripts/install-dependencies.sh && ./scripts/install-dependencies.sh
COPY --from=build ${PROJECT_DIR}build ./build
RUN npm install -g npm@10.5.2 && npm install -g serve

CMD ["sh", "-c", "serve -s build -l ${APP_PORT}"]