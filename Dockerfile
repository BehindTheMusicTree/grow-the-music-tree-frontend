FROM node:20-alpine AS build

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

WORKDIR $PROJECT_DIR

COPY package*.json ./

RUN npm install -g npm@10.5.2
RUN npm cache verify
RUN npm cache clean --force
RUN npm install is-fullwidth-code-point@3.0.0
RUN npm install

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

WORKDIR $PROJECT_DIR

COPY ./scripts/install_dependencies.sh ./scripts/install_dependencies.sh
RUN chmod +x ./scripts/install_dependencies.sh
RUN ./scripts/install_dependencies.sh
COPY --from=build ${PROJECT_DIR}build ./build

RUN npm install -g npm@10.5.2
RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "${APP_PORT}"]