FROM node:lts-alpine

WORKDIR /app

COPY ./package.json .
RUN --mount=type=cache,target=/node_modules npm install

RUN --mount=type=cache,target=/node_modules npm install gulp-cli -g

COPY . .
RUN npm run build

RUN gulp

CMD npm run start:prod
