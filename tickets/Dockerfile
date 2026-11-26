FROM node:alpine

RUN apk add --no-cache git

WORKDIR /app
COPY package.json .
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force
COPY . .

CMD [ "npm", "start" ]