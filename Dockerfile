FROM node:20 AS base

WORKDIR /

COPY package.json ./
COPY package-lock.json ./
COPY * .

COPY app/ .
COPY components/  .
COPY docs/  .
COPY hooks/  .
COPY lib/  .
COPY models/ .
COPY nordic44/  .
COPY public/ .

RUN npm ci
RUN npm run build

EXPOSE 3000
CMD ["node", "run", "start"]
