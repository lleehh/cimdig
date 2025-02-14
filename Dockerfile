FROM node:20

WORKDIR /usr/src/app

COPY ./cimdig .

EXPOSE 3000

RUN npm i

RUN npm run build

CMD ["npm", "start"]