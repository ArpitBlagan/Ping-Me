FROM node:20-alpine

WORKDIR /app/src

COPY . .

RUN npm install pnpm -g -y

RUN pnpm install

EXPOSE 5173

CMD ["pnpm","run","dev"]