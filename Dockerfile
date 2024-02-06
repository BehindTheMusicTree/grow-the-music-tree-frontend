FROM node:14-alpine

ARG bodzifyApiUmgUsername
ARG bodzifyApiUmgUserPassword

ENV BODZIFY_API_UMG_USERNAME=${bodzifyApiUmgUsername}
ENV BODZIFY_API_UMG_USER_PASSWORD=${bodzifyApiUmgUserPassword}

RUN echo "BODZIFY_API_UMG_USERNAME=${BODZIFY_API_UMG_USERNAME}"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
