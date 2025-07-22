# Stage 1: Build the React application
FROM node:24-alpine AS build

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY env .env

COPY package*.json ./

USER root

RUN npm install

COPY --chown=node:node . .

USER node

EXPOSE 3001
CMD ["node", "server.mjs"]
