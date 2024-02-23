FROM node:lts-alpine as base

WORKDIR /app

RUN --mount=type=cache,target=/node_modules npm install gulp-cli -g
RUN --mount=type=cache,target=/node_modules npm install @nestjs/cli -g

FROM base as dependencies
COPY ./package.json .
RUN --mount=type=cache,target=/node_modules npm install

FROM dependencies as build
COPY . .
RUN npm run build

RUN gulp

FROM build as test
CMD npm run test

FROM build as run
CMD npm run start:prod
