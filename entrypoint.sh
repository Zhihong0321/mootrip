#!/bin/sh
set -e

echo "--- MOOTRIP STARTUP ---"

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
echo "Starting Next.js on 0.0.0.0:${PORT:-3000}..."
# Using -H 0.0.0.0 to force binding to all interfaces
exec su-exec nextjs npx next start -H 0.0.0.0 -p ${PORT:-3000}
