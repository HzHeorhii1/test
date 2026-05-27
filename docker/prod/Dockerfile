FROM node:24-alpine AS build

WORKDIR /app

ARG SERVICE_NAME=iam

RUN apk add --no-cache protobuf

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run proto:gen
RUN npx prisma generate --schema "services/${SERVICE_NAME}/prisma/schema.prisma"
RUN npm run "build:${SERVICE_NAME}"

FROM node:24-alpine AS runtime

WORKDIR /app

ARG SERVICE_NAME=iam
ENV SERVICE_NAME=${SERVICE_NAME}
ENV NODE_ENV=production

COPY package*.json ./
RUN NODE_ENV=production npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/libs/proto/src/proto ./libs/proto/src/proto
COPY --from=build /app/services/${SERVICE_NAME}/prisma ./prisma

EXPOSE 3001 3002 5001 5002

CMD ["sh", "-c", "npx prisma migrate deploy --config ./prisma/prisma.config.ts && node dist/services/${SERVICE_NAME}/src/main.js"]
