#!/bin/bash
set -e

echo "--- RAILWAY STARTUP ---"
echo "PORT: $PORT"

# 1. STORAGE
if [ -d "/storage" ]; then
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
fi

# 2. MIGRATIONS
./node_modules/.bin/prisma migrate deploy || echo "Migration failed"

# 3. START APP
echo "Starting Next.js..."
export HOSTNAME="0.0.0.0"
exec ./node_modules/.bin/next start -H 0.0.0.0 -p ${PORT:-3000}
