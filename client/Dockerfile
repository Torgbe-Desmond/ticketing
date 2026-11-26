FROM node:alpine
WORKDIR /appclea
COPY package.json .
RUN npm install 
COPY . .

CMD ["npm","run","dev"]