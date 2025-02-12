FROM ubuntu:22.04 AS base

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci
RUN npm run build

EXPOSE 3000

CMD HOSTNAME="0.0.0.0" node server.js
