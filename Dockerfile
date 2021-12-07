FROM node:17-alpine3.12

# Dependencies for node-gyp
RUN apk add python3 make gcc g++

WORKDIR /usr/src/app
COPY package*.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

CMD ["yarn", "start"]
