FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm","run","dev"]