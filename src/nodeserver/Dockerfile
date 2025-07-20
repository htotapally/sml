# Stage 1: Build the React application
FROM node:24-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER root

RUN npm install

COPY --chown=node:node . .

RUN npm run build

USER node

EXPOSE 3000
CMD ["node", "server.js"]
