FROM node:20-alpine

ARG bodzifyApiUmgUsername
ARG bodzifyApiUmgUserPassword

# React env variables have to be prefixed with VITE_
ENV VITE_BODZIFY_API_UMG_USERNAME=${bodzifyApiUmgUsername}
ENV VITE_BODZIFY_API_UMG_USER_PASSWORD=${bodzifyApiUmgUserPassword}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g npm@10.5.2
RUN npm cache verify
RUN npm cache clean --force
RUN npm install is-fullwidth-code-point@3.0.0
RUN npm install

COPY . .

RUN npm run build
RUN ls -la build

RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "5000"]