#!/bin/sh
set -e

echo "--- MOOTRIP STARTUP (FULL IMAGE) ---"

# 1. STORAGE
if [ -d "/storage" ]; then
  mkdir -p /storage/uploads/thumbnails /storage/uploads/medium /storage/uploads/full
  chown -R 1001:1001 /storage
  rm -rf public/uploads
  ln -s /storage/uploads public/uploads
fi

# 2. MIGRATIONS
su-exec nextjs npx prisma migrate deploy || echo "Prisma migrate failed"

# 3. START SERVER
echo "Starting Next.js via next start..."
export HOSTNAME="0.0.0.0"
exec su-exec nextjs npx next start -p ${PORT:-3000}
