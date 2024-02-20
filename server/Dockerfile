FROM node:lts-alpine

WORKDIR /app

RUN --mount=type=cache,target=/node_modules npm install gulp-cli -g
RUN --mount=type=cache,target=/node_modules npm install @nestjs/cli -g

COPY ./package.json .
RUN --mount=type=cache,target=/node_modules npm install

COPY . .
RUN npm run build

RUN gulp

CMD npm run start:prod
