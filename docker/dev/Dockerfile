FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=development

RUN apk add --no-cache protobuf python3 make g++

COPY package.json package-lock.json ./
COPY docker/dev/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . .

EXPOSE 3001 3002 5001 5002

ENTRYPOINT ["/entrypoint.sh"]
