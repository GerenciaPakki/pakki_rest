FROM node:18.16.0-alpine

RUN apk update && apk add --no-cache python3

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm","run", "dev"]