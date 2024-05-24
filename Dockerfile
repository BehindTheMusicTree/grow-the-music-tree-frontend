FROM node:20-alpine AS build

ARG bodzifyApiUmgUsername
ARG bodzifyApiUmgUserPassword
ARG sentryAuthToken

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g npm@10.5.2
RUN npm cache verify
RUN npm cache clean --force
RUN npm install is-fullwidth-code-point@3.0.0
RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

# React env variables have to be prefixed with VITE_
ENV VITE_BODZIFY_API_UMG_USERNAME=${bodzifyApiUmgUsername}
ENV VITE_BODZIFY_API_UMG_USER_PASSWORD=${bodzifyApiUmgUserPassword}
ENV SENTRY_AUTH_TOKEN=${sentryAuthToken}

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/build ./build

RUN npm install -g npm@10.5.2
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "5000"]