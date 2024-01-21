FROM node:lts-alpine

WORKDIR /app

COPY ./package.json .
RUN npm install

RUN  npm install gulp-cli -g

COPY . .
RUN npm run build

RUN gulp

CMD npm run start:prod
