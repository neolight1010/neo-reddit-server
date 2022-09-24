FROM node:17-alpine3.12 as base

# Dependencies for node-gyp
RUN apk add python3 make gcc g++

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM base as prod

ENV NODE_ENV production

CMD ["yarn", "start"]
