# syntax=docker/dockerfile:1
FROM node:20-alpine

RUN apk add --no-cache bash wget

ARG PROJECT_DIR

RUN if [ -z "$PROJECT_DIR" ]; then \
        echo "ERROR: The PROJECT_DIR argument is not provided" >&2; \
        exit 1; \
    fi

ENV PROJECT_DIR=$PROJECT_DIR

WORKDIR $PROJECT_DIR

COPY . .
RUN ls -la
RUN chmod +x ./scripts/* && ./scripts/install-dependencies.sh
RUN npm install -g npm@10.5.2

ENTRYPOINT ["./scripts/entrypoint.sh"]