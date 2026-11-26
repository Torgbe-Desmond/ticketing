FROM node:alpine

RUN apk add --no-cache git

WORKDIR /app
COPY package.json .
RUN npm install --only=prod
COPY . .

CMD [ "npm", "start" ]