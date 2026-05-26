#!/bin/sh
set -eu

LOCKFILE_HASH_FILE="node_modules/.package-lock.sha1"
CURRENT_LOCKFILE_HASH="$(sha1sum package-lock.json | awk '{ print $1 }')"
INSTALLED_LOCKFILE_HASH="$(cat "$LOCKFILE_HASH_FILE" 2>/dev/null || true)"

if [ ! -d "node_modules" ] || [ "$CURRENT_LOCKFILE_HASH" != "$INSTALLED_LOCKFILE_HASH" ]; then
  echo "Installing dependencies..."
  npm ci
  printf '%s' "$CURRENT_LOCKFILE_HASH" > "$LOCKFILE_HASH_FILE"
fi

echo "Generating proto types..."
npm run proto:gen

echo "Running migrations for ${SERVICE_NAME}..."
npx prisma migrate deploy --config "services/${SERVICE_NAME}/prisma/prisma.config.ts"

echo "Generating Prisma client for ${SERVICE_NAME}..."
npx prisma generate --schema "services/${SERVICE_NAME}/prisma/schema.prisma"

exec npm run "start:dev:${SERVICE_NAME}"
