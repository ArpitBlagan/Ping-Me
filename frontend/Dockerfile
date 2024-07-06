FROM node:20-alpine

WORKDIR /app/src

COPY package* .

RUN npm install pnpm -g -y

RUN pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm","run","dev"]