FROM node:latest

WORKDIR /app

COPY . .

RUN npm install

CMD node deploy-commands.js && node index.js
