FROM node:14-alpine

ARG bodzifyApiUmgUsername
ARG bodzifyApiUmgUserPassword

# react env variables have to be prefixed with VITE_
ENV VITE_BODZIFY_API_UMG_USERNAME=${bodzifyApiUmgUsername}
ENV VITE_BODZIFY_API_UMG_USER_PASSWORD=${bodzifyApiUmgUserPassword}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm install -g serve

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["serve", "-s", "build", "-l", "5000"]
