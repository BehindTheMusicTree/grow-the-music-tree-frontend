FROM node:14-alpine

ARG bodzifyApiUmgUsername
ARG bodzifyApiUmgUserPassword

# react env variables have to be prefixed with REACT_APP_
ENV REACT_APP_BODZIFY_API_UMG_USERNAME=${bodzifyApiUmgUsername}
ENV REACT_APP_BODZIFY_API_UMG_USER_PASSWORD=${bodzifyApiUmgUserPassword}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
